import { GameTimeControlBucket } from "@chess-opening-master/common";

export const toTimeControlBucket = (value?: string): GameTimeControlBucket | undefined => {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized.includes("bullet")) {
    return "bullet";
  }
  if (normalized.includes("blitz")) {
    return "blitz";
  }
  if (normalized.includes("rapid")) {
    return "rapid";
  }
  if (normalized.includes("classical") || normalized.includes("daily") || normalized.includes("correspondence")) {
    return "classical";
  }
  const raw = value.split("+")[0];
  const seconds = Number(raw);
  if (!Number.isFinite(seconds)) {
    if (raw.includes("/")) {
      const parts = raw.split("/");
      const denominator = Number(parts[1]);
      if (Number.isFinite(denominator) && denominator > 0) {
        return denominator >= 1800 ? "classical" : denominator >= 600 ? "rapid" : denominator >= 180 ? "blitz" : "bullet";
      }
    }
    return undefined;
  }
  if (seconds < 180) {
    return "bullet";
  }
  if (seconds < 600) {
    return "blitz";
  }
  if (seconds < 1800) {
    return "rapid";
  }
  return "classical";
};
