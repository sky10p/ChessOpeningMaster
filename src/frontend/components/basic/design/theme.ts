import { createTheme, responsiveFontSizes } from "@mui/material";

const theme = createTheme({
    palette: {
        primary: {
            main: "#2F3337"
        },
    },
})

const responsiveTheme = responsiveFontSizes(theme);

export default responsiveTheme;