'use client';

import React, { useEffect, useState } from 'react';

interface GoalItem {
  id: number;
  employeeName: string;
  department: string;
  title: string;
  description: string;
  category: string;
  progress: number;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  targetDate: string;
  quarter: string;
}

const API = 'http://localhost:8080/api/v1';
const hdrs = () => {
  const tok = typeof window !== 'undefined' ? localStorage.getItem('erp_token') : null;
  return { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) };
};

const CAT_ICON: Record<string, string> = {
  PERFORMANCE: '📊', LEARNING: '🎓', LEADERSHIP: '👑', DELIVERY: '🚀', INNOVATION: '💡',
};

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; ringColor: string }> = {
  ACTIVE:    { label: 'Active',    color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',       ringColor: '#6366f1' },
  COMPLETED: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', ringColor: '#10b981' },
  PAUSED:    { label: 'Paused',    color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',     ringColor: '#f59e0b' },
  CANCELLED: { label: 'Cancelled', color: 'text-slate-400',   bg: 'bg-slate-500/10 border-slate-500/20',     ringColor: '#475569' },
};

function CircularProgress({ pct, color }: { pct: number; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="flex-shrink-0">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#1e293b" strokeWidth="6" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 36 36)" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill="white">{pct}%</text>
    </svg>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<string>('ALL');
  const [form, setForm] = useState({
    employeeId: '1', title: '', description: '',
    category: 'PERFORMANCE', targetDate: '', quarter: 'Q3 2026', progress: '0',
  });

  useEffect(() => {
    fetch(`${API}/goals`, { headers: hdrs() })
      .then(r => r.json()).then(setGoals).catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/goals`, {
        method: 'POST', headers: hdrs(),
        body: JSON.stringify({
          employeeId: Number(form.employeeId),
          title: form.title, description: form.description,
          category: form.category, targetDate: form.targetDate,
          quarter: form.quarter, progress: Number(form.progress),
        }),
      });
      const created = await res.json();
      setGoals(g => [created, ...g]);
      setShowCreate(false);
      setForm({ employeeId: '1', title: '', description: '', category: 'PERFORMANCE', targetDate: '', quarter: 'Q3 2026', progress: '0' });
    } catch (e: unknown) { alert((e as Error).message); }
    finally { setSaving(false); }
  };

  const handleProgressUpdate = async (id: number, progress: number) => {
    try {
      const res = await fetch(`${API}/goals/${id}/progress`, {
        method: 'PUT', headers: hdrs(), body: JSON.stringify({ progress }),
      });
      const updated = await res.json();
      setGoals(g => g.map(x => x.id === id ? updated : x));
    } catch (e: unknown) { alert((e as Error).message); }
  };

  const filtered = filter === 'ALL' ? goals : goals.filter(g => g.status === filter);
  const avgProgress = goals.length ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;
  const completed   = goals.filter(g => g.status === 'COMPLETED').length;
  const active      = goals.filter(g => g.status === 'ACTIVE').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Goals & OKR Tracking</h2>
          <p className="text-slate-400">Set, track, and achieve employee objectives and key results.</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)]">
          + New Goal
        </button>
      </div>

      {error && <div className="px-5 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">⚠️ {error}</div>}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Goals',    value: goals.length,      color: 'text-white' },
          { label: 'Active',         value: active,            color: 'text-blue-400' },
          { label: 'Completed',      value: completed,         color: 'text-emerald-400' },
          { label: 'Avg. Progress',  value: `${avgProgress}%`, color: 'text-indigo-400' },
        ].map(c => (
          <div key={c.label} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-5">
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className={`text-2xl font-bold ${c.color}`}>{loading ? '—' : c.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filter === f ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white'
            }`}>
            {f === 'ALL' ? 'All Goals' : STATUS_CFG[f]?.label}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 animate-pulse space-y-4">
            <div className="h-5 bg-slate-800 rounded w-3/4" />
            <div className="h-16 bg-slate-800 rounded" />
          </div>
        )) : filtered.map(goal => {
          const cfg = STATUS_CFG[goal.status] || STATUS_CFG.ACTIVE;
          return (
            <div key={goal.id} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 hover:border-slate-700 transition-all group">
              <div className="flex items-start gap-4">
                <CircularProgress pct={goal.progress} color={cfg.ringColor} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <span>{CAT_ICON[goal.category] || '🎯'}</span>
                    <h3 className="text-sm font-semibold text-white leading-tight">{goal.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500">{goal.employeeName}</p>
                  {goal.department && <p className="text-xs text-slate-600">{goal.department}</p>}
                </div>
              </div>

              {goal.description && <p className="text-xs text-slate-400 mt-3 mb-3 line-clamp-2">{goal.description}</p>}

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  {goal.quarter && <span className="text-xs text-slate-600">{goal.quarter}</span>}
                </div>
                {goal.targetDate && (
                  <span className="text-xs text-slate-600">{new Date(goal.targetDate).toLocaleDateString()}</span>
                )}
              </div>

              {/* Progress slider */}
              {goal.status === 'ACTIVE' && (
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <label className="text-xs text-slate-600 block mb-1.5">Update Progress</label>
                  <input type="range" min="0" max="100" defaultValue={goal.progress}
                    className="w-full accent-indigo-500"
                    onMouseUp={e => handleProgressUpdate(goal.id, Number((e.target as HTMLInputElement).value))}
                    onTouchEnd={e => handleProgressUpdate(goal.id, Number((e.target as HTMLInputElement).value))} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">New Goal</h3>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1.5">Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Employee ID</label>
                  <input type="number" value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                    {['PERFORMANCE','LEARNING','LEADERSHIP','DELIVERY','INNOVATION'].map(c => (
                      <option key={c} value={c}>{CAT_ICON[c]} {c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Target Date</label>
                  <input type="date" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Quarter</label>
                  <select value={form.quarter} onChange={e => setForm(f => ({ ...f, quarter: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                    {['Q1 2026','Q2 2026','Q3 2026','Q4 2026','Q1 2027'].map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Initial Progress (%)</label>
                  <input type="number" min="0" max="100" value={form.progress} onChange={e => setForm(f => ({ ...f, progress: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.title}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-colors">
                {saving ? 'Creating...' : 'Create Goal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
