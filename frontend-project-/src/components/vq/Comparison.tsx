import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, Check, X, Sliders, TrendingDown } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassCard, SectionTitle, LoadingState, ErrorState } from "./primitives";
import { useAnalyticsData } from "@/hooks/useVanguardData";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--popover-foreground)",
};

export function Comparison() {
  const { comparisonRows, rateHikeScenario, loading, error, refresh } = useAnalyticsData();
  const [scenario, setScenario] = useState(false);
  const [openRow, setOpenRow] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        <GlassCard>
          <LoadingState message="Fetching comparison model from Flask backend..." />
        </GlassCard>
      </div>
    );
  }

  if (error || !comparisonRows.length) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        <GlassCard>
          <ErrorState
            title="Comparison Model Unavailable"
            message={error || "Failed to load comparison data from Flask backend."}
            onRetry={refresh}
          />
        </GlassCard>
      </div>
    );
  }


  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6">
      <GlassCard>
        <SectionTitle
          icon={<Scale className="size-4" />}
          title="Vanguard 60/40 vs Vanguard Quantum"
          subtitle="Structural comparison across five allocation dimensions — click a row for detail"
        />
        <div className="space-y-2">
          {comparisonRows.map((r, i) => {
            const open = openRow === r.dimension;
            return (
              <motion.div
                key={r.dimension}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="overflow-hidden rounded-xl border border-border bg-secondary/30"
              >
                <button
                  type="button"
                  onClick={() => setOpenRow(open ? null : r.dimension)}
                  className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)_auto]"
                >
                  <span className="truncate text-xs font-semibold">{r.dimension}</span>
                  <span className="hidden min-w-0 items-center gap-2 text-xs text-muted-foreground md:flex">
                    <X className="size-3.5 shrink-0 text-danger" />
                    <span className="truncate">{r.vanguard}</span>
                  </span>
                  <span className="hidden min-w-0 items-center gap-2 text-xs md:flex">
                    <Check className="size-3.5 shrink-0 text-emerald" />
                    <span className="truncate">{r.quantum}</span>
                  </span>
                  <span className="num shrink-0 rounded-full bg-gradient-gold px-2.5 py-1 text-[10px] font-semibold text-background">
                    {r.edge}
                  </span>
                </button>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="grid gap-3 border-t border-border px-4 py-3 md:grid-cols-2"
                  >
                    <div className="rounded-lg border border-border bg-card/50 p-3">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-danger">
                        Traditional Vanguard model
                      </p>
                      <p className="mt-1.5 text-xs text-muted-foreground">{r.vanguard}</p>
                    </div>
                    <div className="rounded-lg border border-primary/40 bg-card/50 p-3">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-emerald">
                        Vanguard Quantum
                      </p>
                      <p className="mt-1.5 text-xs">{r.quantum}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard delay={0.15}>
        <SectionTitle
          icon={<Sliders className="size-4" />}
          title="Simulate 2022 Rate Hike Scenario"
          subtitle="500bps hiking cycle applied to both mandates"
          right={
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {scenario ? "Simulation on" : "Simulation off"}
              </span>
              <Switch checked={scenario} onCheckedChange={setScenario} />
            </div>
          }
        />
        {scenario ? (
          <>
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-secondary/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Vanguard 60/40 drawdown
                </p>
                <p className="num mt-1.5 text-2xl font-semibold text-danger">-16.0%</p>
              </div>
              <div className="rounded-xl border border-primary/40 bg-secondary/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Quantum drawdown
                </p>
                <p className="num mt-1.5 text-2xl font-semibold text-emerald">-3.1%</p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Capital preserved
                </p>
                <p className="num mt-1.5 text-2xl font-semibold text-gold">$320,590</p>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rateHikeScenario}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} width={40} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    dataKey="vanguard"
                    name="Vanguard 60/40"
                    stroke="var(--danger)"
                    strokeWidth={2.5}
                  />
                  <Line
                    dataKey="quantum"
                    name="Vanguard Quantum"
                    stroke="var(--emerald)"
                    strokeWidth={2.5}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-14 text-center">
            <TrendingDown className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">Scenario engine idle</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Toggle the simulation to replay the 2022 hiking cycle path-by-path against
              both mandates.
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
