import { Request, Response, NextFunction } from "express";
import { getDefaultUserId, getUserByToken, isAuthEnabled } from "../services/authService";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    if (!isAuthEnabled()) {
      (req as Request & { userId: string }).userId = await getDefaultUserId();
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.slice(7);
    const userId = await getUserByToken(token);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    (req as Request & { userId: string }).userId = userId;
    return next();
  } catch (error) {
    return next(error);
  }
}
