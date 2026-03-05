import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  BookOpenIcon,
  ChartBarIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  Squares2X2Icon,
  SunIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { ArrowRightOnRectangleIcon, ChevronRightIcon, PlusIcon } from "@heroicons/react/24/solid";
import { downloadRepertoiresBackup } from "../../../repository/repertoires/repertoires";
import { logout } from "../../../repository/auth/auth";
import { useHeaderState } from "../../../contexts/HeaderContext";
import { useNavbarDispatch, useNavbarState } from "../../../contexts/NavbarContext";
import { useFooterState } from "../../../contexts/FooterContext";
import { useTheme } from "../../../hooks/useTheme";
import { Badge, Button, Drawer, IconButton, Input } from "../../ui";
import { cn } from "../../../utils/cn";

interface AppShellProps {
  authEnabled: boolean;
  authenticated: boolean;
  onLoggedOut: () => void;
  children: React.ReactNode;
}

type NavItem = {
  label: string;
  shortLabel: string;
  href: string;
  icon: React.ReactNode;
};

const primaryNav: NavItem[] = [
  {
    label: "Today",
    shortLabel: "Today",
    href: "/dashboard",
    icon: <HomeIcon className="h-5 w-5" />,
  },
  {
    label: "Repertoires",
    shortLabel: "Repertoires",
    href: "/repertoires",
    icon: <Squares2X2Icon className="h-5 w-5" />,
  },
  {
    label: "Games",
    shortLabel: "Games",
    href: "/games",
    icon: <TrophyIcon className="h-5 w-5" />,
  },
  {
    label: "Studies",
    shortLabel: "Studies",
    href: "/studies",
    icon: <BookOpenIcon className="h-5 w-5" />,
  },
];

const getRouteMeta = (pathname: string) => {
  if (pathname.startsWith("/dashboard")) {
    return {
      title: "Today",
      description: "Focus on the next lesson, your daily targets, and the work that matters now.",
    };
  }
  if (pathname.startsWith("/repertoires")) {
    return {
      title: "Repertoires",
      description: "Manage your opening library, track due work, and jump into training.",
    };
  }
  if (pathname.startsWith("/games")) {
    return {
      title: "Games",
      description: "Turn imported games into mapped signals, training queues, and opening insights.",
    };
  }
  if (pathname.startsWith("/studies")) {
    return {
      title: "Studies",
      description: "Organize study groups, keep sessions moving, and review supporting material.",
    };
  }
  if (pathname.startsWith("/repertoire/")) {
    return {
      title: "Repertoire Editor",
      description: "Author lines, review positions, and keep the current branch in focus.",
    };
  }
  if (pathname.startsWith("/train/repertoires/")) {
    return {
      title: "Training Session",
      description: "Stay on the current move, resolve mistakes, and finish the run with clear progress.",
    };
  }
  return {
    title: "ChessKeep",
    description: "Professional training workflows for your opening repertoire.",
  };
};

const isActiveRoute = (pathname: string, href: string) =>
  href === "/dashboard" ? pathname === "/" || pathname.startsWith("/dashboard") || pathname.startsWith("/path") : pathname.startsWith(href);

export const AppShell: React.FC<AppShellProps> = ({
  authEnabled,
  authenticated,
  onLoggedOut,
  children,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { icons, isSaving } = useHeaderState();
  const { repertoires, open } = useNavbarState();
  const { setOpen, updateRepertoires } = useNavbarDispatch();
  const footerState = useFooterState();
  const { theme, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const routeMeta = getRouteMeta(location.pathname);
  const favoriteRepertoires = React.useMemo(
    () => repertoires.filter((repertoire) => repertoire.favorite && !repertoire.disabled).slice(0, 8),
    [repertoires]
  );
  const filteredFavorites = React.useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();
    if (!normalizedQuery) {
      return favoriteRepertoires;
    }
    return favoriteRepertoires.filter((repertoire) =>
      repertoire.name.toLowerCase().includes(normalizedQuery)
    );
  }, [favoriteRepertoires, searchValue]);
  const isImmersiveWorkspace =
    location.pathname.startsWith("/repertoire/") ||
    location.pathname.startsWith("/train/repertoires/");

  React.useEffect(() => {
    if (!authenticated) {
      return;
    }
    void updateRepertoires();
  }, [authenticated, updateRepertoires]);

  const handleLogout = React.useCallback(async () => {
    if (authEnabled) {
      await logout().catch(() => undefined);
    }
    onLoggedOut();
    navigate("/login");
  }, [authEnabled, navigate, onLoggedOut]);

  if (!authenticated) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="min-h-screen bg-page text-text-base lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="hidden h-screen border-r border-border-subtle bg-page-subtle lg:sticky lg:top-0 lg:flex lg:flex-col">
          <div className="border-b border-border-subtle px-5 py-5">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-text-on-brand shadow-surface">
                <ChartBarIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-text-subtle">ChessKeep</p>
                <p className="text-sm text-text-muted">Opening training workspace</p>
              </div>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <nav className="space-y-1">
              {primaryNav.map((item) => {
                const active = isActiveRoute(location.pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-brand text-text-on-brand shadow-surface"
                        : "text-text-muted hover:bg-surface hover:text-text-base"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </span>
                    {active ? <ChevronRightIcon className="h-4 w-4" /> : null}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 rounded-2xl border border-border-subtle bg-surface px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-base">Quick create</p>
                  <p className="text-xs text-text-muted">Start a new repertoire from your library.</p>
                </div>
                <Button intent="primary" size="sm" onClick={() => navigate("/repertoires?create=1")}>
                  <PlusIcon className="h-4 w-4" />
                  New
                </Button>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-base">Favorites</p>
                  <p className="text-xs text-text-muted">Pinned repertoires for fast re-entry.</p>
                </div>
                {favoriteRepertoires.length > 0 ? (
                  <Badge variant="brand" size="sm">
                    {favoriteRepertoires.length}
                  </Badge>
                ) : null}
              </div>
              <div className="space-y-2">
                {favoriteRepertoires.length > 0 ? (
                  favoriteRepertoires.map((repertoire) => (
                    <Link
                      key={repertoire._id}
                      to={`/repertoire/${repertoire._id}`}
                      className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface px-3 py-3 text-sm text-text-muted transition-colors hover:border-border-default hover:text-text-base"
                    >
                      <span className="truncate">{repertoire.name}</span>
                      <ChevronRightIcon className="h-4 w-4 shrink-0 text-text-subtle" />
                    </Link>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-border-default px-3 py-4 text-sm text-text-muted">
                    Favorite repertoires will appear here.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-border-subtle px-4 py-4">
            <Button intent="secondary" size="sm" className="w-full justify-between" onClick={toggleTheme}>
              <span className="flex items-center gap-2">
                {theme === "dark" ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
                {theme === "dark" ? "Dark mode" : "Light mode"}
              </span>
              <span className="text-xs text-text-subtle">{theme === "dark" ? "On" : "Off"}</span>
            </Button>
            <Button intent="outline" size="sm" className="w-full justify-center" onClick={() => void downloadRepertoiresBackup()}>
              Download backup
            </Button>
            {authEnabled ? (
              <Button intent="ghost" size="sm" className="w-full justify-center" onClick={() => void handleLogout()}>
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Log out
              </Button>
            ) : null}
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 border-b border-border-subtle bg-page/95 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2 lg:hidden">
                <IconButton label="Open menu" onClick={() => setOpen(true)}>
                  <Bars3Icon className="h-5 w-5" />
                </IconButton>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-subtle">
                  {routeMeta.title}
                </p>
                <p className={cn("text-sm text-text-muted", isImmersiveWorkspace ? "hidden sm:block sm:truncate" : "truncate")}>
                  {routeMeta.description}
                </p>
              </div>
              <div className="hidden items-center gap-2 md:flex">
                {!isImmersiveWorkspace ? (
                  <Button intent="secondary" size="sm" onClick={() => setSearchOpen(true)}>
                    <MagnifyingGlassIcon className="h-4 w-4" />
                    Search
                  </Button>
                ) : null}
                {isSaving ? (
                  <Badge variant="accent" size="sm">
                    Saving
                  </Badge>
                ) : (
                  <Badge variant="default" size="sm">
                    Synced
                  </Badge>
                )}
                {icons.map((icon) => (
                  <Button
                    key={icon.key}
                    intent="secondary"
                    size="sm"
                    onClick={icon.onClick}
                    className="justify-center"
                  >
                    {icon.icon}
                    {icon.label ?? icon.key}
                  </Button>
                ))}
              </div>
            </div>
            {icons.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto border-t border-border-subtle px-4 py-2 md:hidden">
                {icons.map((icon) => (
                  <Button
                    key={icon.key}
                    intent="secondary"
                    size="sm"
                    onClick={icon.onClick}
                    className="shrink-0"
                  >
                    {icon.icon}
                    {icon.label ?? icon.key}
                  </Button>
                ))}
              </div>
            ) : null}
          </header>

          <main
            className={cn(
              "flex min-h-0 flex-1 flex-col",
              !isImmersiveWorkspace && "pb-20 lg:pb-0",
              isImmersiveWorkspace && footerState.isVisible && "pb-24 lg:pb-0"
            )}
          >
            {children}
          </main>
        </div>

        {!isImmersiveWorkspace ? (
          <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border-subtle bg-surface/95 px-2 py-2 backdrop-blur lg:hidden">
            <div className="grid grid-cols-5 gap-1">
              {primaryNav.map((item) => {
                const active = isActiveRoute(location.pathname, item.href);
                return (
                  <Button
                    key={item.href}
                    intent={active ? "primary" : "ghost"}
                    size="sm"
                    className="min-h-[52px] flex-col gap-1"
                    onClick={() => navigate(item.href)}
                  >
                    {item.icon}
                    <span className="text-[11px]">{item.shortLabel}</span>
                  </Button>
                );
              })}
              <Button
                intent={open ? "primary" : "ghost"}
                size="sm"
                className="min-h-[52px] flex-col gap-1"
                onClick={() => setOpen(true)}
              >
                <Bars3Icon className="h-5 w-5" />
                <span className="text-[11px]">More</span>
              </Button>
            </div>
          </nav>
        ) : null}

        {isImmersiveWorkspace && footerState.isVisible && footerState.icons.length > 0 ? (
          <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border-subtle bg-surface/95 px-3 py-2 backdrop-blur lg:hidden">
            <div className="grid auto-cols-fr grid-flow-col gap-2 overflow-x-auto">
              {footerState.icons.map((icon) => (
                <Button
                  key={icon.key}
                  intent="secondary"
                  size="sm"
                  className="min-h-[44px] flex-col gap-1 rounded-2xl px-2 py-2"
                  onClick={icon.onClick}
                >
                  {icon.icon}
                  <span className="text-[11px]">{icon.label}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <Drawer
        open={open}
        title="Navigate"
        description="Primary sections, favorites, and utility actions."
        onClose={() => setOpen(false)}
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button intent="secondary" size="sm" onClick={toggleTheme}>
              {theme === "dark" ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
              {theme === "dark" ? "Dark" : "Light"}
            </Button>
            {authEnabled ? (
              <Button intent="ghost" size="sm" onClick={() => void handleLogout()}>
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Log out
              </Button>
            ) : null}
          </div>
        }
      >
        <div className="space-y-6">
          <div className="space-y-2">
            {primaryNav.map((item) => {
              const active = isActiveRoute(location.pathname, item.href);
              return (
                <Button
                  key={item.href}
                  intent={active ? "primary" : "secondary"}
                  size="md"
                  className="w-full justify-between"
                  onClick={() => {
                    navigate(item.href);
                    setOpen(false);
                  }}
                >
                  <span className="flex items-center gap-3">
                    {item.icon}
                    {item.label}
                  </span>
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>

          <div className="space-y-2">
            <Button
              intent="primary"
              size="md"
              className="w-full justify-center"
              onClick={() => {
                navigate("/repertoires?create=1");
                setOpen(false);
              }}
            >
              <PlusIcon className="h-4 w-4" />
              New repertoire
            </Button>
            <Button
              intent="outline"
              size="md"
              className="w-full justify-center"
              onClick={() => void downloadRepertoiresBackup()}
            >
              Download backup
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-text-base">Favorites</p>
              <p className="text-sm text-text-muted">Pinned repertoires for quick access.</p>
            </div>
            {favoriteRepertoires.length > 0 ? (
              <div className="space-y-2">
                {favoriteRepertoires.map((repertoire) => (
                  <Button
                    key={repertoire._id}
                    intent="secondary"
                    size="md"
                    className="w-full justify-between"
                    onClick={() => {
                      navigate(`/repertoire/${repertoire._id}`);
                      setOpen(false);
                    }}
                  >
                    <span className="truncate">{repertoire.name}</span>
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border-default px-3 py-4 text-sm text-text-muted">
                No favorite repertoires yet.
              </div>
            )}
          </div>
        </div>
      </Drawer>

      <Drawer
        open={searchOpen}
        title="Quick search"
        description="Jump to a pinned repertoire."
        onClose={() => setSearchOpen(false)}
      >
        <div className="space-y-4">
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search favorites"
          />
          <div className="space-y-2">
            {filteredFavorites.length > 0 ? (
              filteredFavorites.map((repertoire) => (
                <Button
                  key={repertoire._id}
                  intent="secondary"
                  size="md"
                  className="w-full justify-between"
                  onClick={() => {
                    navigate(`/repertoire/${repertoire._id}`);
                    setSearchOpen(false);
                  }}
                >
                  <span className="truncate">{repertoire.name}</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border-default px-3 py-5 text-sm text-text-muted">
                No matching pinned repertoire.
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
};
