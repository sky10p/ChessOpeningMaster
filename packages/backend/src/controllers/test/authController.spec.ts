import request from "supertest";
import app from "../../app";
import * as authService from "../../services/authService";

jest.mock("../../services/authService");

describe("auth routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authService.isAuthEnabled as jest.Mock).mockReturnValue(true);
    (authService.isDefaultUserAccessAllowed as jest.Mock).mockReturnValue(true);
    (authService.getDefaultUsername as jest.Mock).mockReturnValue("default");
  });

  it("returns auth config", async () => {
    const response = await request(app).get("/auth/config");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ enabled: true, allowDefaultUser: true, defaultUsername: "default" });
  });

  it("registers user", async () => {
    (authService.createUser as jest.Mock).mockResolvedValue("1");
    (authService.loginUser as jest.Mock).mockResolvedValue({ token: "token", userId: "1" });
    const response = await request(app).post("/auth/register").send({ username: "a", password: "StrongPass1!" });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ userId: "1" });
    expect(response.headers["set-cookie"]).toEqual(expect.arrayContaining([expect.stringContaining("chess_opening_master_auth=")]));
  });

  it("rejects weak passwords during registration", async () => {
    const response = await request(app).post("/auth/register").send({ username: "a", password: "b" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
    });
    expect(authService.createUser).not.toHaveBeenCalled();
  });

  it("logs in with default user when allowed", async () => {
    (authService.loginDefaultUserWithoutPassword as jest.Mock).mockResolvedValue({ token: "token", userId: "1" });
    const response = await request(app).post("/auth/default-login").send({});
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ userId: "1" });
    expect(response.headers["set-cookie"]).toEqual(expect.arrayContaining([expect.stringContaining("chess_opening_master_auth=")]));
  });

  it("returns 404 for default login when disabled", async () => {
    (authService.isDefaultUserAccessAllowed as jest.Mock).mockReturnValue(false);
    const response = await request(app).post("/auth/default-login").send({});
    expect(response.status).toBe(404);
  });

  it("revokes token on logout", async () => {
    (authService.revokeToken as jest.Mock).mockResolvedValue(undefined);
    const response = await request(app)
      .post("/auth/logout")
      .set("Cookie", "chess_opening_master_auth=token-value")
      .send({});

    expect(response.status).toBe(204);
    expect(authService.revokeToken).toHaveBeenCalledWith("token-value");
  });

  it("returns session as authenticated when cookie token is valid", async () => {
    (authService.getUserByToken as jest.Mock).mockResolvedValue("1");
    const response = await request(app)
      .get("/auth/session")
      .set("Cookie", "chess_opening_master_auth=token-value");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ authenticated: true, userId: "1" });
  });

  it("returns unauthenticated session when token is invalid or expired", async () => {
    (authService.getUserByToken as jest.Mock).mockResolvedValue(null);
    const response = await request(app)
      .get("/auth/session")
      .set("Cookie", "chess_opening_master_auth=token-value");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ authenticated: false, userId: null });
  });
});
