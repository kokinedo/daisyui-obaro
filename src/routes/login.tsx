import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { signIn } from "#/lib/auth-client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — Obaro" }] }),
});

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@obaro.dev");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn.email({ email, password });
      if (res.error) {
        setError(res.error.message ?? "Unable to sign in.");
        return;
      }
      router.navigate({ to: "/dashboard" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-base-200/40 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="grid size-12 place-items-center rounded-box bg-primary text-primary-content">
            <span className="icon-[lucide--hexagon] size-6" aria-hidden="true"></span>
          </span>
          <div>
            <h1 className="text-xl font-semibold">Welcome back</h1>
            <p className="text-sm text-base-content/60">Sign in to your workspace to continue.</p>
          </div>
        </div>

        <div className="card border border-base-300 bg-base-100">
          <div className="card-body gap-4">
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <label className="floating-label">
                <span>Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  className="input input-bordered w-full"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label className="floating-label">
                <span>Password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  className={`input input-bordered w-full ${error ? "input-error" : ""}`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>

              {error && (
                <div role="alert" className="alert alert-error alert-soft py-2 text-sm">
                  <span className="icon-[lucide--circle-alert] size-4" aria-hidden="true"></span>
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <span className="icon-[lucide--log-in] size-4" aria-hidden="true"></span>
                )}
                Sign in
              </button>
            </form>

            <p className="text-center text-xs text-base-content/50">
              Demo account pre-filled — <span className="font-medium">demo@obaro.dev</span> /{" "}
              <span className="font-medium">demo1234</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
