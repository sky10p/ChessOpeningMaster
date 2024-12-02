import { Box, TextField, Typography } from "@mui/material";
import React from "react"
import { MoveVariantNode } from "../../../../models/VariantNode";

interface HintInfoProps {
  currentMoveNode: MoveVariantNode;
}


export const HintInfo: React.FC<HintInfoProps> = ({
  currentMoveNode
}) => {
    const getHints = (): string[] => {
      const comments: string[] = [];
      let node = currentMoveNode;
      for(let i = 0; i < 3; i++) {
        if(node.move){
          comments.push(node.toString())
          if(node.comment) {
            comments.push(node.comment);
          }else{
            comments.push("No comment")
          }
        }
        
        if(node.parent) {
          node = node.parent;
        } else {
          break;
        }
      }
      return comments;
    }
   
    return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Comments
          </Typography>
      <TextField
        label="No comments"
        multiline
        disabled={true}
        rows={10}
        value={getHints().join("\n")}
        variant="outlined"
        fullWidth
      />
        </Box>
      );
}