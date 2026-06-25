'use client';

import React, { useState } from 'react';

// Mock chart data for Finance page
const monthlyData = [
  { month: 'Jan', revenue: 92, costs: 71 },
  { month: 'Feb', revenue: 98, costs: 73 },
  { month: 'Mar', revenue: 105, costs: 75 },
  { month: 'Apr', revenue: 103, costs: 78 },
  { month: 'May', revenue: 115, costs: 76 },
  { month: 'Jun', revenue: 112, costs: 80 },
  { month: 'Jul', revenue: 118, costs: 79 },
  { month: 'Aug', revenue: 124, costs: 82 },
  { month: 'Sep', revenue: 121, costs: 81 },
  { month: 'Oct', revenue: 128, costs: 84 },
  { month: 'Nov', revenue: 131, costs: 83 },
  { month: 'Dec', revenue: 124.5, costs: 84.2 },
];

const maxVal = 140;

function BarChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="w-full">
      <div className="flex items-end gap-2 h-52 px-2">
        {monthlyData.map((d, i) => (
          <div
            key={d.month}
            className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {hoveredIndex === i && (
              <div className="text-xs text-slate-300 whitespace-nowrap bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg mb-1 z-10">
                Rev: ${d.revenue}M / Cost: ${d.costs}M
              </div>
            )}
            <div className="w-full flex items-end gap-0.5 h-44">
              <div
                className="flex-1 bg-indigo-500/70 hover:bg-indigo-400 rounded-t transition-all duration-200"
                style={{ height: `${(d.revenue / maxVal) * 100}%` }}
              />
              <div
                className="flex-1 bg-rose-500/50 hover:bg-rose-400/70 rounded-t transition-all duration-200"
                style={{ height: `${(d.costs / maxVal) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 mt-1">{d.month}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-6 mt-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-indigo-500/70" />
          <span className="text-xs text-slate-400">Revenue ($M)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-rose-500/50" />
          <span className="text-xs text-slate-400">Operating Costs ($M)</span>
        </div>
      </div>
    </div>
  );
}

const budgetItems = [
  { dept: 'Engineering', allocated: 18.2, spent: 14.6, color: 'bg-indigo-500' },
  { dept: 'Sales & Marketing', allocated: 12.4, spent: 11.8, color: 'bg-violet-500' },
  { dept: 'Human Resources', allocated: 5.6, spent: 4.2, color: 'bg-emerald-500' },
  { dept: 'Operations', allocated: 22.1, spent: 19.4, color: 'bg-amber-500' },
  { dept: 'Research & Dev', allocated: 16.8, spent: 10.2, color: 'bg-cyan-500' },
];

export default function FinancePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Finance & Accounting</h2>
          <p className="text-slate-400">AI-driven financial intelligence and budget analytics.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            AI Forecast
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-500" />
          <h3 className="text-slate-400 text-sm font-medium mb-2">Net Profit (Q4)</h3>
          <p className="text-3xl font-bold text-emerald-400 mb-1">$40.3M</p>
          <p className="text-sm text-emerald-400/70">+18.7% YoY</p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-500" />
          <h3 className="text-slate-400 text-sm font-medium mb-2">Gross Margin</h3>
          <p className="text-3xl font-bold text-white mb-1">67.4%</p>
          <p className="text-sm text-indigo-400/80">+2.1% vs last quarter</p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full group-hover:bg-amber-500/20 transition-all duration-500" />
          <h3 className="text-slate-400 text-sm font-medium mb-2">Cash Runway</h3>
          <p className="text-3xl font-bold text-white mb-1">38 months</p>
          <p className="text-sm text-amber-400/80">AI optimized</p>
        </div>
      </div>

      {/* Revenue vs Cost Chart */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">Revenue vs. Operating Costs (2026)</h3>
          <span className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">AI Predicted ✦</span>
        </div>
        <BarChart />
      </div>

      {/* Budget Utilization */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6">
        <h3 className="text-lg font-medium text-white mb-6">Budget Utilization by Department</h3>
        <div className="space-y-5">
          {budgetItems.map((item) => {
            const pct = Math.round((item.spent / item.allocated) * 100);
            return (
              <div key={item.dept}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">{item.dept}</span>
                  <span className="text-xs text-slate-500">${item.spent}M / ${item.allocated}M ({pct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
