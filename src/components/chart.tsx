import { useEffect, useRef } from "react";

/**
 * Chart — the ONE charting primitive for this app (daisyUI + ApexCharts).
 *
 * - ApexCharts is imported dynamically and instantiated on the CLIENT only, so
 *   it never breaks SSR (it needs `window`).
 * - Colors are NEVER hardcoded. Series/label/grid colors are resolved from the
 *   active daisyUI theme's CSS variables (`--color-primary`, `--color-base-content`,
 *   …) at render time, and the chart re-themes automatically when the user
 *   changes theme (a MutationObserver watches `data-theme` on <html>).
 */
export type ChartType =
  | "area"
  | "line"
  | "bar"
  | "donut"
  | "pie"
  | "radar"
  | "radialBar"
  | "heatmap";

interface ChartProps {
  className?: string;
  /** Extra series colors, in daisyUI token order. Defaults to primary→accent. */
  colorTokens?: string[];
  height?: number;
  /** Partial ApexCharts options; merged over the themed defaults. */
  options?: Record<string, unknown>;
  series: ApexAxisChartSeries | ApexNonAxisChartSeries | number[];
  type: ChartType;
}

const DEFAULT_TOKENS = [
  "--color-primary",
  "--color-secondary",
  "--color-accent",
  "--color-info",
];

function readVar(name: string): string {
  if (typeof window === "undefined") {
    return "#888";
  }
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || "#888";
}

export function Chart({
  type,
  series,
  options = {},
  height = 320,
  colorTokens,
  className,
}: ChartProps) {
  const el = useRef<HTMLDivElement>(null);
  const chartRef = useRef<{
    destroy: () => void;
    updateOptions: (o: unknown) => void;
  } | null>(null);

  useEffect(() => {
    let disposed = false;
    let observer: MutationObserver | null = null;

    async function build() {
      const mod = await import("apexcharts");
      const ApexCharts = mod.default;
      if (disposed || !el.current) {
        return;
      }

      const tokens = colorTokens ?? DEFAULT_TOKENS;
      const themed = () => ({
        chart: {
          animations: { enabled: true, speed: 300 },
          background: "transparent",
          fontFamily: "inherit",
          height,
          toolbar: { show: false },
          type,
        },
        colors: tokens.map(readVar),
        dataLabels: { enabled: false },
        fill:
          type === "area"
            ? {
                gradient: { opacityFrom: 0.35, opacityTo: 0.05 },
                type: "gradient",
              }
            : {},
        grid: {
          borderColor: `${readVar("--color-base-content")}1a`,
          strokeDashArray: 4,
        },
        legend: { labels: { colors: readVar("--color-base-content") } },
        series,
        stroke: {
          curve: "smooth",
          width: type === "area" || type === "line" ? 2 : 0,
        },
        tooltip: {
          theme:
            document.documentElement.style.colorScheme === "dark"
              ? "dark"
              : "light",
        },
        xaxis: {
          labels: { style: { colors: readVar("--color-base-content") } },
        },
        yaxis: {
          labels: { style: { colors: readVar("--color-base-content") } },
        },
        ...options,
      });

      const chart = new ApexCharts(el.current, themed());
      chart.render();
      chartRef.current = chart as unknown as typeof chartRef.current;

      // Re-theme when the daisyUI theme changes.
      observer = new MutationObserver(() =>
        chartRef.current?.updateOptions(themed())
      );
      observer.observe(document.documentElement, {
        attributeFilter: ["data-theme", "style"],
        attributes: true,
      });
    }

    build().catch(() => {
      // Chart build manages its own state; a failure just leaves no chart.
    });
    return () => {
      disposed = true;
      observer?.disconnect();
      chartRef.current?.destroy();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, height, series, options, colorTokens]);

  return <div className={className} ref={el} />;
}
