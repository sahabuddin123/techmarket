import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import ConfirmDialog from '../../../Components/Admin/ConfirmDialog';
import { Plus, Edit2, Trash2, FolderTree, ExternalLink, Image as ImageIcon } from 'lucide-react';

export default function AdminCategories({ categories = [] }) {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [density, setDensity] = useState('comfortable');

  const catList = Array.isArray(categories) ? categories : [];

  const filteredCategories = catList.filter(c => 
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (!deleteTarget) return;
    router.delete(`/admin/categories/${deleteTarget.id}`, {
      onFinish: () => setDeleteTarget(null),
    });
  };

  const columns = [
    {
      header: 'Category Name',
      accessor: 'name',
      sortable: true,
      render: (cat) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <FolderTree className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100 font-heading text-xs">
              {cat.name}
            </div>
            <div className="text-[10.5px] text-slate-400 font-mono">
              slug: {cat.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Hierarchy / Parent',
      accessor: 'parent',
      render: (cat) => (
        <span className="text-slate-600 dark:text-slate-300 font-medium">
          {cat.parent ? cat.parent.name : '— Root Category —'}
        </span>
      ),
    },
    {
      header: 'Products',
      accessor: 'products_count',
      align: 'center',
      sortable: true,
      render: (cat) => (
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
          {cat.products_count ?? 0}
        </span>
      ),
    },
    {
      header: 'Badging',
      accessor: 'is_featured',
      render: (cat) => (
        <AdminStatusBadge
          status={cat.is_featured ? 'featured' : 'standard'}
          label={cat.is_featured ? 'Featured' : 'Standard'}
          size="xs"
        />
      ),
    },
    {
      header: 'SEO Content Enrichments',
      accessor: 'content_sections_count',
      render: (cat) => (
        <span className="text-[11px] text-slate-500 font-mono">
          {cat.content_sections_count ?? 0} sections • {cat.price_tables_count ?? 0} prices • {cat.faqs_count ?? 0} FAQs
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (cat) => (
        <div className="flex items-center justify-end space-x-1.5 whitespace-nowrap">
          <a
            href={`/category/${cat.slug}`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Preview Storefront Category"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link
            href={`/admin/categories/${cat.id}/edit`}
            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 transition-colors"
            title="Edit Category"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setDeleteTarget(cat)}
            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
            title="Delete Category"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Categories">
      <Head title="Hardware Categories - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Hardware Categories Hierarchy"
          subtitle="Manage product categories, subcategories, navigation icons, and enriched SEO purchase guides."
          badge={`${catList.length} Categories`}
          actions={
            <div className="flex items-center gap-2">
              <a
                href="/admin/data-management/template/categories/xlsx"
                download
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-all"
                title="Download Category Import Template (XLSX)"
              >
                <span>Import Format</span>
              </a>

              <Link
                href="/admin/data-management/export?entity=categories"
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-all"
                title="Export Categories"
              >
                <span>Export</span>
              </Link>

              <Link
                href="/admin/data-management/import?entity=categories"
                className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition-all"
                title="Bulk Import Categories"
              >
                <span>Bulk Import</span>
              </Link>

              <Link
                href="/admin/categories/create"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs hover:shadow transition-all"
                style={{ backgroundColor: 'var(--admin-primary, #4f46e5)' }}
              >
                <Plus className="w-4 h-4" />
                <span>Add New Category</span>
              </Link>
            </div>
          }
        />

        {/* Page Toolbar */}
        <AdminPageToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search categories by name or slug..."
          onRefresh={() => router.get('/admin/categories')}
        />

        {/* Categories Table */}
        <AdminTable
          columns={columns}
          data={filteredCategories}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No categories found"
          emptyDescription="Create your first catalog category to organize hardware items."
          emptyAction={
            <Link
              href="/admin/categories/create"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </Link>
          }
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteTarget?.name}"? All associated specs and content sections will be deleted.`}
        confirmText="Delete Category"
        isDestructive
      />
    </AdminShell>
  );
}
