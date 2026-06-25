'use client';

import React, { useEffect, useState } from 'react';
import {
  getDepartmentsWithCount, createDepartment, updateDepartment, deleteDepartment,
  type DepartmentWithCount,
} from '@/lib/api';

const DEPT_ICONS = ['🏗️', '👥', '💼', '🎨', '📦', '⚙️', '📊', '🔬'];

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DepartmentWithCount | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = () => getDepartmentsWithCount()
    .then(setDepartments)
    .catch(e => setError(e.message))
    .finally(() => setIsLoading(false));

  const openCreate = () => { setEditing(null); setFormName(''); setFormDesc(''); setShowModal(true); };
  const openEdit = (d: DepartmentWithCount) => { setEditing(d); setFormName(d.name); setFormDesc(d.description || ''); setShowModal(true); };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateDepartment(editing.id, { name: formName, description: formDesc });
        setDepartments(prev => prev.map(d => d.id === editing.id ? updated : d));
      } else {
        const created = await createDepartment({ name: formName, description: formDesc });
        setDepartments(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this department? Employees in it will need reassignment.')) return;
    setDeleteId(id);
    try {
      await deleteDepartment(id);
      setDepartments(prev => prev.filter(d => d.id !== id));
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally { setDeleteId(null); }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Department Management</h2>
          <p className="text-slate-400">{departments.length} departments · {departments.reduce((s, d) => s + d.employeeCount, 0)} total employees</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)]"
        >
          + New Department
        </button>
      </div>

      {error && <div className="px-5 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">⚠️ {error}</div>}

      {/* Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {isLoading ? Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-40 bg-slate-900/40 border border-slate-800/60 rounded-2xl animate-pulse" />
        )) : departments.map((dept, idx) => (
          <div key={dept.id} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 hover:border-slate-700/60 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{DEPT_ICONS[idx % DEPT_ICONS.length]}</div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{dept.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{dept.description || 'No description'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/60">
              <div>
                <p className="text-2xl font-bold text-white">{dept.employeeCount}</p>
                <p className="text-xs text-slate-500">employee{dept.employeeCount !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(dept)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-300 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(dept.id)}
                  disabled={deleteId === dept.id}
                  className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded-lg text-xs transition-colors disabled:opacity-50"
                >
                  {deleteId === dept.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">{editing ? 'Edit Department' : 'New Department'}</h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Department Name *</label>
                <input
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Engineering"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">Description</label>
                <textarea
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Brief description of this department..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !formName.trim()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
