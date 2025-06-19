import express from "express";
import { getComment, updateComment, getCommentsByFens } from "../controllers/positionsController";

const router = express.Router();

router.get("/:fen", getComment);
router.put("/:fen", updateComment);
router.get("/comments", getCommentsByFens);

export default router;
