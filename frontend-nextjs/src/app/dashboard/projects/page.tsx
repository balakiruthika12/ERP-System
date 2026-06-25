'use client';

import React, { useEffect, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectTask {
  id: number;
  title: string;
  description: string;
  assigneeName: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueDate: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  dueDate: string;
  budget: number;
  leadEmployeeName: string;
  tasks: ProjectTask[];
  taskCount: number;
  completedTaskCount: number;
}

const API = 'http://localhost:8080/api/v1';
const hdrs = () => {
  const tok = typeof window !== 'undefined' ? localStorage.getItem('erp_token') : null;
  return { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) };
};

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  PLANNING:    { label: 'Planning',    color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',       dot: 'bg-blue-400' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',     dot: 'bg-amber-400' },
  ON_HOLD:     { label: 'On Hold',     color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/20',   dot: 'bg-orange-400' },
  COMPLETED:   { label: 'Completed',   color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
  CANCELLED:   { label: 'Cancelled',   color: 'text-slate-400',   bg: 'bg-slate-500/10 border-slate-500/20',     dot: 'bg-slate-400' },
};

const TASK_STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  TODO:        { label: 'To Do',       color: 'text-slate-400',   bg: 'bg-slate-700/40' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-amber-400',   bg: 'bg-amber-500/10' },
  IN_REVIEW:   { label: 'In Review',   color: 'text-violet-400',  bg: 'bg-violet-500/10' },
  DONE:        { label: 'Done',        color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  BLOCKED:     { label: 'Blocked',     color: 'text-rose-400',    bg: 'bg-rose-500/10' },
};

const PRIORITY_COLOR: Record<string, string> = {
  LOW: 'text-slate-400', MEDIUM: 'text-blue-400', HIGH: 'text-amber-400', CRITICAL: 'text-rose-400',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Project | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', status: 'PLANNING', dueDate: '', budget: '' });

  useEffect(() => {
    fetch(`${API}/projects`, { headers: hdrs() })
      .then(r => r.json()).then(setProjects).catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/projects`, {
        method: 'POST', headers: hdrs(),
        body: JSON.stringify({ name: form.name, description: form.description, status: form.status, dueDate: form.dueDate, budget: Number(form.budget) }),
      });
      const created = await res.json();
      setProjects(p => [created, ...p]);
      setShowCreate(false);
      setForm({ name: '', description: '', status: 'PLANNING', dueDate: '', budget: '' });
    } catch (e: unknown) { alert((e as Error).message); }
    finally { setSaving(false); }
  };

  const totalBudget    = projects.reduce((s, p) => s + (p.budget || 0), 0);
  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
  const completedTasks = projects.reduce((s, p) => s + p.completedTaskCount, 0);
  const totalTasks     = projects.reduce((s, p) => s + p.taskCount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Project Management</h2>
          <p className="text-slate-400">Track projects, tasks, assignees, and delivery timelines.</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)]">
          + New Project
        </button>
      </div>

      {error && <div className="px-5 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">⚠️ {error}</div>}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects',  value: projects.length,                                     color: 'text-white' },
          { label: 'Active',          value: activeProjects,                                       color: 'text-amber-400' },
          { label: 'Tasks Completed', value: `${completedTasks}/${totalTasks}`,                    color: 'text-emerald-400' },
          { label: 'Total Budget',    value: `$${totalBudget.toLocaleString()}`,                   color: 'text-indigo-400' },
        ].map(c => (
          <div key={c.label} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-5">
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className={`text-2xl font-bold ${c.color}`}>{loading ? '—' : c.value}</p>
          </div>
        ))}
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 animate-pulse space-y-4">
            <div className="h-5 bg-slate-800 rounded w-3/4" />
            <div className="h-20 bg-slate-800 rounded" />
          </div>
        )) : projects.map(project => {
          const cfg = STATUS_CFG[project.status] || STATUS_CFG.PLANNING;
          const pct = project.taskCount > 0 ? Math.round((project.completedTaskCount / project.taskCount) * 100) : 0;
          const isSelected = selected?.id === project.id;

          return (
            <div key={project.id}
              className={`bg-slate-900/40 backdrop-blur-md border rounded-2xl p-6 cursor-pointer transition-all hover:border-slate-600 ${isSelected ? 'border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]' : 'border-slate-800/60'}`}
              onClick={() => setSelected(isSelected ? null : project)}>
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <h3 className="text-base font-semibold text-white truncate">{project.name}</h3>
                  </div>
                  {project.leadEmployeeName && (
                    <p className="text-xs text-slate-500 ml-4">Lead: {project.leadEmployeeName}</p>
                  )}
                </div>
                <span className={`ml-3 inline-flex px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                  {cfg.label}
                </span>
              </div>

              {project.description && (
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{project.description}</p>
              )}

              {/* Progress bar */}
              {project.taskCount > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-slate-300 font-medium">{pct}% ({project.completedTaskCount}/{project.taskCount} tasks)</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-4 text-xs text-slate-600">
                {project.dueDate && <span>Due: <span className="text-slate-400">{new Date(project.dueDate).toLocaleDateString()}</span></span>}
                {project.budget && <span>Budget: <span className="text-slate-400">${Number(project.budget).toLocaleString()}</span></span>}
              </div>

              {/* Tasks (expanded when selected) */}
              {isSelected && project.tasks?.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-800 space-y-2" onClick={e => e.stopPropagation()}>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Tasks</p>
                  {project.tasks.map(task => {
                    const tc = TASK_STATUS_CFG[task.status] || TASK_STATUS_CFG.TODO;
                    return (
                      <div key={task.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${tc.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_COLOR[task.priority]?.replace('text-', 'bg-') || 'bg-slate-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${task.status === 'DONE' ? 'line-through text-slate-500' : 'text-white'}`}>{task.title}</p>
                          {task.assigneeName && <p className="text-xs text-slate-600">{task.assigneeName}</p>}
                        </div>
                        <span className={`text-xs ${tc.color}`}>{tc.label}</span>
                      </div>
                    );
                  })}
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
              <h3 className="text-base font-semibold text-white">New Project</h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Project Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                    {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1.5">Budget ($)</label>
                  <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.name}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-colors">
                {saving ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
