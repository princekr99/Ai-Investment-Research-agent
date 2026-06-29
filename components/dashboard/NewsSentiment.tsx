"use client";

import React from "react";
import { NewsArticle } from "@/types";
import { TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";

interface NewsSentimentProps {
  sentiment: {
    overall: "bullish" | "bearish" | "neutral";
    score: number;
    summary: string;
    articles: NewsArticle[];
  };
}

export default function NewsSentiment({ sentiment }: NewsSentimentProps) {
  const isBullish = sentiment.overall === "bullish";
  const isBearish = sentiment.overall === "bearish";

  const getSentimentConfig = () => {
    if (isBullish) {
      return {
        label: "Bullish",
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
        icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      };
    }
    if (isBearish) {
      return {
        label: "Bearish",
        color: "text-rose-400",
        bgColor: "bg-rose-500/10",
        borderColor: "border-rose-500/20",
        icon: <TrendingDown className="w-5 h-5 text-rose-400" />,
      };
    }
    return {
      label: "Neutral",
      color: "text-zinc-400",
      bgColor: "bg-zinc-500/10",
      borderColor: "border-zinc-500/20",
      icon: <Minus className="w-5 h-5 text-zinc-400" />,
    };
  };

  const config = getSentimentConfig();

  // Circular progress calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (sentiment.score / 100) * circumference;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold tracking-tight text-white">News & Market Sentiment</h3>
        <p className="text-sm text-zinc-400">Media indexing and sentiment scoring derived from social and news channels</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Score Dial */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
          <h4 className="text-sm font-semibold text-zinc-400">Overall Sentiment Index</h4>
          
          <div className="relative flex items-center justify-center w-36 h-36">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-zinc-800 fill-none"
                strokeWidth="8"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                className={`fill-none transition-all duration-1000 ${
                  isBullish ? "stroke-emerald-500" : isBearish ? "stroke-rose-500" : "stroke-zinc-500"
                }`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white tracking-tight">{sentiment.score}%</span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">Sentiment Score</span>
            </div>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${config.bgColor} ${config.color} ${config.borderColor}`}>
            {config.icon}
            {config.label}
          </div>
        </div>

        {/* AI Sentiment Analysis Summary */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-md font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
              Sentiment Analysis
            </h4>
            <p className="text-zinc-300 text-sm leading-relaxed">{sentiment.summary}</p>
          </div>

          <div className="text-[11px] text-zinc-500 border-t border-white/5 pt-3 leading-none">
            * Score combines social sentiment, trade publication counts, and general press analysis.
          </div>
        </div>
      </div>

      {/* Latest Articles */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Indexed News Articles</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sentiment.articles.map((art, idx) => {
            const artPos = art.sentiment === "positive";
            const artNeg = art.sentiment === "negative";

            return (
              <a
                href={art.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                key={idx}
                className="glass-panel p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-zinc-700 hover:bg-white/[0.03] transition-all group duration-200"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] text-zinc-500 font-medium truncate max-w-[120px]">
                      {art.source}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        artPos
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : artNeg
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                      }`}
                    >
                      {art.sentiment}
                    </span>
                  </div>
                  <h5 className="text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {art.title}
                  </h5>
                  <p className="text-[11px] text-zinc-400 line-clamp-3 leading-relaxed">
                    {art.snippet}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-semibold group-hover:underline self-end">
                  Read Article
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
