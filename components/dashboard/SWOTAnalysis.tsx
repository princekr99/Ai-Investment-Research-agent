"use client";

import React from "react";
import { SWOT } from "@/types";
import { CheckCircle2, AlertTriangle, Lightbulb, ShieldAlert } from "lucide-react";

interface SWOTAnalysisProps {
  swot: SWOT;
}

export default function SWOTAnalysis({ swot }: SWOTAnalysisProps) {
  const quadrants = [
    {
      title: "Strengths",
      items: swot.strengths,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      borderColor: "hover:border-emerald-500/30",
      glowBg: "group-hover:bg-emerald-500/[0.02]",
      badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      title: "Weaknesses",
      items: swot.weaknesses,
      icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
      borderColor: "hover:border-rose-500/30",
      glowBg: "group-hover:bg-rose-500/[0.02]",
      badgeBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    },
    {
      title: "Opportunities",
      items: swot.opportunities,
      icon: <Lightbulb className="w-5 h-5 text-sky-400" />,
      borderColor: "hover:border-sky-500/30",
      glowBg: "group-hover:bg-sky-500/[0.02]",
      badgeBg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    },
    {
      title: "Threats",
      items: swot.threats,
      icon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
      borderColor: "hover:border-amber-500/30",
      glowBg: "group-hover:bg-amber-500/[0.02]",
      badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold tracking-tight text-white">SWOT Analysis</h3>
        <p className="text-sm text-zinc-400">Internal strengths and weakness vs external opportunities and threats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quadrants.map((q, idx) => (
          <div
            key={idx}
            className={`group glass-panel p-6 rounded-2xl transition-all duration-300 ${q.borderColor} ${q.glowBg} flex flex-col justify-between`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-bold text-white flex items-center gap-2">
                  {q.icon}
                  {q.title}
                </h4>
                <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${q.badgeBg}`}>
                  Quadrant {idx + 1}
                </span>
              </div>

              <ul className="space-y-3">
                {q.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-zinc-300 text-sm leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
