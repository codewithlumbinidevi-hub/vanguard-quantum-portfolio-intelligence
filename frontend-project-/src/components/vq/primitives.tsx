import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn("glass rounded-2xl p-5", className)}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({
  icon,
  title,
  subtitle,
  right,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {icon ? (
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-primary">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold tracking-tight">{title}</h2>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Delta({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const positive = value >= 0;
  return (
    <span
      className={cn(
        "num text-xs font-semibold",
        positive ? "text-emerald" : "text-danger",
      )}
    >
      {positive ? "+" : ""}
      {value.toFixed(2)}
      {suffix}
    </span>
  );
}

export function Chip({
  active,
  children,
  onClick,
  tone = "default",
}: {
  active?: boolean;
  children: ReactNode;
  onClick: () => void;
  tone?: "default" | "gold";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
        active
          ? tone === "gold"
            ? "border-transparent bg-gradient-gold text-background"
            : "border-transparent bg-gradient-quantum text-primary-foreground glow-quantum"
          : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function QuantumField() {
  const nodes = Array.from({ length: 26 }, (_, i) => ({
    id: i,
    x: (i * 37) % 100,
    y: (i * 61) % 100,
    d: 3 + (i % 7),
    s: 2 + (i % 4),
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 55% at 20% 10%, oklch(0.62 0.22 285 / 28%), transparent 70%), radial-gradient(50% 50% at 85% 20%, oklch(0.68 0.16 240 / 22%), transparent 70%), radial-gradient(45% 45% at 60% 90%, oklch(0.79 0.13 87 / 12%), transparent 70%)",
        }}
      />
      <svg className="absolute inset-0 size-full opacity-30" aria-hidden="true">
        {nodes.map((n, i) =>
          i % 3 === 0 && nodes[i + 1] ? (
            <line
              key={`l-${n.id}`}
              x1={`${n.x}%`}
              y1={`${n.y}%`}
              x2={`${nodes[i + 1].x}%`}
              y2={`${nodes[i + 1].y}%`}
              stroke="var(--quantum)"
              strokeWidth="0.5"
            />
          ) : null,
        )}
      </svg>
      {nodes.map((n) => (
        <motion.span
          key={n.id}
          className="absolute rounded-full bg-primary"
          style={{ left: `${n.x}%`, top: `${n.y}%`, width: n.s, height: n.s }}
          animate={{ opacity: [0.15, 0.9, 0.15], y: [0, -18, 0] }}
          transition={{ duration: n.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export function LoadingState({ message = "Fetching live backend data..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-xs text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
}

export function ErrorState({
  title = "Backend Connection Failed",
  message = "Could not connect to Flask API server at http://127.0.0.1:5000/api",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-danger/40 bg-danger/10 p-8 text-center">
      <div className="grid size-10 place-items-center rounded-full bg-danger/20 text-danger font-bold text-base">
        !
      </div>
      <div>
        <h3 className="text-sm font-semibold text-danger">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-md">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-xl border border-danger/40 bg-secondary/80 px-4 py-2 text-xs font-semibold hover:bg-secondary"
        >
          Retry Connection
        </button>
      )}
    </div>
  );
}

