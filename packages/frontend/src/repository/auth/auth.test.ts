import { getAuthConfig, getAuthSession, login, loginWithDefaultUser, logout, register } from "./auth";
import { API_URL } from "../constants";
import { apiFetch } from "../apiClient";

jest.mock("../apiClient", () => ({
  apiFetch: jest.fn(),
}));

describe("auth repository", () => {
  const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  it("loads auth config", async () => {
    mockApiFetch.mockResolvedValue({ ok: true, json: async () => ({ enabled: true, allowDefaultUser: true, defaultUsername: "default" }) } as Response);
    const result = await getAuthConfig();
    expect(mockApiFetch).toHaveBeenCalledWith(`${API_URL}/auth/config`);
    expect(result.enabled).toBe(true);
    expect(result.allowDefaultUser).toBe(true);
  });

  it("sends login request", async () => {
    mockApiFetch.mockResolvedValue({ ok: true, json: async () => ({ userId: "1" }) } as Response);
    const result = await login("user", "pass");
    expect(result.userId).toBe("1");
    expect(mockApiFetch).toHaveBeenCalledWith(
      `${API_URL}/auth/login`,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("sends register request", async () => {
    mockApiFetch.mockResolvedValue({ ok: true, json: async () => ({ userId: "1" }) } as Response);
    const result = await register("user", "pass");
    expect(result.userId).toBe("1");
  });

  it("returns backend register validation message", async () => {
    mockApiFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character" }),
    } as Response);

    await expect(register("user", "pass")).rejects.toMatchObject({
      message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      status: 400,
    });
  });

  it("sends default-user login request", async () => {
    mockApiFetch.mockResolvedValue({ ok: true, json: async () => ({ userId: "1" }) } as Response);
    const result = await loginWithDefaultUser();
    expect(result.userId).toBe("1");
    expect(mockApiFetch).toHaveBeenCalledWith(
      `${API_URL}/auth/default-login`,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("loads auth session", async () => {
    mockApiFetch.mockResolvedValue({ ok: true, json: async () => ({ authenticated: true, userId: "1" }) } as Response);
    const result = await getAuthSession();
    expect(result.authenticated).toBe(true);
    expect(mockApiFetch).toHaveBeenCalledWith(`${API_URL}/auth/session`);
  });

  it("sends logout request", async () => {
    mockApiFetch.mockResolvedValue({ ok: true, status: 204 } as Response);
    await logout();
    expect(mockApiFetch).toHaveBeenCalledWith(
      `${API_URL}/auth/logout`,
      expect.objectContaining({ method: "POST" })
    );
  });
});
