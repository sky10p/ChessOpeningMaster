# MCP Setup (Codex and GitHub Copilot)

This project is configured to use MCP servers from `.vscode/mcp.json`:

- `context7`
- `playwright`
- `chrome-devtools`

## Workspace configuration (VS Code / Copilot)

The workspace MCP file is:

- `.vscode/mcp.json`

Current server entries:

```json
{
  "servers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "chrome-devtools": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

Reload VS Code after changing `mcp.json`.

## Global Codex CLI configuration

Codex global MCP servers are managed with:

```bash
codex mcp list
codex mcp add context7 -- npx -y @upstash/context7-mcp@latest
codex mcp add playwright -- npx -y @playwright/mcp@latest
codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest
```

Codex stores this in:

- `C:\Users\<your-user>\.codex\config.toml`

## Node.js compatibility note

- `context7`: works with current project Node version.
- `playwright`: works with current project Node version.
- `chrome-devtools-mcp`: requires Node `>=20.19.0` (project uses `20.19.0` in Volta).

If Chrome DevTools MCP is needed locally, use Node `20.19+` (or newer LTS) for MCP execution.
