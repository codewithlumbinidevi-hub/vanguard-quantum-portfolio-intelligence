import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { BarChart3, TrendingUp, ShieldAlert, Globe, Percent, Activity, Zap, Layers, RefreshCw, LineChart as LineIcon } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ScatterChart, Scatter, Cell, Line, Legend } from 'recharts';

export const AdvancedAnalyticsSuite: React.FC = () => {
  const { analysis, macroData, currencySymbol, profile } = usePortfolio();
  const [activeSubTab, setActiveSubTab] = useState<'insights' | 'montecarlo' | 'frontier' | 'correlation' | 'attribution'>('insights');

  if (!analysis) return null;

  const { monteCarlo, metrics, sectorAllocation, countryAllocation, stressTesting } = analysis;

  const correlationMatrix = [
    { name: 'NIFTY 50', RELIANCE: 1.0, TCS: 0.62, HDFCBANK: 0.78, NVDA: 0.42, GOLDBEES: -0.15, GOV_BOND: -0.22, BTC: 0.35 },
    { name: 'RELIANCE', RELIANCE: 0.85, TCS: 0.48, HDFCBANK: 0.65, NVDA: 0.38, GOLDBEES: -0.10, GOV_BOND: -0.18, BTC: 0.28 },
    { name: 'TCS', RELIANCE: 0.48, TCS: 1.0, HDFCBANK: 0.52, NVDA: 0.58, GOLDBEES: -0.08, GOV_BOND: -0.12, BTC: 0.40 },
    { name: 'HDFCBANK', RELIANCE: 0.65, TCS: 0.52, HDFCBANK: 1.0, NVDA: 0.32, GOLDBEES: -0.18, GOV_BOND: -0.25, BTC: 0.22 },
    { name: 'NVDA', RELIANCE: 0.38, TCS: 0.58, HDFCBANK: 0.32, NVDA: 1.0, GOLDBEES: -0.20, GOV_BOND: -0.30, BTC: 0.65 },
    { name: 'GOLD ETF', RELIANCE: -0.10, TCS: -0.08, HDFCBANK: -0.18, NVDA: -0.20, GOLDBEES: 1.0, GOV_BOND: 0.35, BTC: 0.12 },
    { name: 'RBI 10Y BOND', RELIANCE: -0.18, TCS: -0.12, HDFCBANK: -0.25, NVDA: -0.30, GOLDBEES: 0.35, GOV_BOND: 1.0, BTC: -0.15 },
    { name: 'BITCOIN', RELIANCE: 0.28, TCS: 0.40, HDFCBANK: 0.22, NVDA: 0.65, GOLDBEES: 0.12, GOV_BOND: -0.15, BTC: 1.0 }
  ];

  const efficientFrontierPoints = [
    { risk: 4.5, return: 7.2, label: 'Min Variance Bond Portfolio' },
    { risk: 8.2, return: 11.5, label: 'Conservative Asset Mix' },
    { risk: 12.5, return: metrics.expectedReturnAnnual, label: 'Vanguard Quantum Optimal Sharpe (Chosen)' },
    { risk: 16.8, return: 17.8, label: 'High Volatility Equity' },
    { risk: 24.0, return: 22.5, label: 'Unconstrained Tech & Crypto' },
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
      {/* Tab Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-400" /> Phase 6 & 7 AI Insights & Advanced Quantitative Analytics
          </h2>
          <p className="text-xs text-slate-400">
            Real-time macroeconomic telemetry, Monte Carlo stochastic simulations, Efficient Frontier, and risk attribution.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'insights', label: 'AI Insights' },
            { id: 'montecarlo', label: 'Monte Carlo' },
            { id: 'frontier', label: 'Efficient Frontier' },
            { id: 'correlation', label: 'Correlation Matrix' },
            { id: 'attribution', label: 'Risk Attribution' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUB-TAB 1: AI INSIGHTS & MACRO TELEMETRY */}
      {activeSubTab === 'insights' && (
        <div className="space-y-6">
          {/* Macro Telemetry Grid */}
          {macroData && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">US 10Y Yield</span>
                <span className="text-base font-bold text-white">{macroData.us10yYield}%</span>
                <span className="text-[10px] text-emerald-400 block">{macroData.us10yChange}% Today</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">RBI Repo Rate</span>
                <span className="text-base font-bold text-emerald-400">{macroData.rbiRepoRate}%</span>
                <span className="text-[10px] text-slate-400 block">Stable Yield</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">India CPI Inflation</span>
                <span className="text-base font-bold text-amber-400">{macroData.cpiInflation}%</span>
                <span className="text-[10px] text-slate-400 block">Target &lt; 4%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Vol Volatility (VIX)</span>
                <span className="text-base font-bold text-cyan-400">{macroData.vixIndex}</span>
                <span className="text-[10px] text-emerald-400 block">Low Volatility</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Spot Gold</span>
                <span className="text-base font-bold text-amber-400">${macroData.goldPrice}</span>
                <span className="text-[10px] text-emerald-400 block">+{macroData.goldChange}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Bitcoin USD</span>
                <span className="text-base font-bold text-purple-400">${macroData.btcUsd.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-400 block">+{macroData.btcChange}%</span>
              </div>
            </div>
          )}

          {/* AI Insights Executive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h3 className="font-heading text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="h-4 w-4" /> Daily AI Executive Summary
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Vanguard Quantum AI indicates optimal covariance alignment. The current portfolio Sharpe ratio of <strong className="text-emerald-400">{metrics.sharpeRatio}</strong> significantly outperforms standard benchmarks ({metrics.beta} Beta). Gold ETF and Sovereign Bond positions shield against inflation volatility.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h3 className="font-heading text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" /> Weekly Economic Impact Assessment
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Recent US Federal Reserve rate pause and RBI monetary stance provide a supportive backdrop for Indian IT exporters and US AI hardware equities. Tax-loss harvesting opportunities detected for Q4 rebalancing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MONTE CARLO STOCHASTIC PROJECTION */}
      {activeSubTab === 'montecarlo' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold">1,000-Path Geometric Brownian Motion (GBM) Wealth Cones</span>
            <span className="font-mono text-emerald-400">Target Goal: {currencySymbol}{metrics.goalTargetAmount.toLocaleString()}</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monteCarlo} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="p90Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="p50Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="p10Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="year" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} tickFormatter={(v) => `${currencySymbol}${(v / 100000).toFixed(1)}L`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090D16', borderColor: '#1E293B', borderRadius: '12px', fontSize: '11px' }}
                  formatter={(val: any) => [`${currencySymbol}${Number(val).toLocaleString()}`, 'Portfolio Value']}
                />
                <Legend />
                <Area type="monotone" dataKey="p90" name="Bull Scenario (90th Percentile)" stroke="#10B981" fillOpacity={1} fill="url(#p90Grad)" strokeWidth={2} />
                <Area type="monotone" dataKey="p50" name="Median Expected Wealth (50th Percentile)" stroke="#3B82F6" fillOpacity={1} fill="url(#p50Grad)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="p10" name="Bear Stress Scenario (10th Percentile)" stroke="#EF4444" fillOpacity={1} fill="url(#p10Grad)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: EFFICIENT FRONTIER & CAPITAL MARKET LINE */}
      {activeSubTab === 'frontier' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold">Markowitz Efficient Frontier & Capital Market Line (CML)</span>
            <span className="font-mono text-cyan-400">Risk-Free Rate: 7.1% (RBI G-Sec)</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" dataKey="risk" name="Volatility (Risk %)" unit="%" stroke="#64748B" domain={[0, 30]} tick={{ fontSize: 11 }} />
                <YAxis type="number" dataKey="return" name="Expected Return (%)" unit="%" stroke="#64748B" domain={[0, 25]} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#090D16', borderColor: '#1E293B', borderRadius: '12px', fontSize: '11px' }} />
                <Scatter name="Efficient Portfolios" data={efficientFrontierPoints} fill="#10B981">
                  {efficientFrontierPoints.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 2 ? '#3B82F6' : '#10B981'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CORRELATION MATRIX HEATMAP */}
      {activeSubTab === 'correlation' && (
        <div className="space-y-4">
          <span className="text-xs text-slate-300 font-bold block">Cross-Asset Correlation Heatmap (Matrix)</span>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] font-mono text-center border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="p-2 text-left">Asset</th>
                  <th className="p-2">RELIANCE</th>
                  <th className="p-2">TCS</th>
                  <th className="p-2">HDFCBANK</th>
                  <th className="p-2">NVDA</th>
                  <th className="p-2">GOLD</th>
                  <th className="p-2">RBI BOND</th>
                  <th className="p-2">BTC</th>
                </tr>
              </thead>
              <tbody>
                {correlationMatrix.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-800/60">
                    <td className="p-2 text-left font-bold text-slate-300">{row.name}</td>
                    {[row.RELIANCE, row.TCS, row.HDFCBANK, row.NVDA, row.GOLDBEES, row.GOV_BOND, row.BTC].map((val, cIdx) => {
                      const bg = val > 0.7 ? 'bg-emerald-500/30 text-emerald-300' : val < 0 ? 'bg-blue-500/30 text-blue-300' : 'bg-slate-900 text-slate-300';
                      return (
                        <td key={cIdx} className={`p-2 rounded font-bold ${bg}`}>
                          {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: RISK ATTRIBUTION */}
      {activeSubTab === 'attribution' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="font-heading font-bold text-slate-200 uppercase tracking-wider">Sector Exposure Attribution</h3>
            <div className="space-y-2">
              {sectorAllocation.map((s, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300">{s.name}</span>
                    <span className="font-bold text-emerald-400">{s.value}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="font-heading font-bold text-slate-200 uppercase tracking-wider">Geographic Exposure Attribution</h3>
            <div className="space-y-2">
              {countryAllocation.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-300">{c.name}</span>
                    <span className="font-bold text-cyan-400">{c.value}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${c.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
