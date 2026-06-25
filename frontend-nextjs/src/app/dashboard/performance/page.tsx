'use client';

import React, { useEffect, useState } from 'react';
import {
  getPerformanceReviews, createPerformanceReview, getEmployees,
  type PerformanceReview, type Employee,
} from '@/lib/api';

const RATING_CONFIG = {
  EXCELLENT:        { label: 'Excellent',        color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', bar: 'bg-emerald-500' },
  GOOD:             { label: 'Good',             color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',       bar: 'bg-blue-500' },
  SATISFACTORY:     { label: 'Satisfactory',     color: 'text-indigo-400',  bg: 'bg-indigo-500/10 border-indigo-500/20',  bar: 'bg-indigo-500' },
  NEEDS_IMPROVEMENT:{ label: 'Needs Improvement',color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',    bar: 'bg-amber-500' },
  UNSATISFACTORY:   { label: 'Unsatisfactory',   color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20',      bar: 'bg-rose-500' },
};

const RATINGS = Object.keys(RATING_CONFIG);

export default function PerformancePage() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [form, setForm] = useState({
    employeeId: '',
    reviewPeriod: 'Q2 2026',
    score: '80',
    rating: 'GOOD',
    goals: '',
    comments: '',
    reviewedBy: 'admin@erp.com',
  });

  useEffect(() => {
    Promise.all([getPerformanceReviews(), getEmployees()])
      .then(([r, e]) => { setReviews(r); setEmployees(e); })
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const avgScore = reviews.length
    ? Math.round(reviews.reduce((s, r) => s + r.score, 0) / reviews.length)
    : 0;

  const handleSubmit = async () => {
    if (!form.employeeId) return;
    setSaving(true);
    try {
      const created = await createPerformanceReview({
        employeeId: Number(form.employeeId),
        reviewPeriod: form.reviewPeriod,
        reviewDate: new Date().toISOString().split('T')[0],
        score: Number(form.score),
        rating: form.rating as PerformanceReview['rating'],
        goals: form.goals,
        comments: form.comments,
        reviewedBy: form.reviewedBy,
      });
      setReviews(prev => [created, ...prev]);
      setShowModal(false);
    } catch (e: unknown) { alert((e as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Performance Reviews</h2>
          <p className="text-slate-400">Track quarterly and annual employee performance assessments.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)]"
        >
          + New Review
        </button>
      </div>

      {error && <div className="px-5 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">⚠️ {error}</div>}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reviews',  value: reviews.length,                                                        color: 'text-white' },
          { label: 'Average Score',  value: avgScore ? `${avgScore}/100` : '—',                                   color: 'text-indigo-400' },
          { label: 'Excellent',      value: reviews.filter(r => r.rating === 'EXCELLENT').length,                 color: 'text-emerald-400' },
          { label: 'Need Attention', value: reviews.filter(r => ['NEEDS_IMPROVEMENT','UNSATISFACTORY'].includes(r.rating)).length, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-5 rounded-2xl">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{isLoading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Reviews Table */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-white">Review History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Employee', 'Period', 'Score', 'Rating', 'Goals', 'Reviewed By', 'Date'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-20" /></td>
                  ))}
                </tr>
              )) : reviews.map(r => {
                const cfg = RATING_CONFIG[r.rating as keyof typeof RATING_CONFIG] || RATING_CONFIG.GOOD;
                return (
                  <tr key={r.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">{r.employeeName}</p>
                        <p className="text-xs text-slate-500">{r.department}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{r.reviewPeriod}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-slate-800 rounded-full h-1.5">
                          <div className={`${cfg.bar} h-1.5 rounded-full`} style={{ width: `${r.score}%` }} />
                        </div>
                        <span className="text-sm font-bold text-white">{r.score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-xs text-slate-400 truncate" title={r.goals}>{r.goals || '—'}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{r.reviewedBy}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {r.reviewDate ? new Date(r.reviewDate).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Review Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">New Performance Review</h3>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Employee *</label>
                  <select
                    value={form.employeeId}
                    onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select employee...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Review Period</label>
                  <input value={form.reviewPeriod} onChange={e => setForm(f => ({ ...f, reviewPeriod: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Score (0–100)</label>
                  <input type="number" min="0" max="100" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Rating</label>
                  <select value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                    {RATINGS.map(r => <option key={r} value={r}>{RATING_CONFIG[r as keyof typeof RATING_CONFIG].label}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Goals & Achievements</label>
                  <textarea value={form.goals} onChange={e => setForm(f => ({ ...f, goals: e.target.value }))} rows={2}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">Comments</label>
                  <textarea value={form.comments} onChange={e => setForm(f => ({ ...f, comments: e.target.value }))} rows={2}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSubmit} disabled={saving || !form.employeeId}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
