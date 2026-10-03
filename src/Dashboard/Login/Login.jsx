import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { IoMailOutline, IoLockClosedOutline } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import usePageTitle from "../../hooks/usePageTitle";

export default function Login() {
  usePageTitle("Admin Login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await login(email, password);

    if (!result.success) {
      setError(result.message || "Invalid email or password.");
      setIsSubmitting(false);
      return;
    }

    const redirectTo = location.state?.from?.pathname || "/admin";
    navigate(redirectTo, { replace: true });
  }

  return (
    <div className="min-h-dvh bg-primary-500 flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[24px] border border-accent-500/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-8">
        <h1 className="text-2xl font-semibold text-main text-center">
          Agency Admin
        </h1>
        <p className="mt-1 text-sm text-trenary text-center">
          Sign in to manage your listings
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-secondary mb-1.5"
            >
              Email
            </label>
            <div className="relative">
              <IoMailOutline
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-trenary"
              />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@agency.com"
                className="w-full rounded-[12px] border border-accent-500/10 bg-primary-500 py-3 pl-10 pr-4 text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-secondary mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <IoLockClosedOutline
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-trenary"
              />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full rounded-[12px] border border-accent-500/10 bg-primary-500 py-3 pl-10 pr-4 text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-[12px] border border-accent-500/10 bg-accent-500/5 px-3 py-2 text-sm text-accent-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-[12px] bg-accent-500 py-3 font-medium text-white transition-colors hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
