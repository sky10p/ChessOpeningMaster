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
    const response = await request(app).post("/auth/register").send({ username: "a", password: "b" });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ token: "token", userId: "1" });
  });

  it("logs in with default user when allowed", async () => {
    (authService.loginDefaultUserWithoutPassword as jest.Mock).mockResolvedValue({ token: "token", userId: "1" });
    const response = await request(app).post("/auth/default-login").send({});
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ token: "token", userId: "1" });
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
      .set("Authorization", "Bearer token-value")
      .send({});

    expect(response.status).toBe(204);
    expect(authService.revokeToken).toHaveBeenCalledWith("token-value");
  });
});
