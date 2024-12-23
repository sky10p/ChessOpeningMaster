import { Story } from "@ladle/react";
import Header from "./Header";
import HeaderTailwind from "./Header";
import React from "react";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import theme from "../../../design/theme";
import { BellIcon, BookmarkIcon, AcademicCapIcon, UserIcon } from "@heroicons/react/24/outline";

import '../../../index.css';

const icons = [
  { key: "bell", icon: <BellIcon className="h-6 w-6" />, onClick: () => alert("Bell icon clicked") },
  { key: "bookmark", icon: <BookmarkIcon className="h-6 w-6" />, onClick: () => alert("Bookmark icon clicked") },
  { key: "chat", icon: <AcademicCapIcon className="h-6 w-6" />, onClick: () => alert("Chat icon clicked") },
  { key: "user", icon: <UserIcon className="h-6 w-6" />, onClick: () => alert("User icon clicked") },
];

export const HeaderWithMenu: Story = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header setOpenNavbar={() => {}} isSaving={false} icons={icons} />
    </ThemeProvider>
  );
};

export const HeaderTailwindWithMenu: Story = () => {
    return (
        <ThemeProvider theme={theme}>
        <CssBaseline />
        <HeaderTailwind setOpenNavbar={() => {}} isSaving={false} icons={icons} />
        </ThemeProvider>
    );
    }
