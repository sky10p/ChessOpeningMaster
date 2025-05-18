import express from "express";
import { getComment } from "../controllers/positionsController";

const router = express.Router();

router.get("/:fen", getComment);

export default router;
