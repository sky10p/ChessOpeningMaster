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
    <header className="relative bg-gradient-to-r from-slate-800 to-slate-900 shadow-md border-b border-slate-700">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-3 px-4">
        <div className="flex items-center">
          <button
            aria-label="menu"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-all duration-200"
            onClick={() => setOpenNavbar(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <h1 className="ml-3 text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            <a href="/" className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">ChessKeep</a>
          </h1>
        </div>
        
        <div className="flex items-center">
          <div className="flex items-center px-3 py-1.5 bg-slate-700/50 rounded-md mr-6 border border-slate-600">
            <p className="text-sm text-slate-300 hidden md:block">
              {isSaving ? "Saving repertoire..." : "Last repertoire saved"}
            </p>
            <div className="ml-2 text-slate-300">
              {isSaving ? (
                <CloudArrowUpIcon className="h-5 w-5 text-blue-400 animate-pulse" />
              ) : (
                <CloudDoneIcon className="h-5 w-5 text-green-400" />
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {icons.map((icon, i) => (
              <button
                key={i}
                onClick={icon.onClick}
                className="flex items-center justify-center w-8 h-8 text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded-md transition-all duration-200"
              >
                {icon.icon}
              </button>
            ))}
            {showLogout ? (
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1 rounded-md border border-slate-500 px-2 py-1 text-xs text-slate-200 transition-all duration-200 hover:border-amber-400 hover:text-amber-300"
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
