import { Annotation } from "@langchain/langgraph";
import { CompanyFinancials, NewsArticle, SWOT } from "../types";

export const AgentStateAnnotation = Annotation.Root({
  companyName: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  ticker: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  financials: Annotation<CompanyFinancials>({
    reducer: (x, y) => y ?? x,
  }),
  businessOverview: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  revenueModel: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  financialAnalysis: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  swot: Annotation<SWOT>({
    reducer: (x, y) => y ?? x,
  }),
  competitiveAdvantage: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  risks: Annotation<string[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  growthPotential: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  newsSentiment: Annotation<{
    overall: 'bullish' | 'bearish' | 'neutral';
    score: number;
    summary: string;
    articles: NewsArticle[];
  }>({
    reducer: (x, y) => y ?? x,
  }),
  aiSummary: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  investmentThesis: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  recommendation: Annotation<'INVEST' | 'PASS'>({
    reducer: (x, y) => y ?? x,
    default: () => "PASS",
  }),
  confidenceScore: Annotation<number>({
    reducer: (x, y) => y ?? x,
    default: () => 50,
  }),
  nextAgent: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "research",
  }),
});

export type AgentStateType = typeof AgentStateAnnotation.State;
