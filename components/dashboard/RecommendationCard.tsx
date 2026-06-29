"use client";

import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckCircle2, XCircle, BrainCircuit } from "lucide-react";
import confetti from "canvas-confetti";

interface RecommendationCardProps {
  recommendation: "INVEST" | "PASS";
  confidenceScore: number;
  aiSummary: string;
  investmentThesis: string;
}

export default function RecommendationCard({
  recommendation,
  confidenceScore,
  aiSummary,
  investmentThesis,
}: RecommendationCardProps) {
  const isInvest = recommendation === "INVEST";

  // Trigger celebration confetti if the recommendation is INVEST
  useEffect(() => {
    if (isInvest) {
      const duration = 2 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 50 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 40 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isInvest]);

  return (
    <div className="space-y-6">
      {/* Decisive Verdict Header */}
      <div
        className={`glass-panel p-6 md:p-8 rounded-2xl transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative ${
          isInvest ? "glow-card-invest border-emerald-500/20" : "glow-card-pass border-rose-500/20"
        }`}
      >
        <div className="flex items-center gap-4 md:gap-5">
          {isInvest ? (
            <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-12 h-12 md:w-16 md:h-16 text-rose-400 shrink-0" />
          )}
          
          <div>
            <span className="text-[10px] md:text-xs font-semibold text-zinc-400 uppercase tracking-widest leading-none">
              CIO Investment Decision
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-1">
              Final Recommendation:{" "}
              <span className={isInvest ? "text-emerald-400" : "text-rose-400"}>
                {recommendation}
              </span>
            </h2>
          </div>
        </div>

        {/* Confidence Percentage Gauge */}
        <div className="flex flex-col items-center md:items-end justify-center shrink-0">
          <span className="text-[10px] md:text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            Confidence Rating
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl md:text-5xl font-black text-white">{confidenceScore}</span>
            <span className="text-lg font-bold text-zinc-400">%</span>
          </div>
        </div>
      </div>

      {/* AI Summary Brief */}
      <div className="glass-panel p-5 rounded-xl border-l-4 border-l-indigo-500 flex gap-4 items-start bg-indigo-500/[0.01]">
        <BrainCircuit className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Executive Summary Brief</h4>
          <p className="text-zinc-300 text-sm leading-relaxed">{aiSummary}</p>
        </div>
      </div>

      {/* Structured Investment Thesis */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
          Structured Investment Thesis
        </h3>
        
        <div className="prose prose-invert max-w-none text-zinc-300 text-sm md:text-base leading-relaxed space-y-4 prose-headings:text-white prose-headings:font-bold prose-h3:text-md prose-h3:mt-6 prose-ul:list-disc prose-ul:pl-5 prose-li:my-1">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{investmentThesis}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
