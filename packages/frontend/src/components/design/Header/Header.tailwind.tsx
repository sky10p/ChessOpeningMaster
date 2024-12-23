import React from "react";
import { Bars3Icon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { HeaderIcon } from "./models";

import "../../../index.css";
import { CloudDoneIcon } from "./icons/CloudDoneIcon";

interface HeaderProps {
  setOpenNavbar: (open: boolean) => void;
  isSaving: boolean;
  icons: HeaderIcon[];
}

const Header: React.FC<HeaderProps> = ({ setOpenNavbar, isSaving, icons }) => {
  return (
    <header className="relative bg-gray-800 shadow">
      <div className="flex items-center justify-between p-4">
        <button
          aria-label="menu"
          className="p-2 text-gray-300 hover:text-white"
          onClick={() => setOpenNavbar(true)}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <div className="flex items-center flex-grow">
          <h1 className="text-xl font-semibold text-accent">ChessKeep</h1>
          <div className="flex items-center ml-4">
            <p className="text-sm text-gray-300">
              {isSaving ? "Saving repertoire..." : "Last repertoire saved"}
            </p>
            <div className="ml-2 text-gray-300">
              {isSaving ? <CloudArrowUpIcon className="h-6 w-6" /> : <CloudDoneIcon className="h-6 w-6" />}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {icons.map((icon, i) => (
            <button
              key={i}
              onClick={icon.onClick}
              className="p-2 text-gray-300 hover:text-white"
            >
              {icon.icon}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
