import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import { Users, Mail, Phone, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function AdminCustomers({ customers = { data: [], links: [] }, filters = {} }) {
  const [search, setSearch] = useState(filters.search || '');
  const [density, setDensity] = useState('comfortable');

  const customerList = Array.isArray(customers?.data) ? customers.data : [];

  const handleSearchSubmit = (val) => {
    setSearch(val);
    router.get('/admin/customers', { search: val || undefined }, { preserveState: true, replace: true });
  };

  const tableColumns = [
    {
      header: 'Customer Profile',
      accessor: 'name',
      sortable: true,
      render: (customer) => (
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
            {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100 font-heading text-xs">
              {customer.name}
            </div>
            <div className="text-[10.5px] text-slate-400 font-mono">
              ID: #{customer.id} • Joined {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'Recent'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Email Address',
      accessor: 'email',
      render: (customer) => (
        <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{customer.email}</span>
        </div>
      ),
    },
    {
      header: 'Phone Number',
      accessor: 'phone',
      render: (customer) => (
        <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 font-mono">
          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{customer.phone || '—'}</span>
        </div>
      ),
    },
    {
      header: 'Account Role',
      accessor: 'role',
      render: (customer) => (
        <AdminStatusBadge
          status={customer.role === 'admin' ? 'admin' : 'customer'}
          label={customer.role || 'Customer'}
          size="xs"
        />
      ),
    },
    {
      header: 'Total Orders',
      accessor: 'orders_count',
      align: 'right',
      sortable: true,
      render: (customer) => (
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
          {customer.orders_count || 0} Orders
        </span>
      ),
    },
  ];

  return (
    <AdminShell title="Customers">
      <Head title="Customers Directory - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Registered Customers Directory"
          subtitle="View customer profiles, contact info, and lifetime purchasing telemetry."
          badge={`${customers?.total || customerList.length} Customers`}
          actions={
            <Link
              href="/admin/customers/fraud-checker"
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center space-x-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Anti-Fraud Shield</span>
            </Link>
          }
        />

        {/* Page Toolbar */}
        <AdminPageToolbar
          search={search}
          onSearchChange={handleSearchSubmit}
          searchPlaceholder="Search by Customer Name, Email, or Phone..."
          onRefresh={() => router.get('/admin/customers')}
        />

        {/* Customers Table */}
        <AdminTable
          columns={tableColumns}
          data={customerList}
          pagination={customers}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No customers registered yet"
          emptyDescription="Customer accounts created during checkout or registration will populate here automatically."
        />
      </div>
    </AdminShell>
  );
}
