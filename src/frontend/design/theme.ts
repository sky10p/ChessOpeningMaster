import { createTheme, responsiveFontSizes } from "@mui/material";

declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      black: string;
    };
  }
  interface PaletteOptions {
    custom?: {
      black?: string;
    };
  }
}

const theme = createTheme({
    palette: {
        background: {
            default: '#636B74',
          },
        primary: {
            main: "#2F3337"
        },
        secondary: {
            main: "#FFFFFF"
        },
        custom: {
            black: "#2F3337"
        }
    },
    components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: 'transparent',
            },
            '*::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '*::-webkit-scrollbar-thumb': {
              backgroundColor: 'black',
              borderRadius: '4px',
            },
            '*::-webkit-scrollbar-thumb:hover': {
              backgroundColor: 'darkgray',
            },
          },
        },
      },
})

const responsiveTheme = responsiveFontSizes(theme);

export default responsiveTheme;