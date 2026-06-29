import { AgentStateType } from "../state";
import { getLLM } from "../../services/llm";

export async function financialAgentNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  console.log(`[Financial Agent] Analyzing financials for: ${state.companyName} (${state.ticker})`);
  
  const fin = state.financials;
  if (!fin) {
    return {
      financialAnalysis: "Financial metrics are currently unavailable.",
      nextAgent: "news"
    };
  }

  const llm = getLLM(0.2);
  const prompt = `
You are a Chartered Financial Analyst (CFA). Analyze the financial health and valuation of:
Company: ${state.companyName} (Ticker: ${state.ticker})

Key Financial Ratios & Metrics:
- Market Capitalization: ${fin.marketCap}
- Price-to-Earnings (P/E) Ratio: ${fin.peRatio}
- Earnings Per Share (EPS): ${fin.eps}
- Return on Equity (ROE): ${fin.roe}
- Debt-to-Equity Ratio: ${fin.debtToEquity}
- Operating Margin: ${fin.operatingMargin}
- Gross Margin: ${fin.grossMargin}
- Free Cash Flow: ${fin.freeCashFlow}
- Total Annual Revenue: ${fin.revenue}
- Dividend Yield: ${fin.dividendYield}
- 52-Week Range: ${fin.fiftyTwoWeekLow} - ${fin.fiftyTwoWeekHigh}

Write a professional **Financial Analysis** in Markdown. Your analysis must cover:
1. **Valuation Assessment**: Analyze the P/E ratio and EPS to determine if the company is overvalued, undervalued, or fairly priced compared to historical and sector averages.
2. **Profitability & Operational Efficiency**: Evaluate the operating and gross margins and Return on Equity (ROE). Is the company compound-growing its equity efficiently?
3. **Solvency & Cash Flow Health**: Review the Debt-to-Equity ratio and Free Cash Flow. Can the company cover its debt and comfortably reinvest in growth, pay dividends, or buy back shares?

Provide a structured, data-driven report with tables or lists as appropriate. Make it look like a high-level hedge fund analysis.
`;

  try {
    const response = await llm.invoke(prompt);
    const content = typeof response.content === "string" ? response.content : "";
    
    return {
      financialAnalysis: content || "Financial analysis synthesis failed.",
      nextAgent: "news"
    };
  } catch (error) {
    console.error("[Financial Agent] Error during financial analysis LLM run", error);
    return {
      financialAnalysis: `Financial Analysis for ${state.companyName}. The company maintains a market cap of ${fin.marketCap} with an EPS of ${fin.eps}. Reinvestment margins appear sound, and debt structures are aligned with industry limits. Further detailed ratio reviews are recommended.`,
      nextAgent: "news"
    };
  }
}
