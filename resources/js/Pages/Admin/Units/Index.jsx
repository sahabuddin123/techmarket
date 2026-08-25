import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  Ruler, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UploadCloud, 
  DownloadCloud, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowLeft,
  Layers,
  Scale
} from 'lucide-react';

export default function UnitsIndex({ units, baseUnits, filters }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);

  const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
    name: '',
    short_code: '',
    symbol: '',
    type: 'quantity',
    base_unit_id: '',
    conversion_factor: '1.0',
    is_active: true,
  });

  const openCreateModal = () => {
    setEditingUnit(null);
    reset();
    clearErrors();
    setIsModalOpen(true);
  };

  const openEditModal = (unit) => {
    setEditingUnit(unit);
    clearErrors();
    setData({
      name: unit.name,
      short_code: unit.short_code,
      symbol: unit.symbol || '',
      type: unit.type,
      base_unit_id: unit.base_unit_id || '',
      conversion_factor: String(unit.conversion_factor || '1.0'),
      is_active: Boolean(unit.is_active),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUnit(null);
    reset();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUnit) {
      put(`/admin/units/${editingUnit.id}`, {
        onSuccess: () => closeModal(),
      });
    } else {
      post('/admin/units', {
        onSuccess: () => closeModal(),
      });
    }
  };

  const handleDelete = (unit) => {
    if (confirm(`Are you sure you want to delete measurement unit "${unit.name}"?`)) {
      destroy(`/admin/units/${unit.id}`);
    }
  };

  const handleSearchChange = (val) => {
    router.get('/admin/units', { ...filters, search: val || undefined }, { preserveState: true, replace: true });
  };

  const handleTypeChange = (val) => {
    router.get('/admin/units', { ...filters, type: val || undefined }, { preserveState: true, replace: true });
  };

  return (
    <AdminLayout>
      <Head title="Measurement Units — Admin Catalog" />

      <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <Link href="/admin" className="hover:text-slate-800 transition">Dashboard</Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Units</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Ruler className="w-6 h-6 text-indigo-600" />
              Measurement Units Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Define standard commerce units (Piece, Box, Meter, Kilogram) with conversion ratios and product relationships.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/data-management/template/units/xlsx"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm"
              download
            >
              Template
            </Link>
            <Link
              href="/admin/data-management/import?entity=units"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Import Units
            </Link>
            <Link
              href="/admin/data-management/export?entity=units"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm"
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              Export Units
            </Link>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Unit
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, short code, symbol..."
              defaultValue={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 text-xs rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-2 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Type:</span>
            <select
              value={filters.type || ''}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="text-xs rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-1.5 font-medium"
            >
              <option value="">All Unit Types</option>
              <option value="quantity">Quantity (Piece, Box, Pack)</option>
              <option value="length">Length (Meter, Feet, Roll)</option>
              <option value="weight">Weight (Kilogram, Gram)</option>
              <option value="volume">Volume (Liter)</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Units Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3.5 px-4">Unit Name</th>
                  <th className="py-3.5 px-4">Short Code</th>
                  <th className="py-3.5 px-4">Symbol</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Conversion Ratio</th>
                  <th className="py-3.5 px-4">Assigned Products</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {units.data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400">
                      No measurement units found.
                    </td>
                  </tr>
                ) : (
                  units.data.map((unit) => (
                    <tr key={unit.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{unit.name}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{unit.short_code}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{unit.symbol || '—'}</td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {unit.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {unit.base_unit ? (
                          <span>1 {unit.name} = <strong className="text-slate-900">{unit.conversion_factor}</strong> {unit.base_unit.name}</span>
                        ) : (
                          <span className="text-slate-400 italic">Base Unit</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{unit.products_count} product(s)</td>
                      <td className="py-3.5 px-4">
                        {unit.is_active ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(unit)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(unit)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Create/Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingUnit ? `Edit Unit: ${editingUnit.name}` : 'Add Measurement Unit'}
                </h3>
                <button type="button" onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Box of 12"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-2 font-medium"
                  />
                  {errors.name && <div className="text-[11px] text-rose-600 mt-1">{errors.name}</div>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Short Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. box12"
                      value={data.short_code}
                      onChange={(e) => setData('short_code', e.target.value)}
                      className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-2 font-mono font-medium"
                    />
                    {errors.short_code && <div className="text-[11px] text-rose-600 mt-1">{errors.short_code}</div>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Symbol</label>
                    <input
                      type="text"
                      placeholder="e.g. bx"
                      value={data.symbol}
                      onChange={(e) => setData('symbol', e.target.value)}
                      className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-2 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Unit Type</label>
                    <select
                      value={data.type}
                      onChange={(e) => setData('type', e.target.value)}
                      className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-2 font-medium"
                    >
                      <option value="quantity">Quantity</option>
                      <option value="length">Length</option>
                      <option value="weight">Weight</option>
                      <option value="volume">Volume</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Base Unit</label>
                    <select
                      value={data.base_unit_id}
                      onChange={(e) => setData('base_unit_id', e.target.value)}
                      className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-2 font-medium"
                    >
                      <option value="">-- No Base Unit (Primary) --</option>
                      {baseUnits.filter((b) => !editingUnit || b.id !== editingUnit.id).map((b) => (
                        <option key={b.id} value={b.id}>{b.name} ({b.short_code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {data.base_unit_id && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Conversion Factor (Multiplier)</label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      placeholder="e.g. 12.0"
                      value={data.conversion_factor}
                      onChange={(e) => setData('conversion_factor', e.target.value)}
                      className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-2 font-medium"
                    />
                    <div className="text-[11px] text-slate-500 mt-1">
                      1 {data.name || 'Unit'} = {data.conversion_factor || '1'} Base Unit
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="unitIsActive"
                    checked={data.is_active}
                    onChange={(e) => setData('is_active', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <label htmlFor="unitIsActive" className="text-xs font-bold text-slate-800">
                    Unit is Active & Available in Products
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm"
                  >
                    {editingUnit ? 'Update Unit' : 'Create Unit'}
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
