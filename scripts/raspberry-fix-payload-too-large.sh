#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="chess-opening-master-backend.service"
APP_ROOT="/home/pi/node/chessopeningmaster"
NGINX_SITE=""
CLIENT_MAX_BODY_SIZE="10M"
REBUILD_BACKEND="true"
RELOAD_NGINX="true"
RESTART_BACKEND="true"
DRY_RUN="false"

print_help() {
  cat <<'EOF'
Usage:
  sudo bash scripts/raspberry-fix-payload-too-large.sh [options]

Options:
  --service <name>           Systemd service name (default: chess-opening-master-backend.service)
  --app-root <path>          Project root on Raspberry Pi (default: /home/pi/node/chessopeningmaster)
  --nginx-site <path>        Nginx site file to update
  --body-size <value>        Nginx client_max_body_size (default: 10M)
  --no-rebuild               Skip yarn backend build
  --no-nginx-reload          Skip nginx reload
  --no-backend-restart       Skip backend restart
  --dry-run                  Show actions without applying
  --help                     Show this help
EOF
}

log() {
  printf '%s\n' "$*"
}

run_cmd() {
  if [[ "$DRY_RUN" == "true" ]]; then
    log "[dry-run] $*"
  else
    eval "$*"
  fi
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "Missing command: $1"
    exit 1
  fi
}

detect_nginx_site() {
  if [[ -n "$NGINX_SITE" ]]; then
    return
  fi

  local candidates=(
    "/etc/nginx/sites-available/chess-opening-master-frontend"
    "/etc/nginx/sites-enabled/chess-opening-master-frontend"
    "/etc/nginx/sites-available/default"
    "/etc/nginx/sites-enabled/default"
  )

  local file
  for file in "${candidates[@]}"; do
    if [[ -f "$file" ]]; then
      NGINX_SITE="$file"
      return
    fi
  done

  log "No nginx site file found. Use --nginx-site <path>."
  exit 1
}

backup_file() {
  local file="$1"
  local backup_file_path="${file}.bak.$(date +%Y%m%d%H%M%S)"
  run_cmd "cp '$file' '$backup_file_path'"
  log "Backup: $backup_file_path"
}

update_client_max_body_size() {
  local file="$1"
  local value="$2"

  if grep -Eq '^\s*client_max_body_size\s+[^;]+;' "$file"; then
    run_cmd "sed -Ei \"s|^\\s*client_max_body_size\\s+[^;]+;|    client_max_body_size ${value};|\" '$file'"
    return
  fi

  local tmp_file
  tmp_file="$(mktemp)"

  awk -v v="$value" '
    BEGIN { inserted=0 }
    {
      print
      if (inserted==0 && $0 ~ /server[[:space:]]*\{/) {
        print "    client_max_body_size " v ";"
        inserted=1
      }
    }
  ' "$file" > "$tmp_file"

  if [[ "$DRY_RUN" == "true" ]]; then
    log "[dry-run] would insert client_max_body_size ${value} into ${file}"
    rm -f "$tmp_file"
  else
    cat "$tmp_file" > "$file"
    rm -f "$tmp_file"
  fi
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --service)
        SERVICE_NAME="$2"
        shift 2
        ;;
      --app-root)
        APP_ROOT="$2"
        shift 2
        ;;
      --nginx-site)
        NGINX_SITE="$2"
        shift 2
        ;;
      --body-size)
        CLIENT_MAX_BODY_SIZE="$2"
        shift 2
        ;;
      --no-rebuild)
        REBUILD_BACKEND="false"
        shift
        ;;
      --no-nginx-reload)
        RELOAD_NGINX="false"
        shift
        ;;
      --no-backend-restart)
        RESTART_BACKEND="false"
        shift
        ;;
      --dry-run)
        DRY_RUN="true"
        shift
        ;;
      --help)
        print_help
        exit 0
        ;;
      *)
        log "Unknown option: $1"
        print_help
        exit 1
        ;;
    esac
  done
}

main() {
  parse_args "$@"

  require_cmd systemctl
  require_cmd journalctl
  require_cmd grep
  require_cmd awk
  require_cmd sed

  if [[ "$DRY_RUN" != "true" && "$(id -u)" -ne 0 ]]; then
    log "Run as root or with sudo."
    exit 1
  fi

  detect_nginx_site

  log "Service: $SERVICE_NAME"
  log "App root: $APP_ROOT"
  log "Nginx site: $NGINX_SITE"
  log "client_max_body_size: $CLIENT_MAX_BODY_SIZE"

  if ! systemctl list-unit-files | grep -q "^${SERVICE_NAME}"; then
    log "Service not found: $SERVICE_NAME"
    exit 1
  fi

  if ! systemctl list-unit-files | grep -q '^nginx.service'; then
    log "nginx service not found"
    exit 1
  fi

  local before_errors
  before_errors="$(journalctl -u "$SERVICE_NAME" -n 300 --no-pager | grep -c 'PayloadTooLargeError' || true)"
  log "PayloadTooLargeError in last 300 lines (before): $before_errors"

  if [[ ! -f "$NGINX_SITE" ]]; then
    log "Nginx site file not found: $NGINX_SITE"
    exit 1
  fi

  backup_file "$NGINX_SITE"
  update_client_max_body_size "$NGINX_SITE" "$CLIENT_MAX_BODY_SIZE"

  if [[ "$RELOAD_NGINX" == "true" ]]; then
    run_cmd "nginx -t"
    run_cmd "systemctl reload nginx"
  fi

  local backend_app_js="${APP_ROOT}/packages/backend/build/backend/app.js"
  local backend_app_ts="${APP_ROOT}/packages/backend/src/app.ts"

  if [[ -f "$backend_app_js" ]]; then
    if grep -Eq 'BODY_PARSER_LIMIT|limit:[[:space:]]*bodyParserLimit|limit:[[:space:]]*"[0-9]+[kKmMgG][bB]"' "$backend_app_js"; then
      log "Backend build limit check: parser limit configuration found in app.js"
    else
      log "Backend build limit check: parser limit configuration not found in app.js"
    fi
  else
    log "Backend build file not found: $backend_app_js"
  fi

  if [[ -f "$backend_app_ts" ]]; then
    if grep -Eq 'BODY_PARSER_LIMIT|limit:[[:space:]]*bodyParserLimit|limit:[[:space:]]*"[0-9]+[kKmMgG][bB]"' "$backend_app_ts"; then
      log "Backend source limit check: parser limit configuration found in app.ts"
    else
      log "Backend source limit check: parser limit configuration not found in app.ts"
    fi
  else
    log "Backend source file not found: $backend_app_ts"
  fi

  if [[ "$REBUILD_BACKEND" == "true" ]]; then
    if [[ -f "${APP_ROOT}/package.json" ]]; then
      run_cmd "cd '$APP_ROOT' && yarn build:common && yarn workspace @chess-opening-master/backend build"
    else
      log "Skipping build: package.json not found at $APP_ROOT"
    fi
  fi

  if [[ "$RESTART_BACKEND" == "true" ]]; then
    run_cmd "systemctl restart '$SERVICE_NAME'"
  fi

  local after_errors
  after_errors="$(journalctl -u "$SERVICE_NAME" -n 300 --no-pager | grep -c 'PayloadTooLargeError' || true)"
  log "PayloadTooLargeError in last 300 lines (after): $after_errors"

  log "Done."
  log "Follow live logs with: sudo journalctl -u $SERVICE_NAME -f"
}

main "$@"
