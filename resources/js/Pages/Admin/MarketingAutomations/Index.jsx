import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { Zap, Plus, CheckCircle, XCircle } from 'lucide-react';

export default function AdminMarketingAutomations({ automations }) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, setData, post, processing, reset } = useForm({
    name: '',
    trigger_event: 'order_completed',
    channel: 'database',
    template: 'Thank you for your order! Your loyalty points have been updated.',
    is_active: true,
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    post('/admin/marketing-automations', {
      onSuccess: () => {
        setShowCreateModal(false);
        reset();
      }
    });
  };

  const handleToggle = (id) => {
    router.post(`/admin/marketing-automations/${id}/toggle`, {}, { preserveScroll: true });
  };

  return (
    <AdminLayout title="Marketing Automations Engine">
      <Head title="Marketing Automations - Admin" />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <Zap className="w-6 h-6 text-amber-500" />
              <span>EVENT-DRIVEN MARKETING AUTOMATIONS</span>
            </h1>
            <p className="text-xs text-slate-400">Trigger automated campaigns on customer registration, order completion, or price drops.</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-lg flex items-center space-x-1.5 uppercase shadow-lg w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Create Automation</span>
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="p-3.5">Campaign Name</th>
                  <th className="p-3.5">Trigger Event</th>
                  <th className="p-3.5">Channel</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {automations.data && automations.data.length > 0 ? (
                  automations.data.map(a => (
                    <tr key={a.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-white">{a.name}</td>
                      <td className="p-3.5 font-mono text-amber-400">{a.trigger_event}</td>
                      <td className="p-3.5 text-slate-300 font-semibold uppercase">{a.channel}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          a.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {a.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button onClick={() => handleToggle(a.id)} className="p-1 bg-slate-800 text-slate-300 hover:text-amber-400 rounded">
                          {a.is_active ? <XCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No marketing automation triggers configured yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CREATE MODAL */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleCreateSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">New Marketing Automation</h3>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Campaign Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Welcome Loyalty Gift"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Trigger Event *</label>
                <select
                  value={data.trigger_event}
                  onChange={(e) => setData('trigger_event', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500"
                >
                  <option value="user_registered">Customer Registration</option>
                  <option value="order_completed">Order Completed</option>
                  <option value="cart_abandoned">Cart Abandoned</option>
                  <option value="product_price_dropped">Product Price Dropped</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Notification Message / Template *</label>
                <textarea
                  rows={3}
                  required
                  value={data.template}
                  onChange={(e) => setData('template', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-bold">Cancel</button>
                <button type="submit" disabled={processing} className="px-4 py-2 bg-amber-500 text-slate-950 rounded font-black uppercase">Create Campaign</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
