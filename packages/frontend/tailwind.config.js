import plugin from "tailwindcss/plugin";

export const darkMode = "class";
export const content = ["./src/**/*.{js,jsx,ts,tsx}"];
export const theme = {
  extend: {
    colors: {
      page: "var(--color-bg-page)",
      surface: "var(--color-bg-surface)",
      "surface-raised": "var(--color-bg-surface-raised)",
      interactive: "var(--color-bg-interactive)",
      brand: "var(--color-brand)",
      "brand-hover": "var(--color-brand-hover)",
      "brand-subtle": "var(--color-brand-subtle)",
      accent: "var(--color-accent)",
      "accent-hover": "var(--color-accent-hover)",
      danger: "var(--color-danger)",
      "danger-hover": "var(--color-danger-hover)",
      "danger-subtle": "var(--color-danger-subtle)",
      success: "var(--color-success)",
      warning: "var(--color-warning)",
      "text-base": "var(--color-text-base)",
      "text-muted": "var(--color-text-muted)",
      "text-subtle": "var(--color-text-subtle)",
      "text-on-brand": "var(--color-text-on-brand)",
      "border-default": "var(--color-border-default)",
      "border-subtle": "var(--color-border-subtle)",
    },
    borderRadius: {
      sm: "6px",
      md: "8px",
      lg: "12px",
      xl: "16px",
      "2xl": "20px",
    },
    spacing: {
      "safe-bottom": "env(safe-area-inset-bottom)",
      "screen-dynamic": "calc(var(--vh, 1vh) * 100)",
    },
    transitionDuration: {
      fast: "var(--transition-fast)",
      normal: "var(--transition-normal)",
      slow: "var(--transition-slow)",
    },
    boxShadow: {
      sm:       "var(--shadow-sm)",
      surface:  "var(--shadow-surface)",
      elevated: "var(--shadow-elevated)",
    },
    fontFamily: {
      sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
    },
  },
};
export const plugins = [
  plugin(function ({ addUtilities }) {
    addUtilities({
      ".scrollbar-none": {
        "scrollbar-width": "none",
        "&::-webkit-scrollbar": { display: "none" },
      },
      ".scrollbar-custom": {
        "scrollbar-width": "thin",
        "scrollbar-color": "var(--tw-scrollbar-thumb) var(--tw-scrollbar-track)",
      },
      ".scrollbar-custom::-webkit-scrollbar": {
        width: "8px",
      },
      ".scrollbar-custom::-webkit-scrollbar-track": {
        background: "var(--tw-scrollbar-track)",
      },
      ".scrollbar-custom::-webkit-scrollbar-thumb": {
        background: "var(--tw-scrollbar-thumb)",
        "border-radius": "4px",
      },
      ".scrollbar-custom::-webkit-scrollbar-thumb:hover": {
        background: "var(--tw-scrollbar-thumb-hover)",
      },
    });
  }),
];
