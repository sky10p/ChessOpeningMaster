import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import RegisterPage from "./RegisterPage";
import { register } from "../../repository/auth/auth";

jest.mock("../../repository/auth/auth", () => ({
  register: jest.fn(),
  AuthRequestError: class AuthRequestError extends Error {
    readonly type: string;
    readonly status?: number;

    constructor(message: string, type: string, status?: number) {
      super(message);
      this.type = type;
      this.status = status;
    }
  },
}));

const mockRegister = register as jest.Mock;

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows password policy error and avoids API call for weak password", async () => {
    render(
      <MemoryRouter>
        <RegisterPage onAuthenticated={jest.fn()} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "user" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "a" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm password"), { target: { value: "a" } });
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
          { selector: "div" }
        )
      ).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("submits when password meets policy", async () => {
    mockRegister.mockResolvedValue({ userId: "1" });

    render(
      <MemoryRouter>
        <RegisterPage onAuthenticated={jest.fn()} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "user" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "StrongPass1!" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm password"), { target: { value: "StrongPass1!" } });
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith("user", "StrongPass1!");
    });
  });
});
