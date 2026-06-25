'use client';

import React, { useEffect, useState } from 'react';
import { getCombinedReport, downloadPayrollCsv, downloadEmployeesCsv, type CombinedReport } from '@/lib/api';

function fmt(n: number | undefined | null) {
  if (n == null) return '—';
  return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const LEAVE_TYPE_EMOJI: Record<string, string> = {
  ANNUAL: '🌴', SICK: '🤒', WORK_FROM_HOME: '🏠',
  MATERNITY: '👶', PATERNITY: '👨‍👦', UNPAID: '⚠️',
};

const STATUS_COLORS: Record<string, string> = {
  PAID:      'bg-emerald-500',
  PROCESSED: 'bg-blue-500',
  PENDING:   'bg-amber-500',
  APPROVED:  'bg-emerald-500',
  REJECTED:  'bg-rose-500',
};

export default function ReportsPage() {
  const [report, setReport] = useState<CombinedReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCombinedReport()
      .then(setReport)
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const maxHeadcount = report ? Math.max(...report.headcount.map(h => h.employeeCount), 1) : 1;
  const totalLeaveRequests = report?.leaves.totalRequests || 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Reports & Analytics</h2>
          <p className="text-slate-400">Real-time aggregated data across payroll, headcount, and leave.</p>
        </div>
        <div className="flex items-center gap-3">
          {report && <p className="text-xs text-slate-600">Generated: {new Date(report.generatedAt).toLocaleString()}</p>}
          <button onClick={() => downloadPayrollCsv().catch(alert)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 transition-colors flex items-center gap-2">
            📥 Export Payroll CSV
          </button>
          <button onClick={() => downloadEmployeesCsv().catch(alert)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 transition-colors flex items-center gap-2">
            📥 Export Employees CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="px-5 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">⚠️ {error} — backend may be offline</div>
      )}

      {/* Payroll Summary KPIs */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">💰 Payroll Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Gross',     value: fmt(report?.payroll.totalGross),         sub: `${report?.payroll.totalRecords || 0} records`, color: 'indigo' },
            { label: 'Total Net Paid',  value: fmt(report?.payroll.totalNet),            sub: `${report?.payroll.paidCount || 0} PAID`,       color: 'emerald' },
            { label: 'Total Tax',       value: fmt(report?.payroll.totalTax),            sub: '25% effective rate',                           color: 'rose' },
            { label: 'Avg Net Salary',  value: fmt(report?.payroll.averageNetSalary),    sub: 'per payslip record',                           color: 'amber' },
          ].map(card => (
            <div key={card.label} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-5 rounded-2xl relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${card.color}-500/10 blur-[40px] rounded-full`} />
              <p className="text-slate-400 text-xs mb-2">{card.label}</p>
              {isLoading
                ? <div className="h-7 bg-slate-800 rounded w-28 animate-pulse" />
                : <p className={`text-2xl font-bold text-${card.color}-400`}>{card.value}</p>}
              <p className="text-xs text-slate-600 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Payroll status bar */}
        {report && (
          <div className="mt-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
            <p className="text-xs text-slate-500 mb-3">Payroll Status Distribution</p>
            <div className="flex gap-2 h-8 rounded-lg overflow-hidden">
              {[
                { label: 'PAID',      count: report.payroll.paidCount,      color: 'bg-emerald-500' },
                { label: 'PROCESSED', count: report.payroll.processedCount, color: 'bg-blue-500' },
                { label: 'PENDING',   count: report.payroll.pendingCount,   color: 'bg-amber-500' },
              ].filter(s => s.count > 0).map(s => (
                <div
                  key={s.label}
                  className={`${s.color} flex items-center justify-center text-white text-xs font-medium transition-all`}
                  style={{ flex: s.count }}
                  title={`${s.label}: ${s.count}`}
                >
                  {s.label} ({s.count})
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Headcount Chart */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">👥 Headcount by Department</h3>
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {(report?.headcount || []).map((h, i) => {
                const pct = Math.round((h.employeeCount / maxHeadcount) * 100);
                const colors = ['bg-indigo-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-cyan-500'];
                return (
                  <div key={h.department} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300 font-medium">{h.department}</span>
                      <span className="text-slate-400">{h.employeeCount} employee{h.employeeCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div
                        className={`${colors[i % colors.length]} h-3 rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Leave Summary */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">🗓️ Leave Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* By Type */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6">
            <p className="text-sm font-medium text-slate-400 mb-4">By Leave Type</p>
            {isLoading ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-6 bg-slate-800 rounded animate-pulse" />)}</div>
            ) : (
              <div className="space-y-3">
                {Object.entries(report?.leaves.byType || {}).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{LEAVE_TYPE_EMOJI[type] || '📋'}</span>
                      <span className="text-sm text-slate-300">{type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-800 rounded-full h-1.5">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${Math.round((count / totalLeaveRequests) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-4 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* By Status */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6">
            <p className="text-sm font-medium text-slate-400 mb-4">By Status</p>
            {isLoading ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-6 bg-slate-800 rounded animate-pulse" />)}</div>
            ) : (
              <div className="space-y-3">
                {Object.entries(report?.leaves.byStatus || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status] || 'bg-slate-500'}`} />
                      <span className="text-sm text-slate-300">{status}</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{count}</span>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Total Requests</span>
                  <span className="text-sm font-bold text-white">{report?.leaves.totalRequests}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
