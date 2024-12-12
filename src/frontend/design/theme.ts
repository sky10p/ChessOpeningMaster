import { createTheme, responsiveFontSizes } from "@mui/material";

declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      black: string;
      lightGray: string;
      darkGray: string;
      highlight: string;
    };
  }
  interface PaletteOptions {
    custom?: {
      black?: string;
      lightGray?: string;
      darkGray?: string;
      highlight?: string;
    };
  }
}

const theme = createTheme({
  palette: {
    background: {
      default: '#636B74',
    },
    primary: {
      main: "#2F3337",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#FFFFFF",
      contrastText: "#2F3337",
      light: "#F0F0F0",
    },
    text: { 
      primary: "#000000",
      secondary: "#4A4A4A",
    },
    custom: {
      black: "#2F3337",
      lightGray: "#D3D3D3",
      darkGray: "#A9A9A9",
      highlight: "#FFD700",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Arial', sans-serif",
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      
    },
    h5: {
      fontSize: "1.5rem",
      fontWeight: 600,
      
    },
    h6: {
      fontSize: "1.25rem",
      fontWeight: 500,
      
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
      
    },
  },
  spacing: 8, // Added spacing unit
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: 'transparent',
          margin: 0,
          padding: 0,
          fontFamily: "'Roboto', 'Arial', sans-serif",
        },
        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: '#2F3337',
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          backgroundColor: '#A9A9A9',
        },
      },
    },
  },
});

const responsiveTheme = responsiveFontSizes(theme);

export default responsiveTheme;
