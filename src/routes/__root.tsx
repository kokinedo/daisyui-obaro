import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import appCss from "../styles.css?url";

// Committed theme: pick the pinned default and honor a stored choice, but NEVER
// follow the OS. daisyUI themes are applied via `data-theme` on <html>. The
// changer (components/theme-changer.tsx) has no "system" option; nothing here
// reads `prefers-color-scheme`. Change the fallback 'light' to match the brand.
const THEME_INIT_SCRIPT = `(function(){try{var t=window.localStorage.getItem('theme');var themes=['light','dark','corporate','business','dim','nord'];var mode=themes.indexOf(t)>=0?t:'light';var root=document.documentElement;root.setAttribute('data-theme',mode);root.style.colorScheme=(mode==='dark'||mode==='dim'||mode==='business')?'dark':'light';}catch(e){}})();`;

export const Route = createRootRoute({
  head: () => ({
    links: [{ href: appCss, rel: "stylesheet" }],
    meta: [
      { charSet: "utf-8" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
      { title: "Obaro" },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="min-h-screen bg-base-100 font-sans text-base-content antialiased">
        {children}
        {import.meta.env.DEV && (
          <TanStackDevtools
            config={{ position: "bottom-right" }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        )}
        <Scripts />
      </body>
    </html>
  );
}
