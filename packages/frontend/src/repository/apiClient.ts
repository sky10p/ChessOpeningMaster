export const AUTH_TOKEN_KEY = "chess-opening-master-auth-token";

export const getAuthToken = (): string | null => {
  if (process.env.NODE_ENV === "test") {
    return null;
  }
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const apiFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const token = getAuthToken();

  if (!token) {
    if (init === undefined) {
      return fetch(input);
    }
    return fetch(input, init);
  }

  const headers = new Headers(init?.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, {
    ...init,
    headers,
  });
};
