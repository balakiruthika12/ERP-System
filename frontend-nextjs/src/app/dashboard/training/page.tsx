'use client';

import React, { useEffect, useState } from 'react';
import { getTrainings, createTraining, type Training } from '@/lib/api';

const STATUS_CONFIG = {
  UPCOMING:    { label: 'Upcoming',    color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',       dot: 'bg-blue-400' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',     dot: 'bg-amber-400' },
  COMPLETED:   { label: 'Completed',   color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
  CANCELLED:   { label: 'Cancelled',   color: 'text-slate-400',   bg: 'bg-slate-500/10 border-slate-500/20',     dot: 'bg-slate-400' },
};

export default function TrainingPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', provider: '', description: '',
    durationDays: '3', startDate: '', endDate: '', cost: '', status: 'UPCOMING',
  });

  useEffect(() => {
    getTrainings()
      .then(setTrainings)
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const created = await createTraining({
        title: form.title,
        provider: form.provider,
        description: form.description,
        durationDays: Number(form.durationDays),
        startDate: form.startDate,
        endDate: form.endDate,
        cost: Number(form.cost),
        status: form.status as Training['status'],
      });
      setTrainings(prev => [created, ...prev]);
      setShowModal(false);
      setForm({ title: '', provider: '', description: '', durationDays: '3', startDate: '', endDate: '', cost: '', status: 'UPCOMING' });
    } catch (e: unknown) { alert((e as Error).message); }
    finally { setSaving(false); }
  };

  const totalCost = trainings.reduce((s, t) => s + (t.cost || 0), 0);
  const upcoming  = trainings.filter(t => t.status === 'UPCOMING').length;
  const completed = trainings.filter(t => t.status === 'COMPLETED').length;
  const totalEnrolled = trainings.reduce((s, t) => s + t.enrolledCount, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Training & Development</h2>
          <p className="text-slate-400">Manage employee learning programs, certifications, and skill development.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)]">
          + New Program
        </button>
      </div>

      {error && <div className="px-5 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">⚠️ {error}</div>}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Programs',   value: trainings.length, color: 'text-white' },
          { label: 'Upcoming',         value: upcoming,          color: 'text-blue-400' },
          { label: 'Completed',        value: completed,         color: 'text-emerald-400' },
          { label: 'Total Enrolled',   value: totalEnrolled,     color: 'text-indigo-400' },
        ].map(card => (
          <div key={card.label} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-5">
            <p className="text-xs text-slate-500 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{isLoading ? '—' : card.value}</p>
          </div>
        ))}
      </div>

      {/* Total Training Spend */}
      {!isLoading && (
        <div className="bg-gradient-to-r from-indigo-900/30 to-violet-900/30 border border-indigo-500/20 rounded-2xl px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-indigo-400 font-medium">Total Training Investment</p>
            <p className="text-2xl font-bold text-white mt-1">${totalCost.toLocaleString()}</p>
          </div>
          <span className="text-4xl">🎓</span>
        </div>
      )}

      {/* Training Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 animate-pulse space-y-3">
            <div className="h-5 bg-slate-800 rounded w-3/4" />
            <div className="h-4 bg-slate-800 rounded w-1/2" />
            <div className="h-16 bg-slate-800 rounded" />
          </div>
        )) : trainings.map(t => {
          const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.UPCOMING;
          return (
            <div key={t.id} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 hover:border-slate-700 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">{t.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t.provider}</p>
                </div>
                <span className={`ml-2 inline-flex px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                  {cfg.label}
                </span>
              </div>

              {t.description && <p className="text-sm text-slate-400 mb-4 line-clamp-2">{t.description}</p>}

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-slate-600">Duration</p>
                  <p className="text-sm text-slate-300">{t.durationDays} day{t.durationDays !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Cost</p>
                  <p className="text-sm text-slate-300">${(t.cost || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Start Date</p>
                  <p className="text-sm text-slate-300">{t.startDate ? new Date(t.startDate).toLocaleDateString() : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Enrolled</p>
                  <p className="text-sm text-slate-300">{t.enrolledCount} employee{t.enrolledCount !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {t.enrolledEmployeeNames?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-600 mb-2">Participants</p>
                  <div className="flex flex-wrap gap-1.5">
                    {t.enrolledEmployeeNames.slice(0, 4).map(name => (
                      <span key={name} className="px-2 py-0.5 bg-slate-800 text-xs text-slate-300 rounded-full">{name.split(' ')[0]}</span>
                    ))}
                    {t.enrolledEmployeeNames.length > 4 && (
                      <span className="px-2 py-0.5 bg-slate-800 text-xs text-slate-400 rounded-full">+{t.enrolledEmployeeNames.length - 4}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">New Training Program</h3>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1.5">Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Provider</label>
                  <input value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Duration (days)</label>
                  <input type="number" value={form.durationDays} onChange={e => setForm(f => ({ ...f, durationDays: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Cost ($)</label>
                  <input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                    <option value="UPCOMING">Upcoming</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.title}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-colors">
                {saving ? 'Creating...' : 'Create Program'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
