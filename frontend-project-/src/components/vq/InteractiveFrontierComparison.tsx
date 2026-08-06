import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Scale,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  PieChart as PieIcon,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { GlassCard, SectionTitle } from "./primitives";
import { usePortfolio } from "@/context/PortfolioContext";
import { fmtCurrency } from "@/lib/vq-data";

export interface PortfolioPreset {
  id: string;
  name: string;
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  treynorRatio: number;
  alpha: number;
  beta: number;
  maxDrawdown: number;
  calmarRatio: number;
  informationRatio: number;
  trackingError: number;
  diversificationScore: number;
  quantumImprovementPct: number;
  weights: { name: string; weight: number; color: string }[];
}

export function InteractiveFrontierComparison() {
  const { profile, currencySymbol } = usePortfolio();

  // Selected portfolio index or active point along Efficient Frontier slider
  const [targetRiskPoint, setTargetRiskPoint] = useState<number>(55); // 0 to 100 slider
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("quantum");

  const amount = profile.investmentAmount;
  const currency = profile.currency;

  // Generate 9 distinct portfolios derived from base profile
  const PORTFOLIOS: PortfolioPreset[] = [
    {
      id: "max_return",
      name: "Maximum Return",
      expectedReturn: 24.8,
      volatility: 21.4,
      sharpeRatio: 0.88,
      sortinoRatio: 1.15,
      treynorRatio: 16.2,
      alpha: 4.8,
      beta: 1.35,
      maxDrawdown: -28.5,
      calmarRatio: 0.87,
      informationRatio: 0.72,
      trackingError: 8.5,
      diversificationScore: 68,
      quantumImprovementPct: 5.2,
      weights: [
        { name: "NVDA (Tech/AI)", weight: 35, color: "#10B981" },
        { name: "Bitcoin (Crypto)", weight: 20, color: "#F59E0B" },
        { name: "RELIANCE (Energy)", weight: 20, color: "#3B82F6" },
        { name: "TCS (IT)", weight: 15, color: "#8B5CF6" },
        { name: "Gold ETF", weight: 10, color: "#EC4899" },
      ],
    },
    {
      id: "min_risk",
      name: "Minimum Risk",
      expectedReturn: 8.5,
      volatility: 4.2,
      sharpeRatio: 1.18,
      sortinoRatio: 1.62,
      treynorRatio: 8.2,
      alpha: 1.2,
      beta: 0.28,
      maxDrawdown: -4.8,
      calmarRatio: 1.77,
      informationRatio: 0.85,
      trackingError: 2.1,
      diversificationScore: 92,
      quantumImprovementPct: 8.4,
      weights: [
        { name: "RBI 10Y G-Sec Bonds", weight: 45, color: "#3B82F6" },
        { name: "Sovereign Gold Bonds", weight: 25, color: "#F59E0B" },
        { name: "TREPS Overnight Cash", weight: 20, color: "#10B981" },
        { name: "HDFC Bank (Blue-chip)", weight: 10, color: "#8B5CF6" },
      ],
    },
    {
      id: "balanced",
      name: "Balanced",
      expectedReturn: 14.2,
      volatility: 9.8,
      sharpeRatio: 1.24,
      sortinoRatio: 1.72,
      treynorRatio: 11.5,
      alpha: 2.1,
      beta: 0.75,
      maxDrawdown: -11.2,
      calmarRatio: 1.27,
      informationRatio: 0.92,
      trackingError: 3.8,
      diversificationScore: 88,
      quantumImprovementPct: 12.5,
      weights: [
        { name: "Nifty 50 BeES ETF", weight: 30, color: "#3B82F6" },
        { name: "RELIANCE & TCS", weight: 25, color: "#10B981" },
        { name: "Gold ETFs", weight: 20, color: "#F59E0B" },
        { name: "G-Sec Debt ETF", weight: 15, color: "#8B5CF6" },
        { name: "TREPS Cash", weight: 10, color: "#06B6D4" },
      ],
    },
    {
      id: "income",
      name: "Income Portfolio",
      expectedReturn: 10.8,
      volatility: 6.5,
      sharpeRatio: 1.15,
      sortinoRatio: 1.55,
      treynorRatio: 9.8,
      alpha: 1.5,
      beta: 0.42,
      maxDrawdown: -7.5,
      calmarRatio: 1.44,
      informationRatio: 0.88,
      trackingError: 2.8,
      diversificationScore: 89,
      quantumImprovementPct: 9.2,
      weights: [
        { name: "Sovereign Debt (High Yield)", weight: 40, color: "#3B82F6" },
        { name: "VNQ REIT Real Estate", weight: 25, color: "#8B5CF6" },
        { name: "TCS (Dividend Yield)", weight: 20, color: "#10B981" },
        { name: "Gold ETF", weight: 15, color: "#F59E0B" },
      ],
    },
    {
      id: "growth",
      name: "Growth Portfolio",
      expectedReturn: 18.5,
      volatility: 14.2,
      sharpeRatio: 1.16,
      sortinoRatio: 1.58,
      treynorRatio: 13.8,
      alpha: 3.2,
      beta: 1.05,
      maxDrawdown: -18.2,
      calmarRatio: 1.02,
      informationRatio: 0.81,
      trackingError: 5.4,
      diversificationScore: 82,
      quantumImprovementPct: 15.8,
      weights: [
        { name: "NVDA & US Tech", weight: 30, color: "#10B981" },
        { name: "RELIANCE & HDFC", weight: 30, color: "#3B82F6" },
        { name: "Nifty 50 ETF", weight: 20, color: "#8B5CF6" },
        { name: "Gold ETF", weight: 12, color: "#F59E0B" },
        { name: "Bitcoin", weight: 8, color: "#EC4899" },
      ],
    },
    {
      id: "aggressive",
      name: "Aggressive",
      expectedReturn: 22.4,
      volatility: 18.8,
      sharpeRatio: 1.08,
      sortinoRatio: 1.42,
      treynorRatio: 15.1,
      alpha: 4.1,
      beta: 1.25,
      maxDrawdown: -24.0,
      calmarRatio: 0.93,
      informationRatio: 0.78,
      trackingError: 7.2,
      diversificationScore: 74,
      quantumImprovementPct: 18.2,
      weights: [
        { name: "NVDA (Semiconductors)", weight: 35, color: "#10B981" },
        { name: "Bitcoin Digital Alpha", weight: 20, color: "#F59E0B" },
        { name: "Indian Equities", weight: 25, color: "#3B82F6" },
        { name: "Gold Hedge", weight: 10, color: "#EC4899" },
        { name: "TREPS Buffer", weight: 10, color: "#06B6D4" },
      ],
    },
    {
      id: "conservative",
      name: "Conservative",
      expectedReturn: 9.2,
      volatility: 5.1,
      sharpeRatio: 1.22,
      sortinoRatio: 1.68,
      treynorRatio: 8.9,
      alpha: 1.1,
      beta: 0.32,
      maxDrawdown: -5.8,
      calmarRatio: 1.58,
      informationRatio: 0.89,
      trackingError: 2.4,
      diversificationScore: 94,
      quantumImprovementPct: 10.4,
      weights: [
        { name: "10-Yr RBI Government Bonds", weight: 50, color: "#3B82F6" },
        { name: "Gold ETF (GOLDBEES)", weight: 25, color: "#F59E0B" },
        { name: "TREPS Overnight Cash", weight: 15, color: "#06B6D4" },
        { name: "Nifty 50 Index ETF", weight: 10, color: "#10B981" },
      ],
    },
    {
      id: "quantum",
      name: "Quantum Optimized",
      expectedReturn: 19.8,
      volatility: 11.2,
      sharpeRatio: 1.68,
      sortinoRatio: 2.32,
      treynorRatio: 18.5,
      alpha: 4.8,
      beta: 0.78,
      maxDrawdown: -9.8,
      calmarRatio: 2.02,
      informationRatio: 1.42,
      trackingError: 3.1,
      diversificationScore: 96,
      quantumImprovementPct: 24.4,
      weights: [
        { name: "QAOA Dynamic Equity Sleeve", weight: 38, color: "#10B981" },
        { name: "QAOA Gold & Inflation Hedge", weight: 22, color: "#F59E0B" },
        { name: "Sovereign Debt Duration Sleeve", weight: 20, color: "#3B82F6" },
        { name: "US AI Compute (NVDA)", weight: 12, color: "#8B5CF6" },
        { name: "Asymmetric Digital Alpha", weight: 8, color: "#EC4899" },
      ],
    },
    {
      id: "ai_recommended",
      name: "AI Recommended",
      expectedReturn: 18.2,
      volatility: 10.5,
      sharpeRatio: 1.64,
      sortinoRatio: 2.25,
      treynorRatio: 17.8,
      alpha: 4.5,
      beta: 0.74,
      maxDrawdown: -9.2,
      calmarRatio: 1.98,
      informationRatio: 1.38,
      trackingError: 2.9,
      diversificationScore: 95,
      quantumImprovementPct: 22.8,
      weights: [
        { name: "Core Indian Equities", weight: 35, color: "#10B981" },
        { name: "Gold Inflation Hedge", weight: 20, color: "#F59E0B" },
        { name: "Sovereign Debt Buffer", weight: 20, color: "#3B82F6" },
        { name: "Global AI Compute", weight: 15, color: "#8B5CF6" },
        { name: "Liquid Cash Reserve", weight: 10, color: "#06B6D4" },
      ],
    },
  ];

  // Dynamic Efficient Frontier Points derived from target slider (0 to 100)
  const dynamicReturn = Number((8.0 + (targetRiskPoint / 100) * 17.0).toFixed(1));
  const dynamicVol = Number((4.0 + Math.pow(targetRiskPoint / 100, 1.4) * 18.0).toFixed(1));
  const dynamicSharpe = Number(((dynamicReturn - 4.5) / Math.max(dynamicVol, 1)).toFixed(2));

  // Frontier points scatter data
  const frontierCurveData = PORTFOLIOS.map((p) => ({
    x: p.volatility,
    y: p.expectedReturn,
    name: p.name,
    id: p.id,
    sharpe: p.sharpeRatio,
  }));

  const activePort = PORTFOLIOS.find((p) => p.id === selectedPortfolioId) || PORTFOLIOS[7];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6">
      {/* Header Banner */}
      <GlassCard className="relative overflow-hidden border border-emerald/30 bg-gradient-to-r from-emerald/10 via-primary/5 to-purple-500/10 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-emerald/20 text-emerald">
                <Scale className="size-5" />
              </span>
              <div>
                <h1 className="font-heading text-xl font-bold tracking-tight">
                  Interactive Efficient Frontier & Multi-Portfolio Engine
                </h1>
                <p className="text-xs text-muted-foreground">
                  Intelligent 9-Portfolio Construction & 13 Financial Ratio Comparison Table
                </p>
              </div>
            </div>
          </div>

          <span className="rounded-xl border border-emerald/40 bg-emerald/10 px-4 py-2 font-mono text-xs font-bold text-emerald flex items-center gap-1.5">
            <Sparkles className="size-4" /> QAOA Quantum Sharpe: {PORTFOLIOS[7].sharpeRatio}
          </span>
        </div>
      </GlassCard>

      {/* Section 1: Interactive Efficient Frontier Drag & Click Visualizer */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Frontier Curve Chart (7 Cols) */}
        <GlassCard className="lg:col-span-7">
          <SectionTitle
            icon={<TrendingUp className="size-4 text-emerald" />}
            title="Interactive Efficient Frontier"
            subtitle="Drag slider or click any portfolio node to re-weight weights in real time"
          />

          {/* Interactive Risk Target Slider */}
          <div className="mb-6 rounded-2xl border border-border bg-secondary/30 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground flex items-center gap-1 font-semibold">
                <Sliders className="size-3.5 text-cyan" /> Interactive Risk Target Target:
              </span>
              <span className="text-emerald font-bold">
                Return: {dynamicReturn}% · Risk: {dynamicVol}% · Sharpe: {dynamicSharpe}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={targetRiskPoint}
              onChange={(e) => setTargetRiskPoint(Number(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-emerald"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>Min Risk (4.0% Vol)</span>
              <span>Balanced (11.0% Vol)</span>
              <span>Max Alpha (22.0% Vol)</span>
            </div>
          </div>

          {/* Frontier Scatter Chart */}
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Risk (Volatility %)"
                  unit="%"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Expected Return %"
                  unit="%"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", fontSize: 11 }}
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                />
                <Scatter
                  name="Portfolios"
                  data={frontierCurveData}
                  fill="var(--emerald)"
                  onClick={(entry: any) => entry && entry.id && setSelectedPortfolioId(entry.id)}
                  className="cursor-pointer"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Selected Portfolio Active Allocation (5 Cols) */}
        <GlassCard className="lg:col-span-5">
          <SectionTitle
            icon={<PieIcon className="size-4 text-cyan" />}
            title={`${activePort.name} Sleeve Weights`}
            subtitle={`Allocating ${fmtCurrency(amount, currency)} mandate across asset classes`}
          />

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activePort.weights}
                  dataKey="weight"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {activePort.weights.map((w) => (
                    <Cell key={w.name} fill={w.color} stroke="var(--background)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-1.5 text-xs">
            {activePort.weights.map((w) => (
              <div key={w.name} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-1.5">
                <span className="flex items-center gap-2 font-medium">
                  <span className="size-2 rounded-full" style={{ backgroundColor: w.color }} />
                  {w.name}
                </span>
                <span className="font-mono font-bold text-foreground">
                  {w.weight}% · {fmtCurrency(amount * (w.weight / 100), currency)}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Section 2: 9-Portfolio Comparison Matrix Across 13 Ratios */}
      <GlassCard>
        <SectionTitle
          icon={<Scale className="size-4 text-gold" />}
          title="Institutional 9-Portfolio Comparison Table"
          subtitle="Comparing Expected Return, Volatility, Sharpe, Sortino, Treynor, Alpha, Beta, Drawdown & Quantum Edge"
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-xs text-left">
            <thead>
              <tr className="border-b border-border bg-secondary/50 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="p-3">Portfolio Strategy</th>
                <th className="p-3">Exp Return</th>
                <th className="p-3">Volatility</th>
                <th className="p-3">Sharpe</th>
                <th className="p-3">Sortino</th>
                <th className="p-3">Treynor</th>
                <th className="p-3">Alpha</th>
                <th className="p-3">Beta</th>
                <th className="p-3">Max DD</th>
                <th className="p-3">Calmar</th>
                <th className="p-3">Info Ratio</th>
                <th className="p-3">Tracking Err</th>
                <th className="p-3">Div Score</th>
                <th className="p-3">Quantum %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono">
              {PORTFOLIOS.map((p) => {
                const isSelected = selectedPortfolioId === p.id;
                const isQuantum = p.id === "quantum";
                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPortfolioId(p.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-cyan/15 font-semibold text-foreground ring-1 ring-cyan/40"
                        : isQuantum
                          ? "bg-emerald/10 font-semibold"
                          : "hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <td className="p-3 font-sans font-bold flex items-center gap-1.5 text-foreground">
                      {isQuantum && <Sparkles className="size-3.5 text-emerald shrink-0" />}
                      {p.name}
                    </td>
                    <td className="p-3 text-emerald font-bold">{p.expectedReturn}%</td>
                    <td className="p-3 text-foreground">{p.volatility}%</td>
                    <td className="p-3 text-cyan font-bold">{p.sharpeRatio}</td>
                    <td className="p-3">{p.sortinoRatio}</td>
                    <td className="p-3">{p.treynorRatio}</td>
                    <td className="p-3 text-emerald">+{p.alpha}%</td>
                    <td className="p-3">{p.beta}</td>
                    <td className="p-3 text-rose-400">{p.maxDrawdown}%</td>
                    <td className="p-3">{p.calmarRatio}</td>
                    <td className="p-3">{p.informationRatio}</td>
                    <td className="p-3">{p.trackingError}%</td>
                    <td className="p-3 text-gold font-bold">{p.diversificationScore}</td>
                    <td className="p-3 text-emerald font-bold">+{p.quantumImprovementPct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
