import { Router } from "express";
import {
  deleteImportedGameById,
  deleteImportedGames,
  deleteLinkedAccount,
  getGamesStatsSummary,
  getImportedGames,
  getLinkedAccounts,
  getTrainingPlan,
  patchTrainingPlanItem,
  postForceSynchronize,
  postGenerateTrainingPlan,
  postImportGames,
  postLinkedAccount,
} from "../controllers/gamesController";

const router = Router();

router.get("/accounts", getLinkedAccounts);
router.post("/accounts", postLinkedAccount);
router.delete("/accounts/:provider", deleteLinkedAccount);
router.post("/imports", postImportGames);
router.get("/imports", getImportedGames);
router.delete("/imports", deleteImportedGames);
router.delete("/imports/:gameId", deleteImportedGameById);
router.get("/stats", getGamesStatsSummary);
router.post("/training-plan", postGenerateTrainingPlan);
router.get("/training-plan", getTrainingPlan);
router.patch("/training-plan/:planId/items/:lineKey", patchTrainingPlanItem);
router.post("/force-sync", postForceSynchronize);

export default router;
