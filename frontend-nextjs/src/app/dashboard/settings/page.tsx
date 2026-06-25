'use client';

import React, { useEffect, useState } from 'react';
import { getAllUsers, toggleUserActive, getUserStats, type ManagedUser } from '@/lib/api';

const ROLE_STYLES: Record<string, string> = {
  ADMIN:      'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  HR_MANAGER: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  EMPLOYEE:   'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const TABS = ['Users', 'Tenant', 'Security'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Users');
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [stats, setStats] = useState<{ total: number; active: number; inactive: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getAllUsers(), getUserStats()])
      .then(([u, s]) => { setUsers(u); setStats(s); })
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleToggle = async (id: number) => {
    setToggling(id);
    try {
      const result = await toggleUserActive(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: result.isActive } : u));
      setStats(prev => prev ? {
        ...prev,
        active: result.isActive ? prev.active + 1 : prev.active - 1,
        inactive: result.isActive ? prev.inactive - 1 : prev.inactive + 1,
      } : prev);
    } catch (e: unknown) { alert((e as Error).message); }
    finally { setToggling(null); }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Settings & Admin</h2>
        <p className="text-slate-400">System configuration, user management, and security settings.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/50 border border-slate-800 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && <div className="px-5 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">⚠️ {error}</div>}

      {/* ── Users Tab ── */}
      {activeTab === 'Users' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Users',    value: stats?.total,    color: 'text-white' },
              { label: 'Active',         value: stats?.active,   color: 'text-emerald-400' },
              { label: 'Inactive',       value: stats?.inactive, color: 'text-rose-400' },
            ].map(s => (
              <div key={s.label} className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
                <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{isLoading ? '—' : (s.value ?? 0)}</p>
              </div>
            ))}
          </div>

          {/* User Table */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">System Users</h3>
              <span className="text-xs text-slate-500">{users.length} user{users.length !== 1 ? 's' : ''}</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {['User', 'Email', 'Roles', 'Status', 'Joined', 'Action'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {isLoading ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-20" /></td>
                    ))}
                  </tr>
                )) : users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-xs text-white font-bold">
                          {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                        </div>
                        <p className="text-sm font-medium text-white">
                          {user.firstName || ''} {user.lastName || ''}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(user.roles || []).map(role => (
                          <span key={role} className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${ROLE_STYLES[role] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(user.id)}
                        disabled={toggling === user.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                          user.isActive
                            ? 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/30'
                            : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                        }`}
                      >
                        {toggling === user.id ? '...' : user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tenant Tab ── */}
      {activeTab === 'Tenant' && (
        <div className="space-y-4 max-w-2xl">
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-5">
            {[
              { label: 'Organisation Name', value: 'Enterprise Corp', editable: true },
              { label: 'Timezone',          value: 'Asia/Kolkata (UTC+5:30)', editable: true },
              { label: 'Fiscal Year Start', value: 'April 1',         editable: true },
              { label: 'Currency',          value: 'USD ($)',          editable: false },
              { label: 'Plan',              value: 'Enterprise',       editable: false },
            ].map(field => (
              <div key={field.label} className="flex items-center justify-between py-3 border-b border-slate-800/60 last:border-0">
                <div>
                  <p className="text-xs text-slate-500">{field.label}</p>
                  <p className="text-sm text-white font-medium mt-0.5">{field.value}</p>
                </div>
                {field.editable && (
                  <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Edit</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Security Tab ── */}
      {activeTab === 'Security' && (
        <div className="space-y-4 max-w-2xl">
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-5">
            {[
              { label: 'Authentication',       value: 'JWT Bearer Tokens',           status: '✅ Active' },
              { label: 'Token Expiry',          value: '24 hours',                    status: '✅ Configured' },
              { label: 'Password Policy',       value: 'Min 8 chars, mixed case',     status: '✅ Enforced' },
              { label: 'Password Hashing',      value: 'BCrypt (cost factor 10)',     status: '✅ Active' },
              { label: 'CORS Origins',          value: 'localhost:3000, localhost:3001', status: '✅ Restricted' },
              { label: 'CSRF Protection',       value: 'Disabled (stateless JWT)',    status: '⚠️ Stateless' },
              { label: 'Password in Responses', value: '@JsonIgnore applied',         status: '✅ Hidden' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-800/60 last:border-0">
                <div>
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-sm text-white font-medium mt-0.5">{item.value}</p>
                </div>
                <span className="text-xs text-slate-400">{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
