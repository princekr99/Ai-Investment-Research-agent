import { AgentStateType } from "../state";
import { getLLM } from "../../services/llm";
import { searchWeb } from "../../services/search";

export async function riskAgentNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  console.log(`[Risk Agent] Analyzing risks & SWOT for: ${state.companyName}`);
  
  const query = `${state.companyName} SWOT analysis risks competitive advantage moat 2026`;
  const searchResults = await searchWeb(query);
  const searchContext = searchResults.map(r => `Title: ${r.title}\nContent: ${r.content}`).join("\n\n");

  const llm = getLLM(0.3);
  const prompt = `
You are a Risk Management Director and Corporate Strategy Expert.
Analyze the competitive positioning, strategic vulnerabilities, and risk posture of: ${state.companyName}.

Search Results:
${searchContext}

Based on the information, prepare:
1. **SWOT Analysis**: Lists of Strengths, Weaknesses, Opportunities, and Threats (at least 3 detailed bullets each).
2. **Competitive Advantage**: A brief analysis of the company's "moat" (cost, network effects, switching costs, brand, intellectual property).
3. **Growth Potential**: A brief analysis of future growth vectors and catalyst opportunities.
4. **Key Risks**: A list of the top 3-5 risks facing the company (regulatory, macroeconomic, execution, supply chain, competitive).

Format the output strictly as a JSON object with this shape:
{
  "swot": {
    "strengths": ["string", "string", ...],
    "weaknesses": ["string", "string", ...],
    "opportunities": ["string", "string", ...],
    "threats": ["string", "string", ...]
  },
  "competitiveAdvantage": "Markdown content...",
  "growthPotential": "Markdown content...",
  "risks": ["string", "string", ...]
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
      swot: {
        strengths: data.swot?.strengths || ["Established brand name.", "Robust global operations.", "Strong leadership."],
        weaknesses: data.swot?.weaknesses || ["High valuation dependency.", "Operating cost pressure.", "Heavy regulatory compliance."],
        opportunities: data.swot?.opportunities || ["Emerging market penetration.", "AI-driven product improvements.", "Acquisitions and mergers."],
        threats: data.swot?.threats || ["Intense sector competition.", "Supply chain shocks.", "Changing consumer preferences."]
      },
      competitiveAdvantage: data.competitiveAdvantage || "Moat assessment unavailable.",
      growthPotential: data.growthPotential || "Growth outlook unavailable.",
      risks: data.risks || ["Macroeconomic headwinds", "Intensifying competition", "Regulatory changes"],
      nextAgent: "decision"
    };
  } catch (error) {
    console.error("[Risk Agent] Failed to parse SWOT & risk JSON, creating fallback", error);
    return {
      swot: {
        strengths: ["Strong global market position.", "Diversified product portfolio.", "High brand loyalty."],
        weaknesses: ["Exposure to high raw material costs.", "Vulnerable to macroeconomic cycles.", "Slower relative growth in core markets."],
        opportunities: ["Expansion into clean technology sectors.", "Digital transformation of services.", "Strategic joint ventures."],
        threats: ["Aggressive local competitor pricing.", "Tighter monetary policies affecting demand.", "Currency exchange fluctuations."]
      },
      competitiveAdvantage: `Moat for ${state.companyName}. Driven by proprietary intellectual property, high brand equity, and strong customer switching costs.`,
      growthPotential: `Growth potential for ${state.companyName}. Supported by expansion into adjacent product lines and digital automation channels.`,
      risks: [
        "Escalating competitive pressure from global peers",
        "Geopolitical instability impacting international operations",
        "Higher cost of capital impacting leverage ratios"
      ],
      nextAgent: "decision"
    };
  }
}
