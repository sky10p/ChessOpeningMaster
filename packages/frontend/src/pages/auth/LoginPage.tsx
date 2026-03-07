import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthRequestError, login, loginWithDefaultUser } from "../../repository/auth/auth";
import { Button, Checkbox, Input } from "../../components/ui";
import AuthPageShell from "./AuthPageShell";

interface LoginPageProps {
  allowDefaultUser: boolean;
  onAuthenticated: () => void;
}

const getLoginErrorMessage = (error: unknown, useDefaultUser: boolean): string => {
  if (error instanceof AuthRequestError) {
    if (error.type === "network") {
      return "Network error. Check your connection and try again.";
    }
    if (error.type === "server") {
      return "Server error. Please try again in a moment.";
    }
    if (error.type === "authentication") {
      return useDefaultUser ? "Default user access is unavailable" : "Invalid username or password";
    }
    return useDefaultUser ? "Default user access is unavailable" : "Unable to sign in. Please try again.";
  }

  if (error instanceof TypeError) {
    return "Network error. Check your connection and try again.";
  }

  return useDefaultUser ? "Default user access is unavailable" : "Unable to sign in. Please try again.";
};

const LoginPage: React.FC<LoginPageProps> = ({ allowDefaultUser, onAuthenticated }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [useDefaultUser, setUseDefaultUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (useDefaultUser) {
      setPassword("");
    }
  }, [useDefaultUser]);

  useEffect(() => {
    if (!allowDefaultUser) {
      setUseDefaultUser(false);
    }
  }, [allowDefaultUser]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!useDefaultUser && (!username || !password)) {
      setError("Username and password are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await (useDefaultUser ? loginWithDefaultUser() : login(username, password));
      onAuthenticated();
      navigate("/dashboard");
    } catch (error) {
      setError(getLoginErrorMessage(error, useDefaultUser));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageShell
      title="Sign in"
      description="Access your opening library, daily queue, games intelligence, and study sessions."
      asideTitle="Train with one coherent opening workspace."
      asideDescription="ChessKeep brings your lessons, repertoire editing, imported games, and study notes into a single product flow."
    >
      <form className="flex flex-col gap-4" onSubmit={submit}>
        {allowDefaultUser ? (
          <label className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-raised px-4 py-3 text-sm text-text-base">
            <Checkbox
              checked={useDefaultUser}
              onChange={(event) => setUseDefaultUser(event.target.checked)}
              className="shrink-0"
            />
            Use local default-user access
          </label>
        ) : null}
        {useDefaultUser ? (
          <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-text-muted">
            Local default-user access is enabled for this environment. Username and password are disabled.
          </div>
        ) : null}
        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          disabled={useDefaultUser}
          size="lg"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          disabled={useDefaultUser}
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
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-text-muted">
        No account?{" "}
        <Link className="font-medium text-brand" to="/register">
          Create one
        </Link>
      </p>
    </AuthPageShell>
  );
};

export default LoginPage;
