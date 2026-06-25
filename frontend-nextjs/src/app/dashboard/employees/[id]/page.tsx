'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getEmployeeProfile, type EmployeeProfile } from '@/lib/api';

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-amber-500/10 text-amber-400',
  PROCESSED: 'bg-blue-500/10 text-blue-400',
  PAID:      'bg-emerald-500/10 text-emerald-400',
  APPROVED:  'bg-emerald-500/10 text-emerald-400',
  REJECTED:  'bg-rose-500/10 text-rose-400',
};

function formatMoney(v: number | undefined | null) {
  if (v == null) return '—';
  return `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

const AVATAR_COLORS = [
  'from-indigo-500 to-violet-500', 'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',  'from-rose-500 to-pink-500',
  'from-cyan-500 to-blue-500',
];

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getEmployeeProfile(Number(id))
      .then(setProfile)
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-48" />
        <div className="h-40 bg-slate-900/40 rounded-2xl border border-slate-800/60" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-20">
        <p className="text-rose-400 mb-4">{error || 'Employee not found'}</p>
        <button onClick={() => router.back()} className="text-indigo-400 hover:text-indigo-300 text-sm">← Go Back</button>
      </div>
    );
  }

  const avatarColor = AVATAR_COLORS[Number(id) % AVATAR_COLORS.length];
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  const yearsAtCompany = profile.hireDate
    ? ((Date.now() - new Date(profile.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1)
    : '—';

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Employees
      </button>

      {/* Profile Header Card */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-8">
        <div className="flex items-start gap-8">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${avatarColor} flex items-center justify-center text-2xl font-bold text-white shadow-xl flex-shrink-0`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{profile.fullName}</h2>
                <p className="text-indigo-400 font-medium mt-0.5">{profile.jobTitle}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-slate-500">{profile.department}</span>
                  {profile.email && <span className="text-xs text-slate-500">{profile.email}</span>}
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${profile.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${profile.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    {profile.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-medium text-slate-300 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-6 mt-8 pt-8 border-t border-slate-800/60">
          <div>
            <p className="text-xs text-slate-500 mb-1">Annual Salary</p>
            <p className="text-lg font-bold text-emerald-400">{formatMoney(profile.salary)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Last Net Salary</p>
            <p className="text-lg font-bold text-white">{formatMoney(profile.lastNetSalary)}</p>
            {profile.lastPayrollStatus && (
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_STYLES[profile.lastPayrollStatus] || ''}`}>
                {profile.lastPayrollStatus}
              </span>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Tenure</p>
            <p className="text-lg font-bold text-white">{yearsAtCompany} yrs</p>
            <p className="text-xs text-slate-600">Since {profile.hireDate ? new Date(profile.hireDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Leave Summary</p>
            <p className="text-lg font-bold text-white">{profile.totalLeavesTaken}</p>
            <p className="text-xs text-amber-400/80">{profile.pendingLeaveRequests} pending</p>
          </div>
        </div>
      </div>

      {/* 2-column: Payroll History + Leave History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payrolls */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-5">Recent Payslips</h3>
          {!profile.recentPayrolls?.length ? (
            <p className="text-sm text-slate-500 text-center py-6">No payroll records yet.</p>
          ) : (
            <div className="space-y-3">
              {profile.recentPayrolls.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {p.payPeriodStart ? new Date(p.payPeriodStart).toLocaleString('default', { month: 'long', year: 'numeric' }) : '—'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Gross: {formatMoney(p.grossSalary)} · Tax: {formatMoney(p.taxDeduction)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">{formatMoney(p.netSalary)}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_STYLES[p.status] || ''}`}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Leave Requests */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-5">Recent Leave Requests</h3>
          {!profile.recentLeaves?.length ? (
            <p className="text-sm text-slate-500 text-center py-6">No leave requests yet.</p>
          ) : (
            <div className="space-y-3">
              {profile.recentLeaves.map(l => (
                <div key={l.id} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
                  <div>
                    <p className="text-sm font-medium text-white">{l.leaveType?.replace('_', ' ')}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {l.startDate ? new Date(l.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'} →{' '}
                      {l.endDate ? new Date(l.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[l.status] || ''}`}>{l.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
