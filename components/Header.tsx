"use client";

import React from "react";
import { BrainCircuit, Activity } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 bg-[#030303]/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">Antigravity</h1>
            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Investment Research Agent</span>
          </div>
        </div>

        {/* API / Agent Engine Status */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-zinc-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Graph Engine Active
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-white">GPT-4.1 / Gemini 2.5 Pro</span>
          </div>
        </div>
      </div>
    </header>
  );
}
