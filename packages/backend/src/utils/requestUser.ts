import { Request } from "express";

export function getRequestUserId(req: Request): string {
  return (req as Request & { userId: string }).userId;
}
