import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, loginWithDefaultUser } from "../../repository/auth/auth";
import { setAuthToken } from "../../repository/apiClient";

interface LoginPageProps {
  allowDefaultUser: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ allowDefaultUser }) => {
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
      const authResult = useDefaultUser ? await loginWithDefaultUser() : await login(username, password);
      setAuthToken(authResult.token);
      navigate("/dashboard");
      window.location.reload();
    } catch {
      setError(useDefaultUser ? "Default user access is unavailable" : "Invalid username or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-12 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
      <div className="rounded-t-2xl bg-slate-900 px-6 py-5">
        <h1 className="text-2xl font-semibold text-white">Login</h1>
        <p className="mt-1 text-sm text-slate-300">Access your chess repertoire workspace</p>
      </div>
      <form className="flex flex-col gap-4 p-6" onSubmit={submit}>
        {allowDefaultUser ? (
          <label className="flex items-center gap-3 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800">
            <input
              type="checkbox"
              checked={useDefaultUser}
              onChange={(event) => setUseDefaultUser(event.target.checked)}
              className="h-4 w-4 accent-slate-800"
            />
            Access with local default user without password
          </label>
        ) : null}
        {useDefaultUser ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Local default-user access is enabled. Username and password are locked.
          </div>
        ) : null}
        <input
          className={`rounded-lg border p-3 text-slate-900 placeholder-slate-500 focus:outline-none ${
            useDefaultUser
              ? "border-slate-300 bg-slate-100 text-slate-500 cursor-not-allowed"
              : "border-slate-400 bg-white focus:border-slate-700"
          }`}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          disabled={useDefaultUser}
        />
        <input
          className={`rounded-lg border p-3 text-slate-900 placeholder-slate-500 focus:outline-none ${
            useDefaultUser
              ? "border-slate-300 bg-slate-100 text-slate-500 cursor-not-allowed"
              : "border-slate-400 bg-white focus:border-slate-700"
          }`}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          disabled={useDefaultUser}
        />
        {error ? <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</div> : null}
        <button
          className="rounded-lg bg-slate-900 p-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>
      <p className="px-6 pb-6 text-sm text-slate-700">
        No account?{" "}
        <Link className="font-medium text-slate-900 underline" to="/register">
          Register
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
