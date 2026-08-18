import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AccountLayout from '@/Layouts/AccountLayout';
import { Plus, X, ExternalLink, MapPin, Trash2 } from 'lucide-react';

export default function Profile({ user, addresses = [], recentOrders = [], points = 0, unreadCount = 0, status, mustVerifyEmail }) {
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [addAddressOpen, setAddAddressOpen] = useState(false);

  // Edit Profile Form
  const profileForm = useForm({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Add Address Form
  const addressForm = useForm({
    label: 'Home',
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    district: 'Dhaka',
    is_default: addresses.length === 0,
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    profileForm.patch('/profile', {
      preserveScroll: true,
      onSuccess: () => setEditProfileOpen(false),
    });
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    addressForm.post('/addresses', {
      preserveScroll: true,
      onSuccess: () => {
        addressForm.reset('address');
        setAddAddressOpen(false);
      },
    });
  };

  const handleDeleteAddress = (id) => {
    if (confirm('Are you sure you want to remove this delivery address?')) {
      addressForm.delete(`/addresses/${id}`, { preserveScroll: true });
    }
  };

  // Extract Initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <AccountLayout unreadCount={unreadCount}>
      <Head title="My Profile - TechMarket BD" />

      {/* Top 2 Cards Row matching Screenshot 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: Profile Information */}
        <div className="bg-white border border-[#d9dde3] rounded-[8px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-start gap-6">
            {/* Left Sub-Column: Avatar, Points, Edit Profile Button */}
            <div className="flex flex-col items-center shrink-0 w-[96px]">
              <div className="w-[64px] h-[64px] rounded-full bg-[#334155] text-white font-bold text-lg flex items-center justify-center shadow-xs">
                {getInitials(user?.name)}
              </div>

              <div className="text-[12px] text-[#64748b] font-medium mt-2 text-center">
                Points: {points}
              </div>

              <button
                type="button"
                onClick={() => setEditProfileOpen(true)}
                className="mt-1.5 w-full bg-[#274a7d] hover:bg-[#1d375d] text-white text-[11.5px] font-semibold py-1.5 px-2 rounded-[4px] transition-colors shadow-xs text-center"
              >
                Edit Profile
              </button>
            </div>

            {/* Right Sub-Column: Name, Phone, Email */}
            <div className="flex-1 min-w-0">
              <h1 className="text-[18px] font-bold text-[#1e293b] truncate">
                {user?.name || 'Customer'}
              </h1>

              <div className="mt-3">
                <div className="text-[11px] font-bold text-[#8b95a5] uppercase tracking-wider">
                  PHONE
                </div>
                <div className="text-[13px] font-medium text-[#1e293b] mt-0.5">
                  {user?.phone || '01951413828'}
                </div>
              </div>

              <div className="mt-3">
                <div className="text-[11px] font-bold text-[#8b95a5] uppercase tracking-wider">
                  EMAIL
                </div>
                <div className="text-[13px] font-medium text-[#1e293b] mt-0.5 truncate">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Delivery Address */}
        <div className="bg-white border border-[#d9dde3] rounded-[8px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[#1e293b]">
              Delivery Address
            </h2>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={() => setAddAddressOpen(true)}
                className="text-[12px] text-[#274a7d] hover:underline font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add More</span>
              </button>
            )}
          </div>

          {addresses.length > 0 ? (
            <div className="space-y-3 flex-1 flex flex-col justify-center mt-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="border border-[#e2e8f0] bg-[#fafbfc] rounded-[6px] p-3.5 relative group text-xs text-[#334155]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#1e293b] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#274a7d]" />
                      {addr.label} {addr.is_default && <span className="text-[10px] bg-[#274a7d]/10 text-[#274a7d] px-1.5 py-0.5 rounded font-semibold">Default</span>}
                    </span>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 opacity-80 hover:opacity-100"
                      title="Delete Address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[12.5px] text-[#475569] leading-relaxed">
                    {addr.address}, {addr.district}
                  </div>
                  <div className="text-[11.5px] text-[#64748b] mt-1 font-medium">
                    Recipient: {addr.name} ({addr.phone})
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              onClick={() => setAddAddressOpen(true)}
              className="mt-3 flex-1 border border-dashed border-[#cbd5e1] hover:border-[#274a7d] rounded-[6px] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group min-h-[160px]"
            >
              <div className="w-8 h-8 rounded-full border border-[#cbd5e1] group-hover:border-[#274a7d] text-[#8b95a5] group-hover:text-[#274a7d] flex items-center justify-center mb-1.5 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[12.5px] font-semibold text-[#475569] group-hover:text-[#274a7d] transition-colors">
                Add Delivery
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Card: Recent Orders */}
      <div className="bg-white border border-[#d9dde3] rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-6 py-4.5 border-b border-[#e2e8f0] flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[#1e293b]">
            Recent Orders
          </h2>
          {recentOrders.length > 0 && (
            <Link
              href="/account/orders/history"
              className="text-[12px] text-[#274a7d] hover:underline font-semibold"
            >
              View All Orders →
            </Link>
          )}
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e2e8f0]">
                <th className="px-6 py-3.5 text-[11.5px] font-bold text-[#8b95a5] uppercase tracking-wider">
                  ORDER
                </th>
                <th className="px-6 py-3.5 text-[11.5px] font-bold text-[#8b95a5] uppercase tracking-wider">
                  DATE
                </th>
                <th className="px-6 py-3.5 text-[11.5px] font-bold text-[#8b95a5] uppercase tracking-wider">
                  AMOUNT
                </th>
                <th className="px-6 py-3.5 text-[11.5px] font-bold text-[#8b95a5] uppercase tracking-wider">
                  PAYMENT
                </th>
                <th className="px-6 py-3.5 text-[11.5px] font-bold text-[#8b95a5] uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-3.5 text-[11.5px] font-bold text-[#8b95a5] uppercase tracking-wider text-right">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[13px] text-[#334155]">
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-6 py-4 font-bold text-[#274a7d]">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-[#64748b]">
                      {new Date(order.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#1e293b]">
                      ৳{Number(order.total).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-[#64748b]">
                      {order.payment_method_label || (
                        order.payment_method?.toLowerCase() === 'cod' ? 'Cash on Delivery' :
                        order.payment_method?.toLowerCase() === 'bkash' ? 'bKash' :
                        order.payment_method?.toLowerCase() === 'nagad' ? 'Nagad' :
                        order.payment_method
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        order.status === 'completed' || order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/invoice/${order.order_number}`}
                        className="inline-flex items-center text-[12px] font-semibold text-[#274a7d] hover:underline"
                      >
                        <span>Invoice</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#8b95a5] text-[13px] font-medium">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-[8px] border border-[#d9dde3] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <h3 className="font-bold text-[16px] text-[#1e293b]">
                Edit Customer Profile
              </h3>
              <button
                type="button"
                onClick={() => setEditProfileOpen(false)}
                className="p-1 rounded-md text-[#8b95a5] hover:text-[#1e293b] hover:bg-[#f1f5f9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.data.name}
                  onChange={(e) => profileForm.setData('name', e.target.value)}
                  className="w-full h-10 px-3 text-[13px] border border-[#d9dde3] rounded-[4px] focus:outline-none focus:border-[#274a7d]"
                />
                {profileForm.errors.name && (
                  <p className="text-rose-600 text-xs mt-1">{profileForm.errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={profileForm.data.email}
                  onChange={(e) => profileForm.setData('email', e.target.value)}
                  className="w-full h-10 px-3 text-[13px] border border-[#d9dde3] rounded-[4px] focus:outline-none focus:border-[#274a7d]"
                />
                {profileForm.errors.email && (
                  <p className="text-rose-600 text-xs mt-1">{profileForm.errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                  Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. 01951413828"
                  value={profileForm.data.phone}
                  onChange={(e) => profileForm.setData('phone', e.target.value)}
                  className="w-full h-10 px-3 text-[13px] border border-[#d9dde3] rounded-[4px] focus:outline-none focus:border-[#274a7d]"
                />
                {profileForm.errors.phone && (
                  <p className="text-rose-600 text-xs mt-1">{profileForm.errors.phone}</p>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="px-4 py-2 text-[13px] font-semibold text-[#475569] hover:bg-[#f1f5f9] rounded-[4px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileForm.processing}
                  className="bg-[#274a7d] hover:bg-[#1d375d] text-white text-[13px] font-semibold px-5 py-2 rounded-[4px] shadow-xs disabled:opacity-50"
                >
                  {profileForm.processing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD DELIVERY ADDRESS MODAL */}
      {addAddressOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-[8px] border border-[#d9dde3] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <h3 className="font-bold text-[16px] text-[#1e293b]">
                Add Delivery Address
              </h3>
              <button
                type="button"
                onClick={() => setAddAddressOpen(false)}
                className="p-1 rounded-md text-[#8b95a5] hover:text-[#1e293b] hover:bg-[#f1f5f9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                    Label (e.g. Home, Office) *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.data.label}
                    onChange={(e) => addressForm.setData('label', e.target.value)}
                    className="w-full h-10 px-3 text-[13px] border border-[#d9dde3] rounded-[4px] focus:outline-none focus:border-[#274a7d]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                    District *
                  </label>
                  <select
                    value={addressForm.data.district}
                    onChange={(e) => addressForm.setData('district', e.target.value)}
                    className="w-full h-10 px-3 text-[13px] border border-[#d9dde3] rounded-[4px] focus:outline-none focus:border-[#274a7d] bg-white"
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chattogram">Chattogram</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barishal">Barishal</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.data.name}
                    onChange={(e) => addressForm.setData('name', e.target.value)}
                    className="w-full h-10 px-3 text-[13px] border border-[#d9dde3] rounded-[4px] focus:outline-none focus:border-[#274a7d]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                    Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.data.phone}
                    onChange={(e) => addressForm.setData('phone', e.target.value)}
                    className="w-full h-10 px-3 text-[13px] border border-[#d9dde3] rounded-[4px] focus:outline-none focus:border-[#274a7d]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                  Detailed Address *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="House, Road, Area, Landmark..."
                  value={addressForm.data.address}
                  onChange={(e) => addressForm.setData('address', e.target.value)}
                  className="w-full p-3 text-[13px] border border-[#d9dde3] rounded-[4px] focus:outline-none focus:border-[#274a7d]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setAddAddressOpen(false)}
                  className="px-4 py-2 text-[13px] font-semibold text-[#475569] hover:bg-[#f1f5f9] rounded-[4px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressForm.processing}
                  className="bg-[#274a7d] hover:bg-[#1d375d] text-white text-[13px] font-semibold px-5 py-2 rounded-[4px] shadow-xs disabled:opacity-50"
                >
                  {addressForm.processing ? 'Saving...' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
