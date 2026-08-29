import React from 'react';
import { ShoppingCart, Flame, AlertCircle, Check, Lock } from 'lucide-react';

export default function QuickOrderForm({
  formData,
  setFormData,
  districts = [],
  paymentMethods = [],
  unitPrice = 0,
  subtotal = 0,
  shippingFee = 0,
  totalPayable = 0,
  submitting = false,
  orderError = null,
  handleFormInteraction,
  handlePaymentMethodSelect,
  handleOrderSubmit,
  orderBtnText = 'অর্ডার নিশ্চিত করুন'
}) {
  return (
    <div className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 transition-all font-['Hind_Siliguri',sans-serif]">
      {/* Red Header Ribbon Banner */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white text-center py-3.5 px-4 shadow-md relative">
        <div className="flex items-center justify-center gap-2">
          <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
          <h2 className="text-lg sm:text-xl font-black tracking-tight">দ্রুত অর্ডার করুন</h2>
        </div>
        <p className="text-[11px] text-red-100 mt-0.5 font-medium">পণ্য পেতে নিচের ফর্মটি পূরণ করুন</p>
      </div>

      {/* Form Content */}
      <form onSubmit={handleOrderSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs">
        {/* Anti-bot Honeypot field (hidden from real users) */}
        <input
          type="text"
          name="website_url_hp"
          value={formData.website_url_hp || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, website_url_hp: e.target.value }))}
          style={{ display: 'none' }}
          tabIndex="-1"
          autoComplete="off"
        />

        {orderError && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{orderError}</span>
          </div>
        )}

        {/* Customer Name */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">👤</span>
          <input
            type="text"
            required
            value={formData.customer_name}
            onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
            onFocus={handleFormInteraction}
            placeholder="আপনার নাম লিখুন"
            className="w-full bg-slate-50 text-slate-900 pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none text-xs font-medium"
          />
        </div>

        {/* Phone Number */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">📱</span>
          <input
            type="tel"
            required
            value={formData.customer_phone}
            onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
            onFocus={handleFormInteraction}
            placeholder="মোবাইল নাম্বার লিখুন"
            className="w-full bg-slate-50 text-slate-900 pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none text-xs font-mono"
          />
        </div>

        {/* District Dropdown */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">📍</span>
          <select
            value={formData.district}
            onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
            className="w-full bg-slate-50 text-slate-900 pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none text-xs font-medium cursor-pointer"
          >
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Area / Thana */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">📍</span>
          <input
            type="text"
            value={formData.area}
            onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
            placeholder="থানা / এরিয়া নির্বাচন করুন"
            className="w-full bg-slate-50 text-slate-900 pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none text-xs font-medium"
          />
        </div>

        {/* Full Delivery Address */}
        <div className="relative">
          <span className="absolute left-3 top-3 text-slate-400 text-sm">🏠</span>
          <textarea
            rows={2}
            required
            value={formData.shipping_address}
            onChange={(e) => setFormData(prev => ({ ...prev, shipping_address: e.target.value }))}
            onFocus={handleFormInteraction}
            placeholder="সম্পূর্ণ ঠিকানা লিখুন"
            className="w-full bg-slate-50 text-slate-900 pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none text-xs font-medium"
          />
        </div>

        {/* Quantity Stepper */}
        <div className="p-2.5 bg-slate-100 rounded-xl flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">পরিমাণ (Quantity):</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
              className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold hover:bg-slate-200 cursor-pointer"
            >
              -
            </button>
            <span className="text-sm font-black text-slate-900 font-mono w-6 text-center">{formData.quantity}</span>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, quantity: Math.min(20, prev.quantity + 1) }))}
              className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold hover:bg-slate-200 cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            পেমেন্ট পদ্ধতি নির্বাচন করুন
          </label>
          <div className="space-y-1.5">
            {/* COD */}
            <div
              onClick={() => handlePaymentMethodSelect('cod')}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                formData.payment_method === 'cod'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  formData.payment_method === 'cod' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-400'
                }`}>
                  {formData.payment_method === 'cod' && <Check className="w-3 h-3 text-white" />}
                </div>
                <span>ক্যাশ অন ডেলিভারি</span>
              </div>
              <span className="text-emerald-600 font-black text-[10px]">● ক্যাশ</span>
            </div>

            {/* bKash */}
            {paymentMethods.some(pm => (pm.id === 'bkash' || pm.code === 'bkash')) && (
              <div
                onClick={() => handlePaymentMethodSelect('bkash')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  formData.payment_method === 'bkash'
                    ? 'border-pink-500 bg-pink-50 text-pink-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    formData.payment_method === 'bkash' ? 'border-pink-600 bg-pink-600' : 'border-slate-400'
                  }`}>
                    {formData.payment_method === 'bkash' && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span>বিকাশ</span>
                </div>
                <span className="font-bold text-pink-600 text-xs font-mono">bKash</span>
              </div>
            )}

            {/* Nagad */}
            {paymentMethods.some(pm => (pm.id === 'nagad' || pm.code === 'nagad')) && (
              <div
                onClick={() => handlePaymentMethodSelect('nagad')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  formData.payment_method === 'nagad'
                    ? 'border-orange-500 bg-orange-50 text-orange-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    formData.payment_method === 'nagad' ? 'border-orange-600 bg-orange-600' : 'border-slate-400'
                  }`}>
                    {formData.payment_method === 'nagad' && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span>নগদ</span>
                </div>
                <span className="font-bold text-orange-600 text-xs font-mono">Nagad</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Total Payable Summary */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-slate-700">
          <div className="flex justify-between text-xs">
            <span>পণ্যের মূল্য:</span>
            <span className="font-mono font-semibold">৳ {Number(subtotal).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>ডেলিভারি চার্জ ({formData.district}):</span>
            <span className="font-mono font-semibold text-slate-800">
              {shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `৳ ${Number(shippingFee).toLocaleString()}`}
            </span>
          </div>
          <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
            <span>সর্বমোট প্রদেয়:</span>
            <span className="text-base font-black text-red-600 font-mono">৳ {Number(totalPayable).toLocaleString()}</span>
          </div>
        </div>

        {/* Confirm Order Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-500 text-white font-black text-base shadow-xl shadow-red-500/30 transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-50"
        >
          <ShoppingCart className="w-4 h-4 text-white" />
          <span>{submitting ? 'অর্ডার প্রসেস হচ্ছে...' : orderBtnText}</span>
        </button>

        <p className="text-center text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1">
          <Lock className="w-3 h-3 text-emerald-600" />
          <span>আপনার তথ্য ১০০% নিরাপদ</span>
        </p>
      </form>
    </div>
  );
}
