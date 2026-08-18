import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { Warehouse, Plus, History, ArrowDown, ArrowUp, RefreshCw } from 'lucide-react';

export default function AdminInventory({ products, movements, filters }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, setData, post, processing, reset } = useForm({
    product_id: '',
    type: 'purchase',
    quantity: 1,
    notes: '',
  });

  const openAdjustmentModal = (product) => {
    setSelectedProduct(product);
    setData({
      product_id: product.id,
      type: 'purchase',
      quantity: 1,
      notes: `Restock inventory adjustment for ${product.sku}`,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/admin/inventory/adjust', {
      onSuccess: () => {
        setModalOpen(false);
        reset();
      }
    });
  };

  return (
    <AdminLayout title="Inventory Ledger Workspace">
      <Head title="Inventory Ledger & Movements - Admin" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
            <Warehouse className="w-6 h-6 text-amber-500" />
            <span>INVENTORY WORKSPACE & MOVEMENTS LEDGER</span>
          </h1>
          <p className="text-xs text-slate-400">Track real-time hardware stock levels, audit reservations, and manual stock movements.</p>
        </div>

        {/* INVENTORY MOVEMENTS LEDGER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
              <Warehouse className="w-4 h-4 text-emerald-400" />
              <span>Current Stock Levels by Hardware Item</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                    <th className="p-3">Product SKU & Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">In Stock</th>
                    <th className="p-3 text-right">Adjust Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products.data.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="p-3">
                        <div className="font-bold text-white leading-tight">{p.title}</div>
                        <div className="text-[10px] font-mono text-slate-400">{p.sku}</div>
                      </td>
                      <td className="p-3 text-slate-300">{p.category?.name}</td>
                      <td className="p-3">
                        <span className={`font-black px-2 py-0.5 rounded text-xs ${
                          p.stock <= 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 
                          p.stock <= 5 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {p.stock} Units
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => openAdjustmentModal(p)}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] px-3 py-1 rounded flex items-center space-x-1 ml-auto shadow"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Adjust</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RECENT MOVEMENT AUDIT LOGS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
              <History className="w-4 h-4 text-blue-400" />
              <span>Recent Stock Movements</span>
            </h3>

            <div className="space-y-3 text-xs overflow-y-auto max-h-[500px] pr-1">
              {movements && movements.map(m => (
                <div key={m.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">{m.product?.sku}</span>
                    <span className={`font-bold text-[10px] uppercase px-1.5 py-0.5 rounded ${
                      m.quantity > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {m.type} ({m.quantity > 0 ? `+${m.quantity}` : m.quantity})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{m.notes}</div>
                  <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-900">
                    <span>Resulting: {m.resulting_stock}</span>
                    <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ADJUSTMENT MODAL */}
        {modalOpen && selectedProduct && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Adjust Inventory: {selectedProduct.sku}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Adjustment Type</label>
                  <select
                    value={data.type}
                    onChange={(e) => setData('type', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500"
                  >
                    <option value="purchase">Purchase Restock (+)</option>
                    <option value="adjustment">Manual Adjustment (+/-)</option>
                    <option value="return">Customer Return (+)</option>
                    <option value="damaged">Damaged/Lost (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Quantity Change (Use negative for deduction)</label>
                  <input
                    type="number"
                    required
                    value={data.quantity}
                    onChange={(e) => setData('quantity', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Reason / Notes *</label>
                  <textarea
                    rows={2}
                    required
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded font-black uppercase"
                  >
                    Save Movement
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
