import plugin from "tailwindcss/plugin";

export const content = ["./src/**/*.{js,jsx,ts,tsx}"];
export const theme = {
  extend: {
    colors: {
      primary: "#1e293b", /* Fondo principal oscuro */
      secondary: "#475569", /* Gris medio */
      accent: "#fbbf24", /* Amarillo de acento */
      background: "#0f172a", /* Fondo aún más oscuro */
      textLight: "#e2e8f0", /* Texto claro */
      textDark: "#94a3b8", /* Texto gris oscuro */
      danger: "#f87171", /* Rojo para eliminar repertorios */
    },
  },
};
export const plugins = [
  plugin(function ({ addUtilities }) {
    addUtilities({
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
