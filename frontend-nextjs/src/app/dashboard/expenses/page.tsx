'use client';

import React, { useEffect, useState } from 'react';
import {
  getExpenses, getExpenseSummary, approveExpense, rejectExpense,
  type Expense,
} from '@/lib/api';

const CATEGORY_ICON: Record<string, string> = {
  TRAVEL: '✈️', MEALS: '🍽️', ACCOMMODATION: '🏨', EQUIPMENT: '💻',
  SOFTWARE: '📦', TRAINING: '🎓', MARKETING: '📣', OTHER: '📎',
};

const STATUS_CONFIG = {
  PENDING:    { color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',    label: 'Pending' },
  APPROVED:   { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20',label: 'Approved' },
  REJECTED:   { color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20',      label: 'Rejected' },
  REIMBURSED: { color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',      label: 'Reimbursed' },
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([getExpenses(), getExpenseSummary()])
      .then(([e, s]) => { setExpenses(e); setSummary(s); })
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleApprove = async (id: number) => {
    setActionId(id);
    try {
      const updated = await approveExpense(id);
      setExpenses(prev => prev.map(e => e.id === id ? updated : e));
    } catch (e: unknown) { alert((e as Error).message); }
    finally { setActionId(null); }
  };

  const handleReject = async (id: number) => {
    setActionId(id);
    try {
      const updated = await rejectExpense(id, 'Does not meet policy requirements.');
      setExpenses(prev => prev.map(e => e.id === id ? updated : e));
    } catch (e: unknown) { alert((e as Error).message); }
    finally { setActionId(null); }
  };

  const fmt = (n: number) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Expense Management</h2>
        <p className="text-slate-400">Review and approve employee expense claims across all departments.</p>
      </div>

      {error && <div className="px-5 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">⚠️ {error}</div>}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Claims',         value: String(summary.total ?? '—'),               color: 'text-white' },
          { label: 'Pending Approval',     value: String(summary.pending ?? '—'),              color: 'text-amber-400' },
          { label: 'Pending Amount',       value: summary.totalPendingAmount ? fmt(Number(summary.totalPendingAmount)) : '—', color: 'text-amber-400' },
          { label: 'Approved & Reimbursed',value: summary.totalApprovedAmount ? fmt(Number(summary.totalApprovedAmount)) : '—', color: 'text-emerald-400' },
        ].map(card => (
          <div key={card.label} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-5">
            <p className="text-xs text-slate-500 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{isLoading ? '—' : card.value}</p>
          </div>
        ))}
      </div>

      {/* Expense Table */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">All Expense Claims</h3>
          <span className="text-xs text-slate-500">{expenses.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Employee', 'Category', 'Description', 'Amount', 'Date', 'Status', 'Actions'].map(h => (
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
              )) : expenses.map(expense => {
                const sc = STATUS_CONFIG[expense.status] || STATUS_CONFIG.PENDING;
                return (
                  <tr key={expense.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">{expense.employeeName}</p>
                        <p className="text-xs text-slate-500">{expense.department}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2 text-sm text-slate-300">
                        <span>{CATEGORY_ICON[expense.category] || '📎'}</span>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-slate-300 truncate" title={expense.description}>{expense.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-white">{fmt(expense.amount)}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${sc.bg} ${sc.color}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {expense.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(expense.id)}
                            disabled={actionId === expense.id}
                            className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs transition-colors disabled:opacity-50"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleReject(expense.id)}
                            disabled={actionId === expense.id}
                            className="px-3 py-1 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 text-rose-400 rounded-lg text-xs transition-colors disabled:opacity-50"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      )}
                      {expense.status !== 'PENDING' && (
                        <div>
                          <p className="text-xs text-slate-500">By: {expense.reviewedBy || '—'}</p>
                          {expense.managerNotes && <p className="text-xs text-slate-600 mt-0.5 italic truncate max-w-[120px]" title={expense.managerNotes}>{expense.managerNotes}</p>}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
