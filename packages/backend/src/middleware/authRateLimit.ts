import { Request, Response, NextFunction } from "express";

type RateLimitEntry = {
  attempts: number;
  windowStart: number;
};

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_ATTEMPTS = 10;

const parseEnvNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const windowMs = parseEnvNumber(process.env.AUTH_LOGIN_RATE_LIMIT_WINDOW_MS, DEFAULT_WINDOW_MS);
const maxAttempts = parseEnvNumber(process.env.AUTH_LOGIN_RATE_LIMIT_MAX_ATTEMPTS, DEFAULT_MAX_ATTEMPTS);

const attemptsByIp = new Map<string, RateLimitEntry>();

const getClientIp = (req: Request) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.ip || "unknown";
};

export const authLoginRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const ip = getClientIp(req);
  const now = Date.now();

  const current = attemptsByIp.get(ip);
  if (!current || now - current.windowStart >= windowMs) {
    attemptsByIp.set(ip, { attempts: 1, windowStart: now });
    next();
    return;
  }

  if (current.attempts >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((windowMs - (now - current.windowStart)) / 1000);
    res.setHeader("Retry-After", String(Math.max(1, retryAfterSeconds)));
    res.status(429).json({ message: "Too many login attempts. Please try again later." });
    return;
  }

  current.attempts += 1;
  attemptsByIp.set(ip, current);
  next();
};
