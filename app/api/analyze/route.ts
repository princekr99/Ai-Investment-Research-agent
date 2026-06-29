import { NextRequest } from "next/server";
import { resolveTickerAndData } from "@/services/finance";
import { graph } from "@/langgraph/graph";

// Force dynamic execution for API routes that fetch live data
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const { companyName } = await req.json();
    if (!companyName) {
      return new Response(JSON.stringify({ error: "Company name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const sendProgress = (step: string, message: string) => {
          controller.enqueue(
            encoder.encode(`event: progress\ndata: ${JSON.stringify({ step, message })}\n\n`)
          );
        };

        const sendError = (errorMsg: string) => {
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify({ error: errorMsg })}\n\n`)
          );
          controller.close();
        };

        try {
          // Step 1: Resolving ticker and getting financial numbers
          sendProgress("initialize", `Resolving ticker and fetching initial quote for "${companyName}"...`);
          
          const { ticker, companyName: resolvedName, financials } = await resolveTickerAndData(companyName);
          
          sendProgress("initialize", `Resolved to ${ticker} (${resolvedName}). Bootstrapping LangGraph agents...`);

          // Step 2: Stream graph execution
          const graphStream = await graph.stream({
            companyName: resolvedName,
            ticker,
            financials,
            nextAgent: "research",
          });

          let accumulatedState: any = {
            companyName: resolvedName,
            ticker,
            financials,
          };

          for await (const chunk of graphStream) {
            // chunk is an object like { research: { businessOverview: "...", ... } }
            const activeNode = Object.keys(chunk)[0];
            const nodeData = (chunk as any)[activeNode];
            
            // Merge states
            accumulatedState = { ...accumulatedState, ...nodeData };

            // Send corresponding user-friendly progress message
            if (activeNode === "supervisor") {
              // Supervisor check
              const next = nodeData.nextAgent;
              if (next === "research") {
                sendProgress("research", "Supervisor delegating to Research Agent: Analyzing business model...");
              } else if (next === "financials") {
                sendProgress("financials", "Supervisor delegating to Financial Agent: Calculating valuation and ratios...");
              } else if (next === "news") {
                sendProgress("news", "Supervisor delegating to News Agent: Scraping articles & computing market sentiment...");
              } else if (next === "risk") {
                sendProgress("risk", "Supervisor delegating to Risk Agent: Compiling SWOT and identifying market risks...");
              } else if (next === "decision") {
                sendProgress("decision", "Supervisor delegating to Decision Agent: Synthesizing final investment thesis...");
              }
            } else if (activeNode === "research") {
              sendProgress("research", "Research Agent complete: Extracted business overview and revenue model.");
            } else if (activeNode === "financials_node") {
              sendProgress("financials", "Financial Agent complete: Analyzed operational margins and capital structures.");
            } else if (activeNode === "news") {
              sendProgress("news", "News Agent complete: Calculated sentiment score and compiled top articles.");
            } else if (activeNode === "risk") {
              sendProgress("risk", "Risk Agent complete: Assembled SWOT matrix and threat profiles.");
            } else if (activeNode === "decision") {
              sendProgress("decision", "Decision Agent complete: Formulated recommendation and confidence score.");
            }
          }

          // Step 3: Finalize report object
          const finalReport = {
            companyName: accumulatedState.companyName,
            ticker: accumulatedState.ticker,
            recommendation: accumulatedState.recommendation || "PASS",
            confidenceScore: accumulatedState.confidenceScore || 50,
            businessOverview: accumulatedState.businessOverview,
            revenueModel: accumulatedState.revenueModel,
            financialAnalysis: accumulatedState.financialAnalysis,
            financials: accumulatedState.financials,
            swot: accumulatedState.swot,
            competitiveAdvantage: accumulatedState.competitiveAdvantage,
            risks: accumulatedState.risks,
            growthPotential: accumulatedState.growthPotential,
            newsSentiment: accumulatedState.newsSentiment || {
              overall: "neutral",
              score: 50,
              summary: "",
              articles: [],
            },
            aiSummary: accumulatedState.aiSummary,
            investmentThesis: accumulatedState.investmentThesis,
            timestamp: new Date().toISOString(),
          };

          // Send the final result event
          controller.enqueue(
            encoder.encode(`event: result\ndata: ${JSON.stringify(finalReport)}\n\n`)
          );
          controller.close();

        } catch (err: any) {
          console.error("Stream Error:", err);
          sendError(err.message || "Failed during graph execution.");
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("API Server Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
