import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sliders,
  DollarSign,
  Target,
  ShieldAlert,
  Clock,
  Layers,
  Sparkles,
  RefreshCw,
  Building2,
  Ban,
  Leaf,
  Receipt,
  Wallet,
  Globe2,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { GlassCard, SectionTitle } from "./primitives";
import { usePortfolio } from "@/context/PortfolioContext";
import type { CurrencyCode, InvestmentGoal, RiskLevel, HorizonYears } from "@/lib/api";

const CURRENCY_OPTIONS: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: "INR", symbol: "₹", label: "INR (Indian Rupee)" },
  { code: "USD", symbol: "$", label: "USD (US Dollar)" },
  { code: "EUR", symbol: "€", label: "EUR (Euro)" },
  { code: "GBP", symbol: "£", label: "GBP (British Pound)" },
  { code: "JPY", symbol: "¥", label: "JPY (Japanese Yen)" },
];

const GOAL_OPTIONS: InvestmentGoal[] = [
  "Wealth Creation",
  "Retirement",
  "Passive Income",
  "Child Education",
  "Tax Saving",
  "Emergency Fund",
  "Dream Home",
];

const HORIZON_OPTIONS: HorizonYears[] = [1, 3, 5, 10, 20];

const SECTOR_OPTIONS = [
  "Information Technology",
  "Financials & Banking",
  "Energy & Conglomerate",
  "Precious Metals",
  "Healthcare & Biotech",
  "AI & Semiconductors",
  "Real Estate & REITs",
  "Consumer Goods",
];

const COMPANY_PRESETS = ["RELIANCE", "TCS", "HDFCBANK", "NVDA", "AAPL", "AMZN", "MSFT", "GOOGL"];

const COUNTRIES = ["India", "United States", "United Kingdom", "Singapore", "Germany", "Global / Multi-Region"];

const WITHDRAWAL_PERIODS = ["Immediate (<6M)", "1 to 3 Years", "3 to 5 Years", "5 to 10 Years", "10+ Years (Long Term)"];

const ESG_PREFERENCES = [
  { id: "Standard", name: "Standard (Max Return)", desc: "Unconstrained optimal risk-return target" },
  { id: "SRI", name: "High ESG / SRI", desc: "Prioritizes positive environmental & governance scores" },
  { id: "ZeroFossil", name: "Zero Fossil Fuels", desc: "Excludes oil, gas, and high-emission energy producers" },
];

const TAX_PREFERENCES = [
  { id: "Standard", name: "Standard Tax Handling", desc: "Default tax treatment" },
  { id: "TaxLossHarvest", name: "Tax-Loss Harvesting", desc: "Offset realized capital gains automatically" },
  { id: "LTCGOptimized", name: "LTCG Indexation Shield", desc: "Optimizes for long-term capital gains tax brackets" },
];

const LIQUIDITY_REQUIREMENTS = [
  { id: "High", name: "High / Immediate", desc: "Maintain 25%+ instant liquid TREPS/Cash buffer" },
  { id: "Moderate", name: "Moderate Liquidity", desc: "Quarterly rebalancing window without exit loads" },
  { id: "Low", name: "Low (Lock-in Allowed)", desc: "Maximize illiquidity premium in REITs and Sovereign Bonds" },
];

export function PersonalPortfolioBuilder({
  onLaunchSimulation,
}: {
  onLaunchSimulation: () => void;
}) {
  const { profile, updateProfile, currencySymbol, recalculate, isLoading } = usePortfolio();

  // Local state for specialized institutional fields
  const [age, setAge] = useState<number>(34);
  const [country, setCountry] = useState<string>("India");
  const [withdrawalPeriod, setWithdrawalPeriod] = useState<string>("5 to 10 Years");
  const [monthlySip, setMonthlySip] = useState<number>(25000);
  const [preferredCompanies, setPreferredCompanies] = useState<string[]>(["RELIANCE", "NVDA", "TCS"]);
  const [companiesToAvoid, setCompaniesToAvoid] = useState<string[]>(["High Debt Entities"]);
  const [avoidInput, setAvoidInput] = useState("");
  const [esgPref, setEsgPref] = useState("Standard");
  const [taxPref, setTaxPref] = useState("TaxLossHarvest");
  const [liquidityReq, setLiquidityReq] = useState("Moderate");

  const amountPresets =
    profile.currency === "INR"
      ? [
          { label: "₹50,000", val: 50000 },
          { label: "₹5 Lakhs", val: 500000 },
          { label: "₹50 Lakhs", val: 5000000 },
          { label: "₹1 Crore", val: 10000000 },
        ]
      : [
          { label: "$10,000", val: 10000 },
          { label: "$100,000", val: 100000 },
          { label: "$500,000", val: 500000 },
          { label: "$1,000,000", val: 1000000 },
        ];

  const handleSectorToggle = (sector: string) => {
    const current = profile.preferredSectors || [];
    const updated = current.includes(sector)
      ? current.filter((s) => s !== sector)
      : [...current, sector];
    updateProfile({ preferredSectors: updated });
  };

  const handleCompanyToggle = (symbol: string) => {
    setPreferredCompanies((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol],
    );
  };

  const handleAddAvoid = () => {
    if (avoidInput.trim() && !companiesToAvoid.includes(avoidInput.trim())) {
      setCompaniesToAvoid((prev) => [...prev, avoidInput.trim()]);
      setAvoidInput("");
    }
  };

  const handleRemoveAvoid = (item: string) => {
    setCompaniesToAvoid((prev) => prev.filter((i) => i !== item));
  };

  const handleLaunch = async () => {
    await recalculate();
    onLaunchSimulation();
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6">
      {/* Header Banner */}
      <GlassCard className="relative overflow-hidden border border-emerald/30 bg-gradient-to-r from-emerald/10 via-primary/5 to-cyan/10 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-emerald/20 text-emerald">
                <Sliders className="size-5" />
              </span>
              <div>
                <h1 className="font-heading text-xl font-bold tracking-tight">
                  Personal Portfolio Builder
                </h1>
                <p className="text-xs text-muted-foreground">
                  Institutional Mandate Calibration · High-Density Multi-Asset Allocation Engine
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLaunch}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald via-teal-500 to-cyan-500 px-6 py-3 text-xs font-bold text-black shadow-lg shadow-emerald/25 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="size-4" />
            {isLoading ? "Optimizing Quantum State..." : "Run Quantum AI Optimization"}
          </button>
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Column 1: Capital, Currency, Goals & Demographics (4 Cols) */}
        <div className="space-y-6 lg:col-span-4">
          <GlassCard>
            <SectionTitle
              icon={<DollarSign className="size-4 text-emerald" />}
              title="1. Capital & Currency Setup"
              subtitle="Mandate size, base currency, and cash flows"
            />
            <div className="space-y-4 text-xs">
              {/* Investment Amount */}
              <div>
                <label className="block font-medium text-muted-foreground mb-1.5">
                  Investment Capital ({profile.currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-base font-bold text-emerald">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="1000"
                    step="10000"
                    value={profile.investmentAmount}
                    onChange={(e) =>
                      updateProfile({ investmentAmount: Math.max(1000, Number(e.target.value)) })
                    }
                    className="w-full rounded-xl border border-border bg-secondary/60 py-2.5 pl-9 pr-3 font-mono text-base font-bold text-foreground focus:border-emerald focus:outline-none"
                  />
                </div>
                {/* Presets */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {amountPresets.map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => updateProfile({ investmentAmount: p.val })}
                      className={`rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors border ${
                        profile.investmentAmount === p.val
                          ? "border-emerald bg-emerald/15 text-emerald font-semibold"
                          : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency Selector */}
              <div>
                <label className="block font-medium text-muted-foreground mb-1.5">
                  Base Currency
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {CURRENCY_OPTIONS.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => updateProfile({ currency: c.code })}
                      className={`rounded-lg py-1.5 text-center font-mono text-xs font-bold transition-all border ${
                        profile.currency === c.code
                          ? "border-emerald bg-emerald text-black shadow-md"
                          : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {c.symbol} {c.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly SIP */}
              <div>
                <label className="block font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  <Wallet className="size-3.5 text-cyan" /> Monthly SIP / Accumulation Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-cyan">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="5000"
                    value={monthlySip}
                    onChange={(e) => setMonthlySip(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-secondary/60 py-2 pl-8 pr-3 font-mono text-xs font-bold text-foreground focus:border-cyan focus:outline-none"
                  />
                </div>
              </div>

              {/* Goal Selector */}
              <div>
                <label className="block font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  <Target className="size-3.5 text-emerald" /> Primary Investment Objective
                </label>
                <select
                  value={profile.investmentGoal}
                  onChange={(e) =>
                    updateProfile({ investmentGoal: e.target.value as InvestmentGoal })
                  }
                  className="w-full rounded-xl border border-border bg-secondary/60 py-2 px-3 text-xs font-medium text-foreground focus:border-emerald focus:outline-none cursor-pointer"
                >
                  {GOAL_OPTIONS.map((g) => (
                    <option key={g} value={g} className="bg-popover text-popover-foreground">
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Investor Demographics */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <UserCheck className="size-3" /> Investor Age
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="90"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-secondary/60 p-1.5 text-xs font-mono font-semibold text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <Globe2 className="size-3" /> Country / Jurisdiction
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-lg border border-border bg-secondary/60 p-1.5 text-xs font-semibold text-foreground cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c} className="bg-popover text-popover-foreground">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <SectionTitle
              icon={<ShieldAlert className="size-4 text-gold" />}
              title="2. Risk & Time Horizon"
              subtitle="Risk appetite calibration and withdrawal windows"
            />
            <div className="space-y-4 text-xs">
              {/* Risk Category */}
              <div>
                <label className="block font-medium text-muted-foreground mb-1.5">
                  Risk Appetite Class
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Conservative", "Balanced", "Aggressive"] as RiskLevel[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => updateProfile({ riskAppetite: r })}
                      className={`rounded-lg py-2 text-center font-semibold transition-all border ${
                        profile.riskAppetite === r
                          ? r === "Conservative"
                            ? "border-primary bg-primary/20 text-primary"
                            : r === "Balanced"
                              ? "border-gold bg-gold/20 text-gold"
                              : "border-rose-500 bg-rose-500/20 text-rose-400"
                          : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Investment Horizon */}
              <div>
                <label className="block font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  <Clock className="size-3.5 text-cyan" /> Investment Horizon
                </label>
                <div className="grid grid-cols-5 gap-1.5 font-mono">
                  {HORIZON_OPTIONS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => updateProfile({ horizonYears: h })}
                      className={`rounded-lg py-1.5 text-center text-xs font-bold transition-all border ${
                        profile.horizonYears === h
                          ? "border-cyan bg-cyan text-black"
                          : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {h}Y
                    </button>
                  ))}
                </div>
              </div>

              {/* Expected Withdrawal Window */}
              <div>
                <label className="block font-medium text-muted-foreground mb-1.5">
                  Expected Withdrawal Window
                </label>
                <select
                  value={withdrawalPeriod}
                  onChange={(e) => setWithdrawalPeriod(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/60 py-2 px-3 text-xs font-medium text-foreground cursor-pointer"
                >
                  {WITHDRAWAL_PERIODS.map((w) => (
                    <option key={w} value={w} className="bg-popover text-popover-foreground">
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Column 2: Sector, Company & Security Filters (4 Cols) */}
        <div className="space-y-6 lg:col-span-4">
          <GlassCard>
            <SectionTitle
              icon={<Layers className="size-4 text-purple-400" />}
              title="3. Industry & Asset Universe"
              subtitle="Target sectors and asset class filters"
            />
            <div className="space-y-4 text-xs">
              {/* Preferred Sectors */}
              <div>
                <label className="block font-medium text-muted-foreground mb-2">
                  Target Industries & Sectors
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SECTOR_OPTIONS.map((sec) => {
                    const active = (profile.preferredSectors || []).includes(sec);
                    return (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => handleSectorToggle(sec)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all border ${
                          active
                            ? "border-emerald bg-emerald/20 text-emerald"
                            : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {active ? "✓ " : "+ "}
                        {sec}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Companies */}
              <div className="pt-2 border-t border-border">
                <label className="block font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Building2 className="size-3.5 text-cyan" /> Preferred Blue-Chip Companies
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMPANY_PRESETS.map((comp) => {
                    const active = preferredCompanies.includes(comp);
                    return (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => handleCompanyToggle(comp)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-mono font-bold transition-all border ${
                          active
                            ? "border-cyan bg-cyan/20 text-cyan"
                            : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {active ? "✓ " : "+ "}
                        {comp}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Companies / Factors to Avoid */}
              <div className="pt-2 border-t border-border">
                <label className="block font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Ban className="size-3.5 text-rose-400" /> Sectors or Companies to Avoid
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Tobacco, High Debt"
                    value={avoidInput}
                    onChange={(e) => setAvoidInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddAvoid()}
                    className="flex-1 rounded-lg border border-border bg-secondary/60 px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={handleAddAvoid}
                    className="rounded-lg border border-rose-500/40 bg-rose-500/20 px-3 py-1.5 font-semibold text-rose-400 hover:bg-rose-500/30 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {companiesToAvoid.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] text-rose-400"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveAvoid(item)}
                        className="hover:text-rose-200 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Column 3: Institutional Preferences (ESG, Tax, Liquidity) (4 Cols) */}
        <div className="space-y-6 lg:col-span-4">
          <GlassCard>
            <SectionTitle
              icon={<Leaf className="size-4 text-emerald" />}
              title="4. Institutional Mandates & ESG"
              subtitle="Sustainability, tax optimization, and liquidity constraints"
            />
            <div className="space-y-4 text-xs">
              {/* ESG Preference */}
              <div>
                <label className="block font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Leaf className="size-3.5 text-emerald" /> ESG / Sustainability Filter
                </label>
                <div className="space-y-2">
                  {ESG_PREFERENCES.map((esg) => (
                    <button
                      key={esg.id}
                      type="button"
                      onClick={() => setEsgPref(esg.id)}
                      className={`w-full rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                        esgPref === esg.id
                          ? "border-emerald bg-emerald/10 text-foreground"
                          : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <p className="font-semibold text-xs text-foreground flex items-center justify-between">
                        {esg.name}
                        {esgPref === esg.id && <CheckCircle2 className="size-4 text-emerald" />}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{esg.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tax Preference */}
              <div className="pt-2 border-t border-border">
                <label className="block font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Receipt className="size-3.5 text-gold" /> Tax Optimization Policy
                </label>
                <div className="space-y-2">
                  {TAX_PREFERENCES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTaxPref(t.id)}
                      className={`w-full rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                        taxPref === t.id
                          ? "border-gold bg-gold/10 text-foreground"
                          : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <p className="font-semibold text-xs text-foreground flex items-center justify-between">
                        {t.name}
                        {taxPref === t.id && <CheckCircle2 className="size-4 text-gold" />}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Liquidity Requirement */}
              <div className="pt-2 border-t border-border">
                <label className="block font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Wallet className="size-3.5 text-cyan" /> Liquidity Buffer Requirement
                </label>
                <div className="space-y-2">
                  {LIQUIDITY_REQUIREMENTS.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLiquidityReq(l.id)}
                      className={`w-full rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                        liquidityReq === l.id
                          ? "border-cyan bg-cyan/10 text-foreground"
                          : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <p className="font-semibold text-xs text-foreground flex items-center justify-between">
                        {l.name}
                        {liquidityReq === l.id && <CheckCircle2 className="size-4 text-cyan" />}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{l.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
