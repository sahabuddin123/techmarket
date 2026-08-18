import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import PageHeader from '../../../Components/Admin/PageHeader';
import FilterBar from '../../../Components/Admin/FilterBar';
import StatusBadge from '../../../Components/Admin/StatusBadge';
import EmptyState from '../../../Components/Admin/EmptyState';
import ConfirmDialog from '../../../Components/Admin/ConfirmDialog';
import { 
  Plus, Search, Edit2, Trash2, Package, Filter, 
  Eye, CheckCircle2, XCircle, AlertTriangle, ExternalLink,
  Sparkles, RefreshCw, Globe, Check, ShieldCheck, Layers
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
  const [bulkAction, setBulkAction] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const productList = Array.isArray(products?.data) ? products.data : [];

  const handleFilterSubmit = () => {
    router.get('/admin/products', { 
      search: search || undefined,
      seo_health: seoHealth || undefined,
    }, { preserveState: true });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(productList.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExecuteBulkAction = () => {
    if (!bulkAction) {
      alert('Please select a bulk operation.');
      return;
    }

    if (confirm(`Execute "${bulkAction}" on ${selectedIds.length > 0 ? selectedIds.length + ' selected' : 'ALL matching'} products?`)) {
      setIsBulkProcessing(true);
      router.post('/admin/products/bulk-seo', {
        action: bulkAction,
        product_ids: selectedIds,
      }, {
        onFinish: () => {
          setIsBulkProcessing(false);
          setSelectedIds([]);
          setBulkAction('');
        }
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
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
          <AlertTriangle className="w-3 h-3 mr-1" />
          <span>Needs SEO</span>
        </span>
      );
    }

    if (score >= 80) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          <span>Optimized ({score}%)</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
        <AlertTriangle className="w-3 h-3 mr-1" />
        <span>Fair ({score}%)</span>
      </span>
    );
  };

  return (
    <AdminLayout title="Hardware Catalog Management">
      <Head title="Products Catalog - TechMarket BD Admin" />

      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Hardware Products Catalog"
          subtitle="Manage components, live inventory status, pricing schedules, and automated SEO metadata."
          badge={`${products?.total || productList.length} Items`}
          actions={
            <div className="flex items-center space-x-2.5">
              <Link
                href="/admin/products/create"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </Link>
            </div>
          }
        />

        {/* Filter & Search Bar */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          onSearchSubmit={handleFilterSubmit}
          searchPlaceholder="Search by title, SKU, brand, model..."
          filters={[
            {
              value: seoHealth,
              onChange: (val) => {
                setSeoHealth(val);
                router.get('/admin/products', { 
                  search: search || undefined,
                  seo_health: val || undefined,
                }, { preserveState: true });
              },
              options: [
                { value: '', label: 'All SEO Health' },
                { value: 'needs_attention', label: 'Needs SEO Attention' },
                { value: 'good', label: 'SEO Ready (80%+)' },
                { value: 'missing', label: 'Missing Meta Tags' },
              ]
            }
          ]}
          onReset={() => {
            setSearch('');
            setSeoHealth('');
            router.get('/admin/products');
          }}
        />

        {/* BULK ACTIONS TOOLBAR */}
        <div className="p-3.5 bg-slate-900/90 border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-slate-400 font-bold">
              Selected: <span className="text-amber-400 font-bold">{selectedIds.length}</span> of {productList.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-800 focus:border-amber-500 focus:outline-none font-medium"
            >
              <option value="">Bulk Actions...</option>
              <option value="generate_seo">Auto-Generate Missing SEO</option>
              <option value="index_all">Set Indexing (index, follow)</option>
              <option value="noindex_all">Set No-Index (noindex, nofollow)</option>
            </select>

            <button
              type="button"
              onClick={handleExecuteBulkAction}
              disabled={isBulkProcessing || !bulkAction}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {isBulkProcessing ? 'Executing...' : 'Apply Bulk'}
            </button>
          </div>
        </div>

        {/* PRODUCTS TABLE */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto admin-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                  <th className="p-3.5 w-10">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedIds.length > 0 && selectedIds.length === productList.length}
                      className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500"
                    />
                  </th>
                  <th className="p-3.5">Product Title & SKU</th>
                  <th className="p-3.5">Category & Brand</th>
                  <th className="p-3.5">Stock Status</th>
                  <th className="p-3.5">SEO Health</th>
                  <th className="p-3.5 text-right">Price (BDT)</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {productList.length > 0 ? (
                  productList.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => handleToggleSelect(product.id)}
                          className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500"
                        />
                      </td>
                      <td className="p-3.5 font-bold text-white flex items-center space-x-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt=""
                            className="w-10 h-10 object-contain rounded-xl bg-slate-950 border border-slate-800 shrink-0 p-1"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div className="truncate max-w-sm space-y-0.5">
                          <div className="truncate text-slate-100 font-bold font-heading text-xs hover:text-amber-400">
                            <Link href={`/admin/products/${product.id}/edit`}>{product.title}</Link>
                          </div>
                          <div className="text-[10.5px] text-slate-500 font-mono">
                            SKU: {product.sku || 'N/A'} {product.is_featured ? '• ⭐ Featured' : ''}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-300">
                        <div>{product.category?.name || 'General'}</div>
                        <div className="text-[10px] text-slate-500">{product.brand?.name || 'Unbranded'}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <StatusBadge 
                            status={product.stock > 0 ? (product.stock <= 5 ? 'low_stock' : 'in_stock') : 'out_of_stock'} 
                            label={product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                            size="xs"
                          />
                        </div>
                      </td>
                      <td className="p-3.5">
                        {getSeoBadge(product)}
                      </td>
                      <td className="p-3.5 text-right font-mono font-black text-amber-400">
                        ৳ {(product.sale_price || product.price || 0).toLocaleString()}
                        {product.sale_price && product.price > product.sale_price && (
                          <div className="text-[10px] text-slate-500 line-through">
                            ৳ {product.price.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <a
                          href={`/product/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 inline-block bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                          title="View Live Product Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-1.5 inline-block bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
                          className="p-1.5 inline-block bg-slate-800 hover:bg-rose-900/50 text-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-0">
                      <EmptyState
                        title="No products in catalog"
                        description="Add your first component or adjust your search filter."
                        action={
                          <Link
                            href="/admin/products/create"
                            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs inline-flex items-center space-x-1.5"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Product</span>
                          </Link>
                        }
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {products?.links && products.links.length > 3 && (
          <div className="flex items-center justify-between text-xs text-slate-400 px-2 pt-1 font-medium">
            <div>
              Showing <span className="font-bold text-white font-mono">{products.from || 0}</span> to <span className="font-bold text-white font-mono">{products.to || 0}</span> of <span className="font-bold text-white font-mono">{products.total || 0}</span> products
            </div>

            <div className="flex items-center space-x-1 font-mono">
              {products.links.map((link, idx) => (
                <button
                  key={idx}
                  disabled={!link.url || link.active}
                  onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    link.active
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : link.url
                      ? 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 cursor-pointer'
                      : 'bg-slate-950 text-slate-700 opacity-40 cursor-not-allowed'
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}

      </div>

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
    </AdminLayout>
  );
}
