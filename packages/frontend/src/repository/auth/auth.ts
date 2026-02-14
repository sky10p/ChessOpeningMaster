import { API_URL } from "../constants";
import { apiFetch } from "../apiClient";

export interface AuthConfig {
  enabled: boolean;
  allowDefaultUser: boolean;
  defaultUsername: string;
}

export interface AuthSession {
  authenticated: boolean;
  userId: string | null;
}

export interface AuthResult {
  userId: string;
}

export type AuthRequestErrorType = "authentication" | "network" | "server" | "unknown";

export class AuthRequestError extends Error {
  readonly type: AuthRequestErrorType;
  readonly status?: number;

  constructor(message: string, type: AuthRequestErrorType, status?: number) {
    super(message);
    this.name = "AuthRequestError";
    this.type = type;
    this.status = status;
  }
}

const toAuthRequestError = (error: unknown): AuthRequestError => {
  if (error instanceof AuthRequestError) {
    return error;
  }
  if (error instanceof TypeError) {
    return new AuthRequestError("Unable to reach authentication service", "network");
  }
  return new AuthRequestError("Unable to complete authentication request", "unknown");
};

export const getAuthConfig = async (): Promise<AuthConfig> => {
  const response = await apiFetch(`${API_URL}/auth/config`);
  if (!response.ok) {
    throw new Error("Unable to load auth configuration");
  }
  return response.json();
};

export const getAuthSession = async (): Promise<AuthSession> => {
  const response = await apiFetch(`${API_URL}/auth/session`);
  if (!response.ok) {
    throw new Error("Unable to load auth session");
  }
  return response.json();
};

export const login = async (username: string, password: string): Promise<AuthResult> => {
  try {
    const response = await apiFetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new AuthRequestError("Invalid credentials", "authentication", response.status);
      }
      if (response.status >= 500) {
        throw new AuthRequestError("Authentication service unavailable", "server", response.status);
      }
      throw new AuthRequestError("Unable to login", "unknown", response.status);
    }

    return response.json();
  } catch (error) {
    throw toAuthRequestError(error);
  }
};

export const register = async (username: string, password: string): Promise<AuthResult> => {
  try {
    const response = await apiFetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      let message = "Unable to register";
      try {
        const payload = await response.json();
        if (payload && typeof payload.message === "string") {
          message = payload.message;
        }
      } catch (error) {
        message = "Unable to register";
      }

      if (response.status >= 500) {
        throw new AuthRequestError("Authentication service unavailable", "server", response.status);
      }

      throw new AuthRequestError(message, "unknown", response.status);
    }

    return response.json();
  } catch (error) {
    throw toAuthRequestError(error);
  }
};

export const loginWithDefaultUser = async (): Promise<AuthResult> => {
  try {
    const response = await apiFetch(`${API_URL}/auth/default-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new AuthRequestError("Default user access is unavailable", "authentication", response.status);
      }
      if (response.status >= 500) {
        throw new AuthRequestError("Authentication service unavailable", "server", response.status);
      }
      throw new AuthRequestError("Default user access is unavailable", "unknown", response.status);
    }

    return response.json();
  } catch (error) {
    throw toAuthRequestError(error);
  }
};

export const logout = async (): Promise<void> => {
  const response = await apiFetch(`${API_URL}/auth/logout`, {
    method: "POST",
  });

  if (!response.ok && response.status !== 204) {
    throw new Error("Unable to logout");
  }
};
