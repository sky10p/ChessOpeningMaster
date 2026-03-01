import React from "react";
import { Link } from "react-router-dom";
import { XMarkIcon, EllipsisVerticalIcon, ArrowRightOnRectangleIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import chessNavbarBackground from "../../../assets/chess-navbar-background.jpg";
import { NavbarLink } from "./model";
import { ChartPieIcon, StarIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { AcademicCapIcon, BoltIcon, FlagIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../../../hooks/useTheme";

interface NavbarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  mainActions: NavbarLink[];
  secondaryActions: NavbarLink[];
  showLogout?: boolean;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ open, setOpen, mainActions, secondaryActions, showLogout = false, onLogout }) => {
  const [favouritesOpen, setFavouritesOpen] = React.useState(true);
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className={`fixed inset-0 z-40 flex ${open ? 'block' : 'hidden'}`}>
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setOpen(false)}
      />
      
      {/* Sidebar panel */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-surface-raised shadow-xl border-r border-border-default transition-transform duration-300">
        {/* Close button */}
        <div className="absolute top-3 right-3 z-10">
          <button
            className="flex items-center justify-center h-8 w-8 rounded-full bg-interactive/70 text-text-muted hover:bg-interactive hover:text-text-base transition-colors duration-200"
            onClick={() => setOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        
        <div className="flex-1 pb-4 overflow-y-auto">
          {/* Header image with gradient overlay */}
          <div className="relative">
            <img
              src={chessNavbarBackground}
              alt="Chess Navbar Background"
              className="w-full h-32 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-3 left-3 text-2xl font-bold text-white drop-shadow-md">ChessKeep</div>
          </div>
          
          <nav className="mt-6 px-3 space-y-1.5">
            {/* Main navigation links */}
            {mainActions.map((link) => (
              link.onClick ? (
                <button
                  key={link.id}
                  className="nav-link group w-full text-left"
                  onClick={() => {
                    link.onClick?.();
                    setOpen(false);
                  }}
                >
                  <span className="text-accent mr-3">{link.icon}</span>
                  <span>{link.name}</span>
                </button>
              ) : (
                <Link
                  key={link.id}
                  to={link.url}
                  className="nav-link group"
                  onClick={() => setOpen(false)}
                >
                  <span className="text-accent mr-3">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              )
            ))}
            
            <div className="border-t border-border-subtle my-4"></div>
            
            <Link
              key="dashboard"
              to="/dashboard"
              className="nav-link group"
              onClick={() => setOpen(false)}
            >
              <ChartPieIcon className="h-5 w-5 text-brand mr-3" />
              Dashboard
            </Link>

            <Link
              to="/path"
              className="nav-link group mt-2"
              onClick={() => setOpen(false)}
            >
              <FlagIcon className="h-5 w-5 text-brand mr-3" />
              <span>Path</span>
            </Link>

            <Link
              to="/train"
              className="nav-link group mt-2"
              onClick={() => setOpen(false)}
            >
              <BoltIcon className="h-5 w-5 text-accent mr-3" />
              <span>Train</span>
            </Link>
            
            {/* Repertoires dropdown */}
            <div className="mt-2">
              <button
                className="w-full nav-link justify-between group"
                onClick={() => setFavouritesOpen(!favouritesOpen)}
              >
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-accent mr-3" />
                  <span>Repertoires</span>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 text-text-subtle transition-transform duration-200 ${favouritesOpen ? 'transform rotate-180' : ''}`}
                />
              </button>
              
              {/* Repertoire items */}
              {favouritesOpen && (
                <div className="mt-1 ml-8 space-y-1 overflow-auto max-h-40 pr-2">
                  {secondaryActions.map((link) => (
                    <div 
                      key={link.id} 
                      className="flex items-center justify-between py-2 px-3 text-sm font-medium text-text-muted rounded-md hover:bg-interactive hover:text-text-base transition-colors duration-200"
                    >
                      <Link
                        to={link.url}
                        className="flex-1 truncate"
                        onClick={() => setOpen(false)}
                      >
                        {link.name}
                      </Link>
                      <button
                        className="ml-2 p-1 rounded-md text-text-subtle hover:text-accent hover:bg-interactive"
                        onClick={link.onActionClick}
                      >
                        <EllipsisVerticalIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Link
              to="/studies"
              className="nav-link group mt-2"
              onClick={() => setOpen(false)}
            >
              <AcademicCapIcon className="h-5 w-5 text-success mr-3" />
              <span>Studies</span>
            </Link>
            {showLogout ? (
              <button
                className="nav-link group mt-2 w-full text-left"
                onClick={() => {
                  onLogout?.();
                  setOpen(false);
                }}
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 text-danger mr-3" />
                <span>Logout</span>
              </button>
            ) : null}
          </nav>
          
          {/* Footer section */}
          <div className="mt-auto px-3 py-4 space-y-3">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-surface border border-border-subtle text-text-muted hover:text-text-base hover:bg-interactive transition-colors duration-200"
            >
              <div className="flex items-center gap-2.5">
                {theme === "dark" ? (
                  <MoonIcon className="h-4 w-4 text-brand" />
                ) : (
                  <SunIcon className="h-4 w-4 text-amber-400" />
                )}
                <span className="text-sm font-medium">{theme === "dark" ? "Dark mode" : "Light mode"}</span>
              </div>
              <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                theme === "light" ? "bg-brand" : "bg-border-default"
              }`}>
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  theme === "light" ? "translate-x-4" : "translate-x-1"
                }`} />
              </div>
            </button>
            <div className="px-3 py-3 bg-surface rounded-lg border border-border-subtle text-xs text-text-subtle">
              <p>ChessKeep v1.0</p>
              <p className="mt-1">Manage your chess repertoire with ease</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
