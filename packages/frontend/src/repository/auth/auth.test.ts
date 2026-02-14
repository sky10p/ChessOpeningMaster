import { getAuthConfig, login, loginWithDefaultUser, logout, register } from "./auth";
import { API_URL } from "../constants";

describe("auth repository", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.clear();
  });

  it("loads auth config", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ enabled: true, allowDefaultUser: true, defaultUsername: "default" }) });
    const result = await getAuthConfig();
    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/auth/config`);
    expect(result.enabled).toBe(true);
    expect(result.allowDefaultUser).toBe(true);
  });

  it("sends login request", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ token: "abc", userId: "1" }) });
    const result = await login("user", "pass");
    expect(result.token).toBe("abc");
    expect(global.fetch).toHaveBeenCalled();
  });

  it("sends register request", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ token: "abc", userId: "1" }) });
    const result = await register("user", "pass");
    expect(result.userId).toBe("1");
  });

  it("sends default-user login request", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ token: "abc", userId: "1" }) });
    const result = await loginWithDefaultUser();
    expect(result.token).toBe("abc");
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/auth/default-login`,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("sends logout request", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, status: 204 });
    await logout();
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/auth/logout`,
      expect.objectContaining({ method: "POST" })
    );
  });
});
