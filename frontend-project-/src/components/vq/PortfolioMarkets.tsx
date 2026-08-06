import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Activity, Filter, ArrowUpDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassCard, SectionTitle, Chip, Delta, LoadingState, ErrorState } from "./primitives";
import { fmtUsd } from "@/lib/vq-data";
import { usePortfolioData, useMarketData, useNewsData, useRecommendationsData } from "@/hooks/useVanguardData";

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--popover-foreground)",
};

const CLASSES = ["All", "Equities", "Bonds", "TIPS", "Gold", "Commodities", "Crypto", "Cash"];

export function PortfolioView() {
  const { holdings, allocation, loading, error, refresh } = usePortfolioData();
  const [cls, setCls] = useState("All");
  const [sortKey, setSortKey] = useState<"weight" | "ytd" | "value">("weight");

  if (loading) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        <GlassCard>
          <LoadingState message="Fetching live portfolio holdings..." />
        </GlassCard>
      </div>
    );
  }

  if (error || !holdings.length) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        <GlassCard>
          <ErrorState
            title="Portfolio Data Unavailable"
            message={error || "Failed to fetch live portfolio holdings from Flask API."}
            onRetry={refresh}
          />
        </GlassCard>
      </div>
    );
  }

  const rows = holdings
    .filter((h) => cls === "All" || h.cls === cls)
    .slice()
    .sort((a, b) => b[sortKey] - a[sortKey]);
    
  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6">
      <GlassCard>
        <SectionTitle
          icon={<Briefcase className="size-4" />}
          title="Holdings Book"
          subtitle={`${rows.length} positions · ${fmtUsd(rows.reduce((s, r) => s + r.value, 0))} filtered value`}
          right={
            <button
              type="button"
              onClick={() =>
                setSortKey((k) => (k === "weight" ? "ytd" : k === "ytd" ? "value" : "weight"))
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowUpDown className="size-3.5" /> Sort: {sortKey}
            </button>
          }
        />
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Filter className="size-3.5 text-muted-foreground" />
          {CLASSES.map((c) => (
            <Chip key={c} active={cls === c} onClick={() => setCls(c)}>
              {c}
            </Chip>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <th className="pb-2">Ticker</th>
                <th className="pb-2">Name</th>
                <th className="pb-2">Class</th>
                <th className="pb-2 text-right">Weight</th>
                <th className="pb-2 text-right">YTD</th>
                <th className="pb-2 text-right">Market Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((h, i) => (
                <motion.tr
                  key={h.ticker}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-t border-border"
                >
                  <td className="num py-2.5 font-semibold text-primary">{h.ticker}</td>
                  <td className="py-2.5 text-xs">{h.name}</td>
                  <td className="py-2.5 text-xs text-muted-foreground">{h.cls}</td>
                  <td className="num py-2.5 text-right text-xs">{h.weight.toFixed(1)}%</td>
                  <td className="py-2.5 text-right">
                    <Delta value={h.ytd} />
                  </td>
                  <td className="num py-2.5 text-right text-xs">{fmtUsd(h.value)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard delay={0.1}>
        <SectionTitle
          icon={<Activity className="size-4" />}
          title="Sleeve Exposure"
          subtitle="Capital deployed per asset sleeve"
        />
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={allocation}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} width={44} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v}%`, "Weight"]}
              />
              <Bar dataKey="value" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}

export function MarketsView() {
  const { marketTicker, livePrices, loading, error, refresh } = useMarketData();
  const { news } = useNewsData();
  const { recommendations } = useRecommendationsData();

  const [focus, setFocus] = useState("US 10Y");

  if (loading) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        <GlassCard>
          <LoadingState message="Fetching live market intelligence..." />
        </GlassCard>
      </div>
    );
  }

  if (error || !marketTicker.length) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        <GlassCard>
          <ErrorState
            title="Market Intelligence Unavailable"
            message={error || "Failed to connect to Flask API server at http://127.0.0.1:5000/api"}
            onRetry={refresh}
          />
        </GlassCard>
      </div>
    );
  }

  const active = marketTicker.find((m) => m.label === focus) || marketTicker[0] || { label: focus, value: "", change: 0 };
  const curve = Array.from({ length: 12 }, (_, i) => ({
    t: `M${i + 1}`,
    v: Number((50 + Math.sin(i / 1.6 + focus.length) * 14 + i * 1.4).toFixed(2)),
  }));

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {marketTicker.map((m, i) => (
          <GlassCard key={m.label} delay={i * 0.04}>
            <button
              type="button"
              onClick={() => setFocus(m.label)}
              className="w-full text-left"
            >
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {m.label}
              </p>
              <p className="num mt-2 text-xl font-semibold">{m.value}</p>
              <div className="mt-1">
                <Delta value={m.change} />
              </div>
            </button>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <GlassCard delay={0.2}>
          <SectionTitle
            icon={<Activity className="size-4" />}
            title={`${active.label} — 12 Month Path`}
            subtitle="Normalized index level with Quantum regime overlay"
          />
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={curve}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="t" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} width={40} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="v" name={active.label} fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.25}>
          <SectionTitle
            icon={<Activity className="size-4" />}
            title="Live News & Signals"
            subtitle="Real-time macro feed from Flask backend"
          />
          <div className="space-y-3 text-xs">
            {news.map((item, i) => (
              <div key={i} className="rounded-xl border border-border bg-secondary/30 p-3">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                  <span>{item.source}</span>
                  <span>{item.timestamp}</span>
                </div>
                <p className="font-medium text-foreground">{item.headline}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

