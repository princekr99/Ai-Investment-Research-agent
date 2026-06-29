import { NextRequest } from "next/server";
import { resolveTickerAndData } from "@/services/finance";
import { graph } from "@/langgraph/graph";
import { InvestmentReport } from "@/types";

export const dynamic = "force-dynamic";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    // Check if we have the required keys to run the LangGraph LLM agents
    const hasLLMKeys = !!(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY);

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
          if (!hasLLMKeys) {
            console.warn("API Route: No API keys configured. Activating Demo/Simulation Mode.");
            
            // Step 1: Resolving ticker and getting financial numbers
            sendProgress("initialize", `[DEMO MODE] Resolving ticker and fetching initial quote for "${companyName}"...`);
            await delay(1200);

            const { ticker, companyName: resolvedName, financials } = await resolveTickerAndData(companyName);
            sendProgress("initialize", `[DEMO MODE] Resolved to ${ticker} (${resolvedName}). Bootstrapping simulation...`);
            await delay(1000);

            // Step 2: Simulated Agent Execution Timeline
            sendProgress("research", "Research Agent: Analyzing business model and target markets...");
            await delay(1500);

            sendProgress("financials", "Financial Agent: Calculating operating margins and valuation ratios...");
            await delay(1500);

            sendProgress("news", "News Agent: Indexing media sentiment and stock chatter...");
            await delay(1500);

            sendProgress("risk", "Risk Agent: Formulating SWOT matrix and corporate risk profile...");
            await delay(1500);

            sendProgress("decision", "Decision Agent: CIO final thesis synthesis & recommendation...");
            await delay(1500);

            // Step 3: Deliver resolved simulated report
            const finalReport = generateDemoReport(resolvedName, ticker, financials);

            controller.enqueue(
              encoder.encode(`event: result\ndata: ${JSON.stringify(finalReport)}\n\n`)
            );
            controller.close();
            return;
          }

          // --- REAL LANGGRAPH WORKFLOW ---
          sendProgress("initialize", `Resolving ticker and fetching initial quote for "${companyName}"...`);
          const { ticker, companyName: resolvedName, financials } = await resolveTickerAndData(companyName);
          sendProgress("initialize", `Resolved to ${ticker} (${resolvedName}). Bootstrapping LangGraph agents...`);

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
            const activeNode = Object.keys(chunk)[0];
            const nodeData = (chunk as any)[activeNode];
            accumulatedState = { ...accumulatedState, ...nodeData };

            if (activeNode === "supervisor") {
              const next = nodeData.nextAgent;
              if (next === "research") {
                sendProgress("research", "Supervisor delegating to Research Agent: Analyzing business model...");
              } else if (next === "financials_node") {
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

/**
 * Generate highly detailed simulated report structures based on the target company
 */
function generateDemoReport(companyName: string, ticker: string, financials: any): InvestmentReport {
  const cleanName = companyName.toLowerCase();
  
  // Decide INVEST or PASS based on name hash (reproducible per company)
  let sum = 0;
  for (let i = 0; i < ticker.length; i++) sum += ticker.charCodeAt(i);
  const isInvest = sum % 2 === 0 || cleanName.includes("tesla") || cleanName.includes("nvidia") || cleanName.includes("apple") || cleanName.includes("microsoft");
  const confidenceScore = isInvest ? 78 + (sum % 15) : 55 + (sum % 20);

  const recommendation = isInvest ? "INVEST" : "PASS";

  return {
    companyName,
    ticker,
    recommendation,
    confidenceScore,
    timestamp: new Date().toISOString(),
    businessOverview: `
### Company Overview
**${companyName}** is a leading global enterprise operating at the forefront of technological integration in its sector. The company specializes in the design, development, and distribution of scalable solutions, serving both enterprise portfolios and retail customer networks worldwide. With a legacy of strong execution, the company has successfully expanded its total addressable market (TAM) through systematic research and development cycles.
    
### Core Value Proposition
- **Market Leadership**: Holds a dominant position in core operating segments.
- **Diversified Ecosystem**: Deep customer lock-in through overlapping product suites.
- **R&D Focus**: Sustained capital deployment towards software automation, cloud computing, and AI-enabled diagnostics.
`,
    revenueModel: `
### Revenue Breakdown
The business model of **${companyName}** is built upon highly predictable recurring cash flows supplemented by high-margin transaction segments:

1. **Enterprise Subscriptions (45% of revenue)**: Long-term software contracts and platform-as-a-service (PaaS) access, operating at an 82% gross margin.
2. **Product Sales & Hardware (35% of revenue)**: Physical solutions and system integrations sold directly through commercial channels.
3. **Professional Services & Support (20% of revenue)**: Training, consulting, and system optimization support packages, facilitating high switching costs.

### Geographical Distribution
- **North America**: 50%
- **Europe**: 30%
- **Asia Pacific & Emerging Markets**: 20%
`,
    financialAnalysis: `
### Valuation Summary
An analysis of **${ticker}**'s core multiples highlights key valuation and profitability indicators:
* The price-to-earnings (P/E) multiple stands at **${financials.peRatio}**, representing a premium relative to its sector peers. This is justified by the company's historical compounding rates.
* **Return on Equity (ROE)** is strong at **${financials.roe}**, showing outstanding capital allocation efficiency.
* Net balance sheet leverage remains low with a Debt-to-Equity ratio of **${financials.debtToEquity}**.

### Profitability & Cash Generation
Operating margins are highly optimized at **${financials.operatingMargin}**, reflecting strong pricing power. The company generates substantial annual free cash flows (**${financials.freeCashFlow}**), which comfortably cover interest obligations and enable regular share repurchases.
`,
    financials,
    swot: {
      strengths: [
        "Unrivaled brand equity and industry-leading customer retention rates.",
        `Robust balance sheet with substantial liquidity (${financials.freeCashFlow} FCF).`,
        "Proprietary technology stack and extensive patent portfolio."
      ],
      weaknesses: [
        `Premium valuation multiples (${financials.peRatio} P/E) leave narrow room for execution misses.`,
        "Exposure to supply chain vulnerabilities in semiconductor components.",
        "Increasing operational dependency on highly specialized engineering talent."
      ],
      opportunities: [
        "Expansion of high-margin cloud integrations into emerging South Asian markets.",
        "Acquisition of mid-market automation platforms to expand customer cohorts.",
        "Monetization of advanced data analytics dashboards."
      ],
      threats: [
        "Evolving antitrust scrutiny and data privacy frameworks across the EU.",
        "A aggressive pricing campaigns launched by low-cost sector challengers.",
        "Macroeconomic compression affecting institutional capital budgets."
      ]
    },
    competitiveAdvantage: `
### The Corporate Moat
**${companyName}** has engineered a multi-layered competitive moat that safeguards its market position:

* **High Switching Costs**: The integration of its software systems into client workflows creates a high barrier to exit. The cost and disruption associated with migrating to alternatives makes customer churn extremely rare (<3.5% annually).
* **Network Effects**: As more enterprises deploy its data sharing suite, the platform's utility grows exponentially, encouraging organic onboarding of supply-chain partners.
* **Brand Premium**: Decades of reliable delivery command a 15-20% average pricing premium over generic sector competitors.
`,
    risks: [
      "Regulatory and policy headwinds regarding AI governance and cross-border licensing.",
      "Vulnerability to high interest rates compressing growth valuations.",
      "Supply constraints on server chips limiting cloud deployment schedules."
    ],
    growthPotential: `
### Growth Catalysts
The growth thesis for **${companyName}** relies on two major structural vectors:

1. **AI Layer Upsell**: Deploying premium generative AI co-pilots across the software segment is projected to increase average revenue per user (ARPU) by 18-22% over the next 24 months.
2. **Infrastructure Modernization**: Global grid decabornisation and cloud storage mandates act as direct tailwinds for the hardware and storage sectors.
`,
    newsSentiment: {
      overall: isInvest ? "bullish" : "neutral",
      score: isInvest ? 82 : 52,
      summary: `Market sentiment for ${companyName} is generally constructive. Analysts are optimistic about the upcoming product cycles and strong cash returns, although some express caution regarding premium valuations.`,
      articles: [
        {
          title: `${companyName} Beats Q2 Forecasts, Cites Strong Demand for Enterprise Cloud`,
          source: "Wall Street Journal",
          url: "https://wsj.com",
          sentiment: "positive",
          snippet: `${companyName} announced earnings that beat consensus expectations on both top and bottom lines, driven by a 20% spike in cloud subscription revenues.`
        },
        {
          title: `Analysts Raise Targets on ${ticker} Following Product Unveiling`,
          source: "Bloomberg",
          url: "https://bloomberg.com",
          sentiment: "positive",
          snippet: "Institutional brokerages upgraded their target prices, pointing to the high margin profile of the new AI integration layer."
        },
        {
          title: `Regulatory Investigations Initiated in EU Over Platform Access Policies`,
          source: "Reuters",
          url: "https://reuters.com",
          sentiment: "negative",
          snippet: "European regulators launched an inquiry into antitrust complaints related to the company's software bundle terms."
        }
      ]
    },
    aiSummary: `An investment evaluation of ${companyName} (${ticker}). The company shows strong financials, stable cash flows, and a wide competitive moat. The final recommendation is ${recommendation} with a confidence rating of ${confidenceScore}%.`,
    investmentThesis: `
### Investment Thesis

Our recommendation for **${companyName}** is **${recommendation}**.

This decision is backed by the company's capital allocation efficiency and high-margin recurring software segment. At a P/E multiple of **${financials.peRatio}**, the market is pricing in sustained growth. We believe this is fully supported by the company's high switching costs and R&D pipelines.

#### Core Investment Catalysts
* **Margin Optimization**: Ongoing migration of customers from transaction models to recurring cloud models will continue to expand gross margins.
* **Cash Return Cushion**: With **${financials.freeCashFlow}** in free cash generation, the company is well-positioned to fund buybacks and secure dividends.

#### Thesis Invalidation Vectors
We will monitor these parameters to check for changes in our investment thesis:
1. **Margins Compression**: Any drop in gross margins below 75% in the subscription segment will indicate weakening pricing power.
2. **Key Client Churn**: Significant customer churn in enterprise contracts would invalidate our assumption of high switching costs.
`
  };
}
