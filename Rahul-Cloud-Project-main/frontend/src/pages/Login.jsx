import { useState } from "react";
import { Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) return <Navigate to={from} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      toast("Signed in");
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-dvh grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-semibold text-ink-900 dark:text-ink-100">UserHub</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="surface rounded-xl p-6 space-y-4 shadow-float">
          {error && (
            <div
              className="px-3.5 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400"
              role="alert"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="field-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="username"
              className="field"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="field-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="field"
              required
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-80" />
                </svg>
                Signing in
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn size={15} aria-hidden="true" /> Sign in
              </span>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-[13px] text-ink-500 dark:text-ink-400">
          {"Don't have an account? "}
          <Link to="/register" className="font-medium text-ink-800 dark:text-ink-200 hover:underline">
            Create one
          </Link>
        </p>

        <p className="mt-3 text-center text-[11px] text-ink-400">
          Demo login — <span className="font-mono">admin@userhub.dev</span> / <span className="font-mono">userhub-demo</span>
        </p>
      </div>
    </main>
  );
}
