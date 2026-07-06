import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { AppLayout } from "#/components/app-layout";
import { Chart } from "#/components/chart";
import { makeDb } from "#/db/index";
import { getConnectionString } from "#/lib/server-env";
import { createAuth } from "#/lib/auth";
import { seed } from "#/db/seed";

/**
 * Server function: ensure the demo data exists, verify the session, and return
 * the current user's projects. Redirects to /login when unauthenticated.
 */
const loadDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const db = makeDb(getConnectionString());

  // Deterministic demo seed (idempotent — no-ops after the first cold start).
  await seed(db);

  const session = await createAuth().api.getSession({
    headers: getRequestHeaders(),
  });

  if (!session?.user) {
    throw redirect({ to: "/login" });
  }

  const projects = await db.query.project.findMany({
    where: (p, { eq }) => eq(p.userId, session.user.id),
    orderBy: (p, { desc }) => desc(p.createdAt),
  });

  return {
    user: { name: session.user.name, email: session.user.email },
    projects: projects.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
    })),
  };
});

export const Route = createFileRoute("/dashboard")({
  loader: () => loadDashboard(),
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Obaro" }] }),
});

const STATUS_BADGE: Record<string, string> = {
  active: "badge-success",
  paused: "badge-warning",
  archived: "badge-ghost",
};

// Demo analytics — replace with real series in a generated app.
const TREND = [31, 40, 28, 51, 42, 62, 58, 73, 68, 82, 79, 94];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function Dashboard() {
  const { user, projects } = Route.useLoaderData();
  const activeCount = projects.filter((p) => p.status === "active").length;

  const KPIS = [
    { label: "Projects", value: String(projects.length), delta: "+2", up: true, icon: "icon-[lucide--folder-kanban]" },
    { label: "Active", value: String(activeCount), delta: "+1", up: true, icon: "icon-[lucide--activity]" },
    { label: "Members", value: "12", delta: "+3", up: true, icon: "icon-[lucide--users]" },
    { label: "Uptime", value: "99.9%", delta: "0.0", up: true, icon: "icon-[lucide--gauge]" },
  ];

  return (
    <AppLayout title="Dashboard" user={user}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div>
          <p className="text-sm text-base-content/60">Welcome back</p>
          <h2 className="text-2xl font-semibold">{user.name}</h2>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {KPIS.map((k) => (
            <div key={k.label} className="card bg-base-100 shadow-xs">
              <div className="card-body gap-2 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-base-content/60">{k.label}</span>
                  <span className={`${k.icon} size-4 text-base-content/40`} aria-hidden="true"></span>
                </div>
                <div className="text-2xl font-semibold tabular-nums sm:text-3xl">{k.value}</div>
                <div className={`flex items-center gap-1 text-xs ${k.up ? "text-success" : "text-error"}`}>
                  <span className="icon-[lucide--trending-up] size-3.5" aria-hidden="true"></span>
                  {k.delta}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card bg-base-100 shadow-xs lg:col-span-2">
            <div className="card-body gap-1">
              <h3 className="card-title text-base">Activity</h3>
              <p className="text-sm text-base-content/60">Events processed over the last 12 months</p>
              <Chart
                type="area"
                height={300}
                series={[{ name: "Events", data: TREND }]}
                options={{ xaxis: { categories: MONTHS } }}
              />
            </div>
          </div>
          <div className="card bg-base-100 shadow-xs">
            <div className="card-body gap-1">
              <h3 className="card-title text-base">By status</h3>
              <p className="text-sm text-base-content/60">Project distribution</p>
              <Chart
                type="donut"
                height={300}
                series={[activeCount, projects.length - activeCount, 3]}
                options={{ labels: ["Active", "Paused", "Archived"], legend: { position: "bottom" } }}
                colorTokens={["--color-success", "--color-warning", "--color-base-content"]}
              />
            </div>
          </div>
        </div>

        {/* Projects table */}
        <div className="card bg-base-100 shadow-xs">
          <div className="card-body gap-4 p-0">
            <div className="flex items-center justify-between p-4 pb-0">
              <h3 className="card-title text-base">Projects</h3>
              <button className="btn btn-primary btn-sm">
                <span className="icon-[lucide--plus] size-4" aria-hidden="true"></span>
                New project
              </button>
            </div>
            {projects.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-10 text-center">
                <span className="icon-[lucide--folder-kanban] size-8 text-base-content/30" aria-hidden="true"></span>
                <p className="text-sm text-base-content/60">No projects yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Status</th>
                      <th className="text-right">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => (
                      <tr key={p.id} className="hover:bg-base-200/40">
                        <td className="font-medium">{p.title}</td>
                        <td>
                          <span className={`badge badge-sm ${STATUS_BADGE[p.status] ?? "badge-ghost"}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="text-right text-sm text-base-content/60">
                          {new Date(p.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
