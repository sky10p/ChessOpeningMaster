import { Request, Response } from "express";
import { getPositionComment, updatePositionComment } from "../services/positionCommentService";

export const getComment = async (req: Request, res: Response) => {
  try {
    const { fen } = req.params;
    
    if (!fen) {
      return res.status(400).json({ error: "FEN position is required" });
    }
    
    const comment = await getPositionComment(fen);
    
    if (comment === null) {
      return res.status(404).json({ error: "No comment found for position" });
    }
    
    return res.json({ fen, comment });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch position comment" });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const { fen } = req.params;
    const { comment } = req.body;
    
    if (!fen) {
      return res.status(400).json({ error: "FEN position is required" });
    }
    
    if (comment === undefined) {
      return res.status(400).json({ error: "Comment is required" });
    }
    
    await updatePositionComment(fen, comment);
    
    return res.json({ fen, comment, message: "Comment updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update position comment" });
  }
};
