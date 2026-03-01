import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthRequestError, login, loginWithDefaultUser } from "../../repository/auth/auth";
import { Button, Checkbox, Input } from "../../components/ui";

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
    <div className="w-full max-w-md mx-auto mt-12 rounded-2xl border border-border-default bg-surface shadow-elevated">
      <div className="rounded-t-2xl bg-interactive px-6 py-5">
        <h1 className="text-2xl font-semibold text-text-base">Login</h1>
        <p className="mt-1 text-sm text-text-muted">Access your chess repertoire workspace</p>
      </div>
      <form className="flex flex-col gap-4 p-6" onSubmit={submit}>
        {allowDefaultUser ? (
          <label className="flex items-center gap-3 rounded-lg border border-border-default bg-interactive px-3 py-2 text-sm text-text-base">
            <Checkbox
              checked={useDefaultUser}
              onChange={(event) => setUseDefaultUser(event.target.checked)}
              className="shrink-0"
            />
            Access with local default user without password
          </label>
        ) : null}
        {useDefaultUser ? (
          <div className="rounded-lg border border-warning/50 bg-warning/10 px-3 py-2 text-xs text-warning">
            Local default-user access is enabled. Username and password are locked.
          </div>
        ) : null}
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          disabled={useDefaultUser}
          state={useDefaultUser ? "default" : "default"}
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          disabled={useDefaultUser}
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
          {isSubmitting ? "Signing in..." : "Login"}
        </Button>
      </form>
      <p className="px-6 pb-6 text-sm text-text-muted">
        No account?{" "}
        <Link className="font-medium text-text-base underline" to="/register">
          Register
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
