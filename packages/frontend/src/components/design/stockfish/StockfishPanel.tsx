import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import useStockfish from "../../../libs/useStockfish";

interface StockfishPanelProps {
  fen: string;
  numLines: number;
}

export  const StockfishPanel: React.FC<StockfishPanelProps> = ({ fen, numLines }) => {
  const lines = useStockfish(fen, numLines);

  return (
    <div>
      <TableContainer component={Paper} style={{ width: "100%", maxHeight: "300px", overflowY: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Line</TableCell>
              <TableCell>Evaluation</TableCell>
              <TableCell>Moves</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((line, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{line.evaluation}</TableCell>
                <TableCell>{line.moves.join(" ")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
