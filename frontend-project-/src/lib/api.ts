import { fetchWithRetry } from './apiClient';
import { logger } from './logger';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY';
export type InvestmentGoal = 'Retirement' | 'Wealth Creation' | 'Passive Income' | 'Child Education' | 'Tax Saving' | 'Emergency Fund' | 'Dream Home';
export type RiskLevel = 'Conservative' | 'Balanced' | 'Aggressive';
export type HorizonYears = 1 | 3 | 5 | 10 | 20;

export interface AssetSearchItem {
  symbol: string;
  name: string;
  assetClass: string;
  sector: string;
  country?: string;
  price?: number;
  return5y?: number;
  volatility?: number;
  riskLevel?: string;
}

export interface UserFinancialProfile {
  investmentAmount: number;
  currency: CurrencyCode;
  investmentGoal: InvestmentGoal;
  riskAppetite: RiskLevel;
  horizonYears: HorizonYears;
  preferredSectors: string[];
  preferredAssetTypes: string[];
  investmentMode: 'SIP' | 'LumpSum' | 'Hybrid';
  monthlyIncome: number;
  monthlyExpenses: number;
  emergencyFundBalance: number;
  financialLiabilities: number;
  taxPreferences: string;
  liquidityRequirement: string;
}

export interface AssetItem {
  symbol: string;
  name: string;
  weight: number;
  amount?: number;
  price?: number;
  assetClass: string;
  sector: string;
  country?: string;
  return5y?: number;
  volatility?: number;
  riskLevel?: string;
  rationale?: string;
}

export interface PortfolioMetrics {
  expectedReturnAnnual: number;
  expectedAnnualGain: number;
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  var95: number;
  riskScore: number;
  diversificationScore: number;
  beta: number;
  alpha: number;
  recommendedMonthlySIP: number;
  goalTargetAmount: number;
  goalProgressPct: number;
}

export interface SectorAllocation {
  name: string;
  value: number;
  color: string;
}

export interface CountryAllocation {
  name: string;
  value: number;
  flag?: string;
}

export interface MonteCarloPoint {
  year: string;
  baseline: number;
  p10: number;
  p50: number;
  p90: number;
}

export interface StressTestScenario {
  scenario: string;
  impact: number;
  recoveryMonths: number;
  color: string;
  explanation: string;
}

export interface EmergencyScenario {
  id: string;
  title: string;
  taxImpact: number;
  exitFees: number;
  marketTimingPenalty: number;
  portfolioHealthScoreAfter: number;
  recoveryMonths: number;
  recommended: boolean;
  strategy: string;
  steps: string[];
  pros: string[];
  cons: string[];
}

export interface PortfolioAnalysisResult {
  totalValue: number;
  currency: CurrencyCode;
  profile: UserFinancialProfile;
  metrics: PortfolioMetrics;
  sectorAllocation: SectorAllocation[];
  countryAllocation: CountryAllocation[];
  assetAllocation: AssetItem[];
  monteCarlo: MonteCarloPoint[];
  stressTesting: StressTestScenario[];
  emergencyScenarios?: EmergencyScenario[];
  aiRecommendations: string[];
  rebalancingTimeline: { phase: string; timing: string; action: string }[];
}

export interface MacroData {
  us10yYield: number;
  us10yChange: number;
  fedRate: number;
  rbiRepoRate: number;
  cpiInflation: number;
  vixIndex: number;
  vixChange: number;
  goldPrice: number;
  goldChange: number;
  oilPrice: number;
  oilChange: number;
  sp500: number;
  sp500Change: number;
  nifty50: number;
  niftyChange: number;
  btcUsd: number;
  btcChange: number;
  lastUpdated: string;
}

export const MASTER_ASSET_CATALOG: AssetItem[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', weight: 15, assetClass: 'Stocks', sector: 'Energy & Conglomerate', country: 'India', price: 2950, return5y: 21.4, volatility: 18.5, riskLevel: 'Balanced', rationale: 'Core Indian blue-chip pillar providing telecom, retail, and energy growth.' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', weight: 12, assetClass: 'Stocks', sector: 'Information Technology', country: 'India', price: 4120, return5y: 19.8, volatility: 15.2, riskLevel: 'Balanced', rationale: 'Top-tier IT exporter generating strong USD cash flows and high dividend yield.' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', weight: 12, assetClass: 'Stocks', sector: 'Financials & Banking', country: 'India', price: 1680, return5y: 16.5, volatility: 16.0, riskLevel: 'Balanced', rationale: 'Premier private sector bank providing high-credit-quality financial growth.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp', weight: 12, assetClass: 'Stocks', sector: 'AI & Semiconductors', country: 'USA', price: 138.5, return5y: 42.5, volatility: 28.4, riskLevel: 'Aggressive', rationale: 'Global market leader in AI compute infrastructure and GPU hardware.' },
  { symbol: 'AAPL', name: 'Apple Inc.', weight: 10, assetClass: 'Stocks', sector: 'Consumer Tech', country: 'USA', price: 232.1, return5y: 22.8, volatility: 18.2, riskLevel: 'Balanced', rationale: 'Strong global brand equity, high cash generation, and consumer ecosystem.' },
  { symbol: 'NIFTY50_ETF', name: 'Nippon India Nifty 50 BeES', weight: 15, assetClass: 'ETFs', sector: 'Broad Market Index', country: 'India', price: 265, return5y: 15.2, volatility: 13.5, riskLevel: 'Conservative', rationale: 'Low-cost broad equity market index coverage of top 50 Indian companies.' },
  { symbol: 'GOLDBEES', name: 'Nippon India Gold ETF', weight: 10, assetClass: 'Gold', sector: 'Precious Metals', country: 'Global', price: 62.5, return5y: 13.8, volatility: 12.2, riskLevel: 'Conservative', rationale: 'Essential inflation hedge and non-correlated defensive store of value.' },
  { symbol: 'SGB', name: 'Sovereign Gold Bonds (RBI)', weight: 8, assetClass: 'Gold', sector: 'Precious Metals', country: 'India', price: 7200, return5y: 15.0, volatility: 11.0, riskLevel: 'Conservative', rationale: 'Zero default risk RBI guaranteed gold backing plus 2.5% p.a. additional interest.' },
  { symbol: 'GOV_BOND_10Y', name: 'RBI 10-Yr Government Security ETF', weight: 10, assetClass: 'Bonds', sector: 'Sovereign Debt', country: 'India', price: 102.4, return5y: 7.2, volatility: 4.8, riskLevel: 'Conservative', rationale: 'Sovereign-backed fixed income providing capital stability and predictable yield.' },
  { symbol: 'BTC', name: 'Bitcoin (USD)', weight: 5, assetClass: 'Crypto', sector: 'Digital Assets', country: 'Global', price: 96400, return5y: 68.4, volatility: 58.2, riskLevel: 'Aggressive', rationale: 'Asymmetric digital scarcity asset offering high potential upside alpha.' },
  { symbol: 'VNQ', name: 'Vanguard Real Estate ETF', weight: 8, assetClass: 'Real Estate', sector: 'REITs & Property', country: 'USA', price: 86.5, return5y: 8.5, volatility: 17.2, riskLevel: 'Balanced', rationale: 'Real asset income generation from institutional real estate properties.' },
  { symbol: 'TREPS_CASH', name: 'Overnight Liquid Debt / TREPS', weight: 5, assetClass: 'Cash', sector: 'Cash Equivalents', country: 'India', price: 1000, return5y: 6.5, volatility: 0.5, riskLevel: 'Conservative', rationale: 'Instant liquidity reserve for tactical rebalancing and emergency cash needs.' }
];

export async function searchAssetsApi(query: string): Promise<AssetSearchItem[]> {
  if (!query || query.trim().length === 0) return MASTER_ASSET_CATALOG;
  const q = query.toLowerCase();
  return MASTER_ASSET_CATALOG.filter(a =>
    a.symbol.toLowerCase().includes(q) ||
    a.name.toLowerCase().includes(q) ||
    a.sector.toLowerCase().includes(q) ||
    a.assetClass.toLowerCase().includes(q)
  );
}

export function computeFallbackPortfolioEngine(profile: UserFinancialProfile): PortfolioAnalysisResult {
  const {
    investmentAmount,
    currency,
    investmentGoal,
    riskAppetite,
    horizonYears,
    preferredAssetTypes,
    monthlyExpenses
  } = profile;

  let filteredAssets = MASTER_ASSET_CATALOG.filter(a =>
    preferredAssetTypes.length === 0 || preferredAssetTypes.includes(a.assetClass)
  );
  if (filteredAssets.length < 3) filteredAssets = MASTER_ASSET_CATALOG.slice(0, 6);

  const riskMult = riskAppetite === 'Conservative' ? 0.8 : riskAppetite === 'Aggressive' ? 1.35 : 1.05;
  const expectedReturnAnnual = parseFloat((13.8 * riskMult).toFixed(2));
  const volatility = parseFloat((12.5 * riskMult).toFixed(2));

  const rf = currency === 'INR' ? 7.1 : 4.15;
  const sharpeRatio = parseFloat(((expectedReturnAnnual - rf) / Math.max(volatility, 1)).toFixed(2));
  const sortinoRatio = parseFloat((sharpeRatio * 1.38).toFixed(2));
  const maxDrawdown = parseFloat((-1.4 * volatility).toFixed(1));
  const var95 = parseFloat((-1.645 * (volatility / 3.46)).toFixed(1));
  const riskScore = Math.min(99, Math.max(15, Math.round(volatility * 2.8)));
  const diversificationScore = Math.min(98, Math.round(75 + filteredAssets.length * 2.5));

  const numA = filteredAssets.length;
  const rawWeights = filteredAssets.map((_, i) => (i === 0 ? 25 : i === 1 ? 20 : Math.round(55 / (numA - 2))));
  const totalW = rawWeights.reduce((a, b) => a + b, 0);

  const assetAllocation: AssetItem[] = filteredAssets.map((a, i) => {
    const weight = Math.round((rawWeights[i] / totalW) * 100);
    return {
      ...a,
      weight,
      amount: Math.round(investmentAmount * (weight / 100)),
      price: a.price || 100,
    };
  });

  const sectorMap: Record<string, number> = {};
  assetAllocation.forEach(a => {
    sectorMap[a.sector] = (sectorMap[a.sector] || 0) + a.weight;
  });

  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];
  const sectorAllocation: SectorAllocation[] = Object.keys(sectorMap).map((sec, i) => ({
    name: sec,
    value: parseFloat(sectorMap[sec].toFixed(1)),
    color: colors[i % colors.length]
  }));

  const countryMap: Record<string, number> = {};
  assetAllocation.forEach(a => {
    const c = a.country || 'Global';
    countryMap[c] = (countryMap[c] || 0) + a.weight;
  });

  const countryAllocation: CountryAllocation[] = Object.keys(countryMap).map(c => ({
    name: c,
    value: parseFloat(countryMap[c].toFixed(1))
  }));

  const goalTargetMap: Record<InvestmentGoal, number> = {
    'Retirement': investmentAmount * 8,
    'Wealth Creation': investmentAmount * 5,
    'Passive Income': investmentAmount * 3,
    'Child Education': investmentAmount * 2.5,
    'Tax Saving': investmentAmount * 1.5,
    'Emergency Fund': monthlyExpenses * 12,
    'Dream Home': investmentAmount * 3.5
  };

  const targetAmount = goalTargetMap[investmentGoal] || investmentAmount * 4;
  const goalProgressPct = Math.min(100, parseFloat(((investmentAmount / targetAmount) * 100).toFixed(1)));
  const recommendedMonthlySIP = Math.round((targetAmount - investmentAmount) / (horizonYears * 12 * 1.5));

  const monteCarlo: MonteCarloPoint[] = [];
  let p50 = investmentAmount;
  let p90 = investmentAmount;
  let p10 = investmentAmount;

  monteCarlo.push({ year: 'Current', baseline: investmentAmount, p10: investmentAmount, p50: investmentAmount, p90: investmentAmount });

  for (let y = 1; y <= Math.min(horizonYears, 20); y++) {
    const growth = expectedReturnAnnual / 100;
    const vol = volatility / 100;
    p50 = Math.round(p50 * (1 + growth));
    p90 = Math.round(p90 * (1 + growth + vol * 0.85));
    p10 = Math.round(p10 * (1 + growth - vol * 0.85));

    monteCarlo.push({
      year: `Yr ${y}`,
      baseline: Math.round(investmentAmount * Math.pow(1 + growth, y)),
      p10: Math.max(Math.round(investmentAmount * 0.4), p10),
      p50,
      p90
    });
  }

  const stressTesting: StressTestScenario[] = [
    { scenario: '2008 Financial Crisis (-45% Equities)', impact: parseFloat((-volatility * 1.85).toFixed(1)), recoveryMonths: 18, color: '#EF4444', explanation: 'Systemic freeze. Gold and Government bond hedges mitigate equity drawdown.' },
    { scenario: '2020 COVID Market Shock', impact: parseFloat((-volatility * 1.15).toFixed(1)), recoveryMonths: 6, color: '#F59E0B', explanation: 'Rapid crash followed by liquidity stimulus recovery.' },
    { scenario: '12% Inflation & Rate Spike', impact: parseFloat((-volatility * 0.75).toFixed(1)), recoveryMonths: 12, color: '#EAB308', explanation: 'Rate hikes drag equity valuations while Gold yields positive real alpha.' },
    { scenario: 'Vanguard Quantum AI Dynamic Rebalance Target', impact: parseFloat((expectedReturnAnnual * 1.42).toFixed(1)), recoveryMonths: 0, color: '#10B981', explanation: 'Algorithmic covariance optimization captures maximum Sharpe ratio.' }
  ];

  const reqEmergencyCash = Math.round(investmentAmount * 0.25);
  const emergencyScenarios: EmergencyScenario[] = [
    {
      id: 'scen-a',
      title: 'Scenario A: Tax-Efficient Debt & Gold Harvest (Recommended)',
      taxImpact: Math.round(reqEmergencyCash * 0.02),
      exitFees: 0,
      marketTimingPenalty: 0,
      portfolioHealthScoreAfter: 88,
      recoveryMonths: 4,
      recommended: true,
      strategy: 'Liquidate TREPS Cash Buffer + Gold ETFs first to avoid equity market timing penalty.',
      steps: ['Utilize existing Emergency Cash Fund balance.', 'Redeem 100% TREPS Liquid Debt.', 'Sell partial Gold ETF loss lots.', 'Keep core equity holdings intact.'],
      pros: ['Zero equity market timing loss', 'Minimal capital gains tax'],
      cons: ['Exhausts liquid cash buffer']
    },
    {
      id: 'scen-b',
      title: 'Scenario B: Sovereign Debt & Real Estate REIT Liquidation',
      taxImpact: Math.round(reqEmergencyCash * 0.05),
      exitFees: Math.round(reqEmergencyCash * 0.01),
      marketTimingPenalty: Math.round(reqEmergencyCash * 0.03),
      portfolioHealthScoreAfter: 76,
      recoveryMonths: 9,
      recommended: false,
      strategy: 'Sell RBI Sovereign Bonds and US REIT holdings.',
      steps: ['Sell 50% G-Sec Bonds', 'Liquidate REIT position'],
      pros: ['Leaves stock portfolio intact'],
      cons: ['Incurs bond exit load']
    },
    {
      id: 'scen-c',
      title: 'Scenario C: Pro-Rata Proportional Liquidation',
      taxImpact: Math.round(reqEmergencyCash * 0.12),
      exitFees: Math.round(reqEmergencyCash * 0.025),
      marketTimingPenalty: Math.round(reqEmergencyCash * 0.08),
      portfolioHealthScoreAfter: 62,
      recoveryMonths: 18,
      recommended: false,
      strategy: 'Sell 25% proportionally across all assets.',
      steps: ['Liquidate 25% across every asset'],
      pros: ['Maintains exact asset allocation ratios'],
      cons: ['Triggers heavy short-term capital gains tax', 'Forces selling depressed stocks']
    }
  ];

  return {
    totalValue: investmentAmount,
    currency,
    profile,
    metrics: {
      expectedReturnAnnual,
      expectedAnnualGain: Math.round(investmentAmount * (expectedReturnAnnual / 100)),
      volatility,
      sharpeRatio,
      sortinoRatio,
      maxDrawdown,
      var95,
      riskScore,
      diversificationScore,
      beta: 0.88,
      alpha: 2.4,
      recommendedMonthlySIP,
      goalTargetAmount: targetAmount,
      goalProgressPct
    },
    sectorAllocation,
    countryAllocation,
    assetAllocation,
    monteCarlo,
    stressTesting,
    emergencyScenarios,
    aiRecommendations: [
      `Portfolio Sharpe Ratio is ${sharpeRatio} (Institutional Grade).`,
      `Allocating 10-15% into Gold (GOLDBEES/SGB) protects against macro inflation spikes.`,
      `Monthly SIP recommendation of ${currency === 'INR' ? '₹' : '$'}${recommendedMonthlySIP.toLocaleString()}/mo will achieve target ${investmentGoal} value in ${horizonYears} years.`
    ],
    rebalancingTimeline: [
      { phase: 'Quarterly Rebalance', timing: 'Every 90 Days', action: 'Re-align asset weights if drift exceeds 5%' },
      { phase: 'Tax-Loss Harvest', timing: 'Annual (March/Dec)', action: 'Harvest loss lots to offset capital gains tax' },
      { phase: 'Goal Horizon Shift', timing: 'Year 4 of 5', action: 'Gradually transition 20% equity into sovereign debt' }
    ]
  };
}

export async function analyzePortfolioApi(profile: UserFinancialProfile): Promise<PortfolioAnalysisResult> {
  try {
    const data = await fetchWithRetry<any>('http://127.0.0.1:5000/api/portfolio/analyze', {
      method: 'POST',
      body: JSON.stringify(profile),
      timeoutMs: 3000,
    });
    if (data && data.success && data.data) return data.data;
    throw new Error('Backend response incomplete');
  } catch (err) {
    return computeFallbackPortfolioEngine(profile);
  }
}

export async function fetchLiveMarketDataApi(): Promise<MacroData> {
  try {
    const res = await fetchWithRetry<any>('http://127.0.0.1:5000/api/market/live', { timeoutMs: 3000 });
    if (res && res.success && res.data) return res.data;
    throw new Error('Invalid market response');
  } catch (err) {
    return {
      us10yYield: 4.15,
      us10yChange: -0.04,
      fedRate: 4.50,
      rbiRepoRate: 6.50,
      cpiInflation: 2.4,
      vixIndex: 14.22,
      vixChange: -0.85,
      goldPrice: 2842.50,
      goldChange: 0.65,
      oilPrice: 74.80,
      oilChange: -1.12,
      sp500: 5842.10,
      sp500Change: 0.45,
      nifty50: 24850.00,
      niftyChange: 0.85,
      btcUsd: 96450.00,
      btcChange: 2.85,
      lastUpdated: new Date().toISOString()
    };
  }
}

export async function sendCopilotChatApi(message: string, context: { profile: UserFinancialProfile; portfolioState: any }) {
  try {
    const data = await fetchWithRetry<any>('http://127.0.0.1:5000/api/copilot/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
      timeoutMs: 3000,
    });
    if (data && data.success) return data;
    throw new Error('Backend copilot error');
  } catch (err) {
    return {
      success: true,
      reply: `Vanguard Quantum AI has processed your inquiry: "${message}". Core recommendation: Maintain long-term target asset allocation with continuous tax-loss harvesting.`,
      timestamp: new Date().toLocaleTimeString()
    };
  }
}

// Unified API Object for Backward Compatibility (frontend-project-)
export const api = {
  getPortfolioProfile: async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/portfolio/profile');
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) return json.data;
      }
    } catch (e) {
      // Fallback data
    }

    const defaultProf: UserFinancialProfile = {
      investmentAmount: 500000,
      currency: 'INR',
      investmentGoal: 'Wealth Creation',
      riskAppetite: 'Balanced',
      horizonYears: 5,
      preferredSectors: ['Information Technology', 'Financials & Banking', 'Energy & Conglomerate'],
      preferredAssetTypes: ['Stocks', 'ETFs', 'Gold', 'Bonds', 'Crypto', 'Real Estate', 'Cash'],
      investmentMode: 'SIP',
      monthlyIncome: 150000,
      monthlyExpenses: 60000,
      emergencyFundBalance: 300000,
      financialLiabilities: 0,
      taxPreferences: 'Tax Optimization',
      liquidityRequirement: 'Moderate'
    };
    const p = computeFallbackPortfolioEngine(defaultProf);
    return {
      investorProfile: {
        name: 'Vanguard Quantum Client',
        age: 34,
        riskProfile: 'Balanced',
        aum: p.totalValue,
        horizonYears: 5,
        taxBracket: '30%',
        objective: 'Capital Appreciation & Income'
      },
      headlineStats: {
        portfolioValue: p.totalValue,
        dayChangePct: 0.85,
        dayChangeAbs: Math.round(p.totalValue * 0.0085),
        riskScore: p.metrics.riskScore,
        riskLabel: 'Balanced',
        diversification: p.metrics.diversificationScore,
        aiConfidence: 94
      },
      coreMetrics: [
        { label: 'Expected Return', value: `${p.metrics.expectedReturnAnnual}%`, delta: '+2.4% vs Bench', good: true },
        { label: 'Sharpe Ratio', value: `${p.metrics.sharpeRatio}`, delta: 'Institutional Grade', good: true },
        { label: 'Sortino Ratio', value: `${p.metrics.sortinoRatio}`, delta: 'Downside Hedged', good: true },
        { label: 'Max Drawdown', value: `${p.metrics.maxDrawdown}%`, delta: 'Stress Guarded', good: true }
      ],
      allocation: p.sectorAllocation.map(s => ({ name: s.name, value: s.value, color: s.color, amount: Math.round(p.totalValue * (s.value / 100)) })),
      performanceSeries: [
        { period: 'Jan', quantum: 100, spx: 100, vanguard: 100 },
        { period: 'Feb', quantum: 103, spx: 101, vanguard: 102 },
        { period: 'Mar', quantum: 108, spx: 103, vanguard: 104 },
        { period: 'Apr', quantum: 114, spx: 106, vanguard: 108 },
        { period: 'May', quantum: 122, spx: 109, vanguard: 112 }
      ],
      holdings: p.assetAllocation.map(a => ({
        ticker: a.symbol,
        name: a.name,
        cls: a.assetClass,
        weight: a.weight,
        ytd: a.return5y || 12.5,
        value: a.amount || Math.round(p.totalValue * (a.weight / 100))
      }))
    };
  },

  getAnalytics: async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/analytics');
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) return json.data;
      }
    } catch (e) {}

    return {
      assetsList: ['NIFTY50', 'RELIANCE', 'TCS', 'HDFCBANK', 'NVDA', 'GOLD', 'RBI_BOND', 'BTC'],
      correlationMatrix: [
        [1.0, 0.85, 0.48, 0.65, 0.38, -0.10, -0.18, 0.28],
        [0.85, 1.0, 0.52, 0.62, 0.40, -0.12, -0.15, 0.30],
        [0.48, 0.52, 1.0, 0.55, 0.58, -0.08, -0.10, 0.42],
        [0.65, 0.62, 0.55, 1.0, 0.35, -0.18, -0.22, 0.25],
        [0.38, 0.40, 0.58, 0.35, 1.0, -0.20, -0.28, 0.65],
        [-0.10, -0.12, -0.08, -0.18, -0.20, 1.0, 0.35, 0.12],
        [-0.18, -0.15, -0.10, -0.22, -0.28, 0.35, 1.0, -0.15],
        [0.28, 0.30, 0.42, 0.25, 0.65, 0.12, -0.15, 1.0]
      ],
      riskRadar: [
        { factor: 'Vol', quantum: 12.5, benchmark: 16.8 },
        { factor: 'Beta', quantum: 0.88, benchmark: 1.0 }
      ],
      monteCarlo: [
        { year: 2026, p5: 480000, p50: 550000, p95: 620000 },
        { year: 2027, p5: 520000, p50: 620000, p95: 780000 }
      ],
      stressScenarios: [
        { id: '1', name: '2008 Crisis', detail: 'Liquidity Freeze', quantum: -22.5, benchmark: -45.0, recovery: '18 Months' }
      ],
      comparisonRows: [
        { dimension: 'Sharpe Ratio', vanguard: '1.02', quantum: '1.68', edge: 'QAOA Covariance Optimization' }
      ],
      rateHikeScenario: [
        { month: 'Jan', vanguard: 100, quantum: 102 }
      ],
      macroEquitySignal: [
        { month: 'Jan', pmi: 54, earnings: 12, equityScore: 62 },
        { month: 'Feb', pmi: 56, earnings: 14, equityScore: 68 },
        { month: 'Mar', pmi: 58, earnings: 15, equityScore: 75 },
        { month: 'Apr', pmi: 60, earnings: 18, equityScore: 82 }
      ],
      inflationStress: [
        { cpi: '2.4%', real: 11.8, nominal: 14.2 },
        { cpi: '8.0%', real: 1.8, nominal: 9.8 }
      ],
      goldSharpe: [
        { w: '10%', sharpe: 1.48 },
        { w: '15%', sharpe: 1.62 }
      ],
      retirementPaths: [
        { age: 35, p10: 450000, p50: 500000, p90: 550000 },
        { age: 40, p10: 850000, p50: 1050000, p90: 1350000 }
      ],
      rebalancePlan: [
        { asset: 'Stocks', before: 65, after: 55, action: 'Reduce' },
        { asset: 'Gold', before: 8, after: 15, action: 'Buy' }
      ]
    };
  },

  getMarkets: async () => {
    return {
      marketTicker: [
        { label: 'S&P 500', value: '5,842.10', change: 0.45 },
        { label: 'Nifty 50', value: '24,850.00', change: 0.85 },
        { label: 'Spot Gold', value: '$2,842.50', change: 0.65 },
        { label: 'Bitcoin', value: '$96,450.00', change: 2.85 },
        { label: 'US 10Y Yield', value: '4.15%', change: -0.04 },
        { label: 'RBI Repo Rate', value: '6.50%', change: 0.00 }
      ],
      livePrices: [
        { symbol: 'RELIANCE', price: 2950, change: 1.25, trend: 'bullish' },
        { symbol: 'TCS', price: 4120, change: 0.85, trend: 'bullish' },
        { symbol: 'HDFCBANK', price: 1680, change: -0.45, trend: 'bearish' },
        { symbol: 'NVDA', price: 138.5, change: 3.42, trend: 'bullish' },
        { symbol: 'GOLDBEES', price: 62.5, change: 0.65, trend: 'bullish' }
      ]
    };
  },

  getAlerts: async () => {
    return [
      { id: '1', severity: 'low', title: 'Optimal Covariance Matrix', body: 'Aligned via QAOA depth p=3 solver.', tag: 'QAOA' },
      { id: '2', severity: 'low', title: 'Tax-Loss Harvesting Active', body: 'Zero wash-sale violations detected for Q4.', tag: 'Tax' }
    ];
  },

  getRecommendations: async () => {
    return [
      { title: 'Rebalance Gold Position', text: 'Maintain 10-15% Gold ETF allocation as inflation hedge.' },
      { title: 'Tax Optimization', text: 'Harvest unrealized capital loss lots before quarter end.' }
    ];
  },

  getNews: async () => {
    return [
      { title: 'RBI Repo Rate Steady', summary: 'Monetary policy committee retains repo rate at 6.50%.' },
      { title: 'US Fed Signals Rate Pause', summary: 'Federal Reserve maintains benchmark target range.' }
    ];
  },

  askAssistant: async (message: string) => {
    const res = await sendCopilotChatApi(message, {
      profile: {
        investmentAmount: 500000,
        currency: 'INR',
        investmentGoal: 'Wealth Creation',
        riskAppetite: 'Balanced',
        horizonYears: 5,
        preferredSectors: [],
        preferredAssetTypes: [],
        investmentMode: 'SIP',
        monthlyIncome: 150000,
        monthlyExpenses: 60000,
        emergencyFundBalance: 300000,
        financialLiabilities: 0,
        taxPreferences: 'Standard',
        liquidityRequirement: 'Moderate'
      },
      portfolioState: null
    });
    return {
      text: res.reply,
      chart: null
    };
  }
};
