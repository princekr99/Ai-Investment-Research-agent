"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ShieldAlert, Award, Rocket } from "lucide-react";

interface RiskAssessmentProps {
  competitiveAdvantage: string;
  growthPotential: string;
  risks: string[];
}

export default function RiskAssessment({
  competitiveAdvantage,
  growthPotential,
  risks,
}: RiskAssessmentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold tracking-tight text-white">Risks & Moat Profiling</h3>
        <p className="text-sm text-zinc-400">Competitive barrier analysis, catalogued risks, and growth catalysts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competitive Moat */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h4 className="text-md font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            Competitive Advantage (Moat)
          </h4>
          <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed space-y-3">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{competitiveAdvantage}</ReactMarkdown>
          </div>
        </div>

        {/* Growth Potential */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h4 className="text-md font-bold text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-emerald-400" />
            Growth Drivers & Catalysts
          </h4>
          <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed space-y-3">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{growthPotential}</ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Catalogued Risks */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h4 className="text-md font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          Key Investment Risks
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {risks.map((risk, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold shrink-0">
                {idx + 1}
              </span>
              <p className="text-zinc-300 text-xs md:text-sm leading-relaxed font-medium">
                {risk}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
