'use client';

import React, { useEffect, useState } from 'react';
import { getAllPayrolls, markPayrollPaid, type PayrollRecord } from '@/lib/api';

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  PROCESSED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PAID:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

function formatMoney(v: number | undefined | null) {
  if (v == null) return '—';
  return `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPeriod(start: string, end: string) {
  const s = new Date(start); const e = new Date(end);
  return `${s.toLocaleString('default', { month: 'short' })} ${s.getFullYear()}`;
}

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    getAllPayrolls()
      .then(setPayrolls)
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleMarkPaid = async (id: number) => {
    setPaying(id);
    try {
      const updated = await markPayrollPaid(id);
      setPayrolls(prev => prev.map(p => p.id === id ? updated : p));
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setPaying(null);
    }
  };

  const filtered = payrolls.filter(p => {
    const matchesSearch = (p.employeeName || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.department || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalGross = payrolls.reduce((s, p) => s + (p.grossSalary || 0), 0);
  const totalNet = payrolls.reduce((s, p) => s + (p.netSalary || 0), 0);
  const pendingCount = payrolls.filter(p => p.status === 'PENDING' || p.status === 'PROCESSED').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Payroll Management</h2>
          <p className="text-slate-400">Process payslips, track salary runs, and manage disbursements.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-1">Next payroll run</p>
          <p className="text-sm font-semibold text-indigo-400">
            {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full" />
          <p className="text-slate-400 text-sm mb-2">Total Gross Payroll</p>
          <p className="text-3xl font-bold text-white">{formatMoney(totalGross)}</p>
          <p className="text-xs text-slate-500 mt-1">All periods combined</p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full" />
          <p className="text-slate-400 text-sm mb-2">Total Net Disbursed</p>
          <p className="text-3xl font-bold text-emerald-400">{formatMoney(totalNet)}</p>
          <p className="text-xs text-slate-500 mt-1">After tax & deductions</p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full" />
          <p className="text-slate-400 text-sm mb-2">Pending Action</p>
          <p className="text-3xl font-bold text-amber-400">{pendingCount}</p>
          <p className="text-xs text-slate-500 mt-1">Records awaiting payment</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search employee or department..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 max-w-xs px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
        />
        {(['ALL', 'PENDING', 'PROCESSED', 'PAID'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 text-xs font-medium rounded-lg border transition-all ${
              statusFilter === s
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl overflow-hidden">
        {error && (
          <div className="px-6 py-4 bg-amber-500/10 border-b border-amber-500/20 text-sm text-amber-400">
            ⚠️ {error} — Showing cached data
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Employee', 'Department', 'Period', 'Gross', 'Tax', 'Net Salary', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-500">No payroll records found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-white">{p.employeeName}</p>
                    <p className="text-xs text-slate-500">{p.jobTitle}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">{p.department}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{formatPeriod(p.payPeriodStart, p.payPeriodEnd)}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{formatMoney(p.grossSalary)}</td>
                  <td className="px-6 py-4 text-sm text-rose-400/80">{formatMoney(p.taxDeduction)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-emerald-400">{formatMoney(p.netSalary)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {p.status === 'PROCESSED' ? (
                      <button
                        onClick={() => handleMarkPaid(p.id)}
                        disabled={paying === p.id}
                        className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-medium hover:bg-emerald-600/30 transition-colors disabled:opacity-50"
                      >
                        {paying === p.id ? '...' : 'Mark Paid'}
                      </button>
                    ) : (
                      <span className="text-slate-700 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
