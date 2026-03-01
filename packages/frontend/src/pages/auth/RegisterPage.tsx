import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PASSWORD_POLICY_MESSAGE, validatePasswordStrength } from "@chess-opening-master/common";
import { AuthRequestError, register } from "../../repository/auth/auth";
import { Button, Input } from "../../components/ui";

interface RegisterPageProps {
  onAuthenticated: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onAuthenticated }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!username || !password || !confirmPassword) {
      setError("Username, password and confirmation are required");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const passwordValidationResult = validatePasswordStrength(password);
    if (!passwordValidationResult.isValid) {
      setError(passwordValidationResult.message);
      return;
    }
    setIsSubmitting(true);
    try {
      await register(username, password);
      onAuthenticated();
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to register user", error);
      setError(error instanceof AuthRequestError ? error.message : "Unable to register user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-12 rounded-2xl border border-border-default bg-surface shadow-elevated">
      <div className="rounded-t-2xl bg-interactive px-6 py-5">
        <h1 className="text-2xl font-semibold text-text-base">Register</h1>
        <p className="mt-1 text-sm text-text-muted">Create a user to enable secure access</p>
      </div>
      <form className="flex flex-col gap-4 p-6" onSubmit={submit}>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <p className="text-xs text-text-subtle">{PASSWORD_POLICY_MESSAGE}</p>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
        />
        {error ? <div className="rounded-md bg-danger/10 border border-danger/30 p-2 text-sm text-danger">{error}</div> : null}
        <Button
          intent="primary"
          size="lg"
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="w-full justify-center"
        >
          {isSubmitting ? "Creating account..." : "Register"}
        </Button>
      </form>
      <p className="px-6 pb-6 text-sm text-text-muted">
        Already have an account?{" "}
        <Link className="font-medium text-text-base underline" to="/login">
          Login
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
