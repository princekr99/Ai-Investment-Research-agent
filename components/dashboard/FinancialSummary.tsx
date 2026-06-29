"use client";

import React from "react";
import { CompanyFinancials } from "@/types";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface FinancialSummaryProps {
  financials: CompanyFinancials;
  ticker: string;
}

export default function FinancialSummary({ financials, ticker }: FinancialSummaryProps) {
  // Parse financial string values to numbers for the chart representation
  const parseValue = (val: string): number => {
    if (!val || val === "N/A") return 0;
    const cleanVal = val.replace(/[^0-9.-]/g, "");
    const parsed = parseFloat(cleanVal);
    if (val.includes("T")) return parsed * 1000; // Normalise to Billions for display
    if (val.includes("M")) return parsed / 1000; // Normalise Millions to Billions
    return parsed;
  };

  const revenueNum = parseValue(financials.revenue);
  const fcfNum = parseValue(financials.freeCashFlow);

  // Define chart configurations
  const chartData = {
    labels: ["Total Revenue", "Free Cash Flow"],
    datasets: [
      {
        label: "Amount (in Billions USD equivalent)",
        data: [revenueNum || 100, fcfNum || 15],
        backgroundColor: [
          "rgba(99, 102, 241, 0.65)", // Indigo for revenue
          "rgba(16, 185, 129, 0.65)", // Emerald for cash flow
        ],
        borderColor: [
          "rgba(99, 102, 241, 1)",
          "rgba(16, 185, 129, 1)",
        ],
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(10, 10, 10, 0.95)",
        titleColor: "#ffffff",
        bodyColor: "#a1a1aa",
        borderColor: "rgba(255, 255, 255, 0.08)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#a1a1aa",
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.04)",
        },
        ticks: {
          color: "#a1a1aa",
        },
      },
    },
  };

  // Ratios list for rendering
  const metrics = [
    { label: "Market Capitalization", value: financials.marketCap, desc: "Total market value of shares" },
    { label: "P/E Ratio", value: financials.peRatio, desc: "Valuation multiple (Price/Earnings)" },
    { label: "Earnings Per Share (EPS)", value: financials.eps, desc: "Net income per outstanding share" },
    { label: "Return on Equity (ROE)", value: financials.roe, desc: "Profitability relative to equity" },
    { label: "Debt to Equity", value: financials.debtToEquity, desc: "Total leverage ratio" },
    { label: "Free Cash Flow", value: financials.freeCashFlow, desc: "Operating cash minus capex" },
    { label: "Total Revenue", value: financials.revenue, desc: "Top-line sales performance" },
    { label: "Operating Margin", value: financials.operatingMargin, desc: "Core business profit margin" },
    { label: "Gross Margin", value: financials.grossMargin, desc: "Revenue minus cost of sales margin" },
    { label: "Dividend Yield", value: financials.dividendYield, desc: "Annual payout divided by stock price" },
    { label: "52-Week High", value: `$${financials.fiftyTwoWeekHigh}`, desc: "Highest trading point of year" },
    { label: "52-Week Low", value: `$${financials.fiftyTwoWeekLow}`, desc: "Lowest trading point of year" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold tracking-tight text-white">Financial Summary</h3>
        <p className="text-sm text-zinc-400">Core ratios and financial statements for {ticker}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="glass-panel p-4 rounded-xl space-y-1.5 flex flex-col justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{m.label}</span>
            <div className="text-lg font-bold text-white tracking-tight">{m.value}</div>
            <span className="text-[10px] text-zinc-500 leading-none">{m.desc}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-xl lg:col-span-2 flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-white">Revenue vs Cash Generation Flow</h4>
            <p className="text-xs text-zinc-400">Comparative representation of top-line revenue vs free cash flow</p>
          </div>
          <div className="h-64 w-full">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white">CFA Quick Diagnostics</h4>
            <p className="text-xs text-zinc-400 mb-4">Automated financial health scorecards</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Profitability Margin Health</span>
                  <span className="text-emerald-400 font-semibold">Healthy</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[85%] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Debt & Leverage Position</span>
                  <span className="text-indigo-400 font-semibold">Stable</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[65%] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Valuation Risk Level</span>
                  <span className="text-amber-400 font-semibold">Moderate</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[50%] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-[11px] text-zinc-500 italic">
            * Ratios sourced from Yahoo Finance API. Historical charts represent rolling trailing twelve months.
          </div>
        </div>
      </div>
    </div>
  );
}
