import {
  Box,
  Container,
  Grid,
  Typography,
  styled,
} from "@mui/material";
import React from "react";

const HeroContent = styled("div")`
  padding: ${(props) => props.theme.spacing(8, 0, 6)};
  background: linear-gradient(45deg, #2F3337 30%, #62676a 90%);
  color: white;
  margin: -17px;
`;

const FeatureContent = styled(Container)`
  padding: ${(props) => props.theme.spacing(8, 0, 6)};
`;

const Home: React.FC = () => {
  return (
    <div>
      <HeroContent>
        <Container maxWidth="sm">
          <Typography component="h1" variant="h2" align="center" gutterBottom>
            Chess Opening Master
          </Typography>
          <Typography variant="h5" align="center" paragraph>
            Mejora tus habilidades en las aperturas de ajedrez con nuestra
            herramienta interactiva. Explora, aprende y crea tus propios
            repertorios personalizados.
          </Typography>
        </Container>
      </HeroContent>

      <FeatureContent maxWidth="md">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Typography variant="h6" gutterBottom>
                Explora aperturas
              </Typography>
              <Typography>
                Descubre una amplia variedad de aperturas de ajedrez y sus
                variantes. Aprende los movimientos clave y las ideas
                estratégicas detrás de cada apertura.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Typography variant="h6" gutterBottom>
                Personaliza tu repertorio
              </Typography>
              <Typography>
                Crea y gestiona tus propios repertorios de aperturas. Añade,
                edita y elimina variantes según tus preferencias y estilo de
                juego.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Typography variant="h6" gutterBottom>
                Comparte y colabora
              </Typography>
              <Typography>
                Exporta e importa tus repertorios para compartirlos con amigos y
                entrenadores. Colabora y mejora juntos en las aperturas de
                ajedrez.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </FeatureContent>
    </div>
  );
};

export default Home;
