type LogContext = Record<string, unknown>;

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test" || typeof process.env.JEST_WORKER_ID !== "undefined";

const redactKeyPattern = /(token|secret|password|authorization|cookie)/i;

const sanitizeValue = (value: unknown): unknown => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      ...(isProduction ? {} : { stack: value.stack }),
    };
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }
  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    return Object.entries(source).reduce<Record<string, unknown>>((acc, [key, nestedValue]) => {
      acc[key] = redactKeyPattern.test(key) ? "[REDACTED]" : sanitizeValue(nestedValue);
      return acc;
    }, {});
  }
  return value;
};

const toErrorPayload = (error: unknown): Record<string, unknown> => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      ...(isProduction ? {} : { stack: error.stack }),
    };
  }
  return {
    message: String(error),
  };
};

export const logInfo = (message: string, context?: LogContext): void => {
  if (isTest) {
    return;
  }
  if (context) {
    console.log(message, sanitizeValue(context));
    return;
  }
  console.log(message);
};

export const logWarn = (message: string, context?: LogContext): void => {
  if (isTest) {
    return;
  }
  if (context) {
    console.warn(message, sanitizeValue(context));
    return;
  }
  console.warn(message);
};

export const logError = (message: string, error?: unknown, context?: LogContext): void => {
  if (isTest) {
    return;
  }
  const payload: Record<string, unknown> = {};
  if (context) {
    payload.context = sanitizeValue(context);
  }
  if (typeof error !== "undefined") {
    payload.error = toErrorPayload(error);
  }
  if (Object.keys(payload).length > 0) {
    console.error(message, payload);
    return;
  }
  console.error(message);
};