'use client';

import React, { useEffect, useState } from 'react';
import {
  getAnnouncements, createAnnouncement, toggleAnnouncementPin, deleteAnnouncement,
  type Announcement,
} from '@/lib/api';

const PRIORITY_CONFIG = {
  LOW:    { label: 'Low',    color: 'text-slate-400',   bg: 'bg-slate-500/10 border-slate-500/20',    accent: 'border-l-slate-500' },
  NORMAL: { label: 'Normal', color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',       accent: 'border-l-blue-500' },
  HIGH:   { label: 'High',   color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',     accent: 'border-l-amber-500' },
  URGENT: { label: 'Urgent', color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20',       accent: 'border-l-rose-500' },
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', priority: 'NORMAL', authorName: 'Admin User', isPinned: false });

  useEffect(() => {
    getAnnouncements()
      .then(setAnnouncements)
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const created = await createAnnouncement({
        title: form.title,
        body: form.body,
        priority: form.priority as Announcement['priority'],
        authorName: form.authorName,
        isPinned: form.isPinned,
      });
      setAnnouncements(prev => [created, ...prev]);
      setShowModal(false);
      setForm({ title: '', body: '', priority: 'NORMAL', authorName: 'Admin User', isPinned: false });
    } catch (e: unknown) { alert((e as Error).message); }
    finally { setSaving(false); }
  };

  const handlePin = async (id: number) => {
    try {
      const updated = await toggleAnnouncementPin(id);
      setAnnouncements(prev => prev.map(a => a.id === id ? updated : a));
    } catch (e: unknown) { alert((e as Error).message); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (e: unknown) { alert((e as Error).message); }
  };

  const pinned  = announcements.filter(a => a.isPinned);
  const regular = announcements.filter(a => !a.isPinned);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">📢 Company Announcements</h2>
          <p className="text-slate-400">Company-wide bulletin board for news, policies, and important updates.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)]">
          + Post Announcement
        </button>
      </div>

      {error && <div className="px-5 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">⚠️ {error}</div>}

      {/* Pinned Announcements */}
      {!isLoading && pinned.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">📌 Pinned</h3>
          <div className="space-y-3">
            {pinned.map(a => <AnnouncementCard key={a.id} a={a} onPin={handlePin} onDelete={handleDelete} />)}
          </div>
        </div>
      )}

      {/* All Announcements */}
      <div>
        {pinned.length > 0 && <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Latest</h3>}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 animate-pulse space-y-3">
                <div className="h-5 bg-slate-800 rounded w-2/3" />
                <div className="h-12 bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        ) : regular.length === 0 && pinned.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
            <p className="text-slate-500 text-sm">No announcements yet. Post the first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {regular.map(a => <AnnouncementCard key={a.id} a={a} onPin={handlePin} onDelete={handleDelete} />)}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">New Announcement</h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Body *</label>
                <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={4}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Author</label>
                  <input value={form.authorName} onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isPinned} onChange={e => setForm(f => ({ ...f, isPinned: e.target.checked }))}
                  className="w-4 h-4 rounded accent-indigo-500" />
                <span className="text-sm text-slate-300">📌 Pin this announcement to the top</span>
              </label>
            </div>
            <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.title || !form.body}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-colors">
                {saving ? 'Posting...' : 'Post Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnnouncementCard({ a, onPin, onDelete }: {
  a: Announcement;
  onPin: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const cfg = PRIORITY_CONFIG[a.priority] || PRIORITY_CONFIG.NORMAL;
  return (
    <div className={`bg-slate-900/40 backdrop-blur-md border border-slate-800/60 border-l-4 ${cfg.accent} rounded-2xl p-6 hover:border-slate-700 transition-all group`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          {a.isPinned && <span className="text-amber-400 text-sm flex-shrink-0 mt-0.5">📌</span>}
          <h3 className="text-base font-semibold text-white leading-tight">{a.title}</h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
          </span>
          <button onClick={() => onPin(a.id)}
            className="p-1.5 text-slate-600 hover:text-amber-400 transition-colors" title={a.isPinned ? 'Unpin' : 'Pin'}>
            📌
          </button>
          <button onClick={() => onDelete(a.id)}
            className="p-1.5 text-slate-600 hover:text-rose-400 transition-colors" title="Delete">
            ✕
          </button>
        </div>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed mb-4">{a.body}</p>
      <div className="flex items-center gap-4 text-xs text-slate-600">
        <span>By <span className="text-slate-500">{a.authorName || '—'}</span></span>
        <span>·</span>
        <span>{a.publishedAt ? new Date(a.publishedAt).toLocaleString() : '—'}</span>
      </div>
    </div>
  );
}
