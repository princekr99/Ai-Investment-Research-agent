"use client";

import React from "react";
import { Loader2, CheckCircle2, Circle } from "lucide-react";

interface AgentProgressProps {
  currentStep: "initialize" | "research" | "financials" | "news" | "risk" | "decision" | "completed" | "idle";
  statusMessage: string;
}

export default function AgentProgress({ currentStep, statusMessage }: AgentProgressProps) {
  const steps = [
    { key: "initialize", label: "Agent Bootstrapping", description: "Resolving symbol and initializing shared state" },
    { key: "research", label: "Research Agent", description: "Analyzing business model & market positioning" },
    { key: "financials", label: "Financial Agent", description: "Calculating margins, solvency, and valuation ratios" },
    { key: "news", label: "News Agent", description: "Scraping media channels & assessing sentiment trends" },
    { key: "risk", label: "Risk Agent", description: "Compiling SWOT matrix & corporate risk profile" },
    { key: "decision", label: "Decision Agent", description: "CIO final thesis synthesis & recommendation" },
  ];

  const getStepStatus = (stepKey: string) => {
    const stepOrder = ["initialize", "research", "financials", "news", "risk", "decision", "completed"];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepKey);

    if (currentIndex > stepIndex) return "completed";
    if (currentIndex === stepIndex) return "active";
    return "pending";
  };

  const getCompletedPercentage = () => {
    const stepOrder = ["initialize", "research", "financials", "news", "risk", "decision", "completed"];
    const index = stepOrder.indexOf(currentStep);
    if (index === -1) return 0;
    return Math.round((index / (stepOrder.length - 1)) * 100);
  };

  return (
    <div className="glass-panel p-6 md:p-8 rounded-2xl w-full max-w-xl mx-auto space-y-6 shadow-2xl relative overflow-hidden">
      {/* Glow highlight inside progress card */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-right from-indigo-500 via-purple-500 to-pink-500" />
      
      <div className="space-y-2 text-center md:text-left">
        <h3 className="text-xl font-bold text-white tracking-tight">Hedge Fund Agent Workstream</h3>
        <p className="text-xs text-zinc-400">Coordinating multi-agent LangGraph analysis. Please stand by...</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] text-zinc-400 uppercase font-semibold">
          <span>Analysis Progress</span>
          <span>{getCompletedPercentage()}%</span>
        </div>
        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${getCompletedPercentage()}%` }}
          />
        </div>
      </div>

      {/* Status Message Display */}
      <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex items-center gap-3">
        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
        <p className="text-xs md:text-sm text-zinc-300 font-medium animate-pulse leading-normal">
          {statusMessage}
        </p>
      </div>

      {/* Steps Timeline */}
      <div className="relative pl-6 border-l border-white/10 space-y-5 mt-4 ml-2">
        {steps.map((s, idx) => {
          const status = getStepStatus(s.key);
          
          return (
            <div key={idx} className="relative group">
              {/* Indicator Circle */}
              <div className="absolute -left-[31px] top-0.5 bg-[#030303] rounded-full p-0.5">
                {status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 bg-[#030303] rounded-full" />
                ) : status === "active" ? (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-indigo-500/10 border border-indigo-500 animate-pulse">
                    <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
                  </div>
                ) : (
                  <Circle className="w-5 h-5 text-zinc-700 bg-[#030303] rounded-full" />
                )}
              </div>

              {/* Text Info */}
              <div className="space-y-0.5">
                <h4
                  className={`text-xs md:text-sm font-bold transition-colors ${
                    status === "completed"
                      ? "text-zinc-300"
                      : status === "active"
                      ? "text-white"
                      : "text-zinc-600"
                  }`}
                >
                  {s.label}
                </h4>
                <p
                  className={`text-[10px] md:text-xs transition-colors ${
                    status === "active" ? "text-zinc-300" : "text-zinc-500"
                  }`}
                >
                  {s.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
