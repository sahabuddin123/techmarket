import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminModal from '../../../Components/Admin/AdminModal';
import AdminEmptyState from '../../../Components/Admin/AdminEmptyState';
import ConfirmDialog from '../../../Components/Admin/ConfirmDialog';
import { Layers, Plus, Trash2, Tag } from 'lucide-react';

export default function AdminSpecifications({ groups = [] }) {
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [attrModalOpen, setAttrModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [deleteTargetGroup, setDeleteTargetGroup] = useState(null);
  const [deleteTargetAttr, setDeleteTargetAttr] = useState(null);

  const groupList = Array.isArray(groups) ? groups : [];

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

  const handleDeleteGroup = () => {
    if (!deleteTargetGroup) return;
    router.delete(`/admin/specifications/groups/${deleteTargetGroup.id}`, {
      onFinish: () => setDeleteTargetGroup(null),
    });
  };

  const handleDeleteAttr = () => {
    if (!deleteTargetAttr) return;
    router.delete(`/admin/specifications/attributes/${deleteTargetAttr.id}`, {
      onFinish: () => setDeleteTargetAttr(null),
    });
  };

  return (
    <AdminShell title="Specifications">
      <Head title="Specification Groups & Attributes - TechMarket Admin" />

      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title="Hardware Specification Matrices"
          subtitle="Configure dynamic specification groups (e.g. Memory, Processor, GPU, Display) and reusable attributes."
          badge={`${groupList.length} Spec Groups`}
          actions={
            <button
              type="button"
              onClick={() => setGroupModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Spec Group</span>
            </button>
          }
        />

        {/* Specification Groups Matrix Grid */}
        {groupList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupList.map((g) => (
              <div 
                key={g.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        <Layers className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-heading">{g.name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetGroup(g)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Group"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-3 text-xs">
                    {g.attributes && g.attributes.length > 0 ? (
                      g.attributes.map((a) => (
                        <div key={a.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            {a.name} {a.unit && <span className="font-mono text-slate-400">({a.unit})</span>}
                          </span>
                          <button
                            type="button"
                            onClick={() => setDeleteTargetAttr(a)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Attribute"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 text-xs italic py-3 text-center">No attributes defined yet.</div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openAttrModal(g)}
                  className="w-full mt-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Attribute to {g.name}</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            title="No Specification Groups Found"
            description="Create specification groups (e.g. Memory, Processor, Display) to build structured product specs."
            action={
              <button
                type="button"
                onClick={() => setGroupModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Spec Group</span>
              </button>
            }
          />
        )}
      </div>

      {/* Create Group Modal */}
      <AdminModal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        title="Create Specification Group"
        subtitle="e.g. Memory, Processor, Storage, Display"
        size="sm"
        footer={
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setGroupModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGroupSubmit}
              disabled={groupForm.processing}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {groupForm.processing ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleGroupSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Group Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Memory, Processor, Graphics"
              value={groupForm.data.name}
              onChange={(e) => groupForm.setData('name', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden"
            />
          </div>
        </form>
      </AdminModal>

      {/* Create Attribute Modal */}
      {selectedGroup && (
        <AdminModal
          isOpen={attrModalOpen}
          onClose={() => setAttrModalOpen(false)}
          title={`Add Attribute to ${selectedGroup.name}`}
          size="md"
          footer={
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setAttrModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAttrSubmit}
                disabled={attrForm.processing}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {attrForm.processing ? 'Adding...' : 'Add Attribute'}
              </button>
            </div>
          }
        >
          <form onSubmit={handleAttrSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Attribute Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. RAM Capacity, Base Clock, VRAM"
                value={attrForm.data.name}
                onChange={(e) => attrForm.setData('name', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Unit (Optional)</label>
              <input
                type="text"
                placeholder="e.g. GB, GHz, MHz, Watts"
                value={attrForm.data.unit}
                onChange={(e) => attrForm.setData('unit', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
              />
            </div>
          </form>
        </AdminModal>
      )}

      {/* Delete Group Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetGroup)}
        onClose={() => setDeleteTargetGroup(null)}
        onConfirm={handleDeleteGroup}
        title="Delete Specification Group"
        message={`Are you sure you want to delete "${deleteTargetGroup?.name}" and all its attributes?`}
        confirmText="Delete Group"
        isDestructive
      />

      {/* Delete Attribute Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetAttr)}
        onClose={() => setDeleteTargetAttr(null)}
        onConfirm={handleDeleteAttr}
        title="Delete Attribute"
        message={`Are you sure you want to delete attribute "${deleteTargetAttr?.name}"?`}
        confirmText="Delete Attribute"
        isDestructive
      />
    </AdminShell>
  );
}
