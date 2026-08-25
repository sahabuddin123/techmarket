import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import AdminEmptyState from '../../../Components/Admin/AdminEmptyState';
import ConfirmDialog from '../../../Components/Admin/ConfirmDialog';
import InlinePriceInput from '../../../Components/Admin/Products/InlinePriceInput';
import PendingPriceChangesBar from '../../../Components/Admin/Products/PendingPriceChangesBar';
import PriceChangeConfirmationModal from '../../../Components/Admin/Products/PriceChangeConfirmationModal';
import { 
  Plus, Edit2, Trash2, Package, ExternalLink,
  CheckCircle2, AlertTriangle, ShieldCheck,
  UploadCloud, DownloadCloud, FileSpreadsheet, FileText, ChevronDown, Download,
  Save, RotateCcw, Check
} from 'lucide-react';

export default function AdminProducts({ 
  products = { data: [], links: [] }, 
  categories = [], 
  brands = [], 
  filters = {} 
}) {
  const [search, setSearch] = useState(filters?.search || '');
  const [seoHealth, setSeoHealth] = useState(filters?.seo_health || '');
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [tableDensity, setTableDensity] = useState('comfortable');
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);

  // Inline Bulk Price State (persists across pagination/search)
  const [pendingChanges, setPendingChanges] = useState({});
  const [rowErrors, setRowErrors] = useState({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSavingPrices, setIsSavingPrices] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const productList = Array.isArray(products?.data) ? products.data : [];
  const pendingCount = Object.keys(pendingChanges).length;

  // Unsaved navigation protection
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (pendingCount > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pendingCount]);

  const handlePriceChange = (product, field, value) => {
    setPendingChanges(prev => {
      const origRegular = product.regular_price ?? product.price ?? 0;
      const origSelling = product.price ?? 0;

      const current = prev[product.id] || {
        product_id: product.id,
        title: product.title,
        sku: product.sku,
        regular_price: origRegular,
        selling_price: origSelling,
        original_regular_price: origRegular,
        original_selling_price: origSelling,
      };

      const updated = {
        ...current,
        [field]: value,
      };

      // Check if both fields match original database values
      const isRegularSame = String(updated.regular_price) === String(updated.original_regular_price);
      const isSellingSame = String(updated.selling_price) === String(updated.original_selling_price);

      if (isRegularSame && isSellingSame) {
        const next = { ...prev };
        delete next[product.id];
        return next;
      }

      return {
        ...prev,
        [product.id]: updated,
      };
    });

    // Live client validation: selling_price <= regular_price (when regular_price > 0)
    const curRegular = field === 'regular_price' ? Number(value) : Number(pendingChanges[product.id]?.regular_price ?? product.regular_price ?? product.price ?? 0);
    const curSelling = field === 'selling_price' ? Number(value) : Number(pendingChanges[product.id]?.selling_price ?? product.price ?? 0);

    if (curRegular > 0 && curSelling > curRegular) {
      setRowErrors(prev => ({
        ...prev,
        [product.id]: 'Selling price cannot exceed regular price.',
      }));
    } else {
      setRowErrors(prev => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
    }
  };

  const handleDiscardChanges = () => {
    if (pendingCount === 0) return;
    if (confirm(`Discard ${pendingCount} unsaved price modification${pendingCount > 1 ? 's' : ''} and restore original database values?`)) {
      setPendingChanges({});
      setRowErrors({});
      setToastMessage({ type: 'info', text: 'All unsaved price modifications have been discarded.' });
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleOpenConfirm = () => {
    if (pendingCount === 0) return;

    // Check if any row errors exist
    const hasErrors = Object.keys(rowErrors).length > 0;
    if (hasErrors) {
      setToastMessage({ type: 'error', text: 'Please resolve invalid price errors before updating.' });
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleConfirmSavePrices = async () => {
    const changeList = Object.values(pendingChanges);
    if (changeList.length === 0) return;

    setIsSavingPrices(true);
    try {
      const payload = changeList.map(item => ({
        product_id: item.product_id,
        regular_price: item.regular_price !== '' && item.regular_price !== null ? Number(item.regular_price) : null,
        selling_price: Number(item.selling_price),
      }));

      const res = await axios.post('/admin/products/bulk-prices', { updates: payload });

      if (res.data?.success) {
        // Optimistically update displayed product data in list
        res.data.updated_products?.forEach(updated => {
          const target = productList.find(p => p.id === updated.id);
          if (target) {
            target.price = updated.price;
            target.regular_price = updated.regular_price;
          }
        });

        setPendingChanges({});
        setRowErrors({});
        setIsConfirmModalOpen(false);
        setToastMessage({ type: 'success', text: `✓ ${res.data.message}` });
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error('Bulk price update failed:', err);
      const errorMsg = err.response?.data?.message || 'Failed to update prices. Please check the values.';
      const backendErrors = err.response?.data?.errors || {};

      const mappedErrors = {};
      Object.keys(backendErrors).forEach(key => {
        const match = key.match(/updates\.(\d+)\.(.*)/);
        if (match) {
          const index = parseInt(match[1]);
          const affected = changeList[index];
          if (affected) {
            mappedErrors[affected.product_id] = backendErrors[key][0];
          }
        }
      });

      setRowErrors(mappedErrors);
      setToastMessage({ type: 'error', text: `⚠ ${errorMsg}` });
    } finally {
      setIsSavingPrices(false);
    }
  };

  const handleSearchSubmit = (val) => {
    setSearch(val);
    router.get('/admin/products', { 
      search: val || undefined,
      seo_health: seoHealth || undefined,
    }, { preserveState: true, replace: true });
  };

  const handleBulkAction = (actionKey) => {
    if (selectedIds.length === 0) return;
    if (confirm(`Execute "${actionKey}" on ${selectedIds.length} selected products?`)) {
      router.post('/admin/products/bulk-seo', {
        action: actionKey,
        product_ids: selectedIds,
      }, {
        onFinish: () => setSelectedIds([]),
      });
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    router.delete(`/admin/products/${deleteTarget.id}`, {
      onFinish: () => setDeleteTarget(null),
    });
  };

  const getSeoBadge = (product) => {
    const score = product.seo_score || 0;
    const hasMeta = Boolean(product.seo_title || product.meta_title);

    if (!hasMeta) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-mono">
          <AlertTriangle className="w-3 h-3 mr-1" />
          <span>Needs SEO</span>
        </span>
      );
    }

    if (score >= 80) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-mono">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          <span>Optimized ({score}%)</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-mono">
        <AlertTriangle className="w-3 h-3 mr-1" />
        <span>Fair ({score}%)</span>
      </span>
    );
  };

  const tableColumns = [
    {
      header: 'Product Title & SKU',
      accessor: 'title',
      sortable: true,
      render: (product) => (
        <div className="flex items-center space-x-3">
          {product.image ? (
            <img
              src={product.image}
              alt=""
              className="w-10 h-10 object-contain rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 p-1"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
              <Package className="w-5 h-5" />
            </div>
          )}
          <div className="truncate max-w-xs space-y-0.5">
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="truncate text-slate-900 dark:text-slate-100 font-bold font-heading text-xs hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block"
            >
              {product.title}
            </Link>
            <div className="text-[10.5px] text-slate-400 font-mono">
              SKU: {product.sku || 'N/A'} {product.is_featured ? '• ⭐ Featured' : ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Category & Brand',
      accessor: 'category',
      render: (product) => (
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-200">{product.category?.name || 'General'}</div>
          <div className="text-[10.5px] text-slate-400">{product.brand?.name || 'Unbranded'}</div>
        </div>
      ),
    },
    {
      header: 'Stock Status',
      accessor: 'stock',
      render: (product) => (
        <AdminStatusBadge
          status={product.stock > 0 ? (product.stock <= 5 ? 'low_stock' : 'in_stock') : 'out_of_stock'}
          label={product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
          size="xs"
        />
      ),
    },
    {
      header: 'Regular Price',
      accessor: 'regular_price',
      render: (product) => {
        const item = pendingChanges[product.id];
        const origVal = product.regular_price ?? product.price ?? 0;
        const currentVal = item?.regular_price !== undefined ? item.regular_price : origVal;

        return (
          <InlinePriceInput
            value={currentVal}
            originalValue={origVal}
            onChange={(val) => handlePriceChange(product, 'regular_price', val)}
            error={rowErrors[product.id]}
            placeholder="0.00"
          />
        );
      },
    },
    {
      header: 'Selling Price',
      accessor: 'price',
      render: (product) => {
        const item = pendingChanges[product.id];
        const origVal = product.price ?? 0;
        const currentVal = item?.selling_price !== undefined ? item.selling_price : origVal;

        return (
          <InlinePriceInput
            value={currentVal}
            originalValue={origVal}
            onChange={(val) => handlePriceChange(product, 'selling_price', val)}
            error={rowErrors[product.id]}
            placeholder="0.00"
          />
        );
      },
    },
    {
      header: 'SEO Health',
      accessor: 'seo_score',
      render: (product) => getSeoBadge(product),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (product) => (
        <div className="flex items-center justify-end space-x-1.5 whitespace-nowrap">
          <a
            href={`/product/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="View Live Product Page"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 transition-colors"
            title="Edit Product"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setDeleteTarget(product)}
            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
            title="Delete Product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Products">
      <Head title="Hardware Catalog - TechMarket Admin" />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-3 duration-200 ${
          toastMessage.type === 'error'
            ? 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
            : toastMessage.type === 'info'
              ? 'bg-slate-800 text-white border-slate-700'
              : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
        }`}>
          {toastMessage.type === 'success' && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          {toastMessage.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Hardware Catalog"
          subtitle="Manage components, live inventory status, inline pricing schedules, and automated SEO metadata."
          badge={`${products?.total || productList.length} Items`}
          actions={
            <div className="flex items-center gap-2">
              {/* 1. Import Format Dropdown Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsFormatDropdownOpen(!isFormatDropdownOpen)}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-all"
                  title="Download Schema Import Formats / Templates"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Import Format</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isFormatDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-20" 
                      onClick={() => setIsFormatDropdownOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-30 py-1 text-xs">
                      <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                        Product Schema Templates
                      </div>
                      <a
                        href="/admin/data-management/template/products/xlsx"
                        download
                        onClick={() => setIsFormatDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition"
                      >
                        <span className="flex items-center gap-2">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                          Excel Workbook (.xlsx)
                        </span>
                        <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">XLSX</span>
                      </a>
                      <a
                        href="/admin/data-management/template/products/csv"
                        download
                        onClick={() => setIsFormatDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          Standard CSV Format
                        </span>
                        <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">CSV</span>
                      </a>
                    </div>
                  </>
                )}
              </div>

              {/* 2. Export Button */}
              <Link
                href="/admin/data-management/export?entity=products"
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-all"
                title="Export Filtered Product Catalog"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Export</span>
              </Link>

              {/* 3. Bulk Import Button */}
              <Link
                href="/admin/data-management/import?entity=products"
                className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-all"
                title="Launch Bulk Product Import Wizard"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Bulk Import</span>
              </Link>

              {/* 4. Prominent Update Prices Button */}
              <button
                type="button"
                onClick={handleOpenConfirm}
                disabled={pendingCount === 0 || isSavingPrices}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer ${
                  pendingCount > 0
                    ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
                title={pendingCount > 0 ? `Apply ${pendingCount} pending price changes` : 'No price changes pending'}
              >
                <Save className="w-4 h-4" />
                <span>Update Prices ({pendingCount})</span>
              </button>

              {/* 5. Add New Product Button */}
              <Link
                href="/admin/products/create"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs hover:shadow transition-all"
                style={{ backgroundColor: 'var(--admin-primary, #4f46e5)' }}
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </Link>
            </div>
          }
        />

        {/* Page Toolbar */}
        <AdminPageToolbar
          search={search}
          onSearchChange={handleSearchSubmit}
          searchPlaceholder="Search by title, SKU, brand, model..."
          bulkSelectionCount={selectedIds.length}
          bulkActions={[
            { label: 'Generate Missing SEO', onClick: () => handleBulkAction('generate_missing_meta') },
            { label: 'Set Indexable', onClick: () => handleBulkAction('set_indexable') },
            { label: 'Set No-Index', onClick: () => handleBulkAction('set_noindex') },
          ]}
          onRefresh={() => router.get('/admin/products')}
        >
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                {pendingCount} price changes pending
              </span>
              <button
                type="button"
                onClick={handleDiscardChanges}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                Discard
              </button>
            </div>
          )}
        </AdminPageToolbar>

        {/* Enterprise Data Table with Inline Price Editing */}
        <AdminTable
          columns={tableColumns}
          data={productList}
          pagination={products}
          selectable={true}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          density={tableDensity}
          onDensityChange={setTableDensity}
          emptyTitle="No products in catalog"
          emptyDescription="Add your first component or adjust your search filter."
          emptyAction={
            <Link
              href="/admin/products/create"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center space-x-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Link>
          }
        />
      </div>

      {/* Floating Bottom Bar for Pending Changes */}
      <PendingPriceChangesBar
        pendingCount={pendingCount}
        onOpenConfirm={handleOpenConfirm}
        onDiscard={handleDiscardChanges}
        isProcessing={isSavingPrices}
      />

      {/* Price Change Confirmation Modal */}
      <PriceChangeConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSavePrices}
        pendingChanges={pendingChanges}
        isProcessing={isSavingPrices}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All catalog references and specs will be permanently removed.`}
        confirmText="Delete Product"
        isDestructive
      />
    </AdminShell>
  );
}
