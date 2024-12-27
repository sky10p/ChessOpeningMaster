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
      scrollbarThumb: "#475569", /* Color del pulgar de la barra de desplazamiento */
      scrollbarTrack: "#1e293b", /* Color de la pista de la barra de desplazamiento */
      scrollbarThumbHover: "#64748b", /* Color del pulgar de la barra de desplazamiento al pasar el ratón */
    },
    spacing: {
      'safe-bottom': 'env(safe-area-inset-bottom)',
      'screen-dynamic': 'calc(var(--vh, 1vh) * 100)',
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
