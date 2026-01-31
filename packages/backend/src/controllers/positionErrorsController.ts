import { Request, Response } from "express";
import {
  recordPositionError as recordError,
  getPositionErrors,
  getPositionErrorsByRepertoire,
  getTopPositionErrors,
  deletePositionError as deleteError,
  resolvePositionError,
} from "../services/positionErrorService";

export const recordPositionError = async (req: Request, res: Response) => {
  try {
    const { fen, repertoireId, wrongMove, expectedMoves, variantName, orientation } = req.body;

    if (!fen || !repertoireId || !wrongMove) {
      return res.status(400).json({
        error: "fen, repertoireId, and wrongMove are required",
      });
    }

    const positionError = await recordError(
      fen,
      repertoireId,
      wrongMove,
      expectedMoves || [],
      variantName,
      orientation
    );

    return res.status(201).json(positionError);
  } catch (error) {
    return res.status(500).json({ error: "Failed to record position error" });
  }
};

export const getAllPositionErrors = async (_req: Request, res: Response) => {
  try {
    const errors = await getPositionErrors();
    return res.json(errors);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch position errors" });
  }
};

export const getPositionErrorsByRepertoireId = async (
  req: Request,
  res: Response
) => {
  try {
    const { repertoireId } = req.params;

    if (!repertoireId) {
      return res.status(400).json({ error: "repertoireId is required" });
    }

    const errors = await getPositionErrorsByRepertoire(repertoireId);
    return res.json(errors);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch position errors" });
  }
};

export const getTopErrors = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const repertoireId = req.query.repertoireId as string | undefined;

    const errors = await getTopPositionErrors(limit, repertoireId);
    return res.json(errors);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch top position errors" });
  }
};

export const deletePositionError = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }

    const deleted = await deleteError(id);

    if (!deleted) {
      return res.status(404).json({ error: "Position error not found" });
    }

    return res.json({ message: "Position error deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete position error" });
  }
};

export const resolveError = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }

    const resolved = await resolvePositionError(id);

    if (!resolved) {
      return res.status(404).json({ error: "Position error not found" });
    }

    return res.json(resolved);
  } catch (error) {
    return res.status(500).json({ error: "Failed to resolve position error" });
  }
};
