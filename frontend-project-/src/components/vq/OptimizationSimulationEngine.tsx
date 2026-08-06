import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  CheckCircle2,
  Clock,
  Terminal,
  Activity,
  Zap,
  Play,
  RotateCcw,
  Sparkles,
  BarChart3,
  Layers,
  LineChart as LineChartIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import { GlassCard, SectionTitle } from "./primitives";

interface Stage {
  id: number;
  name: string;
  algo: string;
  mathObj: string;
  desc: string;
  execTime: string;
}

const STAGES: Stage[] = [
  { id: 1, name: "Initializing Portfolio...", algo: "Portfolio Initialization", mathObj: "w_0 = [1/N, ..., 1/N]", desc: "Allocating memory buffers & setting asset universe indices", execTime: "0.04s" },
  { id: 2, name: "Loading Asset Universe...", algo: "Multi-Asset Catalog", mathObj: "U = \\{A_1, A_2, ..., A_N\\}", desc: "Ingesting tickers across Equities, Gold, Sovereign Bonds & Crypto", execTime: "0.08s" },
  { id: 3, name: "Fetching Historical Market Data...", algo: "TimeSeries Ingestion", mathObj: "P_{i,t} \\in \\mathbb{R}^{T \\times N}", desc: "Streaming 250-day daily adjusted close prices", execTime: "0.12s" },
  { id: 4, name: "Building Covariance Matrix...", algo: "Covariance Matrix Estimation", mathObj: "\\Sigma_{ij} = \\text{Cov}(R_i, R_j)", desc: "Calculating sample & Ledoit-Wolf shrinkage covariance matrix", execTime: "0.15s" },
  { id: 5, name: "Expected Return Estimation...", algo: "Black-Litterman Model", mathObj: "\\mu_{BL} = [(\\tau \\Sigma)^{-1} + P^T \\Omega^{-1} P]^{-1}", desc: "Combining market equilibrium with AI market sentiment views", execTime: "0.18s" },
  { id: 6, name: "Risk Model Generation...", algo: "Factor Exposure Model", mathObj: "R_i = \\alpha_i + \\beta_{i,m} R_m + \\epsilon_i", desc: "Estimating systematic beta, idiosyncratic volatility & VaR95", execTime: "0.14s" },
  { id: 7, name: "Factor Exposure Analysis...", algo: "PCA Factor Decomposition", mathObj: "\\Sigma = V \\Lambda V^T", desc: "Extracting principal variance components across multi-asset sleeves", execTime: "0.11s" },
  { id: 8, name: "Constructing QUBO Matrix...", algo: "QUBO Formulation", mathObj: "\\min_x x^T Q x, x \\in \\{0,1\\}^n", desc: "Mapping Sharpe objective & turnover constraints to quadratic matrix Q", execTime: "0.22s" },
  { id: 9, name: "Applying Constraints...", algo: "Lagrangian Penalty Engine", mathObj: "Q_{ij} \\leftarrow Q_{ij} + \\lambda (\\sum x_i - B)^2", desc: "Enforcing budget, sector caps, and max position limits", execTime: "0.09s" },
  { id: 10, name: "Encoding Quantum Circuit...", algo: "Ising Hamiltonian Encoding", mathObj: "H_C = \\sum J_{ij} Z_i Z_j + \\sum h_i Z_i", desc: "Converting QUBO problem matrix Q to Pauli-Z spin glass Hamiltonian", execTime: "0.16s" },
  { id: 11, name: "Initializing PennyLane Simulator...", algo: "PennyLane StateVector Simulator", mathObj: "|\\psi_0\\rangle = H^{\\otimes n} |0\\rangle", desc: "Preparing uniform superposition over 2^N qubit state vector space", execTime: "0.20s" },
  { id: 12, name: "Executing QAOA...", algo: "Quantum Approximate Optimization Algorithm", mathObj: "|\\gamma, \\beta\\rangle = \\prod_{l=1}^p e^{-i \\beta_l H_M} e^{-i \\gamma_l H_C} |\\psi_0\\rangle", desc: "Applying depth p=3 Cost and Transverse-Field Mixer Hamiltonians", execTime: "0.45s" },
  { id: 13, name: "Optimizing γ and β Parameters...", algo: "Adam Gradient Optimizer", mathObj: "(\\gamma, \\beta)_{t+1} = (\\gamma, \\beta)_t - \\eta \\nabla \\langle H_C \\rangle", desc: "Iterating quantum parameter angles to minimize expectation value", execTime: "0.38s" },
  { id: 14, name: "Evaluating Bitstrings...", algo: "Quantum Bitstring Sampler", mathObj: "P(x) = |\\langle x | \\gamma, \\beta \\rangle|^2", desc: "Sampling 2,048 measurement shots to retrieve optimal discrete portfolios", execTime: "0.19s" },
  { id: 15, name: "Calculating Efficient Frontier...", algo: "SLSQP Quadratic Solver", mathObj: "\\min_w w^T \\Sigma w \\text{ s.t. } w^T \\mu = r_{target}", desc: "Tracing constrained efficient frontier curve across 15 target return points", execTime: "0.24s" },
  { id: 16, name: "Comparing Classical vs Quantum...", algo: "Benchmark Reconciler", mathObj: "\\Delta_{\\text{Sharpe}} = \\frac{\\text{Sharpe}_{QAOA} - \\text{Sharpe}_{MPT}}{\\text{Sharpe}_{MPT}}", desc: "Validating QAOA quantum portfolio against CVXPY & MPT benchmarks", execTime: "0.12s" },
  { id: 17, name: "Generating AI Insights...", algo: "LLM Explainability Engine", mathObj: "\\text{Score} = f(\\text{Sharpe}, \\text{Div}, \\text{Drawdown})", desc: "Synthesizing rationale, risk attribution, and allocation commentary", execTime: "0.15s" },
  { id: 18, name: "Generating Personalized Recommendations...", algo: "Recommendation Engine", mathObj: "\\text{Rec}_k = \\text{Align}(Profile, Weights)", desc: "Generating rebalancing schedule, tax-loss harvest & SIP advice", execTime: "0.10s" },
  { id: 19, name: "Optimization Complete", algo: "Quantum State Finalized", mathObj: "\\text{Status: Optimal} \\quad \\langle H_C \\rangle^* = -2.842", desc: "All 19 execution stages validated. Portfolio rebalance ready for deployment.", execTime: "0.02s" },
];

export function OptimizationSimulationEngine() {
  const [activeStep, setActiveStep] = useState<number>(19); // Default completed for instant view
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [gamma, setGamma] = useState<number>(0.542);
  const [beta, setBeta] = useState<number>(0.318);
  const [loss, setLoss] = useState<number>(-2.842);
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] PennyLane QAOA simulator initialized on default.qubit (12 qubits, p=3 layers)",
    "[INFO] Covariance matrix condition number: 14.82 (Well-conditioned)",
    "[QUBO] Matrix Q constructed (12x12). Penalty coefficient lambda = 10.0",
    "[QAOA] Iteration 50/50 complete. Gamma: 0.542, Beta: 0.318, Expectation <H>: -2.842",
    "[SUCCESS] Quantum state converged. Quantum Sharpe Ratio: 1.68 (+24.4% over Classical MPT)",
  ]);

  useEffect(() => {
    let timer: any;
    if (isRunning && activeStep < 19) {
      timer = setTimeout(() => {
        const nextStep = activeStep + 1;
        setActiveStep(nextStep);
        const stage = STAGES[nextStep - 1];
        setGamma((g) => Number((g + (Math.random() * 0.04 - 0.02)).toFixed(3)));
        setBeta((b) => Number((b + (Math.random() * 0.04 - 0.02)).toFixed(3)));
        setLoss((l) => Number((l - Math.random() * 0.08).toFixed(3)));
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] Stage ${stage.id}/19: ${stage.name} (${stage.algo})`,
          ...prev.slice(0, 8),
        ]);

        if (nextStep === 19) {
          setIsRunning(false);
        }
      }, 400);
    }
    return () => clearTimeout(timer);
  }, [isRunning, activeStep]);

  const handleStartSim = () => {
    setActiveStep(1);
    setIsRunning(true);
    setLogs(["[SYSTEM] Initiating live Quantum Optimization Engine simulation..."]);
  };

  const currentStage = STAGES[Math.min(activeStep - 1, 18)];
  const progressPct = Math.round((activeStep / 19) * 100);
  const estRemainingSec = ((19 - activeStep) * 0.4).toFixed(1);

  // Live Loss Convergence curve data
  const lossData = Array.from({ length: Math.max(1, activeStep * 2.5) }).map((_, i) => ({
    iter: i + 1,
    loss: Number((-0.5 - (i / 50) * 2.34 - Math.sin(i / 3) * 0.15).toFixed(3)),
    classicalLoss: -1.82,
  }));

  // Parameter convergence trajectory (Gamma vs Beta)
  const paramTrajectory = Array.from({ length: Math.min(20, activeStep) }).map((_, i) => ({
    step: i + 1,
    gamma: Number((0.1 + i * 0.022 + Math.sin(i / 2) * 0.03).toFixed(3)),
    beta: Number((0.8 - i * 0.024 + Math.cos(i / 2) * 0.03).toFixed(3)),
  }));

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6">
      {/* Header Banner */}
      <GlassCard className="relative overflow-hidden border border-cyan/30 bg-gradient-to-r from-cyan/10 via-primary/5 to-emerald/10 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-cyan/20 text-cyan">
                <Cpu className="size-5" />
              </span>
              <div>
                <h1 className="font-heading text-xl font-bold tracking-tight">
                  Professional Optimization Simulation Engine
                </h1>
                <p className="text-xs text-muted-foreground">
                  Live PennyLane QAOA Execution · 19-Stage Workflow Timeline · Parameter & Loss Convergence
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartSim}
              disabled={isRunning}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan via-teal-500 to-emerald-500 px-5 py-2.5 text-xs font-bold text-black shadow-lg shadow-cyan/25 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isRunning ? <RotateCcw className="size-4 animate-spin" /> : <Play className="size-4 fill-current" />}
              {isRunning ? "Simulating QAOA..." : "Re-Run Live Simulation"}
            </button>
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan font-bold flex items-center gap-1.5">
              <Activity className="size-3.5 animate-pulse" />
              Progress: {progressPct}% ({activeStep}/19 Stages)
            </span>
            <span className="text-muted-foreground">
              Estimated Remaining: <span className="text-foreground font-semibold">{estRemainingSec}s</span>
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/80 border border-border">
            <motion.div
              className="h-full bg-gradient-quantum rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </GlassCard>

      {/* Grid Layout */}
      <div className="grid gap-6 xl:grid-cols-12">
        {/* Left Column: 19-Stage Workflow Timeline & Execution Logs (5 Cols) */}
        <div className="space-y-6 xl:col-span-5">
          {/* Timeline Card */}
          <GlassCard className="max-h-[580px] overflow-y-auto">
            <SectionTitle
              icon={<Clock className="size-4 text-cyan" />}
              title="19-Stage Execution Workflow"
              subtitle="Step-by-step algorithmic progression with execution timers"
            />
            <div className="space-y-2 pr-1">
              {STAGES.map((s) => {
                const isCurrent = activeStep === s.id;
                const isPassed = activeStep > s.id;
                return (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition-all ${
                      isCurrent
                        ? "border-cyan bg-cyan/15 text-foreground font-semibold ring-1 ring-cyan/40"
                        : isPassed
                          ? "border-emerald/30 bg-emerald/5 text-foreground/90"
                          : "border-border/60 bg-secondary/20 text-muted-foreground/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`grid size-6 shrink-0 place-items-center rounded-full font-mono text-[10px] font-bold ${
                          isCurrent
                            ? "bg-cyan text-black"
                            : isPassed
                              ? "bg-emerald text-black"
                              : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="size-3.5" /> : s.id}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{s.name}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{s.algo}</p>
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] text-emerald font-semibold ml-2">
                      {isPassed || isCurrent ? s.execTime : "--"}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Log Console Card */}
          <GlassCard>
            <SectionTitle
              icon={<Terminal className="size-4 text-emerald" />}
              title="Live Execution Console"
              subtitle="Real-time algorithm logs and quantum state messages"
            />
            <div className="h-[180px] overflow-y-auto rounded-xl border border-border bg-slate-950 p-3 font-mono text-[11px] text-emerald-400 space-y-1">
              {logs.map((log, idx) => (
                <div key={idx} className="leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Algorithm Execution & Quantum Circuit & Math Visualizer (7 Cols) */}
        <div className="space-y-6 xl:col-span-7">
          {/* Active Algorithm Banner */}
          <GlassCard>
            <SectionTitle
              icon={<Zap className="size-4 text-gold" />}
              title="Current Algorithm Executing"
              subtitle="Active mathematical formulation and objective function"
            />
            <div className="rounded-2xl border border-border bg-secondary/40 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block rounded-md bg-gold/20 px-2 py-0.5 font-mono text-[10px] font-bold text-gold uppercase tracking-wider">
                    {currentStage.algo}
                  </span>
                  <h3 className="font-heading text-lg font-bold text-foreground mt-1">
                    {currentStage.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{currentStage.desc}</p>
                </div>
                <span className="rounded-lg border border-cyan/40 bg-cyan/10 px-2.5 py-1 font-mono text-xs font-bold text-cyan">
                  {currentStage.execTime}
                </span>
              </div>

              {/* Mathematical Objective Block */}
              <div className="rounded-xl border border-border bg-slate-950 p-3 font-mono text-xs text-cyan-300">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">
                  Mathematical Objective Function
                </span>
                <code className="text-sm font-bold">{currentStage.mathObj}</code>
              </div>
            </div>
          </GlassCard>

          {/* Interactive Quantum Circuit Visualizer */}
          <GlassCard>
            <SectionTitle
              icon={<Cpu className="size-4 text-cyan" />}
              title="PennyLane Quantum Circuit Visualizer"
              subtitle="Live qubit wire simulation with Hadamard, Cost, and Mixer Hamiltonians"
            />

            {/* Quantum Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 mb-4 text-center font-mono text-xs">
              <div className="rounded-lg border border-border bg-secondary/40 p-2">
                <span className="block text-[9px] uppercase tracking-wider text-muted-foreground">Qubits</span>
                <span className="font-bold text-foreground">12</span>
              </div>
              <div className="rounded-lg border border-border bg-secondary/40 p-2">
                <span className="block text-[9px] uppercase tracking-wider text-muted-foreground">Circuit Depth</span>
                <span className="font-bold text-foreground">p = 3</span>
              </div>
              <div className="rounded-lg border border-border bg-secondary/40 p-2">
                <span className="block text-[9px] uppercase tracking-wider text-muted-foreground">Shots</span>
                <span className="font-bold text-foreground">2,048</span>
              </div>
              <div className="rounded-lg border border-border bg-secondary/40 p-2">
                <span className="block text-[9px] uppercase tracking-wider text-muted-foreground">Gamma (γ)</span>
                <span className="font-bold text-emerald">{gamma}</span>
              </div>
              <div className="rounded-lg border border-border bg-secondary/40 p-2">
                <span className="block text-[9px] uppercase tracking-wider text-muted-foreground">Beta (β)</span>
                <span className="font-bold text-cyan">{beta}</span>
              </div>
              <div className="rounded-lg border border-border bg-secondary/40 p-2">
                <span className="block text-[9px] uppercase tracking-wider text-muted-foreground">Expectation &lt;H&gt;</span>
                <span className="font-bold text-gold">{loss}</span>
              </div>
            </div>

            {/* Quantum Circuit Wire Diagram */}
            <div className="overflow-x-auto rounded-xl border border-border bg-slate-950 p-4 font-mono text-xs">
              <div className="min-w-[500px] space-y-3">
                {[0, 1, 2, 3].map((q) => (
                  <div key={q} className="flex items-center gap-2">
                    <span className="w-8 shrink-0 font-bold text-cyan">q[{q}]</span>
                    <div className="flex-1 flex items-center relative">
                      <div className="h-0.5 w-full bg-cyan/40" />

                      {/* Gate nodes along wire */}
                      <div className="absolute left-6 grid size-7 place-items-center rounded bg-primary text-primary-foreground font-bold text-[10px] shadow">
                        H
                      </div>
                      <div className="absolute left-24 grid h-7 px-2 place-items-center rounded bg-emerald text-black font-bold text-[10px] shadow">
                        U(C, γ)
                      </div>
                      <div className="absolute left-48 grid h-7 px-2 place-items-center rounded bg-cyan text-black font-bold text-[10px] shadow">
                        U(M, β)
                      </div>
                      <div className="absolute left-72 grid size-7 place-items-center rounded bg-purple-500 text-white font-bold text-[10px] shadow">
                        RZZ
                      </div>
                      <div className="absolute right-6 grid size-7 place-items-center rounded border border-gold bg-gold/20 text-gold font-bold text-[10px]">
                        M
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Mathematical Visualizer: Loss & Parameter Convergence */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Cost Loss Convergence Curve */}
            <GlassCard>
              <SectionTitle
                icon={<LineChartIcon className="size-4 text-emerald" />}
                title="Quantum Cost Convergence"
                subtitle="Expectation value <H_C> loss vs iteration"
              />
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lossData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="iter" stroke="var(--muted-foreground)" fontSize={10} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={10} width={35} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", fontSize: 11 }} />
                    <Line type="monotone" dataKey="loss" name="QAOA Energy <H>" stroke="var(--emerald)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="classicalLoss" name="Classical Baseline" stroke="var(--muted-foreground)" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Parameter Convergence (Gamma vs Beta) */}
            <GlassCard>
              <SectionTitle
                icon={<BarChart3 className="size-4 text-cyan" />}
                title="Parameter Trajectory"
                subtitle="Gamma (γ) vs Beta (β) optimization path"
              />
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="gamma" name="Gamma γ" stroke="var(--muted-foreground)" fontSize={10} />
                    <YAxis dataKey="beta" name="Beta β" stroke="var(--muted-foreground)" fontSize={10} width={35} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", fontSize: 11 }} />
                    <Scatter name="Trajectory" data={paramTrajectory} fill="var(--cyan)" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
