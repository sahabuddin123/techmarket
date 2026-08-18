import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { Flame, Plus, Trash2, Clock, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AdminFlashSales({ flashSales, products }) {
  const [modalOpen, setModalOpen] = useState(false);

  const { data, setData, post, processing, reset } = useForm({
    title: '',
    start_time: '',
    end_time: '',
    is_active: true,
    items: [{ product_id: '', flash_price: '' }],
  });

  const addItemRow = () => {
    setData('items', [...data.items, { product_id: '', flash_price: '' }]);
  };

  const handleToggle = (id) => {
    router.post(`/admin/flash-sales/${id}/toggle`);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this Flash Sale campaign?')) {
      router.delete(`/admin/flash-sales/${id}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/flash-sales', {
      onSuccess: () => {
        setModalOpen(false);
        reset();
      }
    });
  };

  return (
    <AdminLayout title="Flash Sales Campaigns">
      <Head title="Flash Sales & Promotions - Admin" />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <Flame className="w-6 h-6 text-rose-500" />
              <span>FLASH SALES & PROMOTIONAL CAMPAIGNS</span>
            </h1>
            <p className="text-xs text-slate-400">Manage time-limited flash sales, countdown banners, and price overrides.</p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-4 py-2.5 rounded-lg flex items-center space-x-1.5 shadow-lg w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE FLASH SALE</span>
          </button>
        </div>

        {/* CAMPAIGNS LIST */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="p-3.5">Campaign Title</th>
                  <th className="p-3.5">Start & End Schedule</th>
                  <th className="p-3.5">Products Included</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {flashSales && flashSales.length > 0 ? (
                  flashSales.map(fs => (
                    <tr key={fs.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-white text-sm">{fs.title}</td>
                      <td className="p-3.5 text-slate-300">
                        <div>From: {new Date(fs.start_time).toLocaleString()}</div>
                        <div>To: {new Date(fs.end_time).toLocaleString()}</div>
                      </td>
                      <td className="p-3.5 font-bold text-amber-400">
                        {fs.items ? fs.items.length : 0} Products
                      </td>
                      <td className="p-3.5">
                        <button onClick={() => handleToggle(fs.id)} className="flex items-center space-x-1">
                          {fs.is_active ? (
                            <span className="text-emerald-400 font-bold flex items-center"><ToggleRight className="w-5 h-5 mr-1" /> Active</span>
                          ) : (
                            <span className="text-slate-500 font-bold flex items-center"><ToggleLeft className="w-5 h-5 mr-1" /> Inactive</span>
                          )}
                        </button>
                      </td>
                      <td className="p-3.5 text-right">
                        <button onClick={() => handleDelete(fs.id)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No flash sales campaigns created yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CREATE MODAL */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">Create Flash Sale Campaign</h3>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eid Flash Sale Monster Discount"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={data.start_time}
                    onChange={(e) => setData('start_time', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={data.end_time}
                    onChange={(e) => setData('end_time', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-rose-500"
                  />
                </div>
              </div>

              {/* PRODUCTS SELECTION ROWS */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <label className="text-slate-300 font-bold">Select Products & Override Flash Prices</label>
                  <button type="button" onClick={addItemRow} className="text-amber-400 hover:underline font-bold text-[11px]">
                    + Add Product Row
                  </button>
                </div>

                {data.items.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-2 p-2 bg-slate-950 rounded border border-slate-800">
                    <select
                      required
                      value={row.product_id}
                      onChange={(e) => {
                        const newItems = [...data.items];
                        newItems[idx].product_id = e.target.value;
                        setData('items', newItems);
                      }}
                      className="bg-slate-900 text-slate-100 p-2 rounded border border-slate-800 text-xs"
                    >
                      <option value="">Select Product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.title} (Regular: ৳{p.price})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      required
                      placeholder="Flash Price (BDT ৳)"
                      value={row.flash_price}
                      onChange={(e) => {
                        const newItems = [...data.items];
                        newItems[idx].flash_price = e.target.value;
                        setData('items', newItems);
                      }}
                      className="bg-slate-900 text-slate-100 p-2 rounded border border-slate-800 text-xs"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-bold">Cancel</button>
                <button type="submit" disabled={processing} className="px-5 py-2 bg-rose-600 text-white rounded font-black uppercase">Create Flash Sale</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
