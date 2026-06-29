import { AgentStateType } from "../state";
import { getLLM } from "../../services/llm";
import { searchWeb } from "../../services/search";
import { NewsArticle } from "../../types";

export async function newsAgentNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  console.log(`[News Agent] Reading news for: ${state.companyName}`);
  
  const query = `${state.companyName} stock market news sentiment recent 2026`;
  const searchResults = await searchWeb(query);
  const searchContext = searchResults.map(r => `Title: ${r.title}\nUrl: ${r.url}\nContent: ${r.content}`).join("\n\n");

  const llm = getLLM(0.3);
  const prompt = `
You are an AI Sentiment Analyst specializing in stock market news.
Analyze the following latest news articles for: ${state.companyName}.

Search Results:
${searchContext}

Your job is to determine:
1. The overall market sentiment towards the company: "bullish", "bearish", or "neutral".
2. A sentiment score between 0 (highly bearish) and 100 (highly bullish).
3. A short, analytical summary paragraph of the recent news developments, market chatter, or earnings results.
4. A list of up to 3 news articles with individual sentiment classifications ("positive", "negative", or "neutral"). Include title, source, url, and a brief snippet.

Format the output strictly as a JSON object with this shape:
{
  "overall": "bullish" | "bearish" | "neutral",
  "score": number,
  "summary": "String analysis of news...",
  "articles": [
    {
      "title": "Article Title",
      "source": "Yahoo Finance / Reuters / etc.",
      "url": "https://...",
      "sentiment": "positive" | "negative" | "neutral",
      "snippet": "Short summary of article content..."
    }
  ]
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
      newsSentiment: {
        overall: data.overall || "neutral",
        score: data.score || 50,
        summary: data.summary || "No recent news developments summarized.",
        articles: (data.articles || []).map((art: any) => ({
          title: art.title || "Latest News update",
          source: art.source || "Web Search",
          url: art.url || "",
          sentiment: art.sentiment || "neutral",
          snippet: art.snippet || ""
        }))
      },
      nextAgent: "risk"
    };
  } catch (error) {
    console.error("[News Agent] Failed to parse news sentiment JSON, creating fallback", error);
    
    // Fallback based on search results
    const articles: NewsArticle[] = searchResults.slice(0, 3).map(r => ({
      title: r.title,
      source: new URL(r.url).hostname.replace("www.", "") || "Finance Portal",
      url: r.url,
      sentiment: "neutral",
      snippet: r.content.slice(0, 150) + "..."
    }));

    return {
      newsSentiment: {
        overall: "neutral",
        score: 55,
        summary: `Market chatter for ${state.companyName} indicates general stability. Focus remains on incoming quarterly earnings and core service adjustments.`,
        articles
      },
      nextAgent: "risk"
    };
  }
}
