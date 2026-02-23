import { Router } from "express";
import {
  getTrainOpeningSummary,
  getTrainOverviewSummary,
} from "../controllers/trainController";

const router = Router();

router.get("/overview", getTrainOverviewSummary);
router.get("/repertoires/:id/openings/:openingName", getTrainOpeningSummary);

export default router;
