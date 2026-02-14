import { Request, Response, NextFunction } from "express";
import { getDefaultUserId, getUserByToken, isAuthEnabled } from "../services/authService";
import { getTokenFromRequest } from "../utils/authToken";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    if (!isAuthEnabled()) {
      (req as Request & { userId: string }).userId = await getDefaultUserId();
      return next();
    }

    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
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
