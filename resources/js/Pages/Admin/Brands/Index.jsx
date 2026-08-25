import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import ConfirmDialog from '../../../Components/Admin/ConfirmDialog';
import { Plus, Edit2, Trash2, Tag, ExternalLink } from 'lucide-react';

export default function AdminBrands({ brands = [] }) {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [density, setDensity] = useState('comfortable');

  const brandList = Array.isArray(brands) ? brands : [];

  const filteredBrands = brandList.filter(b => 
    !search || b.name?.toLowerCase().includes(search.toLowerCase()) || b.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (!deleteTarget) return;
    router.delete(`/admin/brands/${deleteTarget.id}`, {
      onFinish: () => setDeleteTarget(null),
    });
  };

  const columns = [
    {
      header: 'Brand Name',
      accessor: 'name',
      sortable: true,
      render: (brand) => (
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-xs shrink-0 font-heading uppercase shadow-2xs">
            {brand.name ? brand.name.substring(0, 2) : 'BR'}
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100 font-heading text-xs">
              {brand.name}
            </div>
            <div className="text-[10.5px] text-slate-400 font-mono">
              slug: {brand.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Total Products in Catalog',
      accessor: 'products_count',
      align: 'center',
      sortable: true,
      render: (brand) => (
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
          {brand.products_count ?? 0} Items
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (brand) => (
        <div className="flex items-center justify-end space-x-1.5 whitespace-nowrap">
          <a
            href={`/brand/${brand.slug}`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Preview Storefront Brand Page"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link
            href={`/admin/brands/${brand.id}/edit`}
            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 transition-colors"
            title="Edit Brand"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setDeleteTarget(brand)}
            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
            title="Delete Brand"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Brands">
      <Head title="Authorized Tech Brands - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Authorized Tech Brands"
          subtitle="Manage hardware manufacturers, official authorized partners, and brand showcase logos."
          badge={`${brandList.length} Brands`}
          actions={
            <div className="flex items-center gap-2">
              <a
                href="/admin/data-management/template/brands/xlsx"
                download
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-all"
                title="Download Brand Import Template (XLSX)"
              >
                <span>Import Format</span>
              </a>

              <Link
                href="/admin/data-management/export?entity=brands"
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-all"
                title="Export Brands"
              >
                <span>Export</span>
              </Link>

              <Link
                href="/admin/data-management/import?entity=brands"
                className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-all"
                title="Bulk Import Brands"
              >
                <span>Bulk Import</span>
              </Link>

              <Link
                href="/admin/brands/create"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs hover:shadow transition-all"
                style={{ backgroundColor: 'var(--admin-primary, #4f46e5)' }}
              >
                <Plus className="w-4 h-4" />
                <span>Add New Brand</span>
              </Link>
            </div>
          }
        />

        {/* Page Toolbar */}
        <AdminPageToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search brands by name or slug..."
          onRefresh={() => router.get('/admin/brands')}
        />

        {/* Brands Table */}
        <AdminTable
          columns={columns}
          data={filteredBrands}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No brands found"
          emptyDescription="Add authorized brand partners (e.g. ASUS, MSI, Intel, AMD, Corsair) to your catalog."
          emptyAction={
            <Link
              href="/admin/brands/create"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Brand</span>
            </Link>
          }
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Brand"
        message={`Are you sure you want to delete brand "${deleteTarget?.name}"?`}
        confirmText="Delete Brand"
        isDestructive
      />
    </AdminShell>
  );
}
