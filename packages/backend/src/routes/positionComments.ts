import express from "express";
import { getComment, updateComment } from "../controllers/positionsController";

const router = express.Router();

router.get("/:fen", getComment);
router.put("/:fen", updateComment);

export default router;
