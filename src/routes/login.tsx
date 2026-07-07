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
            <span
              aria-hidden="true"
              className="icon-[lucide--hexagon] size-6"
            />
          </span>
          <div>
            <h1 className="font-semibold text-xl">Welcome back</h1>
            <p className="text-base-content/60 text-sm">
              Sign in to your workspace to continue.
            </p>
          </div>
        </div>

        <div className="card border border-base-300 bg-base-100">
          <div className="card-body gap-4">
            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
              <label className="floating-label">
                <span>Email</span>
                <input
                  autoComplete="email"
                  className="input input-bordered w-full"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  type="email"
                  value={email}
                />
              </label>

              <label className="floating-label">
                <span>Password</span>
                <input
                  autoComplete="current-password"
                  className={`input input-bordered w-full ${error ? "input-error" : ""}`}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  type="password"
                  value={password}
                />
              </label>

              {error && (
                <div
                  className="alert alert-error alert-soft py-2 text-sm"
                  role="alert"
                >
                  <span
                    aria-hidden="true"
                    className="icon-[lucide--circle-alert] size-4"
                  />
                  <span>{error}</span>
                </div>
              )}

              <button
                className="btn btn-primary w-full"
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <span
                    aria-hidden="true"
                    className="icon-[lucide--log-in] size-4"
                  />
                )}
                Sign in
              </button>
            </form>

            <p className="text-center text-base-content/50 text-xs">
              Demo account pre-filled —{" "}
              <span className="font-medium">demo@obaro.dev</span> /{" "}
              <span className="font-medium">demo1234</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
