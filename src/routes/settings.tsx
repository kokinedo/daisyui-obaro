import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { AppLayout } from "#/components/app-layout";
import { createAuth } from "#/lib/auth";

const loadSettings = createServerFn({ method: "GET" }).handler(async () => {
  const session = await createAuth().api.getSession({ headers: getRequestHeaders() });
  if (!session?.user) throw redirect({ to: "/login" });
  return { user: { name: session.user.name, email: session.user.email } };
});

export const Route = createFileRoute("/settings")({
  loader: () => loadSettings(),
  component: Settings,
  head: () => ({ meta: [{ title: "Settings — Obaro" }] }),
});

function Settings() {
  const { user } = Route.useLoaderData();

  return (
    <AppLayout title="Settings" user={user}>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <section className="card bg-base-100 shadow-xs">
          <div className="card-body gap-4">
            <div>
              <h3 className="card-title text-base">Profile</h3>
              <p className="text-sm text-base-content/60">Your account details.</p>
            </div>
            <label className="floating-label">
              <span>Full name</span>
              <input className="input input-bordered w-full" defaultValue={user.name} />
            </label>
            <label className="floating-label">
              <span>Email</span>
              <input className="input input-bordered w-full" type="email" defaultValue={user.email} />
            </label>
            <div className="flex justify-end">
              <button className="btn btn-primary btn-sm">Save changes</button>
            </div>
          </div>
        </section>

        <section className="card bg-base-100 shadow-xs">
          <div className="card-body gap-4">
            <div>
              <h3 className="card-title text-base">Notifications</h3>
              <p className="text-sm text-base-content/60">Choose what you want to hear about.</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Product updates</span>
              <input type="checkbox" className="toggle toggle-primary" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Weekly summary</span>
              <input type="checkbox" className="toggle toggle-primary" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Security alerts</span>
              <input type="checkbox" className="toggle toggle-primary" defaultChecked />
            </div>
          </div>
        </section>

        <section className="card border border-error/30 bg-base-100">
          <div className="card-body gap-3">
            <h3 className="card-title text-base text-error">Danger zone</h3>
            <p className="text-sm text-base-content/60">Permanently delete your account and all data.</p>
            <div className="flex justify-end">
              <button className="btn btn-error btn-outline btn-sm">Delete account</button>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
