import { Router } from "express";
import { getAuthConfig, login, loginWithDefaultUser, logout, register } from "../controllers/authController";

const router = Router();

router.get("/config", getAuthConfig);
router.post("/register", register);
router.post("/login", login);
router.post("/default-login", loginWithDefaultUser);
router.post("/logout", logout);

export default router;
