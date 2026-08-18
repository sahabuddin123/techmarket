import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AccountLayout from '@/Layouts/AccountLayout';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function ChangePassword({ unreadCount = 0, status }) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [recentlySuccessful, setRecentlySuccessful] = useState(false);

  const { data, setData, put, errors, processing, reset } = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put('/password', {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setRecentlySuccessful(true);
        setTimeout(() => setRecentlySuccessful(false), 4000);
      },
    });
  };

  return (
    <AccountLayout unreadCount={unreadCount}>
      <Head title="Change Password - TechMarket BD" />

      {/* Main Single Large Change Password Card matching Screenshot 4 */}
      <div className="bg-white border border-[#d9dde3] rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#e2e8f0]">
          <h1 className="text-[16px] font-bold text-[#1e293b]">
            Change Password
          </h1>
        </div>

        {/* Body with Narrow Left-Aligned Form */}
        <div className="p-6 sm:p-7">
          {recentlySuccessful && (
            <div className="mb-5 max-w-[480px] p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[4px] text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Your password has been updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="max-w-[480px] space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-[12px] font-bold text-[#475569] mb-1.5">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  placeholder="Enter current password"
                  value={data.current_password}
                  onChange={(e) => setData('current_password', e.target.value)}
                  className="w-full h-11 px-3.5 pr-10 text-[13px] text-[#1e293b] placeholder-[#a0aec0] border border-[#d9dde3] rounded-[4px] focus:outline-none focus:border-[#274a7d] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b95a5] hover:text-[#475569] p-1"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.current_password && (
                <p className="text-rose-600 text-xs mt-1.5">{errors.current_password}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[12px] font-bold text-[#475569] mb-1.5">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  placeholder="Enter new password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className="w-full h-11 px-3.5 pr-10 text-[13px] text-[#1e293b] placeholder-[#a0aec0] border border-[#d9dde3] rounded-[4px] focus:outline-none focus:border-[#274a7d] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b95a5] hover:text-[#475569] p-1"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-rose-600 text-xs mt-1.5">{errors.password}</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-[12px] font-bold text-[#475569] mb-1.5">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new password"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  className="w-full h-11 px-3.5 pr-10 text-[13px] text-[#1e293b] placeholder-[#a0aec0] border border-[#d9dde3] rounded-[4px] focus:outline-none focus:border-[#274a7d] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b95a5] hover:text-[#475569] p-1"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-rose-600 text-xs mt-1.5">{errors.password_confirmation}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={processing}
                className="bg-[#274a7d] hover:bg-[#1d375d] text-white text-[13px] font-bold px-5 py-2.5 rounded-[4px] transition-colors shadow-xs disabled:opacity-50 inline-flex items-center justify-center"
              >
                {processing ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AccountLayout>
  );
}
