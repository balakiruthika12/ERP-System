'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  getDashboardMetrics, getPayrollTrend, getAnnouncements,
  type DashboardMetrics, type PayrollTrendPoint, type Announcement,
} from '@/lib/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

function SkeletonCard() {
  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-2xl animate-pulse">
      <div className="h-3 bg-slate-700 rounded w-24 mb-4" />
      <div className="h-8 bg-slate-700 rounded w-32 mb-3" />
      <div className="h-3 bg-slate-700 rounded w-20" />
    </div>
  );
}

// ─── SVG Sparkline ────────────────────────────────────────────────────────────

function PayrollSparkline({ data }: { data: PayrollTrendPoint[] }) {
  const W = 600, H = 160;
  const PAD = { t: 20, r: 20, b: 40, l: 64 };
  if (!data || data.length === 0) return null;
  const values = data.map(d => Number(d.total));
  const maxVal = Math.max(...values, 1), minVal = Math.min(...values, 0);
  const range  = maxVal - minVal || 1;
  const iW = W - PAD.l - PAD.r, iH = H - PAD.t - PAD.b;
  const pts = data.map((d, i) => ({
    x: PAD.l + (i / (data.length - 1)) * iW,
    y: PAD.t + (1 - (Number(d.total) - minVal) / range) * iH,
    label: d.month, val: Number(d.total),
  }));
  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
  const area = [`M${pts[0].x},${PAD.t + iH}`, ...pts.map(p => `L${p.x},${p.y}`), `L${pts[pts.length-1].x},${PAD.t+iH}`, 'Z'].join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t, i) => {
        const y = PAD.t + t * iH;
        return (
          <g key={i}>
            <line x1={PAD.l} y1={y} x2={PAD.l + iW} y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
            <text x={PAD.l - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">{formatCurrency(maxVal - t * range)}</text>
          </g>
        );
      })}
      <path d={area} fill="url(#sparkGrad)" />
      <polyline points={polyline} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#6366f1" stroke="#1e1b4b" strokeWidth="2" />
          <text x={p.x} y={H - 6} textAnchor="middle" fontSize="10" fill="#94a3b8">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Config ───────────────────────────────────────────────────────────────────

const PRIORITY_DOT: Record<string, string> = {
  LOW: 'bg-slate-400', NORMAL: 'bg-blue-400', HIGH: 'bg-amber-400', URGENT: 'bg-rose-400',
};

const ACTION_ICON: Record<string, string> = {
  CREATE: '✚', UPDATE: '✎', DELETE: '✕', LOGIN: '→', LOGOUT: '←',
  APPROVE: '✓', REJECT: '✗', PAY: '💰', EXPORT: '↓', VIEW: '👁',
};

const ACTION_COLOR: Record<string, string> = {
  CREATE: 'text-emerald-400', UPDATE: 'text-blue-400', DELETE: 'text-rose-400',
  APPROVE: 'text-emerald-400', REJECT: 'text-rose-400', PAY: 'text-amber-400',
};

interface ActivityItem {
  id: number;
  action: string;
  entityType: string;
  details: string;
  performedBy: string;
  createdAt: string;
}

interface ProjectSummary {
  total: number;
  active: number;
  planning: number;
  completed: number;
  overdue: number;
}

const API = 'http://localhost:8080/api/v1';
const hdrs = () => {
  const tok = typeof window !== 'undefined' ? localStorage.getItem('erp_token') : null;
  return { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) };
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [trend, setTrend] = useState<PayrollTrendPoint[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [projectSummary, setProjectSummary] = useState<ProjectSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getDashboardMetrics(),
      getPayrollTrend().catch(() => [] as PayrollTrendPoint[]),
      getAnnouncements().catch(() => [] as Announcement[]),
      fetch(`${API}/dashboard/activity-feed`, { headers: hdrs() }).then(r => r.json()).catch(() => []),
      fetch(`${API}/dashboard/project-summary`, { headers: hdrs() }).then(r => r.json()).catch(() => null),
    ])
      .then(([m, t, a, act, ps]) => {
        setMetrics(m); setTrend(t);
        setAnnouncements((a as Announcement[]).slice(0, 3));
        setActivity(act as ActivityItem[]);
        setProjectSummary(ps as ProjectSummary);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Executive Overview</h2>
          <p className="text-slate-400">Enterprise Intelligence Dashboard</p>
        </div>
        <div className="flex space-x-3">
          <a href="/dashboard/reports" className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors">
            View Reports
          </a>
          <a href="/dashboard/ai" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            ✦ AI Copilot
          </a>
        </div>
      </div>

      {error && (
        <div className="px-5 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">
          ⚠️ Backend unavailable: {error}. Some widgets may show cached or empty data.
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-500" />
              <h3 className="text-slate-400 text-sm font-medium mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-white mb-2">{metrics ? formatCurrency(metrics.totalRevenue) : '$124.5M'}</p>
              <div className="flex items-center text-emerald-400 text-sm font-medium">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                +14.2% from last quarter
              </div>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-[50px] rounded-full group-hover:bg-rose-500/20 transition-all duration-500" />
              <h3 className="text-slate-400 text-sm font-medium mb-2">Operating Costs</h3>
              <p className="text-3xl font-bold text-white mb-2">{metrics ? formatCurrency(metrics.operatingCosts) : '$84.2M'}</p>
              <div className="text-rose-400 text-sm font-medium">-2.4% (AI Optimized)</div>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-500" />
              <h3 className="text-slate-400 text-sm font-medium mb-2">AI Health Score</h3>
              <p className="text-3xl font-bold text-indigo-400 mb-2">{metrics ? `${metrics.businessHealthScore}/100` : '94/100'}</p>
              <div className="text-slate-400 text-sm font-medium">Based on 142 AI models</div>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full group-hover:bg-amber-500/20 transition-all duration-500" />
              <h3 className="text-slate-400 text-sm font-medium mb-2">Workforce</h3>
              <p className="text-3xl font-bold text-white mb-2">{metrics ? metrics.totalEmployees : '—'} <span className="text-lg text-slate-500 font-normal">employees</span></p>
              <div className="text-amber-400 text-sm font-medium">{metrics ? metrics.totalDepartments : '—'} departments active</div>
            </div>
          </>
        )}
      </div>

      {/* Projects Quickstats */}
      {projectSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '📁 Total Projects', value: projectSummary.total,     color: 'text-white' },
            { label: '🔄 Active',         value: projectSummary.active,     color: 'text-amber-400' },
            { label: '✅ Completed',      value: projectSummary.completed,  color: 'text-emerald-400' },
            { label: '⚠️ Overdue',        value: projectSummary.overdue,    color: projectSummary.overdue > 0 ? 'text-rose-400' : 'text-slate-500' },
          ].map(c => (
            <a key={c.label} href="/dashboard/projects"
              className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl px-4 py-3 hover:border-slate-700 transition-all">
              <p className="text-xs text-slate-500 mb-0.5">{c.label}</p>
              <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
            </a>
          ))}
        </div>
      )}

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Payroll Trend Chart */}
        <div className="xl:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-white">📊 Payroll Spend — 6 Month Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly gross salary totals across all departments</p>
            </div>
            {trend.length > 0 && (
              <div className="text-right">
                <p className="text-xs text-slate-500">Latest Month</p>
                <p className="text-sm font-bold text-indigo-400">{formatCurrency(Number(trend[trend.length - 1]?.total ?? 0))}</p>
              </div>
            )}
          </div>
          {isLoading ? (
            <div className="h-40 bg-slate-800 rounded-xl animate-pulse" />
          ) : trend.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-slate-600 text-sm">No payroll trend data available</div>
          ) : (
            <PayrollSparkline data={trend} />
          )}
        </div>

        {/* Announcements */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-white">📢 Announcements</h3>
            <a href="/dashboard/announcements" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View all →</a>
          </div>
          {isLoading ? (
            <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="animate-pulse space-y-2"><div className="h-4 bg-slate-800 rounded w-3/4" /><div className="h-3 bg-slate-800 rounded" /></div>)}</div>
          ) : announcements.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-4">No announcements yet.</p>
          ) : (
            <div className="space-y-4">
              {announcements.map(a => (
                <div key={a.id} className="pb-4 border-b border-slate-800 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[a.priority] || 'bg-slate-400'}`} />
                    {a.isPinned && <span className="text-xs text-amber-400">📌</span>}
                    <p className="text-sm font-medium text-white truncate">{a.title}</p>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 pl-4">{a.body}</p>
                  <p className="text-xs text-slate-700 mt-1 pl-4">{new Date(a.publishedAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">🕐 Recent Activity</h3>
          <a href="/dashboard/audit" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Full audit log →</a>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse flex gap-4"><div className="w-8 h-8 bg-slate-800 rounded-full" /><div className="flex-1 space-y-2"><div className="h-4 bg-slate-800 rounded w-3/4" /><div className="h-3 bg-slate-800 rounded w-1/2" /></div></div>)}</div>
        ) : activity.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">No activity logged yet.</p>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {activity.map((item, idx) => (
              <div key={item.id ?? idx} className="px-6 py-3 flex items-start gap-4 hover:bg-slate-800/20 transition-colors">
                <div className={`w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm flex-shrink-0 font-bold ${ACTION_COLOR[item.action] || 'text-slate-400'}`}>
                  {ACTION_ICON[item.action] || '•'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white leading-snug">{item.details}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-600">{item.performedBy}</span>
                    <span className="text-xs text-slate-700">·</span>
                    <span className="text-xs text-slate-700">{item.entityType}</span>
                  </div>
                </div>
                {item.createdAt && (
                  <span className="text-xs text-slate-700 flex-shrink-0 whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
