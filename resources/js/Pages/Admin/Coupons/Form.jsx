import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { ArrowLeft, Save } from 'lucide-react';

export default function CouponForm({ coupon }) {
  const isEdit = !!coupon;

  const { data, setData, post, put, processing, errors } = useForm({
    code: coupon ? coupon.code : '',
    type: coupon ? coupon.type : 'fixed',
    value: coupon ? coupon.value : 500,
    min_spend: coupon ? coupon.min_spend : 5000,
    is_active: coupon ? Boolean(coupon.is_active) : true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(`/admin/coupons/${coupon.id}`);
    } else {
      post('/admin/coupons');
    }
  };

  return (
    <AdminLayout title={isEdit ? 'Edit Coupon' : 'Create Coupon'}>
      <Head title={`${isEdit ? 'Edit' : 'Create'} Coupon - TechMarket Admin`} />

      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center space-x-3">
          <Link href="/admin/coupons" className="p-2 bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              {isEdit ? 'EDIT PROMO COUPON' : 'CREATE PROMO COUPON'}
            </h1>
            <p className="text-xs text-slate-400">Configure discount value and minimum spend rules.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Coupon Code * (e.g. TECHMARKET1000)</label>
            <input
              type="text"
              required
              value={data.code}
              onChange={(e) => setData('code', e.target.value.toUpperCase())}
              placeholder="e.g. DISCOUNT500"
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-100 p-2.5 rounded border border-slate-200/80 dark:border-slate-800/80 focus:border-amber-500 font-mono"
            />
            {errors.code && <p className="text-rose-400 text-[11px] mt-1">{errors.code}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Discount Type *</label>
              <select
                value={data.type}
                onChange={(e) => setData('type', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-100 p-2.5 rounded border border-slate-200/80 dark:border-slate-800/80 focus:border-amber-500"
              >
                <option value="fixed">Fixed Amount (BDT ৳)</option>
                <option value="percent">Percentage (%)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Discount Value *</label>
              <input
                type="number"
                required
                value={data.value}
                onChange={(e) => setData('value', e.target.value)}
                placeholder="500"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-100 p-2.5 rounded border border-slate-200/80 dark:border-slate-800/80 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Minimum Spend (BDT ৳) *</label>
            <input
              type="number"
              required
              value={data.min_spend}
              onChange={(e) => setData('min_spend', e.target.value)}
              placeholder="5000"
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-100 p-2.5 rounded border border-slate-200/80 dark:border-slate-800/80 focus:border-amber-500"
            />
          </div>

          <div className="flex items-center space-x-6 pt-2">
            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={data.is_active}
                onChange={(e) => setData('is_active', e.target.checked)}
                className="rounded text-amber-500"
              />
              <span>Coupon Active</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-3 rounded-lg flex items-center justify-center space-x-2 shadow-lg uppercase"
          >
            <Save className="w-4 h-4" />
            <span>{isEdit ? 'SAVE CHANGES' : 'CREATE COUPON'}</span>
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
