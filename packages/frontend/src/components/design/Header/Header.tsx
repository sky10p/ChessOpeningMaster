import React from "react";
import { ArrowRightOnRectangleIcon, Bars3Icon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { HeaderIcon } from "./models";
import { CloudDoneIcon } from "../../icons/CloudDoneIcon";

interface HeaderProps {
  setOpenNavbar: (open: boolean) => void;
  isSaving: boolean;
  icons: HeaderIcon[];
  showLogout?: boolean;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ setOpenNavbar, isSaving, icons, showLogout = false, onLogout }) => {
  return (
    <header className="relative bg-surface shadow-surface border-b border-border-default">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-2 px-3 md:p-3 md:px-4">
        <div className="flex items-center min-w-0">
          <button
            aria-label="menu"
            className="flex-shrink-0 p-1.5 md:p-2 text-text-muted hover:text-text-base hover:bg-interactive rounded-md transition-all duration-200"
            onClick={() => setOpenNavbar(true)}
          >
            <Bars3Icon className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          
          <h1 className="ml-2 md:ml-3 text-lg md:text-2xl font-bold truncate">
            <a href="/" className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">ChessKeep</a>
          </h1>
        </div>
        
        <div className="flex items-center flex-shrink-0 ml-2">
          <div className="hidden md:flex items-center px-3 py-1.5 bg-interactive/50 rounded-md mr-4 border border-border-default">
            <p className="text-sm text-text-muted">
              {isSaving ? "Saving repertoire..." : "Last repertoire saved"}
            </p>
            <div className="ml-2 text-text-muted">
              {isSaving ? (
                <CloudArrowUpIcon className="h-5 w-5 text-blue-400 animate-pulse" />
              ) : (
                <CloudDoneIcon className="h-5 w-5 text-green-400" />
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-3">
            {icons.map((icon, i) => (
              <button
                key={i}
                onClick={icon.onClick}
                className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-text-muted hover:text-accent hover:bg-interactive/50 rounded-md transition-all duration-200"
              >
                {icon.icon}
              </button>
            ))}
            {showLogout ? (
              <button
                onClick={onLogout}
                className="hidden md:inline-flex items-center gap-1 rounded-md border border-border-default px-2 py-1 text-xs text-text-muted transition-all duration-200 hover:border-accent hover:text-accent"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Logout
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
