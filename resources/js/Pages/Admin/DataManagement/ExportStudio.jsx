import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { 
  DownloadCloud, 
  ArrowLeft, 
  Package, 
  FolderTree, 
  Tag, 
  Ruler, 
  CheckCircle2, 
  FileSpreadsheet, 
  FileText, 
  Code, 
  Filter, 
  Sliders, 
  Check, 
  Download,
  Search,
  Sparkles
} from 'lucide-react';

export default function ExportStudio({ supportedEntities, categories, brands, units, exportColumns }) {
  const urlParams = new URLSearchParams(window.location.search);
  const initialEntity = urlParams.get('entity') || 'products';

  const [selectedEntity, setSelectedEntity] = useState(initialEntity);
  const [exportFormat, setExportFormat] = useState('xlsx');
  
  // Columns state per entity
  const initialSelectedCols = exportColumns[selectedEntity]
    ? exportColumns[selectedEntity].filter((c) => c.default).map((c) => c.key)
    : [];

  const [selectedColumns, setSelectedColumns] = useState(initialSelectedCols);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    brand_id: '',
    unit_id: '',
    stock_status: '',
    component_type: '',
    is_active: '',
    is_featured: '',
    type: '',
    price_min: '',
    price_max: '',
  });

  const entityIcons = {
    products: Package,
    categories: FolderTree,
    brands: Tag,
    units: Ruler,
  };

  const handleEntityChange = (entityKey) => {
    setSelectedEntity(entityKey);
    const defaults = exportColumns[entityKey]
      ? exportColumns[entityKey].filter((c) => c.default).map((c) => c.key)
      : [];
    setSelectedColumns(defaults);
  };

  const toggleColumn = (key) => {
    if (selectedColumns.includes(key)) {
      setSelectedColumns(selectedColumns.filter((k) => k !== key));
    } else {
      setSelectedColumns([...selectedColumns, key]);
    }
  };

  const selectAllColumns = () => {
    const all = exportColumns[selectedEntity]?.map((c) => c.key) || [];
    setSelectedColumns(all);
  };

  const deselectAllColumns = () => {
    setSelectedColumns([]);
  };

  const resetToDefaultColumns = () => {
    const defaults = exportColumns[selectedEntity]?.filter((c) => c.default).map((c) => c.key) || [];
    setSelectedColumns(defaults);
  };

  const availableColsForEntity = exportColumns[selectedEntity] || [];

  return (
    <AdminLayout>
      <Head title="Export Studio — Filtered CSV & Excel Generator" />

      <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <Link href="/admin/data-management" className="hover:text-slate-800 transition">Data Management</Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Export Studio</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <DownloadCloud className="w-6 h-6 text-indigo-600" />
              Filtered Export Studio
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate custom CSV, multi-sheet XLSX, or JSON datasets with selective column scoping and query filters.
            </p>
          </div>

          <Link
            href="/admin/data-management"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* 1. Entity & Format Chooser Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Entity Selection */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600" />
              1. Select Entity to Export
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(supportedEntities).map(([key, entity]) => {
                const Icon = entityIcons[key] || FileSpreadsheet;
                const isSelected = selectedEntity === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleEntityChange(key)}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-100'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">{entity.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export Format */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                2. Export Format
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'xlsx', label: 'Excel (XLSX)', icon: FileSpreadsheet, color: 'text-emerald-600' },
                  { id: 'csv', label: 'CSV', icon: FileText, color: 'text-blue-600' },
                  { id: 'json', label: 'JSON API', icon: Code, color: 'text-amber-600' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setExportFormat(fmt.id)}
                    className={`p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      exportFormat === fmt.id
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <fmt.icon className={`w-5 h-5 ${fmt.color}`} />
                    <span className="text-xs font-bold text-slate-800">{fmt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Streams data safely without memory constraints.
            </div>
          </div>
        </div>

        {/* 2. Filter Matrix */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600" />
              3. Filter Records (Optional)
            </h2>
            <button
              type="button"
              onClick={() =>
                setFilters({
                  search: '',
                  category_id: '',
                  brand_id: '',
                  unit_id: '',
                  stock_status: '',
                  component_type: '',
                  is_active: '',
                  is_featured: '',
                  type: '',
                  price_min: '',
                  price_max: '',
                })
              }
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Clear All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Universal Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Search Keywords</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Title, SKU, name..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-8 text-xs rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-1.5 font-medium"
                />
              </div>
            </div>

            {/* Product-Specific Filters */}
            {selectedEntity === 'products' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={filters.category_id}
                    onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                    className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-1.5 font-medium"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
                  <select
                    value={filters.brand_id}
                    onChange={(e) => setFilters({ ...filters, brand_id: e.target.value })}
                    className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-1.5 font-medium"
                  >
                    <option value="">All Brands</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Status</label>
                  <select
                    value={filters.stock_status}
                    onChange={(e) => setFilters({ ...filters, stock_status: e.target.value })}
                    className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-1.5 font-medium"
                  >
                    <option value="">Any Stock Level</option>
                    <option value="in_stock">In Stock (&gt; 0)</option>
                    <option value="low_stock">Low Stock Warning</option>
                    <option value="out_of_stock">Out of Stock (0)</option>
                  </select>
                </div>
              </>
            )}

            {/* Unit-specific filters */}
            {selectedEntity === 'units' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-1.5 font-medium"
                >
                  <option value="">All Types</option>
                  <option value="quantity">Quantity</option>
                  <option value="length">Length</option>
                  <option value="weight">Weight</option>
                  <option value="volume">Volume</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            {/* Active Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={filters.is_active}
                onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-1.5 font-medium"
              >
                <option value="">All Statuses</option>
                <option value="1">Active / Published</option>
                <option value="0">Draft / Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Column Scope Selector */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                4. Select Columns to Include ({selectedColumns.length} of {availableColsForEntity.length} selected)
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={selectAllColumns}
                className="px-2.5 py-1 font-semibold text-indigo-600 hover:bg-indigo-50 rounded transition"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={deselectAllColumns}
                className="px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-100 rounded transition"
              >
                Deselect All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={resetToDefaultColumns}
                className="px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-100 rounded transition"
              >
                Reset to Defaults
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {availableColsForEntity.map((col) => {
              const isChecked = selectedColumns.includes(col.key);

              return (
                <label
                  key={col.key}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center gap-2 transition-all select-none ${
                    isChecked
                      ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleColumn(col.key)}
                    className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="truncate">{col.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 4. Action Bar */}
        <form action="/admin/data-management/export" method="POST" target="_blank" className="flex justify-end">
          <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
          <input type="hidden" name="entity_type" value={selectedEntity} />
          <input type="hidden" name="format" value={exportFormat} />
          {selectedColumns.map((col) => (
            <input key={col} type="hidden" name="columns[]" value={col} />
          ))}
          {Object.entries(filters).map(([k, v]) => (
            v !== '' ? <input key={k} type="hidden" name={`filters[${k}]`} value={v} /> : null
          ))}

          <button
            type="submit"
            disabled={selectedColumns.length === 0}
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition shadow-lg"
          >
            <Download className="w-4 h-4" />
            Generate & Download {exportFormat.toUpperCase()}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
