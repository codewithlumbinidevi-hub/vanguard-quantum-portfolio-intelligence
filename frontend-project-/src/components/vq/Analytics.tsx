import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, ShieldAlert, Zap, Sparkles, Cpu } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassCard, SectionTitle, Chip, LoadingState, ErrorState } from "./primitives";
import { useAnalyticsData, useAlertsData } from "@/hooks/useVanguardData";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--popover-foreground)",
};

type Tab = "montecarlo" | "stress" | "alerts";

export function Analytics() {
  const { monteCarlo, stressScenarios, loading: loadingAnal, error: errorAnal, refresh: refreshAnal } = useAnalyticsData();
  const { alerts: riskAlerts, loading: loadingAlerts, error: errorAlerts, refresh: refreshAlerts } = useAlertsData();

  const [tab, setTab] = useState<Tab>("montecarlo");
  const [paths, setPaths] = useState<1000 | 5000 | 10000>(1000);
  const [activeStress, setActiveStress] = useState("rates");
  const [alertOpen, setAlertOpen] = useState<string | null>(null);

  if (loadingAnal || loadingAlerts) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        <GlassCard>
          <LoadingState message="Fetching live analytics and scenario models..." />
        </GlassCard>
      </div>
    );
  }

  if (errorAnal || errorAlerts) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        <GlassCard>
          <ErrorState
            title="Analytics Service Unavailable"
            message={errorAnal || errorAlerts || "Failed to load live analytics data from Flask API."}
            onRetry={() => { refreshAnal(); refreshAlerts(); }}
          />
        </GlassCard>
      </div>
    );
  }

  const stress = stressScenarios.find((s) => s.id === activeStress) || stressScenarios[0] || { id: "rates", detail: "", quantum: 0, benchmark: 0, recovery: "" };
  const alert = riskAlerts.find((a) => a.id === alertOpen);
  const scale = paths === 1000 ? 1 : paths === 5000 ? 1.04 : 1.07;


  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6">
      <div className="flex flex-wrap gap-2">
        {(
          [
            { k: "montecarlo", l: "Monte Carlo", i: BarChart3 },
            { k: "stress", l: "Stress Testing", i: Zap },
            { k: "alerts", l: "Smart Risk Alerts", i: ShieldAlert },
          ] as const
        ).map((t) => (
          <button
            key={t.k}
            type="button"
            onClick={() => setTab(t.k)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all",
              tab === t.k
                ? "border-transparent bg-gradient-quantum text-primary-foreground glow-quantum"
                : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground",
            )}
          >
            <t.i className="size-3.5" />
            {t.l}
          </button>
        ))}
      </div>

      {tab === "montecarlo" && (
        <GlassCard>
          <SectionTitle
            icon={<Cpu className="size-4" />}
            title={`${paths.toLocaleString()}-Path Monte Carlo Forecast`}
            subtitle="Terminal wealth in $M with 5th, 50th and 95th percentile bands · 15-year horizon"
            right={
              <div className="flex gap-1.5">
                {([1000, 5000, 10000] as const).map((p) => (
                  <Chip key={p} active={paths === p} onClick={() => setPaths(p)}>
                    {p.toLocaleString()}
                  </Chip>
                ))}
              </div>
            }
          />
          <div className="mb-4 grid gap-3 sm:grid-cols-4">
            {[
              ["Median terminal", `$${(7.98 * scale).toFixed(2)}M`, "text-emerald"],
              ["5th percentile", `$${(3.71 * scale).toFixed(2)}M`, "text-danger"],
              ["95th percentile", `$${(16.74 * scale).toFixed(2)}M`, "text-gold"],
              ["Success probability", "87.4%", "text-primary"],
            ].map(([l, v, c]) => (
              <div key={l} className="rounded-xl border border-border bg-secondary/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {l}
                </p>
                <p className={cn("num mt-1.5 text-xl font-semibold", c)}>{v}</p>
              </div>
            ))}
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monteCarlo.map((m) => ({ ...m, p95: m.p95 * scale }))}>
                <defs>
                  <linearGradient id="mc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="year"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickFormatter={(v) => `Y${v}`}
                />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} width={40} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => [`$${v.toFixed(2)}M`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area
                  dataKey="p95"
                  name="95th percentile"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#mc)"
                />
                <Area
                  dataKey="p50"
                  name="Median"
                  stroke="var(--emerald)"
                  strokeWidth={2.5}
                  fill="transparent"
                />
                <Area
                  dataKey="p5"
                  name="5th percentile"
                  stroke="var(--chart-5)"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {tab === "stress" && (
        <GlassCard>
          <SectionTitle
            icon={<Zap className="size-4" />}
            title="Stress Testing Library"
            subtitle="One-click historical regime replays against the live book"
          />
          <div className="mb-5 flex flex-wrap gap-2">
            {stressScenarios.map((s) => (
              <Chip
                key={s.id}
                active={activeStress === s.id}
                onClick={() => setActiveStress(s.id)}
              >
                {s.name}
              </Chip>
            ))}
          </div>
          <motion.div key={stress.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-4 text-sm text-muted-foreground">{stress.detail}</p>
            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-primary/40 bg-secondary/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Quantum impact
                </p>
                <p className="num mt-1.5 text-2xl font-semibold text-emerald">
                  {stress.quantum}%
                </p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  60/40 benchmark
                </p>
                <p className="num mt-1.5 text-2xl font-semibold text-danger">
                  {stress.benchmark}%
                </p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Est. recovery
                </p>
                <p className="num mt-1.5 text-2xl font-semibold text-gold">
                  {stress.recovery}
                </p>
              </div>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stressScenarios}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} width={40} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    dataKey="quantum"
                    name="Quantum %"
                    fill="var(--emerald)"
                    radius={[0, 0, 6, 6]}
                  />
                  <Bar
                    dataKey="benchmark"
                    name="60/40 %"
                    fill="var(--danger)"
                    radius={[0, 0, 6, 6]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </GlassCard>
      )}

      {tab === "alerts" && (
        <GlassCard>
          <SectionTitle
            icon={<ShieldAlert className="size-4" />}
            title="Smart Risk Alerts"
            subtitle="Click an alert for the full remediation memo"
          />
          <div className="grid gap-3 lg:grid-cols-2">
            {riskAlerts.map((a, i) => (
              <motion.button
                key={a.id}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setAlertOpen(a.id)}
                className="rounded-xl border border-border bg-secondary/40 p-4 text-left transition-colors hover:border-primary/60"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      a.severity === "high" && "bg-danger/20 text-danger",
                      a.severity === "medium" && "bg-gold/20 text-gold",
                      a.severity === "low" && "bg-emerald/20 text-emerald",
                    )}
                  >
                    {a.severity}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {a.tag}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold">{a.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.body}</p>
              </motion.button>
            ))}
          </div>
        </GlassCard>
      )}

      <Dialog open={alertOpen !== null} onOpenChange={(o) => !o && setAlertOpen(null)}>
        <DialogContent className="glass-strong sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-gold" />
              {alert?.title}
            </DialogTitle>
            <DialogDescription>{alert?.body}</DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-border bg-secondary/40 p-4 text-xs text-muted-foreground">
            Quantum will stage this action in the next rebalance window (T+1, 09:45 ET) and
            pre-clear it against wash-sale and concentration policy before execution.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
