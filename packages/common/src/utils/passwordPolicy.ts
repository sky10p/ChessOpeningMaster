export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";

export interface PasswordValidationResult {
  isValid: boolean;
  message: string | null;
}

export const validatePasswordStrength = (password: string): PasswordValidationResult => {
  const hasMinLength = password.length >= PASSWORD_MIN_LENGTH;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialCharacter = /[^A-Za-z0-9]/.test(password);

  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialCharacter;

  return {
    isValid,
    message: isValid ? null : PASSWORD_POLICY_MESSAGE,
  };
};