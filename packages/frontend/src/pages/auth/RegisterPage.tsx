import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PASSWORD_POLICY_MESSAGE, validatePasswordStrength } from "@chess-opening-master/common";
import { AuthRequestError, register } from "../../repository/auth/auth";

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
    <div className="w-full max-w-md mx-auto mt-12 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
      <div className="rounded-t-2xl bg-slate-900 px-6 py-5">
        <h1 className="text-2xl font-semibold text-white">Register</h1>
        <p className="mt-1 text-sm text-slate-300">Create a user to enable secure access</p>
      </div>
      <form className="flex flex-col gap-4 p-6" onSubmit={submit}>
        <input
          className="rounded-lg border border-slate-400 bg-white p-3 text-slate-900 placeholder-slate-500 focus:border-slate-700 focus:outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          className="rounded-lg border border-slate-400 bg-white p-3 text-slate-900 placeholder-slate-500 focus:border-slate-700 focus:outline-none"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <p className="text-xs text-slate-600">{PASSWORD_POLICY_MESSAGE}</p>
        <input
          className="rounded-lg border border-slate-400 bg-white p-3 text-slate-900 placeholder-slate-500 focus:border-slate-700 focus:outline-none"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
        />
        {error ? <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</div> : null}
        <button
          className="rounded-lg bg-slate-900 p-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Register"}
        </button>
      </form>
      <p className="px-6 pb-6 text-sm text-slate-700">
        Already have an account?{" "}
        <Link className="font-medium text-slate-900 underline" to="/login">
          Login
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
