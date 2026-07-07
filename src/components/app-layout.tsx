import { Link, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ThemeChanger } from "#/components/theme-changer";
import { signOut } from "#/lib/auth-client";

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
  /** Full literal iconify class so the build scanner detects it (never build it dynamically). */
  icon: string;
  label: string;
  to: string;
}

const NAV: NavItem[] = [
  {
    icon: "icon-[lucide--layout-dashboard]",
    label: "Dashboard",
    to: "/dashboard",
  },
  { icon: "icon-[lucide--settings]", label: "Settings", to: "/settings" },
];

const WHITESPACE_RE = /\s+/;

function initials(name: string): string {
  return (
    name
      .split(WHITESPACE_RE)
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
      <input className="drawer-toggle" id="app-drawer" type="checkbox" />

      <div className="drawer-content flex min-h-screen flex-col">
        {/* Top bar */}
        <header className="navbar sticky top-0 z-10 gap-2 border-base-300 border-b bg-base-100/80 px-4 backdrop-blur">
          <label
            aria-label="Open menu"
            className="btn btn-ghost btn-square lg:hidden"
            htmlFor="app-drawer"
          >
            <span aria-hidden="true" className="icon-[lucide--menu] size-5" />
          </label>
          <h1 className="flex-1 truncate font-semibold text-lg">{title}</h1>
          <ThemeChanger />
          <div className="dropdown dropdown-end">
            <button
              aria-label="Account menu"
              className="btn btn-ghost btn-sm gap-2"
              tabIndex={0}
              type="button"
            >
              <span className="grid size-8 place-items-center rounded-full bg-primary font-semibold text-primary-content text-sm">
                {initials(user.name)}
              </span>
            </button>
            <ul className="menu dropdown-content z-10 mt-2 w-56 rounded-box bg-base-200 p-2 shadow-lg">
              <li className="menu-title truncate">{user.email}</li>
              <li>
                <Link to="/settings">
                  <span
                    aria-hidden="true"
                    className="icon-[lucide--settings] size-4"
                  />
                  Settings
                </Link>
              </li>
              <li>
                <button
                  className="text-error hover:bg-error/10"
                  onClick={handleSignOut}
                  type="button"
                >
                  <span
                    aria-hidden="true"
                    className="icon-[lucide--log-out] size-4"
                  />
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
        <label
          aria-label="Close menu"
          className="drawer-overlay"
          htmlFor="app-drawer"
        />
        <aside className="flex min-h-full w-64 flex-col border-base-300 border-e bg-base-100">
          <div className="flex h-16 items-center gap-2 px-5">
            <span className="grid size-8 place-items-center rounded-box bg-primary text-primary-content">
              <span
                aria-hidden="true"
                className="icon-[lucide--hexagon] size-5"
              />
            </span>
            <span className="font-semibold text-base">Obaro</span>
          </div>

          <nav className="flex-1 px-3">
            <ul className="menu w-full gap-1">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    className={active === item.to ? "menu-active" : ""}
                    to={item.to}
                  >
                    <span
                      aria-hidden="true"
                      className={`${item.icon} size-5`}
                    />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-base-300 border-t p-3">
            <div className="flex items-center gap-3 rounded-box px-2 py-2">
              <span className="grid size-9 place-items-center rounded-full bg-primary font-semibold text-primary-content text-sm">
                {initials(user.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm">{user.name}</p>
                <p className="truncate text-base-content/60 text-xs">
                  {user.email}
                </p>
              </div>
              <button
                aria-label="Sign out"
                className="btn btn-ghost btn-square btn-sm text-base-content/60 hover:text-error"
                onClick={handleSignOut}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className="icon-[lucide--log-out] size-4"
                />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
