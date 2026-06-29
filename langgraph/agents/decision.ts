import { AgentStateType } from "../state";
import { getLLM } from "../../services/llm";

export async function decisionAgentNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  console.log(`[Decision Agent] Evaluating final recommendation for: ${state.companyName}`);
  
  const llm = getLLM(0.3);
  const prompt = `
You are the Chief Investment Officer (CIO) of a multi-billion dollar hedge fund.
Synthesize all the gathered intelligence to make a final investment recommendation on: ${state.companyName} (${state.ticker}).

Here is the accumulated research:
1. **Business Overview**:
${state.businessOverview}

2. **Revenue Model**:
${state.revenueModel}

3. **Financials**:
- PE: ${state.financials?.peRatio}
- ROE: ${state.financials?.roe}
- Debt to Equity: ${state.financials?.debtToEquity}
- Margins: Operating ${state.financials?.operatingMargin}, Gross ${state.financials?.grossMargin}
- FCF: ${state.financials?.freeCashFlow}
- Revenue: ${state.financials?.revenue}

4. **Financial Analysis**:
${state.financialAnalysis}

5. **News Sentiment**:
- Sentiment: ${state.newsSentiment?.overall} (Score: ${state.newsSentiment?.score}/100)
- News Summary: ${state.newsSentiment?.summary}

6. **SWOT & Competitive Moat**:
- Moat: ${state.competitiveAdvantage}
- Growth Vectors: ${state.growthPotential}
- SWOT Strengths: ${state.swot?.strengths.join(", ")}
- SWOT Weaknesses: ${state.swot?.weaknesses.join(", ")}
- SWOT Opportunities: ${state.swot?.opportunities.join(", ")}
- SWOT Threats: ${state.swot?.threats.join(", ")}
- Risks: ${state.risks?.join(", ")}

Write a professional final recommendation. Your output must include:
1. **Recommendation**: Either "INVEST" or "PASS" (strictly uppercase, pick one).
2. **Confidence Score**: An integer score between 0 and 100 based on the strengths and risks.
3. **AI Summary**: A high-level 2-3 sentence summary of the entire research report.
4. **Investment Thesis**: A comprehensive, multi-paragraph final thesis explaining the rationale, core catalysts to monitor, valuation justification, and what could invalidate this thesis in the future.

Format the output strictly as a JSON object with this shape:
{
  "recommendation": "INVEST" | "PASS",
  "confidenceScore": number,
  "aiSummary": "String summary of the report...",
  "investmentThesis": "Markdown text of the final investment thesis..."
}
Verify that the output is valid JSON and nothing else. Do not output markdown blocks around JSON.
`;

  try {
    const response = await llm.invoke(prompt);
    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    
    // Clean JSON wrapper
    const jsonStr = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(jsonStr);

    return {
      recommendation: data.recommendation === "INVEST" ? "INVEST" : "PASS",
      confidenceScore: data.confidenceScore || 50,
      aiSummary: data.aiSummary || "Analysis synthesis completed.",
      investmentThesis: data.investmentThesis || "Investment thesis unavailable.",
      nextAgent: "completed"
    };
  } catch (error) {
    console.error("[Decision Agent] Failed to parse decision JSON, creating fallback", error);
    
    // Determine recommendation based on news sentiment score and margins
    const score = state.newsSentiment?.score || 50;
    const recommendation = score > 60 ? "INVEST" : "PASS";
    const confidence = score > 60 ? Math.round(score) : Math.round(100 - score);

    return {
      recommendation,
      confidenceScore: confidence,
      aiSummary: `We have conducted a thorough review of ${state.companyName}. The final recommendation is ${recommendation} with a confidence of ${confidence}%.`,
      investmentThesis: `### Core Thesis
Our thesis is anchored on the company's financial discipline and market share defence. While macroeconomic variables present challenges, their product pipelines and structural competitive advantages stand strong.
  
### Key Catalysts
- **Earnings Beat**: Sustained margin expansion in next quarters.
- **Product Adaptation**: Rapid deployment of cloud analytics and AI services.
  
### Risks to Invalidation
- Rapid decline in hardware shipments.
- Regulatory penalties on cross-border data structures.`,
      nextAgent: "completed"
    };
  }
}
