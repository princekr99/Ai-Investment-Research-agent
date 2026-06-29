"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface CompanyOverviewProps {
  companyName: string;
  ticker: string;
  businessOverview: string;
  revenueModel: string;
}

export default function CompanyOverview({
  companyName,
  ticker,
  businessOverview,
  revenueModel,
}: CompanyOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/5 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            {companyName}
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-zinc-400 border border-white/10">
              {ticker}
            </span>
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Hedge Fund Intelligence Briefing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
            Business Overview
          </h3>
          <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed space-y-3">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{businessOverview}</ReactMarkdown>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-4 bg-purple-500 rounded-full" />
            Revenue Model
          </h3>
          <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed space-y-3">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{revenueModel}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
