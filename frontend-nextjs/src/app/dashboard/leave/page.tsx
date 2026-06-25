'use client';

import React, { useEffect, useState } from 'react';
import { getAllLeaveRequests, approveLeave, rejectLeave, type LeaveRequest } from '@/lib/api';

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  APPROVED:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REJECTED:  'bg-rose-500/10 text-rose-400 border-rose-500/20',
  CANCELLED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const TYPE_LABELS: Record<string, string> = {
  ANNUAL: '🌴 Annual', SICK: '🤒 Sick', WORK_FROM_HOME: '🏠 WFH',
  MATERNITY: '👶 Maternity', PATERNITY: '👨‍👦 Paternity', UNPAID: '⚠️ Unpaid',
};

export default function LeavePage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    getAllLeaveRequests()
      .then(setLeaves)
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleApprove = async (id: number) => {
    setActionId(id);
    try {
      const updated = await approveLeave(id, 'Approved by HR Manager');
      setLeaves(prev => prev.map(l => l.id === id ? updated : l));
    } finally { setActionId(null); }
  };

  const handleReject = async (id: number) => {
    setActionId(id);
    try {
      const updated = await rejectLeave(id, 'Rejected by HR Manager');
      setLeaves(prev => prev.map(l => l.id === id ? updated : l));
    } finally { setActionId(null); }
  };

  const filtered = statusFilter === 'ALL'
    ? leaves
    : leaves.filter(l => l.status === statusFilter);

  const pendingCount = leaves.filter(l => l.status === 'PENDING').length;
  const approvedCount = leaves.filter(l => l.status === 'APPROVED').length;
  const thisMonthCount = leaves.filter(l => {
    const d = new Date(l.startDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Leave & Attendance</h2>
          <p className="text-slate-400">Manage employee leave requests and approvals.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)]">
          + New Request
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full" />
          <p className="text-slate-400 text-sm mb-2">Pending Approvals</p>
          <p className="text-3xl font-bold text-amber-400">{pendingCount}</p>
          <p className="text-xs text-amber-400/60 mt-1">Requires your action</p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full" />
          <p className="text-slate-400 text-sm mb-2">Approved This Cycle</p>
          <p className="text-3xl font-bold text-emerald-400">{approvedCount}</p>
          <p className="text-xs text-slate-500 mt-1">Total approved requests</p>
        </div>
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full" />
          <p className="text-slate-400 text-sm mb-2">Leaves This Month</p>
          <p className="text-3xl font-bold text-white">{thisMonthCount}</p>
          <p className="text-xs text-slate-500 mt-1">Scheduled for {new Date().toLocaleString('default', { month: 'long' })}</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-3">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 text-xs font-medium rounded-lg border transition-all ${
              statusFilter === s
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            {s === 'ALL' ? `All (${leaves.length})` : `${s.charAt(0) + s.slice(1).toLowerCase()} (${leaves.filter(l => l.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Leave Cards */}
      {error && (
        <div className="px-5 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">⚠️ {error}</div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-900/40 rounded-2xl border border-slate-800/60 animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No leave requests found.</div>
        ) : filtered.map(leave => (
          <div key={leave.id} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-5 flex items-center gap-6 hover:border-slate-700/60 transition-all group">
            {/* Type Badge */}
            <div className="flex-shrink-0 w-36 text-sm font-medium text-slate-300">
              {TYPE_LABELS[leave.leaveType] || leave.leaveType}
            </div>

            {/* Employee */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{leave.employeeName}</p>
              <p className="text-xs text-slate-500">{leave.department}</p>
            </div>

            {/* Dates */}
            <div className="flex-shrink-0 text-center">
              <p className="text-sm text-slate-300 font-medium">
                {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} →{' '}
                {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{leave.durationDays} day{leave.durationDays !== 1 ? 's' : ''}</p>
            </div>

            {/* Status */}
            <div className="flex-shrink-0">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[leave.status]}`}>
                {leave.status}
              </span>
            </div>

            {/* Actions */}
            {leave.status === 'PENDING' && (
              <div className="flex-shrink-0 flex gap-2">
                <button
                  onClick={() => handleApprove(leave.id)}
                  disabled={actionId === leave.id}
                  className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-medium hover:bg-emerald-600/30 transition-colors disabled:opacity-50"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleReject(leave.id)}
                  disabled={actionId === leave.id}
                  className="px-3 py-1.5 bg-rose-600/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-medium hover:bg-rose-600/30 transition-colors disabled:opacity-50"
                >
                  ✕ Reject
                </button>
              </div>
            )}
            {leave.status !== 'PENDING' && (
              <div className="flex-shrink-0 w-36">
                {leave.managerNotes && (
                  <p className="text-xs text-slate-600 italic truncate" title={leave.managerNotes}>{leave.managerNotes}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
