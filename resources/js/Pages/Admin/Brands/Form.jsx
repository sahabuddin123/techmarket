import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import { ArrowLeft, Save, Tag, Building2, CheckCircle2 } from 'lucide-react';
import MediaPicker from '@/Components/Admin/MediaPicker';

export default function BrandForm({ brand }) {
  const isEdit = !!brand;

  const { data, setData, post, put, processing, errors } = useForm({
    name: brand ? brand.name : '',
    logo: brand ? (brand.logo || '') : '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(`/admin/brands/${brand.id}`);
    } else {
      post('/admin/brands');
    }
  };

  return (
    <AdminShell title={isEdit ? 'Edit Brand' : 'Create Brand'}>
      <Head title={`${isEdit ? 'Edit' : 'Create'} Brand - TechMarket Admin`} />

      <div className="space-y-6">
        {/* Standard Page Header */}
        <AdminPageHeader
          title={isEdit ? `Edit Brand: ${brand.name}` : 'Create New Brand'}
          subtitle="Specify manufacturer brand identity, official title, and logo assets."
          actions={
            <Link
              href="/admin/brands"
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Brands</span>
            </Link>
          }
        />

        {/* Brand Edit Workspace Form */}
        <div className="max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6 text-xs">
              {/* Section Header */}
              <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-[var(--admin-primary-light,rgba(79,70,229,0.08))] text-[var(--admin-primary,#4f46e5)] flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
                    Brand Information
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                    Enter the brand display name and official vector or raster logo.
                  </p>
                </div>
              </div>

              {/* Brand Name Input */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
                  Brand Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="e.g. ASUS, Corsair, Logitech, AMD"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-[var(--admin-primary,#4f46e5)] focus:ring-2 focus:ring-[var(--admin-primary,#4f46e5)]/15 focus:outline-hidden text-slate-900 dark:text-slate-100 font-medium text-xs transition-all"
                />
                {errors.name && <p className="text-rose-500 text-[11px] font-medium mt-1">{errors.name}</p>}
              </div>

              {/* Brand Logo Picker */}
              <div className="space-y-1.5 pt-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
                  Brand Logo Asset
                </label>
                <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
                  <MediaPicker
                    label="Official Logo Image"
                    value={data.logo}
                    onChange={(url) => setData('logo', url)}
                    placeholder="Select brand logo from Media Library or enter image URL..."
                    allowClear={true}
                  />
                </div>
                {errors.logo && <p className="text-rose-500 text-[11px] font-medium mt-1">{errors.logo}</p>}
              </div>

              {/* Action Buttons Footer */}
              <div className="flex items-center justify-end space-x-3 pt-5 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/admin/brands"
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer text-xs"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={processing}
                  className="px-6 py-2.5 rounded-xl bg-[var(--admin-primary,#4f46e5)] hover:bg-[var(--admin-primary-hover,#4338ca)] text-white font-bold text-xs flex items-center space-x-2 shadow-xs transition cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{processing ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Brand'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminShell>
  );
}
