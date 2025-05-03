import { Router } from "express";
import {
  getStudies,
  createStudyGroup,
  updateStudyGroupName,
  deleteStudyGroup,
  createStudy,
  getStudy,
  deleteStudy,
  createStudyEntry,
  updateStudyEntry,
  deleteStudyEntry,
  createStudySession,
  deleteStudySession
} from "../controllers/studiesController";

const router = Router();

router.get("/", getStudies);
router.post("/", createStudyGroup);
router.put("/:id/name", updateStudyGroupName);
router.delete("/:id", deleteStudyGroup);

router.post("/:groupId/studies", createStudy);
router.get("/:groupId/studies/:studyId", getStudy);
router.delete("/:groupId/studies/:studyId", deleteStudy);

router.post("/:groupId/studies/:studyId/entries", createStudyEntry);
router.put("/:groupId/studies/:studyId/entries/:entryId", updateStudyEntry);
router.delete("/:groupId/studies/:studyId/entries/:entryId", deleteStudyEntry);

router.post("/:groupId/studies/:studyId/sessions", createStudySession);
router.delete("/:groupId/studies/:studyId/sessions/:sessionId", deleteStudySession);

export default router;
