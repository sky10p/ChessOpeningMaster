import { Request, Response } from "express";
import { validatePasswordStrength } from "@chess-opening-master/common";
import {
  createUser,
  getDefaultUsername,
  getUserByToken,
  isAuthEnabled,
  isDefaultUserAccessAllowed,
  loginDefaultUserWithoutPassword,
  loginUser,
  revokeToken,
} from "../services/authService";
import { clearAuthCookie, getTokenFromRequest, setAuthCookie } from "../utils/authToken";

export async function getAuthConfig(req: Request, res: Response) {
  return res.json({
    enabled: isAuthEnabled(),
    allowDefaultUser: isDefaultUserAccessAllowed(),
    defaultUsername: getDefaultUsername(),
  });
}

export async function register(req: Request, res: Response) {
  if (!isAuthEnabled()) {
    return res.status(404).json({ message: "Auth disabled" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const passwordValidationResult = validatePasswordStrength(password);
  if (!passwordValidationResult.isValid) {
    return res.status(400).json({ message: passwordValidationResult.message });
  }

  try {
    await createUser(username, password);
    const loginResult = await loginUser(username, password);
    if (!loginResult) {
      return res.status(500).json({ message: "Failed to register" });
    }
    setAuthCookie(res, loginResult.token);
    return res.status(201).json({ userId: loginResult.userId });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_ALREADY_EXISTS") {
      return res.status(409).json({ message: "User already exists" });
    }
    return res.status(500).json({ message: "Failed to register" });
  }
}

export async function login(req: Request, res: Response) {
  if (!isAuthEnabled()) {
    return res.status(404).json({ message: "Auth disabled" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const loginResult = await loginUser(username, password);
  if (!loginResult) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  setAuthCookie(res, loginResult.token);
  return res.json({ userId: loginResult.userId });
}

export async function loginWithDefaultUser(req: Request, res: Response) {
  if (!isAuthEnabled()) {
    return res.status(404).json({ message: "Auth disabled" });
  }

  if (!isDefaultUserAccessAllowed()) {
    return res.status(404).json({ message: "Default user access disabled" });
  }

  const loginResult = await loginDefaultUserWithoutPassword();
  setAuthCookie(res, loginResult.token);
  return res.json({ userId: loginResult.userId });
}

export async function logout(req: Request, res: Response) {
  if (!isAuthEnabled()) {
    return res.status(404).json({ message: "Auth disabled" });
  }

  const token = getTokenFromRequest(req);
  clearAuthCookie(res);

  if (!token) {
    return res.status(204).send();
  }

  await revokeToken(token);
  return res.status(204).send();
}

export async function getSession(req: Request, res: Response) {
  if (!isAuthEnabled()) {
    return res.json({ authenticated: true, userId: null });
  }

  const token = getTokenFromRequest(req);
  if (!token) {
    return res.json({ authenticated: false, userId: null });
  }

  const userId = await getUserByToken(token);
  if (!userId) {
    return res.json({ authenticated: false, userId: null });
  }

  return res.json({ authenticated: true, userId });
}
