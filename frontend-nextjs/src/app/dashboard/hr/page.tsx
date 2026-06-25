'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getEmployees, type Employee } from '@/lib/api';

const AVATAR_COLORS = [
  'from-indigo-500 to-violet-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-blue-500',
];

export default function HRMSPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getEmployees()
      .then(setEmployees)
      .catch(() => {
        // Fallback to mock data if backend is unreachable
        setEmployees([
          { id: 1, firstName: 'Alice',  lastName: 'Chen',     jobTitle: 'VP of Engineering',      salary: 145000, isActive: true,  hireDate: '2020-03-01', department: { id: 1, name: 'Engineering' } },
          { id: 2, firstName: 'Marcus', lastName: 'Johnson',  jobTitle: 'Senior Product Manager',  salary: 125000, isActive: true,  hireDate: '2021-06-15', department: { id: 4, name: 'Product' } },
          { id: 3, firstName: 'Sarah',  lastName: 'Williams', jobTitle: 'HR Director',             salary: 115000, isActive: true,  hireDate: '2019-08-20', department: { id: 2, name: 'Human Resources' } },
          { id: 4, firstName: 'David',  lastName: 'Kim',      jobTitle: 'Financial Controller',    salary: 130000, isActive: false, hireDate: '2022-01-10', department: { id: 3, name: 'Finance' } },
          { id: 5, firstName: 'Emma',   lastName: 'Watson',   jobTitle: 'Lead Designer',           salary: 110000, isActive: true,  hireDate: '2021-09-05', department: { id: 5, name: 'Design' } },
        ] as Employee[]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = employees.filter(e => {
    const name = `${e.firstName} ${e.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase()) || (e.jobTitle || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Human Resources</h2>
          <p className="text-slate-400">Manage workforce, track performance, and analyze attrition risks.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors">
            View Org Chart
          </button>
          <Link href="/dashboard/employees">
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              Full Directory →
            </button>
          </Link>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-indigo-900/20 border border-indigo-500/20 p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-white">AI Attrition Warning</h4>
            <p className="text-xs text-indigo-300">Engineering department showing 12% higher turnover risk this quarter. Recommend reviewing compensation.</p>
          </div>
        </div>
        <Link href="/dashboard/ai">
          <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex-shrink-0 ml-6">View Analysis &rarr;</button>
        </Link>
      </div>

      {/* Employee Directory Table */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">
            Employee Directory
            <span className="ml-2 text-sm font-normal text-slate-500">({filtered.length} employees)</span>
          </h3>
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64 px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Employee</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Department</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-24" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.map((emp, idx) => {
              const initials = `${emp.firstName[0]}${emp.lastName[0]}`.toUpperCase();
              const isActive = emp.isActive;
              return (
                // Gap 4 fix: entire row is now clickable, links to /dashboard/employees/{id}
                <tr
                  key={emp.id}
                  onClick={() => router.push(`/dashboard/employees/${emp.id}`)}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-xs font-bold text-white shadow-md flex-shrink-0`}>
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-xs text-slate-500">EMP-{1000 + emp.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{emp.jobTitle}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{emp.department?.name || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      {isActive ? 'Active' : 'On Leave'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/employees/${emp.id}`}
                      onClick={e => e.stopPropagation()}
                      className="text-xs text-slate-500 hover:text-indigo-400 transition-colors font-medium group-hover:text-indigo-400"
                    >
                      View Profile →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
