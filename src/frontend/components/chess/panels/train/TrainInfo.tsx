// TrainInfo.tsx
import React from "react";
import { Grid, Typography, Card, CardContent, Theme, useMediaQuery } from "@mui/material";
import whiteKing from "../../../../assets/white-king.svg";
import blackKing from "../../../../assets/black-king.svg";
import { useTrainRepertoireContext } from "../../../../contexts/TrainRepertoireContext";

const TrainInfo: React.FC = () => {
 const {turn, isYourTurn, finishedTrain} = useTrainRepertoireContext();

  const isMobile = useMediaQuery((theme: Theme) =>
  theme.breakpoints.down("sm")
);

  const currentVariant = 1;
  const totalVariants = 5;

  return (
    <Card>
      <CardContent>
        <Grid container alignItems="center" spacing={2}>
          {!finishedTrain && <Grid item>
            {turn === "white" ? (
              <img src={whiteKing} alt="white king" />
            ) : (
              <img src={blackKing} alt="black king" />
            )}
          </Grid>}
          <Grid item>
            <Typography variant="h5" component="div">
            {finishedTrain ? "Finished Training" : isYourTurn ? "Your turn" : "Opponent's turn"}
            </Typography>
            {!isMobile && <Typography variant="subtitle1" color="textSecondary">
              
              {finishedTrain ? "You have finished one full variant" :isYourTurn ? "Play one of your allowed moves according to your repertoire" : "Wait for your opponent to play"}
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
