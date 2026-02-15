import { Router } from "express";
import { getPathAnalyticsSummary, getPathPlanSummary, getPaths } from "../controllers/pathsController";

const router = Router();

router.get("/", getPaths);
router.get("/plan", getPathPlanSummary);
router.get("/analytics", getPathAnalyticsSummary);

export default router;
