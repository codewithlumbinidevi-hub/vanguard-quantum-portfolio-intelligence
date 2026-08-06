import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

export interface InvestorProfile {
  name: string;
  age: number;
  riskProfile: string;
  aum: number;
  horizonYears: number;
  taxBracket: string;
  objective: string;
}

export interface HeadlineStats {
  portfolioValue: number;
  dayChangePct: number;
  dayChangeAbs: number;
  riskScore: number;
  riskLabel: string;
  diversification: number;
  aiConfidence: number;
}

export interface CoreMetric {
  label: string;
  value: string;
  delta: string;
  good: boolean;
}

export interface AllocationItem {
  name: string;
  value: number;
  color: string;
  amount: number;
}

export interface PerformancePoint {
  period: string;
  quantum: number;
  spx: number;
  vanguard: number;
}

export interface HoldingItem {
  ticker: string;
  name: string;
  cls: string;
  weight: number;
  ytd: number;
  value: number;
}

export function usePortfolioData() {
  const [data, setData] = useState<{
    investorProfile: InvestorProfile | null;
    headlineStats: HeadlineStats | null;
    coreMetrics: CoreMetric[];
    allocation: AllocationItem[];
    performanceSeries: PerformancePoint[];
    holdings: HoldingItem[];
  }>({
    investorProfile: null,
    headlineStats: null,
    coreMetrics: [],
    allocation: [],
    performanceSeries: [],
    holdings: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getPortfolioProfile();
      if (res) {
        setData({
          investorProfile: res.investorProfile || null,
          headlineStats: res.headlineStats || null,
          coreMetrics: res.coreMetrics || [],
          allocation: res.allocation || [],
          performanceSeries: res.performanceSeries || [],
          holdings: res.holdings || [],
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend server at http://127.0.0.1:5000/api');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...data, loading, error, refresh };
}

export interface RiskRadarItem {
  factor: string;
  quantum: number;
  benchmark: number;
}

export interface MonteCarloPoint {
  year: number;
  p5: number;
  p50: number;
  p95: number;
}

export interface StressScenario {
  id: string;
  name: string;
  detail: string;
  quantum: number;
  benchmark: number;
  recovery: string;
}

export interface ComparisonRow {
  dimension: string;
  vanguard: string;
  quantum: string;
  edge: string;
}

export interface RateHikePoint {
  month: string;
  vanguard: number;
  quantum: number;
}

export interface InflationStressPoint {
  cpi: string;
  real: number;
  nominal: number;
}

export interface MacroEquitySignalPoint {
  m: string;
  pmi: number;
  earnings: number;
  equityScore: number;
}

export interface GoldSharpePoint {
  w: string;
  sharpe: number;
}

export interface RetirementPathPoint {
  age: number;
  p10: number;
  p50: number;
  p90: number;
}

export interface RebalancePlanItem {
  asset: string;
  before: number;
  after: number;
  action: 'Buy' | 'Reduce' | 'Hold';
}

export function useAnalyticsData() {
  const [data, setData] = useState<{
    assetsList: string[];
    correlationMatrix: number[][];
    riskRadar: RiskRadarItem[];
    monteCarlo: MonteCarloPoint[];
    stressScenarios: StressScenario[];
    comparisonRows: ComparisonRow[];
    rateHikeScenario: RateHikePoint[];
    inflationStress: InflationStressPoint[];
    macroEquitySignal: MacroEquitySignalPoint[];
    goldSharpe: GoldSharpePoint[];
    retirementPaths: RetirementPathPoint[];
    rebalancePlan: RebalancePlanItem[];
  }>({
    assetsList: [],
    correlationMatrix: [],
    riskRadar: [],
    monteCarlo: [],
    stressScenarios: [],
    comparisonRows: [],
    rateHikeScenario: [],
    inflationStress: [],
    macroEquitySignal: [],
    goldSharpe: [],
    retirementPaths: [],
    rebalancePlan: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAnalytics();
      if (res) {
        setData({
          assetsList: res.assetsList || [],
          correlationMatrix: res.correlationMatrix || [],
          riskRadar: res.riskRadar || [],
          monteCarlo: res.monteCarlo || [],
          stressScenarios: res.stressScenarios || [],
          comparisonRows: res.comparisonRows || [],
          rateHikeScenario: res.rateHikeScenario || [],
          inflationStress: res.inflationStress || [],
          macroEquitySignal: res.macroEquitySignal || [],
          goldSharpe: res.goldSharpe || [],
          retirementPaths: res.retirementPaths || [],
          rebalancePlan: res.rebalancePlan || [],
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend server at http://127.0.0.1:5000/api');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...data, loading, error, refresh };
}

export interface MarketTickerItem {
  label: string;
  value: string;
  change: number;
}

export interface LivePriceItem {
  symbol: string;
  price: number;
  change: number;
  trend: 'bullish' | 'bearish' | 'neutral';
}

export function useMarketData() {
  const [marketTicker, setMarketTicker] = useState<MarketTickerItem[]>([]);
  const [livePrices, setLivePrices] = useState<LivePriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getMarkets();
      if (res) {
        setMarketTicker(res.marketTicker || []);
        setLivePrices((res.livePrices || []) as any);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend server at http://127.0.0.1:5000/api');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { marketTicker, livePrices, loading, error, refresh };
}

export interface RiskAlert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  body: string;
  tag: string;
}

export function useAlertsData() {
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAlerts();
      if (Array.isArray(res)) {
        setAlerts(res as any);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend server at http://127.0.0.1:5000/api');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { alerts, loading, error, refresh };
}

export interface NewsItem {
  headline: string;
  source: string;
  sentiment: string;
  timestamp: string;
}

export function useNewsData() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getNews();
      if (Array.isArray(res)) {
        setNews(res.map((item: any) => ({
          headline: item.headline || item.title || '',
          source: item.source || 'Bloomberg Terminal',
          sentiment: item.sentiment || 'Bullish',
          timestamp: item.timestamp || 'Just now',
        })));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend server at http://127.0.0.1:5000/api');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { news, loading, error, refresh };
}

export interface RecommendationsData {
  daily: Array<{ title: string; detail: string }>;
  taxAware: Array<{ title: string; detail: string }>;
}

export function useRecommendationsData() {
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getRecommendations();
      if (res) {
        setRecommendations(res as any);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend server at http://127.0.0.1:5000/api');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { recommendations, loading, error, refresh };
}
