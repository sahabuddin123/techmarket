import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { ArrowLeft, Save } from 'lucide-react';
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
    <AdminLayout title={isEdit ? 'Edit Brand' : 'Create Brand'}>
      <Head title={`${isEdit ? 'Edit' : 'Create'} Brand - TechMarket Admin`} />

      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center space-x-3">
          <Link href="/admin/brands" className="p-2 bg-slate-900 border border-slate-800 rounded text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              {isEdit ? 'EDIT BRAND' : 'CREATE BRAND'}
            </h1>
            <p className="text-xs text-slate-400">Specify manufacturer name and logo.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Brand Name *</label>
            <input
              type="text"
              required
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              placeholder="e.g. Corsair"
              className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500"
            />
            {errors.name && <p className="text-rose-400 text-[11px] mt-1">{errors.name}</p>}
          </div>

          <div>
            <MediaPicker
              label="Brand Logo"
              value={data.logo}
              onChange={(url) => setData('logo', url)}
              placeholder="Select brand logo from Media Library or enter image URL..."
              allowClear={true}
            />
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-3 rounded-lg flex items-center justify-center space-x-2 shadow-lg uppercase"
          >
            <Save className="w-4 h-4" />
            <span>{isEdit ? 'SAVE CHANGES' : 'CREATE BRAND'}</span>
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
