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
          },
        },
      },
})

const responsiveTheme = responsiveFontSizes(theme);

export default responsiveTheme;