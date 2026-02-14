import { Router } from "express";
import { getAuthConfig, getSession, login, loginWithDefaultUser, logout, register } from "../controllers/authController";
import { authLoginRateLimit } from "../middleware/authRateLimit";

const router = Router();

router.get("/config", getAuthConfig);
router.get("/session", getSession);
router.post("/register", register);
router.post("/login", authLoginRateLimit, login);
router.post("/default-login", authLoginRateLimit, loginWithDefaultUser);
router.post("/logout", logout);

export default router;
