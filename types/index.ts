export interface CompanyFinancials {
  marketCap: string;
  peRatio: string;
  eps: string;
  roe: string;
  debtToEquity: string;
  freeCashFlow: string;
  revenue: string;
  operatingMargin: string;
  grossMargin: string;
  dividendYield: string;
  fiftyTwoWeekHigh: string;
  fiftyTwoWeekLow: string;
}

export interface NewsArticle {
  title: string;
  source: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  snippet: string;
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface InvestmentReport {
  companyName: string;
  ticker: string;
  recommendation: 'INVEST' | 'PASS';
  confidenceScore: number;
  businessOverview: string;
  revenueModel: string;
  financialAnalysis: string;
  financials: CompanyFinancials;
  swot: SWOT;
  competitiveAdvantage: string;
  risks: string[];
  growthPotential: string;
  newsSentiment: {
    overall: 'bullish' | 'bearish' | 'neutral';
    score: number; // 0 to 100
    summary: string;
    articles: NewsArticle[];
  };
  aiSummary: string;
  investmentThesis: string;
  timestamp: string;
}

export interface SearchResult {
  title: string;
  url: string;
  content: string;
}

export interface AgentProgress {
  step: 'research' | 'financials' | 'news' | 'risk' | 'decision' | 'completed' | 'idle';
  message: string;
}
