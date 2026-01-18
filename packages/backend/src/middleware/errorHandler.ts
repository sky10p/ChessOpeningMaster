import { Request, Response } from "express";

interface ErrorWithStatus extends Error {
  status?: number;
}

export default function errorHandler(err: ErrorWithStatus, req: Request, res: Response) {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
}
