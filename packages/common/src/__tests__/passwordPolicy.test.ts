import { PASSWORD_POLICY_MESSAGE, validatePasswordStrength } from "../utils/passwordPolicy";

describe("passwordPolicy", () => {
  it("accepts a strong password", () => {
    const result = validatePasswordStrength("StrongPass1!");

    expect(result.isValid).toBe(true);
    expect(result.message).toBeNull();
  });

  it("rejects a short password", () => {
    const result = validatePasswordStrength("Aa1!");

    expect(result.isValid).toBe(false);
    expect(result.message).toBe(PASSWORD_POLICY_MESSAGE);
  });

  it("rejects password missing required character classes", () => {
    const result = validatePasswordStrength("alllowercasepassword");

    expect(result.isValid).toBe(false);
    expect(result.message).toBe(PASSWORD_POLICY_MESSAGE);
  });
});