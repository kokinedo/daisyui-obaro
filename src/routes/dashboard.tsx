import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { AppLayout } from "#/components/app-layout";
import { Chart } from "#/components/chart";
import { makeDb } from "#/db/index";
import { seed } from "#/db/seed";
import { createAuth } from "#/lib/auth";
import { getConnectionString } from "#/lib/server-env";

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
    orderBy: (p, { desc }) => desc(p.createdAt),
    where: (p, { eq }) => eq(p.userId, session.user.id),
  });

  return {
    projects: projects.map((p) => ({
      createdAt: p.createdAt.toISOString(),
      id: p.id,
      status: p.status,
      title: p.title,
    })),
    user: { email: session.user.email, name: session.user.name },
  };
});

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — Obaro" }] }),
  loader: () => loadDashboard(),
});

const STATUS_BADGE: Record<string, string> = {
  active: "badge-success",
  archived: "badge-ghost",
  paused: "badge-warning",
};

// Demo analytics — replace with real series in a generated app.
const TREND = [31, 40, 28, 51, 42, 62, 58, 73, 68, 82, 79, 94];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function Dashboard() {
  const { user, projects } = Route.useLoaderData();
  const activeCount = projects.filter((p) => p.status === "active").length;

  const KPIS = [
    {
      delta: "+2",
      icon: "icon-[lucide--folder-kanban]",
      label: "Projects",
      up: true,
      value: String(projects.length),
    },
    {
      delta: "+1",
      icon: "icon-[lucide--activity]",
      label: "Active",
      up: true,
      value: String(activeCount),
    },
    {
      delta: "+3",
      icon: "icon-[lucide--users]",
      label: "Members",
      up: true,
      value: "12",
    },
    {
      delta: "0.0",
      icon: "icon-[lucide--gauge]",
      label: "Uptime",
      up: true,
      value: "99.9%",
    },
  ];

  return (
    <AppLayout title="Dashboard" user={user}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div>
          <p className="text-base-content/60 text-sm">Welcome back</p>
          <h2 className="font-semibold text-2xl">{user.name}</h2>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {KPIS.map((k) => (
            <div className="card bg-base-100 shadow-xs" key={k.label}>
              <div className="card-body gap-2 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-base-content/60 text-xs uppercase tracking-wide">
                    {k.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`${k.icon} size-4 text-base-content/40`}
                  />
                </div>
                <div className="font-semibold text-2xl tabular-nums sm:text-3xl">
                  {k.value}
                </div>
                <div
                  className={`flex items-center gap-1 text-xs ${k.up ? "text-success" : "text-error"}`}
                >
                  <span
                    aria-hidden="true"
                    className="icon-[lucide--trending-up] size-3.5"
                  />
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
              <p className="text-base-content/60 text-sm">
                Events processed over the last 12 months
              </p>
              <Chart
                height={300}
                options={{ xaxis: { categories: MONTHS } }}
                series={[{ data: TREND, name: "Events" }]}
                type="area"
              />
            </div>
          </div>
          <div className="card bg-base-100 shadow-xs">
            <div className="card-body gap-1">
              <h3 className="card-title text-base">By status</h3>
              <p className="text-base-content/60 text-sm">
                Project distribution
              </p>
              <Chart
                colorTokens={[
                  "--color-success",
                  "--color-warning",
                  "--color-base-content",
                ]}
                height={300}
                options={{
                  labels: ["Active", "Paused", "Archived"],
                  legend: { position: "bottom" },
                }}
                series={[activeCount, projects.length - activeCount, 3]}
                type="donut"
              />
            </div>
          </div>
        </div>

        {/* Projects table */}
        <div className="card bg-base-100 shadow-xs">
          <div className="card-body gap-4 p-0">
            <div className="flex items-center justify-between p-4 pb-0">
              <h3 className="card-title text-base">Projects</h3>
              <button className="btn btn-primary btn-sm" type="button">
                <span
                  aria-hidden="true"
                  className="icon-[lucide--plus] size-4"
                />
                New project
              </button>
            </div>
            {projects.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-10 text-center">
                <span
                  aria-hidden="true"
                  className="icon-[lucide--folder-kanban] size-8 text-base-content/30"
                />
                <p className="text-base-content/60 text-sm">No projects yet.</p>
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
                      <tr className="hover:bg-base-200/40" key={p.id}>
                        <td className="font-medium">{p.title}</td>
                        <td>
                          <span
                            className={`badge badge-sm ${STATUS_BADGE[p.status] ?? "badge-ghost"}`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="text-right text-base-content/60 text-sm">
                          {new Date(p.createdAt).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
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
