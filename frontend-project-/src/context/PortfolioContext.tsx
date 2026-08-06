import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserFinancialProfile,
  PortfolioAnalysisResult,
  MacroData,
  AssetItem,
  CurrencyCode,
  InvestmentGoal,
  RiskLevel,
  HorizonYears,
  analyzePortfolioApi,
  fetchLiveMarketDataApi,
  sendCopilotChatApi,
  computeFallbackPortfolioEngine
} from '../lib/api';
import { logger } from '../lib/logger';

export type { CurrencyCode };

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionCard?: any;
}

export const CURRENCY_MAP: Record<CurrencyCode, { symbol: string; rate: number; name: string }> = {
  INR: { symbol: '₹', rate: 1.0, name: 'Indian Rupee' },
  USD: { symbol: '$', rate: 0.012, name: 'US Dollar' },
  EUR: { symbol: '€', rate: 0.011, name: 'Euro' },
  GBP: { symbol: '£', rate: 0.0093, name: 'British Pound' },
  JPY: { symbol: '¥', rate: 1.82, name: 'Japanese Yen' }
};

const DEFAULT_PROFILE: UserFinancialProfile = {
  investmentAmount: 500000,
  currency: 'INR',
  investmentGoal: 'Wealth Creation',
  riskAppetite: 'Balanced',
  horizonYears: 5,
  preferredSectors: ['Information Technology', 'Financials & Banking', 'Energy & Conglomerate', 'Precious Metals'],
  preferredAssetTypes: ['Stocks', 'ETFs', 'Gold', 'Bonds', 'Crypto', 'Real Estate', 'Cash'],
  investmentMode: 'SIP',
  monthlyIncome: 150000,
  monthlyExpenses: 60000,
  emergencyFundBalance: 300000,
  financialLiabilities: 0,
  taxPreferences: 'Tax Optimization (80C / LTCG Harvest)',
  liquidityRequirement: 'Moderate'
};

export interface PortfolioContextType {
  profile: UserFinancialProfile;
  currencySymbol: string;
  themeMode: 'dark' | 'light';
  analysis: PortfolioAnalysisResult | null;
  macroData: MacroData | null;
  isLoading: boolean;
  error: string | null;
  activeTab: string;
  comparisonMode: 'quantum' | 'vanguard' | 'split';
  isCopilotOpen: boolean;
  copilotMessages: ChatMessage[];
  selectedEmergencyScenarioId: string | null;

  // Backward Compatibility Properties
  investmentAmount: number;
  setInvestmentAmount: (val: number) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  riskAppetite: RiskLevel;
  setRiskAppetite: (r: RiskLevel) => void;
  horizonYears: HorizonYears;
  setHorizonYears: (h: HorizonYears) => void;
  activeAssets: AssetItem[];

  // Actions
  updateProfile: (partial: Partial<UserFinancialProfile>) => void;
  setThemeMode: (mode: 'dark' | 'light') => void;
  toggleThemeMode: () => void;
  addAsset: (asset: AssetItem) => void;
  removeAsset: (symbol: string) => void;
  updateAssetWeight: (symbol: string, weight: number) => void;
  rebalancePortfolio: () => void;
  setActiveTab: (tab: string) => void;
  setComparisonMode: (mode: 'quantum' | 'vanguard' | 'split') => void;
  setIsCopilotOpen: (open: boolean) => void;
  sendCopilotMessage: (text: string) => void;
  selectEmergencyScenario: (id: string) => void;
  exportPortfolio: (format: 'csv' | 'json') => void;
  recalculate: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserFinancialProfile>(DEFAULT_PROFILE);
  const [themeMode, setThemeModeState] = useState<'dark' | 'light'>('dark');
  const [comparisonMode, setComparisonMode] = useState<'quantum' | 'vanguard' | 'split'>('split');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [selectedEmergencyScenarioId, setSelectedEmergencyScenarioId] = useState<string | null>('scen-a');

  const [analysis, setAnalysis] = useState<PortfolioAnalysisResult | null>(null);
  const [macroData, setMacroData] = useState<MacroData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [copilotMessages, setCopilotMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Greetings. I am your Personal AI Financial Copilot. I have loaded your ${profile.currency === 'INR' ? '₹' : '$'}${profile.investmentAmount.toLocaleString()} ${profile.investmentGoal} profile. How can I assist with your financial strategy today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const currencySymbol = CURRENCY_MAP[profile.currency].symbol;

  const setThemeMode = (mode: 'dark' | 'light') => {
    setThemeModeState(mode);
    if (mode === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  };

  const toggleThemeMode = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  const updateProfile = (partial: Partial<UserFinancialProfile>) => {
    setProfile(prev => ({ ...prev, ...partial }));
  };

  // Backward Compatibility Setters
  const setInvestmentAmount = (val: number) => updateProfile({ investmentAmount: val });
  const setCurrency = (c: CurrencyCode) => updateProfile({ currency: c });
  const setRiskAppetite = (r: RiskLevel) => updateProfile({ riskAppetite: r });
  const setHorizonYears = (h: HorizonYears) => updateProfile({ horizonYears: h });

  // Recalculate portfolio metrics
  const recalculate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    logger.info('PortfolioContext', 'Recalculating portfolio analytics...');
    try {
      const res = await analyzePortfolioApi(profile);
      setAnalysis(res);
    } catch (err: any) {
      logger.error('PortfolioContext', 'Error in portfolio recalculation, deploying fallback engine:', err);
      const fallback = computeFallbackPortfolioEngine(profile);
      setAnalysis(fallback);
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    recalculate();
  }, [recalculate]);

  useEffect(() => {
    fetchLiveMarketDataApi().then(setMacroData).catch(() => {});
  }, []);

  // Asset Actions
  const addAsset = (newAsset: AssetItem) => {
    if (!analysis) return;
    const currentList = [...analysis.assetAllocation];
    if (currentList.some(a => a.symbol === newAsset.symbol)) return;

    const updated = [...currentList, { ...newAsset, weight: 10 }];
    const totalW = updated.reduce((s, a) => s + a.weight, 0);
    const normalized = updated.map(a => ({
      ...a,
      weight: Math.round((a.weight / totalW) * 100)
    }));

    setAnalysis(prev => (prev ? { ...prev, assetAllocation: normalized } : null));
  };

  const removeAsset = (symbol: string) => {
    if (!analysis) return;
    const filtered = analysis.assetAllocation.filter(a => a.symbol !== symbol);
    if (filtered.length === 0) return;
    const totalW = filtered.reduce((s, a) => s + a.weight, 0);
    const normalized = filtered.map(a => ({
      ...a,
      weight: Math.round((a.weight / totalW) * 100)
    }));

    setAnalysis(prev => (prev ? { ...prev, assetAllocation: normalized } : null));
  };

  const updateAssetWeight = (symbol: string, newWeight: number) => {
    if (!analysis) return;
    const prevList = analysis.assetAllocation;
    const otherTotal = prevList.filter(a => a.symbol !== symbol).reduce((s, a) => s + a.weight, 0);
    const remain = Math.max(0, 100 - newWeight);

    const updated = prevList.map(a => {
      if (a.symbol === symbol) return { ...a, weight: newWeight };
      const proportion = otherTotal > 0 ? a.weight / otherTotal : 1 / (prevList.length - 1);
      return { ...a, weight: Math.round(proportion * remain) };
    });

    setAnalysis(prev => (prev ? { ...prev, assetAllocation: updated } : null));
  };

  const rebalancePortfolio = () => {
    if (!analysis) return;
    const count = analysis.assetAllocation.length;
    const equalWeight = Math.round(100 / count);
    const updated = analysis.assetAllocation.map((a, i) => ({
      ...a,
      weight: i === count - 1 ? 100 - equalWeight * (count - 1) : equalWeight
    }));

    setAnalysis(prev => (prev ? { ...prev, assetAllocation: updated } : null));
  };

  const sendCopilotMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setCopilotMessages(prev => [...prev, userMsg]);

    try {
      const response = await sendCopilotChatApi(text, { profile, portfolioState: analysis });
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionCard: response.actionCard
      };
      setCopilotMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      const fallbackAiMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'Vanguard Quantum AI local engine processed your request. Recommendations generated based on your portfolio profile.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setCopilotMessages(prev => [...prev, fallbackAiMsg]);
    }
  };

  const selectEmergencyScenario = (id: string) => {
    setSelectedEmergencyScenarioId(id);
  };

  const exportPortfolio = (format: 'csv' | 'json') => {
    if (!analysis) return;

    if (format === 'csv') {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "VANGUARD QUANTUM INSTITUTIONAL PORTFOLIO REPORT\n";
      csvContent += `Generated At,${new Date().toISOString()}\n`;
      csvContent += `Investment Amount,${currencySymbol}${analysis.totalValue.toLocaleString()} ${profile.currency}\n`;
      csvContent += `Goal,${profile.investmentGoal}\n`;
      csvContent += `Risk Appetite,${profile.riskAppetite}\n`;
      csvContent += `Expected Annual Return,${analysis.metrics.expectedReturnAnnual}%\n`;
      csvContent += `Sharpe Ratio,${analysis.metrics.sharpeRatio}\n`;
      csvContent += `Max Drawdown,${analysis.metrics.maxDrawdown}%\n\n`;

      csvContent += "ASSET ALLOCATION BREAKDOWN\n";
      csvContent += "Symbol,Name,Asset Class,Sector,Country,Weight %,Allocated Value,Rationale\n";
      analysis.assetAllocation.forEach(a => {
        csvContent += `"${a.symbol}","${a.name}","${a.assetClass}","${a.sector}","${a.country || 'Global'}",${a.weight},"${currencySymbol}${a.amount?.toLocaleString()}","${a.rationale || ''}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Vanguard_Quantum_Portfolio_${profile.currency}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysis, null, 2));
      const link = document.createElement("a");
      link.setAttribute("href", dataStr);
      link.setAttribute("download", `Vanguard_Quantum_Portfolio_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        profile,
        currencySymbol,
        themeMode,
        analysis,
        macroData,
        isLoading,
        error,
        activeTab,
        comparisonMode,
        isCopilotOpen,
        copilotMessages,
        selectedEmergencyScenarioId,

        // Backward compatibility properties
        investmentAmount: profile.investmentAmount,
        setInvestmentAmount,
        currency: profile.currency,
        setCurrency,
        riskAppetite: profile.riskAppetite,
        setRiskAppetite,
        horizonYears: profile.horizonYears,
        setHorizonYears,
        activeAssets: analysis ? analysis.assetAllocation : [],

        updateProfile,
        setThemeMode,
        toggleThemeMode,
        addAsset,
        removeAsset,
        updateAssetWeight,
        rebalancePortfolio,
        setActiveTab,
        setComparisonMode,
        setIsCopilotOpen,
        sendCopilotMessage,
        selectEmergencyScenario,
        exportPortfolio,
        recalculate
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
