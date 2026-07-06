import { Link, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { signOut } from "#/lib/auth-client";
import { ThemeChanger } from "#/components/theme-changer";

/**
 * AppLayout — the authenticated shell (daisyUI `drawer`).
 *
 * The drawer gives a responsive sidebar with a NATIVE smooth slide: it's pinned
 * open on `lg` (`lg:drawer-open`) and slides in/out from a hamburger on mobile,
 * with a fading overlay — no custom animation code needed. Pages render inside
 * `<main>`; the navbar carries the mobile menu toggle, page title, theme changer,
 * and the user menu.
 */
export interface NavItem {
  to: string;
  label: string;
  /** Full literal iconify class so the build scanner detects it (never build it dynamically). */
  icon: string;
}

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: "icon-[lucide--layout-dashboard]" },
  { to: "/settings", label: "Settings", icon: "icon-[lucide--settings]" },
];

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
}

export function AppLayout({
  title,
  user,
  children,
}: {
  title: string;
  user: { name: string; email: string };
  children: ReactNode;
}) {
  const router = useRouter();
  const active = router.state.location.pathname;

  async function handleSignOut() {
    await signOut();
    router.navigate({ to: "/login" });
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex min-h-screen flex-col">
        {/* Top bar */}
        <header className="navbar sticky top-0 z-10 gap-2 border-b border-base-300 bg-base-100/80 px-4 backdrop-blur">
          <label htmlFor="app-drawer" className="btn btn-ghost btn-square lg:hidden" aria-label="Open menu">
            <span className="icon-[lucide--menu] size-5" aria-hidden="true"></span>
          </label>
          <h1 className="flex-1 truncate text-lg font-semibold">{title}</h1>
          <ThemeChanger />
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-ghost btn-sm gap-2" aria-label="Account menu">
              <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-content">
                {initials(user.name)}
              </span>
            </button>
            <ul tabIndex={0} className="menu dropdown-content z-10 mt-2 w-56 rounded-box bg-base-200 p-2 shadow-lg">
              <li className="menu-title truncate">{user.email}</li>
              <li>
                <Link to="/settings">
                  <span className="icon-[lucide--settings] size-4" aria-hidden="true"></span>
                  Settings
                </Link>
              </li>
              <li>
                <button className="text-error hover:bg-error/10" onClick={handleSignOut}>
                  <span className="icon-[lucide--log-out] size-4" aria-hidden="true"></span>
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        </header>

        <main className="flex-1 bg-base-200/10 p-4 sm:p-6">{children}</main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-20">
        <label htmlFor="app-drawer" className="drawer-overlay" aria-label="Close menu"></label>
        <aside className="flex min-h-full w-64 flex-col border-e border-base-300 bg-base-100">
          <div className="flex h-16 items-center gap-2 px-5">
            <span className="grid size-8 place-items-center rounded-box bg-primary text-primary-content">
              <span className="icon-[lucide--hexagon] size-5" aria-hidden="true"></span>
            </span>
            <span className="text-base font-semibold">Obaro</span>
          </div>

          <nav className="flex-1 px-3">
            <ul className="menu w-full gap-1">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={active === item.to ? "menu-active" : ""}>
                    <span className={`${item.icon} size-5`} aria-hidden="true"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-base-300 p-3">
            <div className="flex items-center gap-3 rounded-box px-2 py-2">
              <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-content">
                {initials(user.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-base-content/60">{user.email}</p>
              </div>
              <button
                className="btn btn-ghost btn-square btn-sm text-base-content/60 hover:text-error"
                aria-label="Sign out"
                onClick={handleSignOut}
              >
                <span className="icon-[lucide--log-out] size-4" aria-hidden="true"></span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
