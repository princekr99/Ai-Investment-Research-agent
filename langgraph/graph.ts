import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentStateAnnotation } from "./state";
import { supervisorAgentNode } from "./agents/supervisor";
import { researchAgentNode } from "./agents/research";
import { financialAgentNode } from "./agents/financial";
import { newsAgentNode } from "./agents/news";
import { riskAgentNode } from "./agents/risk";
import { decisionAgentNode } from "./agents/decision";
import { InvestmentReport } from "../types";

// Conditional routing function
function routeNext(state: typeof AgentStateAnnotation.State) {
  const target = state.nextAgent;
  if (target === "research") return "research";
  if (target === "financials") return "financials_node";
  if (target === "news") return "news";
  if (target === "risk") return "risk";
  if (target === "decision") return "decision";
  return END;
}

// Assemble the workflow graph
const workflow = new StateGraph(AgentStateAnnotation)
  // Add nodes
  .addNode("supervisor", supervisorAgentNode)
  .addNode("research", researchAgentNode)
  .addNode("financials_node", financialAgentNode)
  .addNode("news", newsAgentNode)
  .addNode("risk", riskAgentNode)
  .addNode("decision", decisionAgentNode)
  
  // Set up execution paths
  .addEdge(START, "supervisor")
  
  // Supervisor decides what agent to invoke based on nextAgent state
  .addConditionalEdges("supervisor", routeNext, {
    research: "research",
    financials_node: "financials_node",
    news: "news",
    risk: "risk",
    decision: "decision",
    __end__: END
  })
  
  // Every agent loops back to the supervisor
  .addEdge("research", "supervisor")
  .addEdge("financials_node", "supervisor")
  .addEdge("news", "supervisor")
  .addEdge("risk", "supervisor")
  .addEdge("decision", "supervisor");

// Compile graph
export const graph = workflow.compile();

/**
 * Helper to run the graph and format the output report
 */
export async function runInvestmentResearch(
  companyName: string,
  ticker: string,
  financials: any
): Promise<InvestmentReport> {
  const initialState = {
    companyName,
    ticker,
    financials,
    nextAgent: "research",
  };

  console.log(`[LangGraph] Running graph for: ${companyName} (${ticker})`);
  const finalState = await graph.invoke(initialState);
  console.log(`[LangGraph] Graph run completed for: ${companyName}`);

  return {
    companyName: finalState.companyName,
    ticker: finalState.ticker,
    recommendation: finalState.recommendation || "PASS",
    confidenceScore: finalState.confidenceScore || 50,
    businessOverview: finalState.businessOverview,
    revenueModel: finalState.revenueModel,
    financialAnalysis: finalState.financialAnalysis,
    financials: finalState.financials,
    swot: finalState.swot,
    competitiveAdvantage: finalState.competitiveAdvantage,
    risks: finalState.risks,
    growthPotential: finalState.growthPotential,
    newsSentiment: finalState.newsSentiment || {
      overall: "neutral",
      score: 50,
      summary: "",
      articles: [],
    },
    aiSummary: finalState.aiSummary,
    investmentThesis: finalState.investmentThesis,
    timestamp: new Date().toISOString(),
  };
}
