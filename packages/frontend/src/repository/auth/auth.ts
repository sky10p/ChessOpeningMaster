import { API_URL } from "../constants";
import { apiFetch } from "../apiClient";

export interface AuthConfig {
  enabled: boolean;
  allowDefaultUser: boolean;
  defaultUsername: string;
}

export const getAuthConfig = async (): Promise<AuthConfig> => {
  const response = await fetch(`${API_URL}/auth/config`);
  if (!response.ok) {
    throw new Error("Unable to load auth configuration");
  }
  return response.json();
};

export const login = async (username: string, password: string): Promise<{ token: string; userId: string }> => {
  const response = await apiFetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid credentials");
  }

  return response.json();
};

export const register = async (username: string, password: string): Promise<{ token: string; userId: string }> => {
  const response = await apiFetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Unable to register");
  }

  return response.json();
};

export const loginWithDefaultUser = async (): Promise<{ token: string; userId: string }> => {
  const response = await apiFetch(`${API_URL}/auth/default-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error("Default user access is unavailable");
  }

  return response.json();
};

export const logout = async (): Promise<void> => {
  const response = await apiFetch(`${API_URL}/auth/logout`, {
    method: "POST",
  });

  if (!response.ok && response.status !== 204) {
    throw new Error("Unable to logout");
  }
};
