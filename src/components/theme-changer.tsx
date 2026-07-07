import { useEffect, useState } from "react";

/**
 * Theme changer — committed themes only, NEVER "system". The app ships several
 * daisyUI themes and pins `light` as the default; the user's pick is persisted
 * to localStorage and applied via `data-theme` on <html>. There is deliberately
 * no OS/`prefers-color-scheme` option (see the boot script in __root.tsx and the
 * theme config in styles.css). Add/remove entries here to match the product.
 */
export const THEMES = [
  "light",
  "dark",
  "corporate",
  "business",
  "dim",
  "nord",
] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = "light";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme =
    theme === "dark" || theme === "dim" || theme === "business"
      ? "dark"
      : "light";
}

export function ThemeChanger() {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme") as Theme | null;
    const initial = stored && THEMES.includes(stored) ? stored : DEFAULT_THEME;
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function choose(next: Theme) {
    setTheme(next);
    applyTheme(next);
    window.localStorage.setItem("theme", next);
  }

  return (
    <div className="dropdown dropdown-end">
      <button
        aria-label="Change theme"
        className="btn btn-ghost btn-sm gap-2"
        tabIndex={0}
        type="button"
      >
        <span aria-hidden="true" className="icon-[lucide--palette] size-4" />
        <span className="hidden capitalize sm:inline">{theme}</span>
        <span
          aria-hidden="true"
          className="icon-[lucide--chevron-down] size-3.5 opacity-60"
        />
      </button>
      <ul className="menu dropdown-content z-10 mt-2 w-40 rounded-box bg-base-200 p-2 shadow-lg">
        {THEMES.map((t) => (
          <li key={t}>
            <button
              className={t === theme ? "menu-active capitalize" : "capitalize"}
              onClick={() => choose(t)}
              type="button"
            >
              <span
                aria-hidden="true"
                className="inline-grid size-4 grid-cols-2 gap-px overflow-hidden rounded-sm border border-base-content/10"
                data-theme={t}
              >
                <span className="bg-base-100" />
                <span className="bg-primary" />
                <span className="bg-secondary" />
                <span className="bg-accent" />
              </span>
              {t}
              {t === theme && (
                <span className="icon-[lucide--check] ms-auto size-4" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
