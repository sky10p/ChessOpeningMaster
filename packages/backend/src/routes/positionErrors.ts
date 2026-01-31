import express from "express";
import {
  recordPositionError,
  getAllPositionErrors,
  getPositionErrorsByRepertoireId,
  getTopErrors,
  deletePositionError,
  resolveError,
} from "../controllers/positionErrorsController";

const router = express.Router();

router.post("/", recordPositionError);
router.get("/", getAllPositionErrors);
router.get("/top", getTopErrors);
router.get("/repertoire/:repertoireId", getPositionErrorsByRepertoireId);
router.delete("/:id", deletePositionError);
router.patch("/:id/resolve", resolveError);

export default router;
