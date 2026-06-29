import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

export function getLLM(temperature = 0.2): BaseChatModel {
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (openaiKey) {
    console.log("LLM Service: Initializing ChatOpenAI (gpt-4o)");
    return new ChatOpenAI({
      openAIApiKey: openaiKey,
      modelName: "gpt-4o",
      temperature,
    });
  } else if (geminiKey) {
    console.log("LLM Service: Initializing ChatGoogleGenerativeAI (gemini-2.5-pro)");
    return new ChatGoogleGenerativeAI({
      apiKey: geminiKey,
      model: "gemini-2.5-pro",
      temperature,
    });
  } else {
    // If no keys are provided, we will use Gemini with a placeholder or raise a clean error
    // In our api endpoints, we will catch and provide beautiful mock data if no keys exist.
    console.warn("LLM Service: No API keys found in env. Falling back to Gemini default container config.");
    return new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature,
    });
  }
}
