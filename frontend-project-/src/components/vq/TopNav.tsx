import { motion } from "framer-motion";
import {
  Atom,
  LayoutDashboard,
  Briefcase,
  Activity,
  BarChart3,
  Sparkles,
  Scale,
  Sun,
  Moon,
  Settings,
  Menu,
  Sliders,
  Cpu,
} from "lucide-react";
import { useState } from "react";
import type { ViewKey } from "@/lib/vq-data";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const NAV: { key: ViewKey; label: string; icon: typeof Atom }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "builder", label: "Portfolio Builder", icon: Sliders },
  { key: "simulation", label: "Optimization Simulator", icon: Cpu },
  { key: "frontier", label: "Efficient Frontier", icon: Scale },
  { key: "copilot", label: "AI Advisor", icon: Sparkles },
  { key: "markets", label: "Markets", icon: Activity },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];

export function TopNav({
  view,
  setView,
  theme,
  toggleTheme,
  riskTolerance,
  setRiskTolerance,
  liveData,
  setLiveData,
}: {
  view: ViewKey;
  setView: (v: ViewKey) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  riskTolerance: number;
  setRiskTolerance: (n: number) => void;
  liveData: boolean;
  setLiveData: (b: boolean) => void;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 glass-strong border-b border-border">
        <div className="mx-auto grid max-w-[1600px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setView("landing")}
            className="flex min-w-0 items-center gap-2.5"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-quantum text-primary-foreground">
              <Atom className="size-5" />
            </span>
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block truncate text-sm font-semibold tracking-tight">
                Vanguard Quantum
              </span>
              <span className="block truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Portfolio Intelligence
              </span>
            </span>
          </button>

          <nav className="hidden min-w-0 justify-center gap-1 lg:flex">
            {NAV.map((n) => (
              <button
                key={n.key}
                type="button"
                onClick={() => setView(n.key)}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                  view === n.key
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {view === n.key && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <n.icon className="size-3.5" />
                  {n.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="grid size-9 place-items-center rounded-lg border border-border bg-secondary/50 text-muted-foreground transition-colors hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
              className="grid size-9 place-items-center rounded-lg border border-border bg-secondary/50 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Settings className="size-4" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Open navigation"
                className="grid size-9 place-items-center rounded-lg border border-border bg-secondary/50 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
              >
                <Menu className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Navigate</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {NAV.map((n) => (
                  <DropdownMenuItem key={n.key} onSelect={() => setView(n.key)}>
                    <n.icon className="mr-2 size-4" />
                    {n.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="glass-strong sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Platform Settings</DialogTitle>
            <DialogDescription>
              Preferences apply instantly across every module.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="theme-switch">Dark mode</Label>
              <Switch
                id="theme-switch"
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="live-switch">Live market stream</Label>
              <Switch id="live-switch" checked={liveData} onCheckedChange={setLiveData} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Risk tolerance</Label>
                <span className="num text-xs text-primary">{riskTolerance}/100</span>
              </div>
              <Slider
                value={[riskTolerance]}
                min={5}
                max={95}
                step={1}
                onValueChange={(v) => setRiskTolerance(v[0])}
              />
              <p className="text-xs text-muted-foreground">
                {riskTolerance < 35
                  ? "Capital preservation tilt — duration hedged, higher TIPS weight."
                  : riskTolerance < 65
                    ? "Balanced growth — current policy target for this mandate."
                    : "Aggressive growth — higher equity and digital asset sleeve."}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
