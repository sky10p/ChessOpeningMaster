import { createTheme, responsiveFontSizes } from "@mui/material";

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