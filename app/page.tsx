"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  Share2,
  FileText,
  Sparkles,
  History,
  Trash2,
  Check,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import Header from "@/components/Header";
import AgentProgress from "@/components/AgentProgress";
import CompanyOverview from "@/components/dashboard/CompanyOverview";
import FinancialSummary from "@/components/dashboard/FinancialSummary";
import SWOTAnalysis from "@/components/dashboard/SWOTAnalysis";
import NewsSentiment from "@/components/dashboard/NewsSentiment";
import RiskAssessment from "@/components/dashboard/RiskAssessment";
import RecommendationCard from "@/components/dashboard/RecommendationCard";
import { exportReportToPdf } from "@/utils/exportPdf";
import { InvestmentReport } from "@/types";

export default function Home() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "initialize" | "research" | "financials" | "news" | "risk" | "decision" | "completed" | "idle"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [report, setReport] = useState<InvestmentReport | null>(null);
  const [history, setHistory] = useState<InvestmentReport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"verdict" | "overview" | "financials" | "swot" | "sentiment" | "risks">("verdict");
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("research_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history:", e);
    }
  }, []);

  const saveToHistory = (newReport: InvestmentReport) => {
    try {
      setHistory((prev) => {
        // Remove existing reports of the same company to avoid duplicates
        const filtered = prev.filter((r) => r.ticker.toLowerCase() !== newReport.ticker.toLowerCase());
        const updated = [newReport, ...filtered].slice(0, 8); // Keep top 8 searches
        localStorage.setItem("research_history", JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.error("Failed to save report to history:", e);
    }
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.removeItem("research_history");
      setHistory([]);
    } catch (e) {
      console.error("Failed to clear history:", e);
    }
  };

  const deleteHistoryItem = (ticker: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setHistory((prev) => {
        const updated = prev.filter((item) => item.ticker !== ticker);
        localStorage.setItem("research_history", JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.error("Failed to delete history item:", e);
    }
  };

  const handleAnalyze = async (companyName: string) => {
    if (!companyName.trim()) return;

    setIsLoading(true);
    setError(null);
    setReport(null);
    setCurrentStep("initialize");
    setStatusMessage("Preparing analysis sandbox...");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyName }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize connection to multi-agent stream.");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("API did not return a stream reader.");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          // Split line by event details
          if (line.includes("event: progress")) {
            const dataParts = line.split("data: ");
            if (dataParts[1]) {
              const data = JSON.parse(dataParts[1]);
              setCurrentStep(data.step);
              setStatusMessage(data.message);
            }
          } else if (line.includes("event: result")) {
            const dataParts = line.split("data: ");
            if (dataParts[1]) {
              const data = JSON.parse(dataParts[1]);
              setReport(data);
              saveToHistory(data);
              setCurrentStep("completed");
              setIsLoading(false);
            }
          } else if (line.includes("event: error")) {
            const dataParts = line.split("data: ");
            if (dataParts[1]) {
              const data = JSON.parse(dataParts[1]);
              throw new Error(data.error);
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err.message || "Something went wrong during agent reasoning. Please try again.");
      setIsLoading(false);
      setCurrentStep("idle");
    }
  };

  const handleCopyReport = () => {
    if (!report) return;

    const reportMarkdown = `
# Investment Research Report: ${report.companyName} (${report.ticker})
Recommendation: ${report.recommendation} (Confidence: ${report.confidenceScore}%)
Timestamp: ${new Date(report.timestamp).toLocaleDateString()}

## 1. Business Overview
${report.businessOverview}

## 2. Revenue Model
${report.revenueModel}

## 3. Financial Analysis
${report.financialAnalysis}

## 4. SWOT Analysis
- Strengths: ${report.swot.strengths.join(", ")}
- Weaknesses: ${report.swot.weaknesses.join(", ")}
- Opportunities: ${report.swot.opportunities.join(", ")}
- Threats: ${report.swot.threats.join(", ")}

## 5. Competitive Moat & Growth
${report.competitiveAdvantage}
Growth Vectors: ${report.growthPotential}

## 6. Risks
${report.risks.map((r, i) => `${i + 1}. ${r}`).join("\n")}

## 7. News & Sentiment
Overall Sentiment: ${report.newsSentiment.overall.toUpperCase()} (${report.newsSentiment.score}%)
Summary: ${report.newsSentiment.summary}

## 8. CIO Final Thesis
${report.investmentThesis}
    `.trim();

    navigator.clipboard.writeText(reportMarkdown);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleShareLink = () => {
    if (!report) return;
    const url = `${window.location.origin}?company=${encodeURIComponent(report.companyName)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePdfExport = async () => {
    if (!report) return;
    setExportingPdf(true);
    await exportReportToPdf("full-printable-report", report.companyName);
    setExportingPdf(false);
  };

  // URL check for auto-search
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const company = params.get("company");
    if (company) {
      setQuery(company);
      handleAnalyze(company);
    }
  }, []);

  const popularCompanies = ["Tesla", "Apple", "Microsoft", "NVIDIA", "Reliance", "TCS"];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {/* 1. SEARCH/LANDING PAGE */}
          {currentStep === "idle" && !report && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl mx-auto space-y-12 py-8 md:py-16"
            >
              {/* Hero */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Next-Gen LLM Workflow Engine
                </div>
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
                  AI Investment <br className="hidden sm:block" />
                  <span className="shimmer-text">Research Agent</span>
                </h1>
                <p className="text-zinc-400 text-sm sm:text-lg max-w-xl mx-auto">
                  Evaluate stocks using a multi-agent LangGraph workflow. Get institutional-grade financial analysis, news sentiments, SWOT vectors, and risk profiles in minutes.
                </p>
              </div>

              {/* Search Box */}
              <div className="glass-panel p-6 rounded-3xl space-y-4 shadow-xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAnalyze(query);
                  }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Enter company name or ticker (e.g. Tesla, Apple, Reliance)..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm md:text-base text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!query.trim()}
                    className="bg-white text-black font-semibold rounded-2xl px-8 py-4 text-sm md:text-base hover:bg-zinc-200 transition-all shadow-md shadow-white/5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    Analyze Company
                  </button>
                </form>

                {/* Popular companies */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs text-zinc-500 font-semibold mr-1">Examples:</span>
                  {popularCompanies.map((name) => (
                    <button
                      key={name}
                      onClick={() => {
                        setQuery(name);
                        handleAnalyze(name);
                      }}
                      className="text-xs text-zinc-400 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent History */}
              {history.length > 0 && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5" />
                      Recent Analysed Reports
                    </h3>
                    <button
                      onClick={clearHistory}
                      className="text-xs text-zinc-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear History
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {history.map((h, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setReport(h);
                          setCurrentStep("completed");
                        }}
                        className="glass-panel p-4 rounded-2xl flex items-center justify-between hover:bg-white/[0.03] hover:border-zinc-700 transition-all cursor-pointer group"
                      >
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                            {h.companyName}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span>{h.ticker}</span>
                            <span>•</span>
                            <span className={h.recommendation === "INVEST" ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                              {h.recommendation}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => deleteHistoryItem(h.ticker, e)}
                          className="text-zinc-600 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* 2. PROGRESS/LOADING STATE */}
          {isLoading && currentStep !== "completed" && (
            <motion.div
              key="loading-progress"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-12 md:py-24"
            >
              <AgentProgress currentStep={currentStep} statusMessage={statusMessage} />
            </motion.div>
          )}

          {/* 3. ERROR HANDLER */}
          {error && (
            <motion.div
              key="error-box"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto py-16 text-center space-y-6"
            >
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-400">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Agent Pipeline Interrupted</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{error}</p>
              </div>
              <button
                onClick={() => handleAnalyze(query || "Tesla")}
                className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-zinc-200 cursor-pointer transition-all shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                Retry Analysis
              </button>
            </motion.div>
          )}

          {/* 4. FINAL OUTPUT PAGE */}
          {currentStep === "completed" && report && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Back & utility actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
                <button
                  onClick={() => {
                    setCurrentStep("idle");
                    setReport(null);
                  }}
                  className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm cursor-pointer group transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Search
                </button>

                {/* Print/Copy/Share actions */}
                <div className="flex items-center gap-2 flex-wrap no-print">
                  <button
                    onClick={handleCopyReport}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  >
                    {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedReport ? "Copied!" : "Copy Report"}
                  </button>

                  <button
                    onClick={handleShareLink}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    {copiedLink ? "Link Copied!" : "Share Link"}
                  </button>

                  <button
                    onClick={handlePdfExport}
                    disabled={exportingPdf}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {exportingPdf ? "Generating..." : "Export as PDF"}
                  </button>
                </div>
              </div>

              {/* Dashboard Layout Container */}
              <div id="full-printable-report" className="space-y-8 p-1">
                {/* Company Name & Ticker Header */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
                      {report.companyName}
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10 uppercase">
                        {report.ticker}
                      </span>
                    </h2>
                    <p className="text-xs md:text-sm text-zinc-400 mt-1">
                      Report generated on {new Date(report.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <span className="text-xs text-zinc-500 font-semibold">Status:</span>
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase">
                      Analysis Audited
                    </span>
                  </div>
                </div>

                {/* Dashboard Tabs Bar */}
                <div className="flex overflow-x-auto border-b border-white/10 no-print">
                  {[
                    { key: "verdict", label: "CIO Verdict" },
                    { key: "overview", label: "Business Model" },
                    { key: "financials", label: "Financial Summary" },
                    { key: "swot", label: "SWOT Matrix" },
                    { key: "sentiment", label: "News Sentiment" },
                    { key: "risks", label: "Risks & Moat" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`py-3 px-5 border-b-2 text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        activeTab === tab.key
                          ? "border-indigo-500 text-white font-bold"
                          : "border-transparent text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Active Tab Panel */}
                <div className="mt-4 no-print">
                  {activeTab === "verdict" && (
                    <RecommendationCard
                      recommendation={report.recommendation}
                      confidenceScore={report.confidenceScore}
                      aiSummary={report.aiSummary}
                      investmentThesis={report.investmentThesis}
                    />
                  )}
                  {activeTab === "overview" && (
                    <CompanyOverview
                      companyName={report.companyName}
                      ticker={report.ticker}
                      businessOverview={report.businessOverview}
                      revenueModel={report.revenueModel}
                    />
                  )}
                  {activeTab === "financials" && (
                    <FinancialSummary financials={report.financials} ticker={report.ticker} />
                  )}
                  {activeTab === "swot" && <SWOTAnalysis swot={report.swot} />}
                  {activeTab === "sentiment" && <NewsSentiment sentiment={report.newsSentiment} />}
                  {activeTab === "risks" && (
                    <RiskAssessment
                      competitiveAdvantage={report.competitiveAdvantage}
                      growthPotential={report.growthPotential}
                      risks={report.risks}
                    />
                  )}
                </div>

                {/* Hidden Full Stacked Report: Renders only for HTML2Canvas PDF capture */}
                <div className="hidden print-block space-y-12 pt-8 border-t border-zinc-800">
                  <h1 className="text-3xl font-black text-center text-white pb-6 border-b border-zinc-800 uppercase tracking-widest">
                    Hedge Fund Intelligence Dossier
                  </h1>
                  <RecommendationCard
                    recommendation={report.recommendation}
                    confidenceScore={report.confidenceScore}
                    aiSummary={report.aiSummary}
                    investmentThesis={report.investmentThesis}
                  />
                  <CompanyOverview
                    companyName={report.companyName}
                    ticker={report.ticker}
                    businessOverview={report.businessOverview}
                    revenueModel={report.revenueModel}
                  />
                  <FinancialSummary financials={report.financials} ticker={report.ticker} />
                  <SWOTAnalysis swot={report.swot} />
                  <NewsSentiment sentiment={report.newsSentiment} />
                  <RiskAssessment
                    competitiveAdvantage={report.competitiveAdvantage}
                    growthPotential={report.growthPotential}
                    risks={report.risks}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="w-full py-6 text-center text-[10px] sm:text-xs text-zinc-600 border-t border-white/5">
        &copy; {new Date().getFullYear()} AI Investment Research Agent. Built for Recruiters. Private & Confidential.
      </footer>
    </div>
  );
}
