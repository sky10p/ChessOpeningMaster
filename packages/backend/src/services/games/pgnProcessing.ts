import { createHash } from "crypto";
import { GameSource, OpeningDetection } from "@chess-opening-master/common";

export interface ParsedPgnGame {
  headers: Record<string, string>;
  pgn: string;
  movesSan: string[];
}

const HEADER_RE = /^\s*\[(\w+)\s+"(.*)"\]\s*$/;

const parseHeaders = (block: string): Record<string, string> => {
  const headers: Record<string, string> = {};
  const lines = block.split(/\r?\n/);
  lines.forEach((line) => {
    const match = line.match(HEADER_RE);
    if (match) {
      headers[match[1]] = match[2];
    }
  });
  return headers;
};

const sanitizePgnBody = (value: string): string => value
  .replace(/\{[^}]*\}/g, " ")
  .replace(/\([^)]*\)/g, " ")
  .replace(/\$\d+/g, " ")
  .replace(/\r/g, " ")
  .replace(/\n/g, " ");

const extractMoves = (body: string): string[] => {
  const tokens = sanitizePgnBody(body).split(/\s+/).filter(Boolean);
  const moves: string[] = [];
  tokens.forEach((token) => {
    if (/^\d+\.+$/.test(token) || /^\d+\.{3}$/.test(token)) {
      return;
    }
    if (/^\d+\./.test(token)) {
      const cleaned = token.replace(/^\d+\.{1,3}/, "");
      if (cleaned) {
        moves.push(cleaned);
      }
      return;
    }
    if (token === "1-0" || token === "0-1" || token === "1/2-1/2" || token === "*") {
      return;
    }
    moves.push(token);
  });
  return moves;
};

export const splitPgnGames = (rawPgn: string): string[] => {
  const normalized = rawPgn.replace(/\r/g, "").trim();
  if (!normalized) {
    return [];
  }
  const chunks = normalized.split(/\n(?=\[Event\s+")/g);
  return chunks.map((chunk) => chunk.trim()).filter(Boolean);
};

export const parsePgnGames = (rawPgn: string): ParsedPgnGame[] => {
  return splitPgnGames(rawPgn).flatMap((chunk) => {
    const [headerSection, ...rest] = chunk.split(/\n\n/);
    const moveSection = rest.join("\n\n");
    const movesSan = extractMoves(moveSection);
    if (!headerSection || movesSan.length === 0) {
      return [];
    }
    return [{ headers: parseHeaders(headerSection), pgn: chunk, movesSan }];
  });
};

const normalizeResult = (value?: string): "1-0" | "0-1" | "1/2-1/2" | "*" => {
  if (value === "1-0" || value === "0-1" || value === "1/2-1/2") {
    return value;
  }
  return "*";
};

const sanitizeOpeningName = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }
  const normalized = value
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.length > 0 ? normalized : undefined;
};

const openingNameFromEcoUrl = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }
  try {
    const url = new URL(value);
    const lastSegment = url.pathname.split("/").filter(Boolean).pop();
    if (!lastSegment) {
      return undefined;
    }
    return sanitizeOpeningName(decodeURIComponent(lastSegment));
  } catch {
    const lastSegment = value.split("/").filter(Boolean).pop();
    return sanitizeOpeningName(lastSegment);
  }
};

export const inferOrientation = (username: string | undefined, white: string, black: string): "white" | "black" | undefined => {
  if (!username) {
    return undefined;
  }
  const normalized = username.toLowerCase();
  if (white.toLowerCase() === normalized) {
    return "white";
  }
  if (black.toLowerCase() === normalized) {
    return "black";
  }
  return undefined;
};

export const detectOpening = (headers: Record<string, string>, movesSan: string[], maxPlies = 12): OpeningDetection => {
  const lineMovesSan = movesSan.slice(0, maxPlies);
  const fallbackSignature = lineMovesSan.join(" ").toLowerCase();
  const lineKey = createHash("sha256").update(fallbackSignature).digest("hex").slice(0, 16);
  const eco = headers.ECO?.trim();
  const openingName = sanitizeOpeningName(headers.Opening?.trim())
    || sanitizeOpeningName(headers.Variation?.trim())
    || openingNameFromEcoUrl(headers.ECOUrl?.trim())
    || openingNameFromEcoUrl(headers.EcoUrl?.trim());
  if (eco || openingName) {
    return {
      eco,
      openingName,
      lineMovesSan,
      lineKey,
      confidence: eco && openingName ? 0.95 : 0.8,
      fallbackSignature,
    };
  }
  return {
    lineMovesSan,
    lineKey,
    confidence: lineMovesSan.length >= 6 ? 0.6 : 0.45,
    fallbackSignature,
  };
};

export const buildFallbackDedupeKey = (
  source: GameSource,
  playedAt: string | undefined,
  white: string,
  black: string,
  result: string,
  movesSan: string[]
): string => {
  const value = `${source}|${playedAt || "unknown"}|${white.toLowerCase()}|${black.toLowerCase()}|${normalizeResult(result)}|${movesSan.join(" ")}`;
  return createHash("sha256").update(value).digest("hex");
};

export const toNormalizedResult = normalizeResult;
