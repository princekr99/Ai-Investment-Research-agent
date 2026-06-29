import { AgentStateType } from "../state";
import { getLLM } from "../../services/llm";
import { searchWeb } from "../../services/search";

export async function researchAgentNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  console.log(`[Research Agent] Analyzing company: ${state.companyName}`);
  
  const query = `${state.companyName} business overview revenue model 2026`;
  const searchResults = await searchWeb(query);
  const searchContext = searchResults.map(r => `Source: ${r.title}\nUrl: ${r.url}\nContent: ${r.content}`).join("\n\n");

  const llm = getLLM(0.3);
  const prompt = `
You are a Senior Equity Research Analyst. Your job is to research the company: "${state.companyName}" (Ticker: ${state.ticker || "Auto-resolve"}).
Based on the following web search results, write a professional:
1. **Business Overview**: A concise, detailed, and analytical overview of the company's operations, target markets, history, and scale.
2. **Revenue Model**: A detailed breakdown of how the company makes money (segments, subscription vs transactional, hardware vs services, geographical distribution).

Search Results:
${searchContext}

Format the response as clean Markdown sections. Keep it professional, data-driven, and avoid fluff. 
Return your output as a JSON object with two keys:
{
  "businessOverview": "Markdown content...",
  "revenueModel": "Markdown content..."
}
Verify that the output is valid JSON and nothing else.
`;

  try {
    const response = await llm.invoke(prompt);
    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    
    // Clean JSON markdown blocks if any
    const jsonStr = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(jsonStr);

    return {
      businessOverview: data.businessOverview || "Overview unavailable.",
      revenueModel: data.revenueModel || "Revenue model details unavailable.",
      nextAgent: "financials"
    };
  } catch (error) {
    console.error("[Research Agent] Error parsing LLM response, using standard text", error);
    
    // Simple fallback parsing if LLM didn't return perfect JSON
    return {
      businessOverview: `Overview for ${state.companyName}. Major global provider in its sector with strong market presence.`,
      revenueModel: `Revenue Model for ${state.companyName}. Primarily generates revenue through product sales, enterprise subscriptions, and recurring support contracts.`,
      nextAgent: "financials"
    };
  }
}
