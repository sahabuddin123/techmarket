import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import {
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  ShieldCheck,
  Zap,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export default function Rules({ rules = {}, filters = {} }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(filters.rule_type || '');
  const [selectedSystem, setSelectedSystem] = useState(filters.system_type || '');

  const { data, setData, post, processing, reset, errors } = useForm({
    name: '',
    code: '',
    rule_type: 'compatibility',
    system_type_scope: 'all',
    description: '',
    priority: 100,
    is_active: true,
    // Visual Rule Builder state
    source_entity: 'camera',
    source_field: 'system_type',
    operator: 'equals',
    condition_value: 'ip',
    target_entity: 'nvr',
    target_field: 'channel_count',
    action_type: 'validate_compatibility',
    action_result: 'compatible',
  });

  const handleFilter = () => {
    router.get('/admin/cctv/rules', {
      rule_type: selectedType,
      system_type: selectedSystem,
    }, { preserveState: true, replace: true });
  };

  const handleToggle = (id) => {
    router.post(`/admin/cctv/rules/${id}/toggle-status`, {}, { preserveScroll: true });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to permanently delete this rule?')) {
      router.delete(`/admin/cctv/rules/${id}`, { preserveScroll: true });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Auto-generate structured conditions and actions from visual builder
    const payload = {
      ...data,
      conditions: [
        {
          source: data.source_entity,
          field: data.source_field,
          operator: data.operator,
          value: data.condition_value,
        }
      ],
      actions: [
        {
          target: data.target_entity,
          field: data.target_field,
          action: data.action_type,
          result: data.action_result,
        }
      ],
    };

    router.post('/admin/cctv/rules', payload, {
      onSuccess: () => {
        setIsCreateOpen(false);
        reset();
      },
    });
  };

  return (
    <AdminLayout title="CCTV Rule Engine Matrix" breadcrumbs={[{ label: 'CCTV Estimator', href: '/admin/cctv' }, { label: 'Rules' }]}>
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white font-heading">
              CCTV Rules & Matrix Engine
            </h1>
            <p className="text-xs text-slate-400">
              Manage compatibility checks, automatic accessory requirements, and recommendation priorities.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Rule</span>
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Rule Types</option>
            <option value="compatibility">Compatibility Rules</option>
            <option value="recommendation">Recommendation Rules</option>
            <option value="storage_calculation">Storage Calculation Rules</option>
            <option value="cable_calculation">Cable Calculation Rules</option>
            <option value="accessory_requirement">Accessory Requirement Rules</option>
            <option value="pricing_adjustment">Pricing Adjustment Rules</option>
          </select>

          <select
            value={selectedSystem}
            onChange={(e) => setSelectedSystem(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All System Scopes</option>
            <option value="all">Universal / All</option>
            <option value="ip">IP Only</option>
            <option value="analog">Analog Only</option>
            <option value="hybrid">Hybrid Only</option>
            <option value="wifi">Wi-Fi Only</option>
          </select>

          <button
            type="button"
            onClick={handleFilter}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
          >
            Filter
          </button>
        </div>

        {/* Rules Table */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Rule Name & Code</th>
                  <th className="py-3 px-4">Rule Type</th>
                  <th className="py-3 px-4">Scope</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {(!rules.data || rules.data.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No CCTV Rules configured in the database.
                    </td>
                  </tr>
                ) : (
                  rules.data.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{rule.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {rule.code} • {rule.description || 'No description'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px] uppercase font-bold">
                          {rule.rule_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] uppercase">
                          {rule.system_type_scope}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                        {rule.priority}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggle(rule.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                            rule.is_active
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {rule.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {rule.is_active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(rule.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Rule Builder */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Visual CCTV Rule Builder</h2>
                    <p className="text-xs text-slate-400">Build conditional logic without writing JSON.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Rule Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Recommend 16-Port Switch for >8 Cams"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Unique Rule Code</label>
                    <input
                      type="text"
                      placeholder="e.g. RULE_REC_POE_16P"
                      value={data.code}
                      onChange={(e) => setData('code', e.target.value.toUpperCase())}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Rule Category</label>
                    <select
                      value={data.rule_type}
                      onChange={(e) => setData('rule_type', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    >
                      <option value="compatibility">Compatibility Matrix</option>
                      <option value="recommendation">Product Recommendation</option>
                      <option value="storage_calculation">Storage Calculation</option>
                      <option value="cable_calculation">Cable Calculation</option>
                      <option value="accessory_requirement">Accessory Requirement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">System Scope</label>
                    <select
                      value={data.system_type_scope}
                      onChange={(e) => setData('system_type_scope', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    >
                      <option value="all">Universal / All</option>
                      <option value="ip">IP System</option>
                      <option value="analog">Analog System</option>
                      <option value="hybrid">Hybrid System</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Priority (Higher First)</label>
                    <input
                      type="number"
                      value={data.priority}
                      onChange={(e) => setData('priority', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Structured Condition Builder Card */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5" />
                    <span>IF Condition</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Source Entity</label>
                      <select
                        value={data.source_entity}
                        onChange={(e) => setData('source_entity', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                      >
                        <option value="camera">Camera</option>
                        <option value="recorder">Recorder (NVR/DVR)</option>
                        <option value="storage">Storage HDD</option>
                        <option value="requirement">Customer Requirement</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Field</label>
                      <input
                        type="text"
                        value={data.source_field}
                        onChange={(e) => setData('source_field', e.target.value)}
                        placeholder="e.g. total_cameras"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Operator</label>
                      <select
                        value={data.operator}
                        onChange={(e) => setData('operator', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                      >
                        <option value="equals">Equals (==)</option>
                        <option value="greater_than">Greater Than (&gt;)</option>
                        <option value="greater_than_or_equal">Greater Than / Equal (&gt;=)</option>
                        <option value="less_than">Less Than (&lt;)</option>
                        <option value="contains">Contains</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Condition Value</label>
                      <input
                        type="text"
                        value={data.condition_value}
                        onChange={(e) => setData('condition_value', e.target.value)}
                        placeholder="e.g. 8"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider pt-2 border-t border-slate-800/60">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>THEN Action / Result</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Target Entity</label>
                      <select
                        value={data.target_entity}
                        onChange={(e) => setData('target_entity', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                      >
                        <option value="nvr">NVR / DVR</option>
                        <option value="poe_switch">PoE Switch</option>
                        <option value="accessory">Accessory</option>
                        <option value="service">Installation Service</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Action Type</label>
                      <select
                        value={data.action_type}
                        onChange={(e) => setData('action_type', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                      >
                        <option value="recommend_product">Recommend Product</option>
                        <option value="validate_compatibility">Validate Compatibility</option>
                        <option value="attach_mandatory_accessory">Attach Mandatory Accessory</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[11px] text-slate-400 mb-1">Result / Directive</label>
                      <input
                        type="text"
                        value={data.action_result}
                        onChange={(e) => setData('action_result', e.target.value)}
                        placeholder="e.g. 16_channel_nvr"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                  >
                    {processing ? 'Creating...' : 'Save Rule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
