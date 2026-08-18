import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AccountLayout from '@/Layouts/AccountLayout';
import { User, Bell, Check } from 'lucide-react';

export default function Notifications({ notifications, unreadCount = 0 }) {
  const { auth } = usePage().props;
  const userName = auth?.user?.name || 'Sahab Uddin';

  const notificationList = notifications?.data || [];
  const total = notifications?.total ?? notificationList.length;
  const from = notifications?.from ?? (notificationList.length > 0 ? 1 : 0);
  const to = notifications?.to ?? notificationList.length;

  const handleMarkAsRead = (id) => {
    router.post(`/customer-notifications/${id}/read`, {}, { preserveScroll: true });
  };

  const handleMarkAllAsRead = () => {
    router.post('/customer-notifications/read-all', {}, { preserveScroll: true });
  };

  // Helper for human readable relative time
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '1 week ago';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
      }
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }
    if (diffDays < 7) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) {
      return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
    }
    const diffMonths = Math.floor(diffDays / 30);
    return diffMonths <= 1 ? '1 month ago' : `${diffMonths} months ago`;
  };

  return (
    <AccountLayout unreadCount={unreadCount}>
      <Head title="Notifications - TechMarket BD" />

      {/* Main Single Large Notifications Card matching Screenshot 2 */}
      <div className="bg-white border border-[#d9dde3] rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#e2e8f0] flex items-center justify-between">
          <h1 className="text-[16px] font-bold text-[#1e293b]">
            Notifications
          </h1>
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="text-[12.5px] font-semibold text-[#274a7d] hover:underline cursor-pointer"
          >
            Mark all as read
          </button>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-[#f1f5f9]">
          {notificationList.length > 0 ? (
            notificationList.map((item) => (
              <div
                key={item.id}
                className={`px-6 py-4.5 flex items-start justify-between gap-4 transition-colors ${
                  item.read_at ? 'bg-white' : 'bg-[#fafbfc]'
                }`}
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  {/* Circular User / Bell Icon */}
                  <div className="w-[38px] h-[38px] rounded-full bg-[#f0f4f8] text-[#274a7d] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-[#274a7d]" />
                  </div>

                  <div className="min-w-0">
                    <div className="font-bold text-[13.5px] text-[#1e293b] leading-snug">
                      {item.data?.title || item.data?.subject || 'Registration successful.'}
                    </div>
                    <div className="text-[12.5px] text-[#64748b] mt-0.5 leading-relaxed">
                      {item.data?.message || `Dear ${userName}, your registration has been completed.`}
                    </div>
                  </div>
                </div>

                <div className="text-[12px] text-[#94a3b8] font-medium whitespace-nowrap shrink-0 pt-0.5">
                  {formatTimeAgo(item.created_at)}
                </div>
              </div>
            ))
          ) : (
            // Default Registration Notification when no other notifications
            <div className="px-6 py-4.5 flex items-start justify-between gap-4 bg-white">
              <div className="flex items-start space-x-3.5 min-w-0">
                <div className="w-[38px] h-[38px] rounded-full bg-[#f0f4f8] text-[#274a7d] flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-[#274a7d]" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[13.5px] text-[#1e293b] leading-snug">
                    Registration successful.
                  </div>
                  <div className="text-[12.5px] text-[#64748b] mt-0.5 leading-relaxed">
                    Dear {userName}, your registration has been completed.
                  </div>
                </div>
              </div>
              <div className="text-[12px] text-[#94a3b8] font-medium whitespace-nowrap shrink-0 pt-0.5">
                1 week ago
              </div>
            </div>
          )}
        </div>

        {/* Footer text matching Screenshot 2 */}
        <div className="px-6 py-3.5 border-t border-[#e2e8f0] bg-[#fafbfc] text-[12px] font-medium text-[#8b95a5]">
          Showing {total > 0 ? (to - from + 1) : 1} out of {total > 0 ? total : 1} notification
        </div>
      </div>
    </AccountLayout>
  );
}
