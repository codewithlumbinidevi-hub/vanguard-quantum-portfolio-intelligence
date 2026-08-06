import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TopNav } from "@/components/vq/TopNav";
import { Landing } from "@/components/vq/Landing";
import { MarketTicker } from "@/components/vq/Dashboard";
import { InstitutionalDashboard } from "@/components/vq/InstitutionalDashboard";
import { PersonalPortfolioBuilder } from "@/components/vq/PersonalPortfolioBuilder";
import { OptimizationSimulationEngine } from "@/components/vq/OptimizationSimulationEngine";
import { InteractiveFrontierComparison } from "@/components/vq/InteractiveFrontierComparison";
import { PortfolioView, MarketsView } from "@/components/vq/PortfolioMarkets";
import { Copilot } from "@/components/vq/Copilot";
import { Comparison } from "@/components/vq/Comparison";
import { Analytics } from "@/components/vq/Analytics";
import { PortfolioProvider } from "@/context/PortfolioContext";
import type { ViewKey } from "@/lib/vq-data";

const TITLE = "Vanguard Quantum — Institutional AI Investment Platform";
const DESC =
  "World-class institutional-grade AI & Quantum investment platform: QAOA optimization simulator, interactive efficient frontier, 9-portfolio comparison matrix, and AI advisor.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: VanguardQuantum,
});

function VanguardQuantum() {
  return (
    <PortfolioProvider>
      <VanguardQuantumContent />
    </PortfolioProvider>
  );
}

function VanguardQuantumContent() {
  const [view, setView] = useState<ViewKey>("dashboard");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [riskTolerance, setRiskTolerance] = useState(58);
  const [liveData, setLiveData] = useState(true);
  const [demoLoaded, setDemoLoaded] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const go = (v: ViewKey) => {
    setView(v);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav
        view={view}
        setView={go}
        theme={theme}
        toggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        riskTolerance={riskTolerance}
        setRiskTolerance={setRiskTolerance}
        liveData={liveData}
        setLiveData={setLiveData}
      />
      {view !== "landing" && <MarketTicker live={liveData} />}

      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {view === "landing" && (
              <Landing
                demoLoaded={demoLoaded}
                onDashboard={() => go("dashboard")}
                onCopilot={() => go("copilot")}
                onDemo={() => setDemoLoaded(true)}
              />
            )}
            {view === "dashboard" && <InstitutionalDashboard />}
            {view === "builder" && (
              <PersonalPortfolioBuilder onLaunchSimulation={() => go("simulation")} />
            )}
            {view === "simulation" && <OptimizationSimulationEngine />}
            {view === "frontier" && <InteractiveFrontierComparison />}
            {view === "copilot" && <Copilot />}
            {view === "portfolio" && <PortfolioView />}
            {view === "markets" && <MarketsView />}
            {view === "comparison" && <Comparison />}
            {view === "analytics" && <Analytics />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        Vanguard Quantum · Institutional AI Investment Platform · Bloomberg / BlackRock Aladdin Grade
      </footer>
    </div>
  );
}


