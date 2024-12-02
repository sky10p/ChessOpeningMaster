// TrainInfo.tsx
import React, { useState } from "react";
import {
  Grid,
  Typography,
  Card,
  CardContent,
  Theme,
  useMediaQuery,
  LinearProgress,
} from "@mui/material";
import whiteKing from "../../../../assets/white-king.svg";
import blackKing from "../../../../assets/black-king.svg";
import { getMovementsFromVariant } from "../../../../utils/chess/variants/getMovementsFromVariants";
import { Turn } from "../../../../../common/types/Orientation";
import { TrainVariant } from "../../../../models/chess.models";
import { MoveVariantNode } from "../../../../models/VariantNode";

interface TrainInfoProps {
  turn: Turn;
  isYourTurn: boolean;
  trainVariants: TrainVariant[];
  finishedTrain: boolean;
  currentMoveNode: MoveVariantNode;
}

const TrainInfo: React.FC<TrainInfoProps> = ({
  turn,
  isYourTurn,
  trainVariants,
  finishedTrain,
  currentMoveNode
}) => {

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

  const currentVariant = trainVariants.filter(
    (variant) => variant.state === "finished"
  ).length;
  const totalVariants = trainVariants.length;

  const availableVariants = trainVariants.filter(
    (variant) => variant.state === "inProgress"
  );

  const [expandedVariant, setExpandedVariant] = useState<number | null>(null);

  const handleToggleVariant = (index: number) => {
    setExpandedVariant(expandedVariant === index ? null : index);
  };

  return (
    <Card>
      <CardContent>
        <Grid container alignItems="center" spacing={2}>
          {!finishedTrain && (
            <Grid item>
              {turn === "white" ? (
                <img src={whiteKing} alt="white king" />
              ) : (
                <img src={blackKing} alt="black king" />
              )}
            </Grid>
          )}
          <Grid item>
            <Typography variant="h5" component="div">
              {finishedTrain
                ? "Finished Training"
                : isYourTurn
                ? "Your turn"
                : "Opponent's turn"}
            </Typography>
            {!isMobile && (
              <Typography variant="subtitle1" color="textSecondary">
                {finishedTrain
                  ? "You have finished one full variant"
                  : isYourTurn
                  ? "Play one of your allowed moves according to your repertoire"
                  : "Wait for your opponent to play"}
              </Typography>
            )}
          </Grid>
        </Grid>
        <Typography variant="body1" style={{ marginTop: 16 }}>
          {currentVariant} de {totalVariants} variantes
        </Typography>
        <LinearProgress
          value={(currentVariant / totalVariants) * 100}
          variant="determinate"
          style={{ marginTop: 16, marginBottom: 16 }}
        />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" style={{ marginBottom: 8 }}>
              Available Variants to Play
            </Typography>
          </Grid>
          <Grid item xs={12} style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
              {availableVariants.map((variant, index) => (
                <li
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "16px",
                    marginBottom: "12px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                    cursor: "pointer",
                  }}
                  onClick={() => handleToggleVariant(index)}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: "#3f51b5",
                        marginRight: "12px",
                        flexShrink: 0,
                      }}
                    ></span>
                    <Typography variant="body1" style={{ fontWeight: 500, flexGrow: 1 }}>
                      {variant.variant.fullName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Click to see variant
                    </Typography>
                  </div>
                  {expandedVariant === index && (
                    <div style={{ marginTop: "8px", paddingLeft: "24px", display: "flex", flexWrap: "wrap" }}>
                      {getMovementsFromVariant(variant, currentMoveNode).map((move, moveIndex) => (
                        <Typography key={moveIndex} variant="body2" style={{ marginRight: "16px", marginBottom: "8px" }}>
                          {move}
                        </Typography>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TrainInfo;
