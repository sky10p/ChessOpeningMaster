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
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={() => setOpen(false)}
      />
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
        <div className="absolute top-2 right-2">
          <button
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => setOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 pb-4 overflow-y-auto">
          <img
            src={chessNavbarBackground}
            alt="Chess Navbar Background"
            className="w-full h-20 object-cover mb-4"
          />
          <nav className="mt-5 px-2 space-y-1">
            
            {mainActions.map((link) => (
              <Link
                key={link.id}
                to={link.url}
                className="group flex items-center px-2 py-2 text-base font-medium text-white rounded-md hover:bg-gray-700"
                onClick={() => setOpen(false)}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            <div className="border-t border-gray-700 mt-5"></div>
            <Link
              key="dashboard"
              to="/dashboard"
              className="group flex items-center px-2 py-2 text-base font-medium text-white rounded-md hover:bg-gray-700"
              onClick={() => setOpen(false)}
            >
              <ChartPieIcon className="h-6 w-6 mr-2" />
              Dashboard
            </Link>
            
            <button
              className="group flex items-center justify-between px-2 py-2 text-base font-medium text-white rounded-md hover:bg-gray-700 w-full"
              onClick={() => setFavouritesOpen(!favouritesOpen)}
            >
              <div className="flex items-center">
                <StarIcon className="h-6 w-6 mr-2" />
                Repertoires
              </div>
              <ChevronDownIcon
                className={`h-5 w-5 transition-transform ${favouritesOpen ? 'transform rotate-180' : ''}`}
              />
            </button>
            {favouritesOpen && (
              <div className="overflow-auto max-h-32">
                {secondaryActions.map((link) => (
                  <div key={link.id} className="flex items-center justify-between px-2 py-2 text-base font-medium text-white rounded-md hover:bg-gray-700">
                    <Link
                      to={link.url}
                      className="flex items-center"
                      onClick={() => setOpen(false)}
                    >
                      {link.name}
                    </Link>
                    <button
                      className="ml-4 flex-shrink-0 h-6 w-6 text-gray-400 hover:text-gray-300"
                      onClick={link.onActionClick}
                    >
                      <EllipsisVerticalIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};
