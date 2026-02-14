import { Request, Response } from "express";
import {
  createUser,
  getDefaultUsername,
  isAuthEnabled,
  isDefaultUserAccessAllowed,
  loginDefaultUserWithoutPassword,
  loginUser,
  revokeToken,
} from "../services/authService";

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

  try {
    await createUser(username, password);
    const loginResult = await loginUser(username, password);
    return res.status(201).json(loginResult);
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

  return res.json(loginResult);
}

export async function loginWithDefaultUser(req: Request, res: Response) {
  if (!isAuthEnabled()) {
    return res.status(404).json({ message: "Auth disabled" });
  }

  if (!isDefaultUserAccessAllowed()) {
    return res.status(404).json({ message: "Default user access disabled" });
  }

  const loginResult = await loginDefaultUserWithoutPassword();
  return res.json(loginResult);
}

export async function logout(req: Request, res: Response) {
  if (!isAuthEnabled()) {
    return res.status(404).json({ message: "Auth disabled" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(204).send();
  }

  const token = authHeader.slice(7);
  await revokeToken(token);
  return res.status(204).send();
}
