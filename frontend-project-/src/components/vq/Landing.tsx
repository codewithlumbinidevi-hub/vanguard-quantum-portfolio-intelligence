import { motion } from "framer-motion";
import { Sparkles, TrendingUp, PlayCircle, Cpu, ShieldCheck, Zap } from "lucide-react";
import { QuantumField } from "./primitives";
import { fmtUsd } from "@/lib/vq-data";
import { usePortfolioData } from "@/hooks/useVanguardData";

export function Landing({
  onDashboard,
  onCopilot,
  onDemo,
  demoLoaded,
}: {
  onDashboard: () => void;
  onCopilot: () => void;
  onDemo: () => void;
  demoLoaded: boolean;
}) {
  const { headlineStats, investorProfile } = usePortfolioData();

  return (
    <section className="relative overflow-hidden">
      <QuantumField />
      <div className="relative mx-auto max-w-[1200px] px-4 py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-gold">
            <Cpu className="size-3.5" /> Quantum Intelligence Engine v4.2
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Quantum Multi-Asset{" "}
            <span className="text-gradient-quantum">Portfolio Intelligence</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            The world's first AI-driven personalized portfolio intelligence platform
            continuously analyzing macroeconomics, risk appetite, and portfolio health.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onDashboard}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-quantum px-5 py-3 text-sm font-semibold text-primary-foreground glow-quantum transition-transform hover:scale-[1.02]"
            >
              <TrendingUp className="size-4" /> Start Investing
            </button>
            <button
              type="button"
              onClick={onCopilot}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-5 py-3 text-sm font-semibold transition-colors hover:border-primary/60"
            >
              <Sparkles className="size-4 text-gold" /> Try Live AI Copilot
            </button>
            <button
              type="button"
              onClick={onDemo}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <PlayCircle className="size-4" />
              {demoLoaded ? "Demo profile loaded" : "See Live Demo"}
            </button>
          </div>

          {demoLoaded && headlineStats && investorProfile && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-xs text-emerald"
            >
              Live API profile active — {investorProfile.name}, {investorProfile.riskProfile},{" "}
              {fmtUsd(headlineStats.portfolioValue)} AUM, {investorProfile.horizonYears}yr horizon.
            </motion.p>
          )}
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3">
          {[
            {
              icon: Zap,
              t: "Continuous Rebalancing",
              d: "Regime-aware signals recompute target weights every 4 hours across 7 asset sleeves.",
            },
            {
              icon: ShieldCheck,
              t: "Drawdown Control",
              d: "-3.1% in the 2022 rate shock versus -16.0% for a static 60/40 mandate.",
            },
            {
              icon: Cpu,
              t: "Institutional Depth",
              d: "Monte Carlo, factor attribution, and stress libraries built for allocator scrutiny.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.t}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="glass rounded-2xl p-5 text-left"
            >
              <f.icon className="size-5 text-primary" />
              <h3 className="mt-3 text-sm font-semibold">{f.t}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
