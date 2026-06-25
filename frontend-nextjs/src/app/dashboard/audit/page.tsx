'use client';

import React, { useEffect, useState } from 'react';
import { getAuditLogs, type AuditLogEntry } from '@/lib/api';

const ACTION_STYLES: Record<string, string> = {
  CREATE:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  UPDATE:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  DELETE:  'bg-rose-500/10 text-rose-400 border-rose-500/20',
  APPROVE: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  REJECT:  'bg-orange-500/10 text-orange-400 border-orange-500/20',
  PROCESS: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  PAY:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  LOGIN:   'bg-slate-500/10 text-slate-400 border-slate-500/20',
  LOGOUT:  'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const ENTITY_ICONS: Record<string, string> = {
  EMPLOYEE:      '👤', PAYROLL: '💰', LEAVE_REQUEST: '🗓️',
  DEPARTMENT:    '🏢', USER:    '🔑', NOTIFICATION:  '🔔',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const ENTITY_TYPES = ['ALL', 'EMPLOYEE', 'PAYROLL', 'LEAVE_REQUEST', 'DEPARTMENT', 'USER', 'NOTIFICATION'];

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAuditLogs()
      .then(setLogs)
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = logs.filter(l => {
    const matchEntity = entityFilter === 'ALL' || l.entityType === entityFilter;
    const matchAction = actionFilter === 'ALL' || l.action === actionFilter;
    const matchSearch = !search ||
      l.details?.toLowerCase().includes(search.toLowerCase()) ||
      l.performedBy?.toLowerCase().includes(search.toLowerCase()) ||
      l.entityType?.toLowerCase().includes(search.toLowerCase());
    return matchEntity && matchAction && matchSearch;
  });

  const uniqueActions = ['ALL', ...Array.from(new Set(logs.map(l => l.action)))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Audit Log</h2>
        <p className="text-slate-400">Complete record of all system actions and changes.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Events',   value: logs.length,                                              color: 'text-white' },
          { label: 'Creates',        value: logs.filter(l => l.action === 'CREATE').length,           color: 'text-emerald-400' },
          { label: 'Updates',        value: logs.filter(l => l.action === 'UPDATE').length,           color: 'text-blue-400' },
          { label: 'Deletes',        value: logs.filter(l => l.action === 'DELETE').length,           color: 'text-rose-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-5 rounded-2xl">
            <p className="text-slate-400 text-xs mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{isLoading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search action, entity, or user..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64 px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
        />
        <select
          value={entityFilter}
          onChange={e => setEntityFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          {ENTITY_TYPES.map(t => <option key={t} value={t}>{t === 'ALL' ? 'All Entities' : t.replace('_', ' ')}</option>)}
        </select>
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          {uniqueActions.map(a => <option key={a} value={a}>{a === 'ALL' ? 'All Actions' : a}</option>)}
        </select>
        <span className="text-xs text-slate-600 ml-auto">{filtered.length} of {logs.length} events</span>
      </div>

      {error && <div className="px-5 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">⚠️ {error}</div>}

      {/* Audit Table */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Action', 'Entity', 'Details', 'Performed By', 'Time'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-24" /></td>
                  ))}
                </tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No audit events found</td></tr>
              ) : filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${ACTION_STYLES[log.action] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span>{ENTITY_ICONS[log.entityType] || '📋'}</span>
                      <span className="text-sm text-slate-300">{log.entityType?.replace('_', ' ')}</span>
                      {log.entityId && <span className="text-xs text-slate-600">#{log.entityId}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-sm text-slate-400 truncate" title={log.details}>{log.details}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
                        {(log.performedBy || 'S')[0].toUpperCase()}
                      </div>
                      <span className="text-xs text-slate-400 truncate max-w-[120px]">{log.performedBy || 'system'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-500">{timeAgo(log.createdAt)}</p>
                    <p className="text-xs text-slate-700">{new Date(log.createdAt).toLocaleDateString()}</p>
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
