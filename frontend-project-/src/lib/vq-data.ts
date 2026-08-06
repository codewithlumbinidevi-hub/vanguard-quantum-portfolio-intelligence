// Central Types and Helper Utilities for Vanguard Quantum.
// All application state and mock data have been replaced with live REST API calls.

export type ViewKey =
  | "landing"
  | "dashboard"
  | "builder"
  | "simulation"
  | "frontier"
  | "portfolio"
  | "markets"
  | "copilot"
  | "comparison"
  | "analytics";

export const fmtUsd = (n: number) =>
  typeof n === "number"
    ? n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
    : "$0";

export const fmtCurrency = (n: number, currency: string = "USD") => {
  if (typeof n !== "number" || isNaN(n)) return "$0";
  const symMap: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥"
  };
  const symbol = symMap[currency] || "$";
  return `${symbol}${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
};

