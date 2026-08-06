import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BadgeCheck,
  Cpu,
  PieChart as PieIcon,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassCard, SectionTitle, Delta, Chip, LoadingState, ErrorState } from "./primitives";
import { fmtUsd } from "@/lib/vq-data";
import { usePortfolioData, useAnalyticsData, useMarketData } from "@/hooks/useVanguardData";
import { cn } from "@/lib/utils";

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--popover-foreground)",
};

export function MarketTicker({ live }: { live: boolean }) {
  const { marketTicker, loading, error } = useMarketData();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!live || loading || error) return;
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, [live, loading, error]);

  if (loading) {
    return (
      <div className="glass-strong overflow-hidden border-y border-border px-4 py-2 text-center text-xs text-muted-foreground animate-pulse">
        Connecting to market stream...
      </div>
    );
  }

  if (error || !marketTicker.length) {
    return (
      <div className="glass-strong overflow-hidden border-y border-border px-4 py-2 text-center text-xs text-danger">
        Market data stream offline — backend server unavailable at http://127.0.0.1:5000/api
      </div>
    );
  }

  return (
    <div className="glass-strong overflow-hidden border-y border-border">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5">
        {marketTicker.map((m, i) => {
          const drift = live ? Math.sin((tick + i) * 1.7) * 0.06 : 0;
          const chg = m.change + drift;
          return (
            <div key={m.label} className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {m.label}
              </span>
              <span className="num text-xs font-semibold">{m.value}</span>
              <Delta value={chg} />
            </div>
          );
        })}
        <span className="ml-auto flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <span
            className={cn(
              "size-1.5 rounded-full",
              live ? "animate-pulse bg-emerald" : "bg-muted-foreground",
            )}
          />
          {live ? "Streaming" : "Paused"}
        </span>
      </div>
    </div>
  );
}

function HeaderCard({
  label,
  value,
  sub,
  accent,
  icon: Icon,
  delay,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
  icon: typeof Cpu;
  delay: number;
}) {
  return (
    <GlassCard delay={delay} className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <p className="num mt-2 truncate text-2xl font-semibold">{value}</p>
          <p className={cn("mt-1 text-xs font-medium", accent)}>{sub}</p>
        </div>
        <Icon className={cn("size-5 shrink-0", accent)} />
      </div>
    </GlassCard>
  );
}

export function Dashboard() {
  const { headlineStats, coreMetrics, allocation, performanceSeries, loading: loadingPort, error: errorPort, refresh: refreshPort } = usePortfolioData();
  const { assetsList, correlationMatrix, riskRadar, loading: loadingAnal, error: errorAnal, refresh: refreshAnal } = useAnalyticsData();

  const [range, setRange] = useState<"1Y" | "3Y" | "5Y" | "Max">("Max");
  const [benchmark, setBenchmark] = useState<"spx" | "vanguard" | "both">("both");
  const [activeSlice, setActiveSlice] = useState<string | null>(null);

  if (loadingPort || loadingAnal) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        <GlassCard>
          <LoadingState message="Connecting to Flask API at http://127.0.0.1:5000/api..." />
        </GlassCard>
      </div>
    );
  }

  if (errorPort || errorAnal || !headlineStats) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        <GlassCard>
          <ErrorState
            title="Dashboard API Unavailable"
            message={errorPort || errorAnal || "Failed to load live portfolio data from Flask backend."}
            onRetry={() => { refreshPort(); refreshAnal(); }}
          />
        </GlassCard>
      </div>
    );
  }


  const sliceCount = range === "1Y" ? 3 : range === "3Y" ? 5 : range === "5Y" ? 7 : 8;
  const series = performanceSeries.slice(-sliceCount);
  const selected = allocation.find((a) => a.name === activeSlice);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HeaderCard
          delay={0}
          label="Live Portfolio Value"
          value={fmtUsd(headlineStats.portfolioValue)}
          sub={`+${headlineStats.dayChangePct}% today · +${fmtUsd(headlineStats.dayChangeAbs)}`}
          accent="text-emerald"
          icon={TrendingUp}
        />
        <HeaderCard
          delay={0.06}
          label="Risk Score"
          value={`${headlineStats.riskScore}/100`}
          sub={headlineStats.riskLabel}
          accent="text-primary"
          icon={ShieldAlert}
        />
        <HeaderCard
          delay={0.12}
          label="Diversification Score"
          value={`${headlineStats.diversification}/100`}
          sub="7 sleeves · 0.31 avg correlation"
          accent="text-emerald"
          icon={BadgeCheck}
        />
        <HeaderCard
          delay={0.18}
          label="AI Confidence Index"
          value={`${headlineStats.aiConfidence}%`}
          sub="1,240 signals reconciled"
          accent="text-gold"
          icon={Cpu}
        />
      </div>

      <GlassCard delay={0.2}>
        <SectionTitle
          icon={<Activity className="size-4" />}
          title="Core Metrics"
          subtitle="Trailing 36-month risk-adjusted statistics, net of fees"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
          {coreMetrics.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-border bg-secondary/40 p-3"
            >
              <p className="truncate text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {m.label}
              </p>
              <p className="num mt-1.5 text-lg font-semibold">{m.value}</p>
              <p className="mt-0.5 truncate text-[10px] text-emerald">{m.delta}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <GlassCard delay={0.24}>
          <SectionTitle
            icon={<PieIcon className="size-4" />}
            title="Dynamic Asset Allocation"
            subtitle={
              selected
                ? `${selected.name} · ${selected.value}% · ${fmtUsd(selected.amount)}`
                : "Click a sleeve for exposure detail"
            }
          />
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={100}
                  paddingAngle={2}
                  onClick={(d: { name?: string }) =>
                    setActiveSlice((prev) => (prev === d.name ? null : (d.name ?? null)))
                  }
                >
                  {allocation.map((a) => (
                    <Cell
                      key={a.name}
                      fill={a.color}
                      stroke="var(--background)"
                      strokeWidth={activeSlice === a.name ? 3 : 1}
                      opacity={!activeSlice || activeSlice === a.name ? 1 : 0.35}
                      className="cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number, n: string) => [`${v}%`, n]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {allocation.map((a) => (
              <button
                key={a.name}
                type="button"
                onClick={() =>
                  setActiveSlice((prev) => (prev === a.name ? null : a.name))
                }
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                  activeSlice === a.name
                    ? "border-primary/60 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: a.color }}
                />
                {a.name} <span className="num">{a.value}%</span>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.28}>
          <SectionTitle
            icon={<TrendingUp className="size-4" />}
            title="Performance vs Benchmarks"
            subtitle="Growth of 100 · Quantum vs S&P 500 vs Vanguard 60/40"
            right={
              <div className="flex flex-wrap gap-1.5">
                {(["1Y", "3Y", "5Y", "Max"] as const).map((r) => (
                  <Chip key={r} active={range === r} onClick={() => setRange(r)}>
                    {r}
                  </Chip>
                ))}
              </div>
            }
          />
          <div className="mb-3 flex flex-wrap gap-1.5">
            {(
              [
                { k: "both", l: "Both benchmarks" },
                { k: "spx", l: "S&P 500 only" },
                { k: "vanguard", l: "Vanguard 60/40 only" },
              ] as const
            ).map((b) => (
              <Chip
                key={b.k}
                active={benchmark === b.k}
                onClick={() => setBenchmark(b.k)}
              >
                {b.l}
              </Chip>
            ))}
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="gQ" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="period" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} width={40} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="quantum"
                  name="Vanguard Quantum"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  fill="url(#gQ)"
                />
                {(benchmark === "both" || benchmark === "spx") && (
                  <Area
                    type="monotone"
                    dataKey="spx"
                    name="S&P 500"
                    stroke="var(--chart-2)"
                    strokeWidth={1.8}
                    fill="transparent"
                  />
                )}
                {(benchmark === "both" || benchmark === "vanguard") && (
                  <Area
                    type="monotone"
                    dataKey="vanguard"
                    name="Vanguard 60/40"
                    stroke="var(--chart-3)"
                    strokeWidth={1.8}
                    strokeDasharray="5 4"
                    fill="transparent"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard delay={0.32}>
          <SectionTitle
            icon={<Activity className="size-4" />}
            title="Correlation Matrix"
            subtitle="Trailing 250-day pairwise correlation across sleeves"
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-separate border-spacing-1 text-center">
              <thead>
                <tr>
                  <th />
                  {assetsList.map((a) => (
                    <th
                      key={a}
                      className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                    >
                      {a}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlationMatrix.map((row, i) => (
                  <tr key={assetsList[i]}>
                    <td className="pr-2 text-right text-[10px] uppercase tracking-wide text-muted-foreground">
                      {assetsList[i]}
                    </td>
                    {row.map((v, j) => (
                      <td key={`${i}-${j}`}>
                        <div
                          className="num grid h-9 place-items-center rounded-md text-[11px] font-semibold"
                          style={{
                            backgroundColor:
                              v >= 0
                                ? `color-mix(in oklab, var(--chart-1) ${Math.abs(v) * 70}%, transparent)`
                                : `color-mix(in oklab, var(--emerald) ${Math.abs(v) * 70}%, transparent)`,
                          }}
                          title={`${assetsList[i]} / ${assetsList[j]}: ${v.toFixed(2)}`}
                        >
                          {v.toFixed(2)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard delay={0.36}>
          <SectionTitle
            icon={<ShieldAlert className="size-4" />}
            title="Risk Radar"
            subtitle="Quantum exposure vs static 60/40 benchmark (lower is safer)"
          />
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={riskRadar}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="factor"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Quantum"
                  dataKey="quantum"
                  stroke="var(--chart-1)"
                  fill="var(--chart-1)"
                  fillOpacity={0.35}
                />
                <Radar
                  name="60/40"
                  dataKey="benchmark"
                  stroke="var(--chart-5)"
                  fill="var(--chart-5)"
                  fillOpacity={0.15}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard delay={0.4}>
        <SectionTitle
          icon={<TrendingUp className="size-4" />}
          title="Rolling 12-Month Excess Return"
          subtitle="Quantum minus Vanguard 60/40, percentage points"
        />
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={performanceSeries.map((p) => ({
                period: p.period,
                excess: Number((p.quantum - p.vanguard).toFixed(1)),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="period" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} width={40} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="excess"
                name="Excess vs 60/40"
                stroke="var(--emerald)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
