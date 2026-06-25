'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getNotifications, markNotificationRead, markAllNotificationsRead, logout, globalSearch, type NotificationItem, type SearchResult } from '@/lib/api';

const NAV_ITEMS = [
  { href: '/dashboard',               label: 'Executive Dashboard', icon: '◈' },
  { href: '/dashboard/employees',     label: 'Employees',           icon: '👥' },
  { href: '/dashboard/hr',            label: 'HRMS',                icon: '🏢' },
  { href: '/dashboard/payroll',       label: 'Payroll',             icon: '💰' },
  { href: '/dashboard/leave',         label: 'Leave & Attendance',  icon: '🗓️' },
  { href: '/dashboard/departments',   label: 'Departments',         icon: '🏗️' },
  { href: '/dashboard/performance',   label: 'Performance',         icon: '⭐' },
  { href: '/dashboard/goals',         label: 'Goals & OKR',         icon: '🎯' },
  { href: '/dashboard/expenses',      label: 'Expenses',            icon: '💸' },
  { href: '/dashboard/training',      label: 'Training & Dev',      icon: '🎓' },
  { href: '/dashboard/projects',      label: 'Projects',            icon: '📁' },
  { href: '/dashboard/orgchart',      label: 'Org Chart',           icon: '🏢' },
  { href: '/dashboard/announcements', label: 'Announcements',       icon: '📢' },
  { href: '/dashboard/finance',       label: 'Finance & Accounting',icon: '📊' },
  { href: '/dashboard/reports',       label: 'Reports',             icon: '📈' },
  { href: '/dashboard/ai',            label: 'AI Copilot',          icon: '✦' },
  { href: '/dashboard/audit',         label: 'Audit Log',           icon: '📋' },
  { href: '/dashboard/settings',      label: 'Settings',            icon: '⚙️' },
];

const NOTIF_ICONS: Record<string, string> = {
  PAYROLL_PROCESSED: '💰', PAYROLL_PAID: '✅',
  LEAVE_APPROVED: '🗓️', LEAVE_REJECTED: '❌',
  AI_INSIGHT: '✦', HR_ACTION: '👥', SYSTEM_ALERT: '🔔',
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Global Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const r = await globalSearch(q);
      setSearchResults([...r.employees, ...r.departments, ...r.leaves]);
    } catch { setSearchResults([]); }
    finally { setSearchLoading(false); }
  }, []);

  useEffect(() => {
    getNotifications().then(setNotifications).catch(() => {});
    const interval = setInterval(() => {
      getNotifications().then(setNotifications).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id: number) => {
    await markNotificationRead(id).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex-shrink-0 flex flex-col relative z-20">
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-white">
            Auto<span className="text-indigo-400">ERP</span>
          </h1>
          <span className="ml-2 text-xs px-2 py-0.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-full">v3.0</span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                A
              </div>
              <div>
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-slate-500">CEO Office</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-rose-400 transition-colors text-xs"
              title="Sign out"
            >
              ⏻
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Header */}
        <header className="h-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 relative z-10">
          {/* Global Search */}
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search employees, departments… (Enter for AI)"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); doSearch(e.target.value); }}
                onFocus={() => setShowSearch(true)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !searchQuery) router.push('/dashboard/ai'); if (e.key === 'Escape') setShowSearch(false); }}
                className="w-96 pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-full text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              {searchLoading && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs">⏳</span>}
            </div>

            {showSearch && (searchQuery.length >= 2) && (
              <div className="absolute top-12 left-0 w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                {searchResults.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-slate-500">{searchLoading ? 'Searching…' : 'No results found'}</div>
                ) : (
                  <div className="py-2 max-h-80 overflow-y-auto">
                    {searchResults.map((r, i) => {
                      const icons: Record<string, string> = { EMPLOYEE: '👤', DEPARTMENT: '🏗️', LEAVE: '🗓️' };
                      return (
                        <button key={i} onClick={() => { router.push(r.url); setShowSearch(false); setSearchQuery(''); }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-left transition-colors">
                          <span className="text-lg flex-shrink-0">{icons[r.type] || '📋'}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{r.title}</p>
                            <p className="text-xs text-slate-500 truncate">{r.subtitle}</p>
                          </div>
                          <span className="ml-auto text-xs text-slate-600 flex-shrink-0">{r.type}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <div className="flex items-center space-x-4" ref={notifRef}>
            <div className="relative">
              <button
                id="notification-bell"
                onClick={() => setShowNotifs(v => !v)}
                className="relative w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 top-12 w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <p className="text-center text-slate-500 text-sm py-8">No notifications</p>
                    ) : notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkRead(n.id)}
                        className={`px-5 py-4 cursor-pointer hover:bg-slate-800/50 transition-colors flex gap-3 ${!n.isRead ? 'bg-indigo-600/5' : ''}`}
                      >
                        <span className="text-xl mt-0.5 flex-shrink-0">{NOTIF_ICONS[n.type] || '🔔'}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium truncate ${!n.isRead ? 'text-white' : 'text-slate-300'}`}>
                              {n.title}
                            </p>
                            {!n.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-xs text-slate-600 mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto relative z-0 p-8">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />
          <div className="relative z-10">{children}</div>
        </div>
      </main>
    </div>
  );
}
