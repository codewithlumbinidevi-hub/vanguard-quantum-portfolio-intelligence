import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ShieldAlert,
  BadgeCheck,
  Cpu,
  Activity,
  PieChart as PieIcon,
  Globe,
  Sparkles,
  BarChart2,
  AlertTriangle,
  HeartPulse,
  Flame,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { GlassCard, SectionTitle, Delta } from "./primitives";
import { usePortfolioData, useMarketData } from "@/hooks/useVanguardData";
import { usePortfolio } from "@/context/PortfolioContext";
import { fmtCurrency } from "@/lib/vq-data";

export function InstitutionalDashboard() {
  const { profile } = usePortfolio();
  const { headlineStats, coreMetrics, allocation, loading, error } = usePortfolioData();
  const { marketTicker } = useMarketData();

  const amount = profile.investmentAmount;
  const currency = profile.currency;

  if (loading || !headlineStats) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-8">
        <GlassCard className="text-center py-12 text-muted-foreground animate-pulse font-mono text-xs">
          Connecting to Institutional Terminal Stream at http://127.0.0.1:5000/api...
        </GlassCard>
      </div>
    );
  }

  // Country allocation dataset
  const countryAllocation = [
    { name: "India", value: 65, color: "#10B981" },
    { name: "United States", value: 22, color: "#3B82F6" },
    { name: "Global / Gold", value: 13, color: "#F59E0B" },
  ];

  // Performance attribution dataset
  const perfAttribution = [
    { sleeve: "Equities (Nifty/Reliance/TCS)", contrib: "+8.4%", alpha: "+2.1%" },
    { sleeve: "US AI & Compute (NVDA)", contrib: "+5.2%", alpha: "+1.8%" },
    { sleeve: "Precious Metals (Gold ETF)", contrib: "+2.8%", alpha: "+0.9%" },
    { sleeve: "Sovereign Debt & Cash", contrib: "+1.4%", alpha: "+0.2%" },
    { sleeve: "Digital Alpha (Crypto)", contrib: "+2.0%", alpha: "+0.8%" },
  ];

  // Top risks dataset
  const topRisks = [
    { risk: "US Fed Rate Pause Drag", level: "Low", mitigation: "TIPS & Sovereign Bond Duration Hedging" },
    { risk: "Oil Supply Shock Volatility", level: "Moderate", mitigation: "Reliance Conglomerate & Energy Weighting" },
    { risk: "USD-INR Currency Drift", level: "Low", mitigation: "Export Heavy TCS & Global Gold Position" },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6">
      {/* Header Banner */}
      <GlassCard className="relative overflow-hidden border border-emerald/30 bg-gradient-to-r from-emerald/10 via-primary/5 to-cyan/10 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-quantum text-primary-foreground">
                <Cpu className="size-5" />
              </span>
              <div>
                <h1 className="font-heading text-xl font-bold tracking-tight">
                  Institutional Terminal Dashboard
                </h1>
                <p className="text-xs text-muted-foreground">
                  Bloomberg / BlackRock Aladdin / Goldman Sachs Marquee Institutional Intelligence
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-xl border border-emerald/40 bg-emerald/10 px-3.5 py-1.5 font-mono text-xs font-bold text-emerald flex items-center gap-1.5">
              <HeartPulse className="size-4 animate-pulse" /> Portfolio Health: 94/100
            </span>
            <span className="rounded-xl border border-gold/40 bg-gold/10 px-3.5 py-1.5 font-mono text-xs font-bold text-gold flex items-center gap-1.5">
              <Flame className="size-4" /> Fear & Greed: 68 (Greed)
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Metric Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                Live Portfolio Value
              </p>
              <p className="font-mono text-2xl font-bold mt-1 text-foreground">
                {fmtCurrency(amount, currency)}
              </p>
              <p className="text-xs font-semibold text-emerald mt-1">
                +0.85% today · +{fmtCurrency(amount * 0.0085, currency)}
              </p>
            </div>
            <TrendingUp className="size-5 text-emerald" />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                Risk Score & Profile
              </p>
              <p className="font-mono text-2xl font-bold mt-1 text-foreground">
                {headlineStats.riskScore}/100
              </p>
              <p className="text-xs font-semibold text-primary mt-1">
                {profile.riskAppetite} Mandate
              </p>
            </div>
            <ShieldAlert className="size-5 text-primary" />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                Diversification Score
              </p>
              <p className="font-mono text-2xl font-bold mt-1 text-foreground">
                {headlineStats.diversification}/100
              </p>
              <p className="text-xs font-semibold text-emerald mt-1">
                7 Sleeves · 0.28 Pairwise Corr
              </p>
            </div>
            <BadgeCheck className="size-5 text-emerald" />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                Quantum Confidence Index
              </p>
              <p className="font-mono text-2xl font-bold mt-1 text-foreground">
                {headlineStats.aiConfidence}%
              </p>
              <p className="text-xs font-semibold text-gold mt-1">
                QAOA State Converged (p=3)
              </p>
            </div>
            <Cpu className="size-5 text-gold" />
          </div>
        </GlassCard>
      </div>

      {/* Main Grid Section */}
      <div className="grid gap-6 xl:grid-cols-12">
        {/* Left Column: Asset Allocation & Country Breakdown (6 Cols) */}
        <div className="space-y-6 xl:col-span-6">
          <GlassCard>
            <SectionTitle
              icon={<PieIcon className="size-4 text-emerald" />}
              title="Sector & Sleeve Allocation"
              subtitle="Asset class exposure distribution across active holdings"
            />
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocation}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {allocation.map((a) => (
                      <Cell key={a.name} fill={a.color} stroke="var(--background)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {allocation.map((a) => (
                <span
                  key={a.name}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/30 px-2.5 py-1 font-mono"
                >
                  <span className="size-2 rounded-full" style={{ backgroundColor: a.color }} />
                  {a.name}: <span className="font-bold text-foreground">{a.value}%</span>
                </span>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <SectionTitle
              icon={<Globe className="size-4 text-cyan" />}
              title="Geographic Exposure Breakdown"
              subtitle="Global cross-border capital allocation distribution"
            />
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryAllocation} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" unit="%" stroke="var(--muted-foreground)" fontSize={10} />
                  <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={11} width={100} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", fontSize: 11 }} />
                  <Bar dataKey="value" fill="var(--cyan)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Performance Attribution & Top Risks (6 Cols) */}
        <div className="space-y-6 xl:col-span-6">
          <GlassCard>
            <SectionTitle
              icon={<BarChart2 className="size-4 text-gold" />}
              title="Performance Attribution"
              subtitle="Trailing 1-year total return contribution and alpha generation by sleeve"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="p-2.5">Sleeve / Asset Class</th>
                    <th className="p-2.5">Return Contribution</th>
                    <th className="p-2.5">Alpha Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono">
                  {perfAttribution.map((item, idx) => (
                    <tr key={idx} className="hover:bg-secondary/30">
                      <td className="p-2.5 font-sans font-semibold text-foreground">{item.sleeve}</td>
                      <td className="p-2.5 text-emerald font-bold">{item.contrib}</td>
                      <td className="p-2.5 text-cyan font-bold">{item.alpha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          <GlassCard>
            <SectionTitle
              icon={<AlertTriangle className="size-4 text-rose-400" />}
              title="Top Risk Factors & Mitigations"
              subtitle="Identified macro stress points and automated portfolio hedges"
            />
            <div className="space-y-2 text-xs">
              {topRisks.map((r, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-secondary/30 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{r.risk}</span>
                    <span className="rounded-md bg-rose-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-400">
                      {r.level} Risk
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    <span className="text-emerald font-semibold">Mitigation: </span>
                    {r.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
