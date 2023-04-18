import {
  Button,
  Container,
  Grid,
  Typography,
  TextField,
  styled,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { createRepertoire } from "../../repository/repertoires/repertoires";
import { useNavbarContext } from "../../contexts/NavbarContext";
import { useNavigate } from "react-router-dom";

const CreateRepertoireContent = styled("div")`
  padding: ${(props) => props.theme.spacing(8, 0, 6)};
`;

const CreateRepertoireButtons = styled("div")`
  margin-top: ${(props) => props.theme.spacing(4)};
`;

const CreateRepertoire: React.FC = () => {
  const [repertoireName, setRepertoireName] = useState("");
  const { setOpen, updateRepertoires } = useNavbarContext();
  const navigate = useNavigate();
  useEffect(() => {
    setOpen(false);
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRepertoireName(event.target.value);
  };

  const handleCreateRepertoire = async () => {
    const createdRepertoire = await createRepertoire(repertoireName);
    const id = createdRepertoire.insertedId;
    updateRepertoires();
    navigate(`/repertoire/${id}`)
    
  };

  return (
    <div>
      <CreateRepertoireContent>
        <Container maxWidth="sm">
          <Typography component="h1" variant="h2" align="center" gutterBottom>
            Crear nuevo repertorio
          </Typography>
          <Typography variant="h5" align="center" paragraph>
            Ingresa el nombre de tu nuevo repertorio de aperturas personalizado.
          </Typography>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="repertoireName"
            label="Nombre del repertorio"
            name="repertoireName"
            autoFocus
            value={repertoireName}
            onChange={handleChange}
          />
          <CreateRepertoireButtons>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateRepertoire}
                >
                  Crear repertorio
                </Button>
              </Grid>
            </Grid>
          </CreateRepertoireButtons>
        </Container>
      </CreateRepertoireContent>
    </div>
  );
};

export default CreateRepertoire;
