import { Story } from "@ladle/react";
import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { BrowserRouter as Router } from "react-router-dom";
import { NavbarLink } from "./model";
import { ArrowDownTrayIcon, PlusIcon } from "@heroicons/react/24/outline";

const mainActions: NavbarLink[] = [
    { id: '1', name: "Download Repertoires", url: "/", onActionClick: () => alert("Home action clicked"), icon: <ArrowDownTrayIcon className="w-6 h-6 mr-2" /> },
    { id: '2', name: "Create repertoire", url: "/create", onActionClick: () => alert("About action clicked"), icon: <PlusIcon className="w-6 h-6 mr-2" /> },
];

const links: NavbarLink[] = [
    { id: '1', name: "Link 1", url: "/link1", onActionClick: () => alert("Link 1 action clicked") },
    { id: '2', name: "Link 2", url: "/link2", onActionClick: () => alert("Link 2 action clicked") },
    { id: '3', name: "Link 3", url: "/link3", onActionClick: () => alert("Link 3 action clicked") },
    { id: '4', name: "Link 4", url: "/link4", onActionClick: () => alert("Link 4 action clicked") },
    { id: '5', name: "Link 5", url: "/link5", onActionClick: () => alert("Link 5 action clicked") },
];

export const NavbarStory: Story = () => {
    const [open, setOpen] = useState(false);

    return (

            <Router>
                <button onClick={() => setOpen(!open)}>
                    {open ? "Close Navbar" : "Open Navbar"}
                </button>
                <Navbar open={open} setOpen={setOpen} secondaryActions={links} mainActions={mainActions} />
            </Router>
    );
};