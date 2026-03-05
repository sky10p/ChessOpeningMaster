import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PASSWORD_POLICY_MESSAGE, validatePasswordStrength } from "@chess-opening-master/common";
import { AuthRequestError, register } from "../../repository/auth/auth";
import { Button, Input } from "../../components/ui";
import AuthPageShell from "./AuthPageShell";

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
    <AuthPageShell
      title="Create account"
      description="Set up secure access to your repertoire library and training progress."
      asideTitle="Keep every training decision in one system."
      asideDescription="Create an account to save repertoire progress, track due reviews, and keep games and studies tied to the same workspace."
    >
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
          size="lg"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          size="lg"
        />
        <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3 text-sm leading-6 text-text-muted">
          {PASSWORD_POLICY_MESSAGE}
        </div>
        <Input
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your password"
          size="lg"
        />
        {error ? <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div> : null}
        <Button
          intent="primary"
          size="lg"
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="w-full justify-center"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-text-muted">
        Already have an account?{" "}
        <Link className="font-medium text-brand" to="/login">
          Sign in
        </Link>
      </p>
    </AuthPageShell>
  );
};

export default RegisterPage;
