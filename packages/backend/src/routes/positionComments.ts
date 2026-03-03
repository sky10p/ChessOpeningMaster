import { Router } from "express";
import { getComment, updateComment, getCommentsByFens } from "../controllers/positionsController";

const router: Router = Router();

router.get("/comments", getCommentsByFens);
router.get("/:fen", getComment);
router.put("/:fen", updateComment);

export default router;
