import React from "react";
import { Link } from "react-router-dom";
import { XMarkIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import chessNavbarBackground from "../../../assets/chess-navbar-background.jpg";
import { NavbarLink } from "./model";
import { ChartPieIcon, StarIcon, ChevronDownIcon } from "@heroicons/react/24/solid";

interface NavbarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  mainActions: NavbarLink[];
  secondaryActions: NavbarLink[];
}

export const Navbar: React.FC<NavbarProps> = ({ open, setOpen, mainActions, secondaryActions }) => {
  const [favouritesOpen, setFavouritesOpen] = React.useState(true);
  
  return (
    <div className={`fixed inset-0 z-40 flex ${open ? 'block' : 'hidden'}`}>
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setOpen(false)}
      />
      
      {/* Sidebar panel */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-slate-800 to-slate-900 shadow-xl border-r border-slate-700 transition-transform duration-300">
        {/* Close button */}
        <div className="absolute top-3 right-3 z-10">
          <button
            className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-700/70 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors duration-200"
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
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
            <div className="absolute bottom-3 left-3 text-2xl font-bold text-white">ChessKeep</div>
          </div>
          
          <nav className="mt-6 px-3 space-y-1.5">
            {/* Main navigation links */}
            {mainActions.map((link) => (
              <Link
                key={link.id}
                to={link.url}
                className="nav-link group"
                onClick={() => setOpen(false)}
              >
                <span className="text-amber-400 mr-3">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            ))}
            
            <div className="border-t border-slate-700/70 my-4"></div>
            
            <Link
              key="dashboard"
              to="/dashboard"
              className="nav-link group"
              onClick={() => setOpen(false)}
            >
              <ChartPieIcon className="h-5 w-5 text-blue-400 mr-3" />
              Dashboard
            </Link>
            
            {/* Repertoires dropdown */}
            <div className="mt-2">
              <button
                className="w-full nav-link justify-between group"
                onClick={() => setFavouritesOpen(!favouritesOpen)}
              >
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-amber-400 mr-3" />
                  <span>Repertoires</span>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${favouritesOpen ? 'transform rotate-180' : ''}`}
                />
              </button>
              
              {/* Repertoire items */}
              {favouritesOpen && (
                <div className="mt-1 ml-8 space-y-1 overflow-auto max-h-40 pr-2">
                  {secondaryActions.map((link) => (
                    <div 
                      key={link.id} 
                      className="flex items-center justify-between py-2 px-3 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-700/50 hover:text-white transition-colors duration-200"
                    >
                      <Link
                        to={link.url}
                        className="flex-1 truncate"
                        onClick={() => setOpen(false)}
                      >
                        {link.name}
                      </Link>
                      <button
                        className="ml-2 p-1 rounded-md text-slate-400 hover:text-amber-400 hover:bg-slate-700"
                        onClick={link.onActionClick}
                      >
                        <EllipsisVerticalIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </nav>
          
          {/* Footer section */}
          <div className="mt-auto px-3 py-4">
            <div className="px-3 py-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-xs text-slate-400">
              <p>ChessOpeningMaster v1.0</p>
              <p className="mt-1">Manage your chess repertoire with ease</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
