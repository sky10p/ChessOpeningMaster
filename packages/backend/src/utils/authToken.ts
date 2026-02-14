import { Request, Response } from "express";
import { getAuthTokenTtlMs } from "../services/authService";

export const AUTH_COOKIE_NAME = "chess_opening_master_auth";

const cookieSecure = process.env.NODE_ENV === "production";

const getCookieSameSite = (): "lax" | "none" | "strict" => {
  const configuredValue = (process.env.AUTH_COOKIE_SAME_SITE || "").toLowerCase();
  if (configuredValue === "none" && cookieSecure) {
    return "none";
  }
  if (configuredValue === "strict") {
    return "strict";
  }
  return "lax";
};

const cookieSameSite = getCookieSameSite();

const splitCookieHeader = (cookieHeader: string): string[] => cookieHeader.split(";");

const parseCookieEntry = (cookieEntry: string): { key: string; value: string } => {
  const [rawKey, ...rawValue] = cookieEntry.trim().split("=");
  return {
    key: decodeURIComponent(rawKey || ""),
    value: decodeURIComponent(rawValue.join("=")),
  };
};

export const getTokenFromCookie = (req: Request): string | null => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return null;
  }

  const tokenCookie = splitCookieHeader(cookieHeader)
    .map(parseCookieEntry)
    .find((entry) => entry.key === AUTH_COOKIE_NAME);

  if (!tokenCookie || !tokenCookie.value) {
    return null;
  }

  return tokenCookie.value;
};

export const getTokenFromAuthorizationHeader = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  return token || null;
};

export const getTokenFromRequest = (req: Request): string | null =>
  getTokenFromCookie(req) || getTokenFromAuthorizationHeader(req);

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSameSite,
    path: "/",
    maxAge: getAuthTokenTtlMs(),
  });
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSameSite,
    path: "/",
  });
};
