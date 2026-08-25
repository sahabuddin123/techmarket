import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DetailPageTemplate from '../Templates/DetailPageTemplate';
import AdminKpiCard from '../../../Components/Admin/AdminKpiCard';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import AdminEmptyState from '../../../Components/Admin/AdminEmptyState';
import { 
  User, Mail, Phone, ShoppingBag, DollarSign, MapPin, 
  ShieldCheck, ArrowUpRight, Video, Wrench, Clock, ExternalLink 
} from 'lucide-react';

export default function CustomerDetail({ 
  customer = {}, 
  orders = { data: [] }, 
  totalSpent = 0, 
  cctvProjects = [], 
  serviceRequests = [] 
}) {
  const [activeTab, setActiveTab] = useState('overview');

  const orderList = Array.isArray(orders?.data) ? orders.data : [];
  const addresses = Array.isArray(customer.addresses) ? customer.addresses : [];

  const tabs = [
    { id: 'overview', label: 'Customer Overview' },
    { id: 'orders', label: 'Order History', count: orders.total || orderList.length },
    { id: 'addresses', label: 'Saved Addresses', count: addresses.length },
    { id: 'cctv', label: 'CCTV & Support Requests', count: cctvProjects.length + serviceRequests.length },
  ];

  return (
    <DetailPageTemplate
      title={customer.name || 'Customer Profile'}
      subtitle={`Email: ${customer.email || 'N/A'} • Phone: ${customer.phone || 'No Phone'} • ID: #${customer.id}`}
      badge={customer.role === 'admin' ? 'Administrator' : 'Verified Customer'}
      backUrl="/admin/customers"
      breadcrumbs={[
        { label: 'Customers', href: '/admin/customers' },
        { label: customer.name || 'Profile' }
      ]}
      headerActions={
        <div className="flex items-center space-x-2">
          <Link
            href={`/admin/customers/fraud-checker?phone=${customer.phone || ''}`}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Anti-Fraud Check</span>
          </Link>
        </div>
      }
      kpis={[
        <AdminKpiCard
          key="kpi-spent"
          title="Lifetime Spend"
          value={`৳ ${Number(totalSpent).toLocaleString()}`}
          description="Total realized gross revenue"
          icon={DollarSign}
          color="indigo"
        />,
        <AdminKpiCard
          key="kpi-orders"
          title="Total Orders"
          value={`${orders.total || orderList.length} Orders`}
          description="Storefront checkout volume"
          icon={ShoppingBag}
          color="blue"
        />,
        <AdminKpiCard
          key="kpi-cctv"
          title="CCTV Projects"
          value={`${cctvProjects.length} Projects`}
          description="Commercial surveillance systems"
          icon={Video}
          color="purple"
        />,
        <AdminKpiCard
          key="kpi-service"
          title="Service Requests"
          value={`${serviceRequests.length} Tickets`}
          description="Warranty and repair claims"
          icon={Wrench}
          color="amber"
        />,
      ]}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <Head title={`${customer.name || 'Customer'} - TechMarket Admin`} />

      {/* =========================================================================
          TAB 1: CUSTOMER OVERVIEW
          ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Account Details Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
                Account Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                  <span className="text-slate-400 text-[10.5px] font-bold uppercase font-mono">Full Name</span>
                  <div className="font-bold text-slate-900 dark:text-slate-100 font-heading text-sm">{customer.name}</div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                  <span className="text-slate-400 text-[10.5px] font-bold uppercase font-mono">Email Address</span>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{customer.email}</div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                  <span className="text-slate-400 text-[10.5px] font-bold uppercase font-mono">Contact Phone</span>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100">{customer.phone || '—'}</div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                  <span className="text-slate-400 text-[10.5px] font-bold uppercase font-mono">Registration Date</span>
                  <div className="font-mono text-slate-900 dark:text-slate-100">{customer.created_at ? new Date(customer.created_at).toLocaleString() : 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading flex items-center justify-between">
                <span>Recent Orders</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View All
                </button>
              </h3>

              {orderList.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {orderList.slice(0, 3).map((ord) => (
                    <div key={ord.id} className="py-2.5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Link href={`/admin/orders/${ord.id}`} className="font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                          #{ord.order_number || ord.id}
                        </Link>
                        <div className="text-[10px] text-slate-400 font-mono">{new Date(ord.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900 dark:text-slate-100">৳ {Number(ord.total).toLocaleString()}</div>
                        <AdminStatusBadge status={ord.status} size="xs" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No orders placed by this customer yet.</p>
              )}
            </div>
          </div>

          {/* Right Col: Primary Address Card */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Primary Shipping Address</span>
              </h3>

              {addresses.length > 0 ? (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{addresses[0].name || customer.name}</div>
                  <div>{addresses[0].address_line}</div>
                  <div>{addresses[0].district}, {addresses[0].division}</div>
                  <div className="font-mono text-slate-500 pt-1">{addresses[0].phone || customer.phone}</div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No saved address book entries.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: ORDER HISTORY
          ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
            Customer Orders Ledger
          </h3>

          {orderList.length > 0 ? (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase text-[9.5px] border-b border-slate-100 dark:border-slate-800 pb-2 font-mono">
                    <th className="py-2.5">Order ID</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Items</th>
                    <th className="py-2.5">Payment</th>
                    <th className="py-2.5 text-right">Amount</th>
                    <th className="py-2.5 text-right">Status</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {orderList.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        #{ord.order_number || ord.id}
                      </td>
                      <td className="py-3 font-mono text-slate-500">
                        {new Date(ord.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-slate-700 dark:text-slate-300">
                        {(ord.items || []).length} items
                      </td>
                      <td className="py-3 uppercase text-[11px] font-mono text-slate-600 dark:text-slate-400">
                        {ord.payment_method || 'COD'}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        ৳ {Number(ord.total).toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        <AdminStatusBadge status={ord.status} size="xs" />
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold text-[11px]"
                        >
                          View Order
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <AdminEmptyState
              title="No Orders on Record"
              description="This customer has not completed any store checkouts yet."
            />
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: ADDRESSES
          ========================================================================= */}
      {activeTab === 'addresses' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses.length > 0 ? (
            addresses.map((addr, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-heading">{addr.name || customer.name}</span>
                  {addr.is_default && <AdminStatusBadge status="active" label="Default" size="xs" />}
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{addr.address_line}</p>
                <div className="text-slate-500 font-medium">{addr.district}, {addr.division}</div>
                <div className="text-slate-400 font-mono pt-1">{addr.phone || customer.phone}</div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <AdminEmptyState
                title="No Saved Addresses"
                description="Addresses saved during checkout or from account settings will appear here."
              />
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: CCTV & SERVICE REQUESTS
          ========================================================================= */}
      {activeTab === 'cctv' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CCTV Projects */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading flex items-center space-x-2">
              <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Surveillance Projects ({cctvProjects.length})</span>
            </h3>

            {cctvProjects.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {cctvProjects.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Link href={`/admin/cctv/projects/${p.id}`} className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 block">
                        {p.project_name || p.project_number}
                      </Link>
                      <div className="text-[10.5px] text-slate-400 font-mono">{p.project_number}</div>
                    </div>
                    <AdminStatusBadge status={p.status} size="xs" />
                  </div>
                ))}
              </div>
            ) : (
              <AdminEmptyState
                title="No CCTV Projects"
                description="Commercial surveillance projects for this client will show here."
              />
            )}
          </div>

          {/* Service & Repair Requests */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-amber-500" />
              <span>Service & Repair Tickets ({serviceRequests.length})</span>
            </h3>

            {serviceRequests.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {serviceRequests.map((s) => (
                  <div key={s.id} className="py-3 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{s.request_number || `#SR-${s.id}`}</div>
                      <div className="text-[10.5px] text-slate-500">{s.issue_description || 'Hardware servicing'}</div>
                    </div>
                    <AdminStatusBadge status={s.status} size="xs" />
                  </div>
                ))}
              </div>
            ) : (
              <AdminEmptyState
                title="No Service Claims"
                description="Warranty claims and hardware servicing tickets will appear here."
              />
            )}
          </div>
        </div>
      )}
    </DetailPageTemplate>
  );
}
