'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getEmployees, type Employee } from '@/lib/api';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  useEffect(() => {
    getEmployees()
      .then(setEmployees)
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  // Support both flat EmployeeDTO (departmentName) and legacy nested (department.name)
  const getDeptName = (e: Employee) => e.departmentName || e.department?.name || '';

  const departments = ['ALL', ...Array.from(new Set(employees.map(getDeptName).filter(Boolean)))];

  const filtered = employees.filter(e => {
    const name = `${e.firstName} ${e.lastName}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || (e.jobTitle || '').toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'ALL' || getDeptName(e) === deptFilter;
    return matchSearch && matchDept;
  });

  const activeCount = employees.filter(e => e.isActive).length;

  function getInitials(e: Employee) {
    return `${e.firstName[0]}${e.lastName[0]}`.toUpperCase();
  }

  const AVATAR_COLORS = [
    'from-indigo-500 to-violet-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-cyan-500 to-blue-500',
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Employee Directory</h2>
          <p className="text-slate-400">{activeCount} active employees across {departments.length - 1} departments.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)]">
          + Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search name or role..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64 px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
        />
        <div className="flex gap-2 flex-wrap">
          {departments.map(d => (
            <button
              key={d}
              onClick={() => setDeptFilter(d)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                deptFilter === d
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {d === 'ALL' ? 'All Departments' : d}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="px-5 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">⚠️ {error}</div>
      )}

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-800" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-28" />
                  <div className="h-3 bg-slate-800 rounded w-20" />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-3 text-center py-16 text-slate-500">No employees found.</div>
        ) : filtered.map((emp, idx) => (
          <Link key={emp.id} href={`/dashboard/employees/${emp.id}`}>
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 hover:border-indigo-500/30 hover:bg-slate-900/60 transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0`}>
                  {getInitials(emp)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                    {emp.firstName} {emp.lastName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{emp.jobTitle}</p>
                </div>
                <span className={`ml-auto flex-shrink-0 w-2 h-2 rounded-full ${emp.isActive ? 'bg-emerald-500' : 'bg-slate-600'}`} title={emp.isActive ? 'Active' : 'Inactive'} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Department</span>
                  <span className="text-slate-300 font-medium">{getDeptName(emp) || '—'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Annual Salary</span>
                  <span className="text-emerald-400 font-semibold">
                    ${Number(emp.salary).toLocaleString()}
                  </span>
                </div>
                {emp.hireDate && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Joined</span>
                    <span className="text-slate-400">{new Date(emp.hireDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-xs text-slate-600">View full profile →</span>
                <svg className="w-4 h-4 text-slate-700 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
