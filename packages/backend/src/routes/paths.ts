import { Router } from "express";
import { getPaths } from "../controllers/pathsController";

const router = Router();

router.get("/", getPaths);

export default router;
