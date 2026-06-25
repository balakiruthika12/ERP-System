'use client';

import React, { useEffect, useState } from 'react';

interface OrgEmployee {
  id: number;
  firstName: string;
  lastName: string;
  jobTitle: string;
  departmentName: string;
  active: boolean;
}

interface OrgDepartment {
  id: number;
  name: string;
  description: string;
}

const API = 'http://localhost:8080/api/v1';
const hdrs = () => {
  const tok = typeof window !== 'undefined' ? localStorage.getItem('erp_token') : null;
  return { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) };
};

const DEPT_COLORS: string[] = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6',
];

function initials(fn: string, ln: string) {
  return `${fn.charAt(0)}${ln.charAt(0)}`.toUpperCase();
}

interface DeptGroup {
  dept: OrgDepartment;
  employees: OrgEmployee[];
  color: string;
}

export default function OrgChartPage() {
  const [employees, setEmployees] = useState<OrgEmployee[]>([]);
  const [departments, setDepartments] = useState<OrgDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<OrgEmployee | null>(null);
  const [view, setView] = useState<'chart' | 'list'>('chart');

  useEffect(() => {
    Promise.all([
      fetch(`${API}/employees`, { headers: hdrs() }).then(r => r.json()),
      fetch(`${API}/departments`, { headers: hdrs() }).then(r => r.json()),
    ])
      .then(([emps, depts]) => {
        setEmployees(emps.filter ? emps.filter((e: OrgEmployee) => e.active !== false) : emps);
        setDepartments(Array.isArray(depts) ? depts : (depts.content || []));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Group employees by department
  const groups: DeptGroup[] = departments.map((dept, i) => ({
    dept,
    employees: employees.filter(e => e.departmentName === dept.name || (e as unknown as Record<string, unknown>).department === dept.name),
    color: DEPT_COLORS[i % DEPT_COLORS.length],
  }));

  // Also capture employees with no department
  const unassigned = employees.filter(e => !departments.some(d => d.name === e.departmentName || d.name === (e as unknown as Record<string, unknown>).department));

  const totalActive = employees.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">🏢 Organization Chart</h2>
          <p className="text-slate-400">Visual company hierarchy — {totalActive} active employees across {departments.length} departments.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('chart')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'chart' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            Chart View
          </button>
          <button onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'list' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            List View
          </button>
        </div>
      </div>

      {error && <div className="px-5 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">⚠️ {error}</div>}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 animate-pulse space-y-3">
              <div className="w-12 h-12 bg-slate-800 rounded-full mx-auto" />
              <div className="h-3 bg-slate-800 rounded w-3/4 mx-auto" />
              <div className="h-3 bg-slate-800 rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      ) : view === 'chart' ? (
        <div className="space-y-8">
          {/* Company root node */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-indigo-900/60 to-violet-900/60 border border-indigo-500/30 rounded-2xl px-8 py-4 text-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold text-white mx-auto mb-2">EC</div>
              <p className="text-white font-semibold text-sm">Enterprise Corp</p>
              <p className="text-indigo-300 text-xs">{totalActive} Employees · {departments.length} Departments</p>
            </div>
          </div>

          {/* Connector line */}
          <div className="flex justify-center">
            <div className="w-px h-6 bg-slate-700" />
          </div>

          {/* Department columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {groups.filter(g => g.employees.length > 0).map(group => (
              <div key={group.dept.id} className="flex flex-col">
                {/* Department header */}
                <div className="rounded-xl px-4 py-3 mb-3 text-center border"
                  style={{ borderColor: group.color + '40', backgroundColor: group.color + '15' }}>
                  <p className="text-sm font-semibold" style={{ color: group.color }}>{group.dept.name}</p>
                  <p className="text-xs text-slate-500">{group.employees.length} member{group.employees.length !== 1 ? 's' : ''}</p>
                </div>

                {/* Employee cards */}
                <div className="space-y-2 flex-1">
                  {group.employees.map(emp => (
                    <button key={emp.id}
                      onClick={() => setSelected(selected?.id === emp.id ? null : emp)}
                      className={`w-full rounded-xl px-3 py-2.5 border text-left transition-all hover:scale-[1.01] ${
                        selected?.id === emp.id
                          ? 'border-current bg-current/20 shadow-sm'
                          : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                      }`}
                      style={selected?.id === emp.id ? { borderColor: group.color + '80', backgroundColor: group.color + '15' } : {}}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: group.color }}>
                          {initials(emp.firstName, emp.lastName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{emp.firstName} {emp.lastName}</p>
                          <p className="text-xs text-slate-500 truncate">{emp.jobTitle}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Selected employee detail */}
          {selected && (
            <div className="bg-slate-900/60 backdrop-blur-md border border-indigo-500/20 rounded-2xl p-6 max-w-sm mx-auto text-center shadow-[0_0_30px_rgba(99,102,241,0.1)]">
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold text-white mx-auto mb-3">
                {initials(selected.firstName, selected.lastName)}
              </div>
              <h3 className="text-lg font-bold text-white">{selected.firstName} {selected.lastName}</h3>
              <p className="text-indigo-400 text-sm font-medium mt-1">{selected.jobTitle}</p>
              <p className="text-slate-500 text-xs mt-1">{selected.departmentName}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-emerald-400">Active</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List view */
        <div className="space-y-6">
          {groups.filter(g => g.employees.length > 0).map(group => (
            <div key={group.dept.id} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3"
                style={{ borderLeftColor: group.color, borderLeftWidth: 4 }}>
                <h3 className="text-sm font-semibold text-white">{group.dept.name}</h3>
                <span className="text-xs text-slate-500">{group.employees.length} members</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-800/20">
                {group.employees.map(emp => (
                  <div key={emp.id} className="bg-slate-900/60 px-5 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: group.color }}>
                      {initials(emp.firstName, emp.lastName)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-slate-500">{emp.jobTitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
