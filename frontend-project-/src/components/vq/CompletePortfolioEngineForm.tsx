import React, { useState } from 'react';
import { usePortfolio, CURRENCY_MAP } from '../../context/PortfolioContext';
import { CurrencyCode, InvestmentGoal, RiskLevel, HorizonYears } from '../../lib/api';
import { Sliders, DollarSign, Target, ShieldAlert, Clock, Layers, PiggyBank, RefreshCw, CheckCircle2, Wallet, FileText } from 'lucide-react';

export const CompletePortfolioEngineForm: React.FC = () => {
  const { profile, updateProfile, currencySymbol, recalculate, isLoading } = usePortfolio();

  const goals: InvestmentGoal[] = ['Wealth Creation', 'Retirement', 'Passive Income', 'Child Education', 'Tax Saving', 'Emergency Fund', 'Dream Home'];
  const risks: RiskLevel[] = ['Conservative', 'Balanced', 'Aggressive'];
  const horizons: HorizonYears[] = [1, 3, 5, 10, 20];
  const allAssetTypes = ['Stocks', 'ETFs', 'Gold', 'Bonds', 'Crypto', 'Real Estate', 'International', 'Cash'];
  const allSectors = ['Information Technology', 'Financials & Banking', 'Energy & Conglomerate', 'Precious Metals', 'Healthcare', 'Real Estate', 'Consumer Goods'];

  const inrPresets = [
    { label: '₹50,000', value: 50000 },
    { label: '₹5 Lakhs', value: 500000 },
    { label: '₹50 Lakhs', value: 5000000 },
    { label: '₹1 Crore', value: 10000000 },
  ];

  const handleAssetTypeToggle = (type: string) => {
    const current = profile.preferredAssetTypes;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    updateProfile({ preferredAssetTypes: updated });
  };

  const handleSectorToggle = (sec: string) => {
    const current = profile.preferredSectors;
    const updated = current.includes(sec)
      ? current.filter(s => s !== sec)
      : [...current, sec];
    updateProfile({ preferredSectors: updated });
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-emerald-400" />
            <h2 className="font-heading text-lg font-bold text-white">AI Institutional Investment & Portfolio Calibration Engine</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure your capital, goal target, risk tolerance, monthly cash flows, liabilities, and asset class preferences.
          </p>
        </div>

        <button
          onClick={() => recalculate()}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 py-2.5 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 hover:opacity-90 active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Optimizing Quantum State...' : 'Generate AI Portfolio'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        {/* Left Column: Capital, Currency & Goal (4 Cols) */}
        <div className="lg:col-span-4 space-y-5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <h3 className="font-heading text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <DollarSign className="h-4 w-4 text-emerald-400" /> 1. Capital & Currency Setup
          </h3>

          {/* Capital Input */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Investment Amount ({profile.currency})</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-emerald-400 font-mono">
                {currencySymbol}
              </span>
              <input
                type="number"
                min="1000"
                step="50000"
                value={profile.investmentAmount}
                onChange={(e) => updateProfile({ investmentAmount: Math.max(1000, Number(e.target.value)) })}
                className="w-full rounded-xl bg-slate-950 border border-slate-700/80 py-2.5 pl-9 pr-3 text-base font-bold text-white focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>

            {/* Currency selector chips */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
              {(Object.keys(CURRENCY_MAP) as CurrencyCode[]).map(c => (
                <button
                  key={c}
                  onClick={() => updateProfile({ currency: c })}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                    profile.currency === c
                      ? 'bg-emerald-500 text-black'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {c} ({CURRENCY_MAP[c as CurrencyCode].symbol})
                </button>
              ))}
            </div>

            {/* INR Presets */}
            {profile.currency === 'INR' && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {inrPresets.map(p => (
                  <button
                    key={p.value}
                    onClick={() => updateProfile({ investmentAmount: p.value })}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono transition ${
                      profile.investmentAmount === p.value
                        ? 'bg-slate-700 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Investment Goal */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium flex items-center gap-1">
              <Target className="h-3.5 w-3.5 text-cyan-400" /> Primary Investment Goal
            </label>
            <select
              value={profile.investmentGoal}
              onChange={(e) => updateProfile({ investmentGoal: e.target.value as InvestmentGoal })}
              className="w-full rounded-xl bg-slate-950 border border-slate-700/80 py-2 px-3 text-xs text-white font-medium focus:border-cyan-500 focus:outline-none cursor-pointer"
            >
              {goals.map(g => (
                <option key={g} value={g} className="bg-slate-900 text-white">{g}</option>
              ))}
            </select>
          </div>

          {/* Investment Mode */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Investment Mode</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['SIP', 'LumpSum', 'Hybrid'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => updateProfile({ investmentMode: m })}
                  className={`py-1.5 rounded-lg text-[11px] font-bold transition ${
                    profile.investmentMode === m
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-md'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {m === 'SIP' ? 'Monthly SIP' : m === 'LumpSum' ? 'Lump Sum' : 'Hybrid SIP+Lump'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column: Risk, Horizon & Financial Context (4 Cols) */}
        <div className="lg:col-span-4 space-y-5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <h3 className="font-heading text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <ShieldAlert className="h-4 w-4 text-amber-400" /> 2. Risk, Horizon & Cash Flows
          </h3>

          {/* Risk Appetite */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Risk Appetite</label>
            <div className="grid grid-cols-3 gap-1.5">
              {risks.map(r => (
                <button
                  key={r}
                  onClick={() => updateProfile({ riskAppetite: r })}
                  className={`py-1.5 rounded-lg text-[11px] font-bold transition ${
                    profile.riskAppetite === r
                      ? r === 'Conservative' ? 'bg-blue-500 text-black' : r === 'Balanced' ? 'bg-amber-500 text-black' : 'bg-purple-500 text-black'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Horizon */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-cyan-400" /> Investment Horizon
            </label>
            <div className="grid grid-cols-5 gap-1 font-mono">
              {horizons.map(h => (
                <button
                  key={h}
                  onClick={() => updateProfile({ horizonYears: h })}
                  className={`py-1.5 rounded-lg text-[11px] font-bold transition ${
                    profile.horizonYears === h
                      ? 'bg-cyan-500 text-black'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {h}Y
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Income & Expenses */}
          <div className="grid grid-cols-2 gap-2 font-mono">
            <div>
              <label className="block text-slate-400 text-[10px] mb-1">Monthly Income</label>
              <input
                type="number"
                step="10000"
                value={profile.monthlyIncome}
                onChange={(e) => updateProfile({ monthlyIncome: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2 text-xs font-bold text-emerald-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] mb-1">Monthly Expenses</label>
              <input
                type="number"
                step="5000"
                value={profile.monthlyExpenses}
                onChange={(e) => updateProfile({ monthlyExpenses: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2 text-xs font-bold text-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Emergency Fund & Liabilities */}
          <div className="grid grid-cols-2 gap-2 font-mono">
            <div>
              <label className="block text-slate-400 text-[10px] mb-1">Emergency Fund</label>
              <input
                type="number"
                step="20000"
                value={profile.emergencyFundBalance}
                onChange={(e) => updateProfile({ emergencyFundBalance: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2 text-xs font-bold text-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] mb-1">Liabilities / Loans</label>
              <input
                type="number"
                step="50000"
                value={profile.financialLiabilities}
                onChange={(e) => updateProfile({ financialLiabilities: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2 text-xs font-bold text-rose-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Preferred Asset Types & Sectors (4 Cols) */}
        <div className="lg:col-span-4 space-y-5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <h3 className="font-heading text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Layers className="h-4 w-4 text-purple-400" /> 3. Asset & Sector Preferences
          </h3>

          {/* Preferred Asset Types */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Preferred Asset Classes</label>
            <div className="flex flex-wrap gap-1.5">
              {allAssetTypes.map(t => {
                const selected = profile.preferredAssetTypes.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => handleAssetTypeToggle(t)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition border ${
                      selected
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}{t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Sectors */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Target Sectors</label>
            <div className="flex flex-wrap gap-1.5">
              {allSectors.map(s => {
                const selected = profile.preferredSectors.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => handleSectorToggle(s)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition border ${
                      selected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}{s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
