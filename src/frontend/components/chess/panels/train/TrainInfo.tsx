// TrainInfo.tsx
import React from "react";
import { Grid, Typography, Card, CardContent, Theme, useMediaQuery } from "@mui/material";
import whiteKing from "../../../../assets/white-king.svg";
import blackKing from "../../../../assets/black-king.svg";

const TrainInfo: React.FC = () => {
  const turn = "white";

  const isMobile = useMediaQuery((theme: Theme) =>
  theme.breakpoints.down("sm")
);

  const currentVariant = 1;
  const totalVariants = 5;

  return (
    <Card>
      <CardContent>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            {turn === "white" ? (
              <img src={whiteKing} alt="white king" />
            ) : (
              <img src={blackKing} alt="black king" />
            )}
          </Grid>
          <Grid item>
            <Typography variant="h5" component="div">
              Your turn
            </Typography>
            {!isMobile && <Typography variant="subtitle1" color="textSecondary">
              Play one of your allowed moves according to your repertoire
            </Typography>}
          </Grid>
        </Grid>
        {/*  <Typography variant="body1" style={{ marginTop: 16 }}>
          {currentVariant} de {totalVariants} variantes
        </Typography>
        <LinearProgress
          value={(currentVariant / totalVariants) * 100}
          variant="determinate"
          style={{ marginTop: 8 }}
        /> */}
      </CardContent>
    </Card>
  );
};

export default TrainInfo;
