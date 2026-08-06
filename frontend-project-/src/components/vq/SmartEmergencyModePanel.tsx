import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { AlertTriangle, ShieldCheck, DollarSign, Activity, FileText, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export const SmartEmergencyModePanel: React.FC = () => {
  const { analysis, currencySymbol, profile, selectedEmergencyScenarioId, selectEmergencyScenario } = usePortfolio();
  const [requestedLiquidity, setRequestedLiquidity] = useState<number>(profile.investmentAmount * 0.25);
  const [emergencyReason, setEmergencyReason] = useState<string>('Medical Emergency / Hospitalization');

  if (!analysis || !analysis.emergencyScenarios) return null;

  const scenarios = analysis.emergencyScenarios;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-amber-900/40 bg-slate-950/80 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-900/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              Smart Emergency Liquidation Engine (Phase 5 Institutional Safeguard)
            </h2>
            <p className="text-xs text-slate-400">
              Evaluates sudden liquidity demands without panic-selling core growth equity assets. Minimizes tax drag and exit penalties.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Capital Portfolio:</span>
          <span className="font-bold text-emerald-400">{currencySymbol}{profile.investmentAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Emergency Input Controller */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-slate-900/70 p-4 rounded-xl border border-slate-800">
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Emergency Reason</label>
          <select
            value={emergencyReason}
            onChange={(e) => setEmergencyReason(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-medium focus:outline-none"
          >
            <option value="Medical Emergency / Hospitalization">Medical Emergency / Hospitalization</option>
            <option value="Job Loss / Income Disruption">Job Loss / Income Disruption</option>
            <option value="Urgent Property Down-Payment">Urgent Property Down-Payment</option>
            <option value="Family Debt Settlement">Family Debt Settlement</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">Urgently Needed Cash ({profile.currency})</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold font-mono">{currencySymbol}</span>
            <input
              type="number"
              step="50000"
              value={requestedLiquidity}
              onChange={(e) => setRequestedLiquidity(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-7 pr-3 text-white font-bold font-mono focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col justify-end">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
            ✓ Smart Engine: Evaluates tax tax-loss harvesting, gold reserves, and debt yields before touching stocks.
          </div>
        </div>
      </div>

      {/* Scenario Cards (A, B, C) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {scenarios.map((scen) => {
          const isSelected = selectedEmergencyScenarioId === scen.id;
          return (
            <div
              key={scen.id}
              onClick={() => selectEmergencyScenario(scen.id)}
              className={`p-5 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-slate-900/90 border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    scen.recommended ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {scen.recommended ? '★ Recommended' : 'Alternative Scenario'}
                  </span>

                  <span className="font-mono text-xs font-bold text-slate-300">
                    Health Score: <span className={scen.portfolioHealthScoreAfter > 80 ? 'text-emerald-400' : 'text-amber-400'}>{scen.portfolioHealthScoreAfter}/100</span>
                  </span>
                </div>

                <h3 className="font-heading text-sm font-bold text-white mb-2">{scen.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{scen.strategy}</p>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                  <div>
                    <span className="text-slate-500 block text-[9px]">Tax Drag Impact</span>
                    <span className="text-rose-400 font-bold">{currencySymbol}{scen.taxImpact.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">Market Timing Penalty</span>
                    <span className="text-amber-400 font-bold">{currencySymbol}{scen.marketTimingPenalty.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">Exit Fees</span>
                    <span className="text-slate-300 font-bold">{currencySymbol}{scen.exitFees.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">Recovery Horizon</span>
                    <span className="text-cyan-400 font-bold">{scen.recoveryMonths} Months</span>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Execution Steps:</span>
                  <ul className="space-y-1">
                    {scen.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                        <ArrowRight className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isSelected ? <CheckCircle2 className="h-4 w-4" /> : null}
                {isSelected ? 'Active Execution Plan' : 'Select Plan'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
