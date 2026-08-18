import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { Layers, Plus, Trash2 } from 'lucide-react';

export default function AdminSpecifications({ groups }) {
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [attrModalOpen, setAttrModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const groupForm = useForm({
    name: '',
    sort_order: 0,
  });

  const attrForm = useForm({
    specification_group_id: '',
    name: '',
    unit: '',
    sort_order: 0,
  });

  const handleGroupSubmit = (e) => {
    e.preventDefault();
    groupForm.post('/admin/specifications/groups', {
      onSuccess: () => {
        setGroupModalOpen(false);
        groupForm.reset();
      }
    });
  };

  const handleAttrSubmit = (e) => {
    e.preventDefault();
    attrForm.post('/admin/specifications/attributes', {
      onSuccess: () => {
        setAttrModalOpen(false);
        attrForm.reset();
      }
    });
  };

  const openAttrModal = (group) => {
    setSelectedGroup(group);
    attrForm.setData('specification_group_id', group.id);
    setAttrModalOpen(true);
  };

  const handleDeleteGroup = (id) => {
    if (confirm('Delete this specification group and all its attributes?')) {
      router.delete(`/admin/specifications/groups/${id}`);
    }
  };

  const handleDeleteAttr = (id) => {
    if (confirm('Delete this attribute?')) {
      router.delete(`/admin/specifications/attributes/${id}`);
    }
  };

  return (
    <AdminLayout title="Dynamic Specifications Management">
      <Head title="Specification Groups & Attributes - Admin" />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <Layers className="w-6 h-6 text-amber-500" />
              <span>DYNAMIC HARDWARE SPECIFICATION TEMPLATES</span>
            </h1>
            <p className="text-xs text-slate-400">Configure specification groups (Processor, Memory, Display) and reusable attributes.</p>
          </div>

          <button
            onClick={() => setGroupModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-lg flex items-center space-x-1.5 shadow-lg w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE SPEC GROUP</span>
          </button>
        </div>

        {/* SPECIFICATION GROUPS & ATTRIBUTES LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups && groups.map(g => (
            <div key={g.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-black text-sm text-white uppercase">{g.name}</h3>
                  <button onClick={() => handleDeleteGroup(g.id)} className="text-rose-400 hover:text-rose-300 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 pt-3 text-xs">
                  {g.attributes && g.attributes.map(a => (
                    <div key={a.id} className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-200 font-semibold">{a.name} {a.unit && `(${a.unit})`}</span>
                      <button onClick={() => handleDeleteAttr(a.id)} className="text-slate-500 hover:text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {(!g.attributes || g.attributes.length === 0) && (
                    <div className="text-slate-500 text-[11px] italic">No attributes defined yet.</div>
                  )}
                </div>
              </div>

              <button
                onClick={() => openAttrModal(g)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs py-2 rounded flex items-center justify-center space-x-1 border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Attribute to {g.name}</span>
              </button>
            </div>
          ))}
        </div>

        {/* CREATE GROUP MODAL */}
        {groupModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleGroupSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">Create Specification Group</h3>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Group Name * (e.g. Memory)</label>
                <input
                  type="text"
                  required
                  value={groupForm.data.name}
                  onChange={(e) => groupForm.setData('name', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setGroupModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-bold">Cancel</button>
                <button type="submit" disabled={groupForm.processing} className="px-4 py-2 bg-amber-500 text-slate-950 rounded font-black uppercase">Create Group</button>
              </div>
            </form>
          </div>
        )}

        {/* CREATE ATTRIBUTE MODAL */}
        {attrModalOpen && selectedGroup && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleAttrSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">Add Attribute to {selectedGroup.name}</h3>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Attribute Name * (e.g. RAM Capacity)</label>
                <input
                  type="text"
                  required
                  value={attrForm.data.name}
                  onChange={(e) => attrForm.setData('name', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Unit (e.g. GB, GHz, Hz)</label>
                <input
                  type="text"
                  value={attrForm.data.unit}
                  onChange={(e) => attrForm.setData('unit', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setAttrModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-bold">Cancel</button>
                <button type="submit" disabled={attrForm.processing} className="px-4 py-2 bg-amber-500 text-slate-950 rounded font-black uppercase">Add Attribute</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
