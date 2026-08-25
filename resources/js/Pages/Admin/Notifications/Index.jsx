import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '@/Components/Admin/AdminShell';
import AdminPageHeader from '@/Components/Admin/AdminPageHeader';
import { 
  Bell, CheckCheck, Trash2, Filter, Search, ShieldAlert, ShoppingBag, 
  Truck, Warehouse, Radio, Cpu, AlertTriangle, AlertOctagon, Check, 
  ExternalLink, Calendar, RefreshCw
} from 'lucide-react';

export default function NotificationCenterIndex({
  notifications = { data: [], total: 0, current_page: 1, last_page: 1, prev_page_url: null, next_page_url: null },
  stats = { total_unread: 0, today_count: 0, high_priority_count: 0, critical_count: 0 },
  filters = {},
  categories = {},
  priorities = [],
}) {
  const [selectedCategory, setSelectedCategory] = useState(filters.category || 'ALL');
  const [selectedPriority, setSelectedPriority] = useState(filters.priority || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [selectedIds, setSelectedIds] = useState([]);
  const [processing, setProcessing] = useState(false);

  const applyFilters = (newOverrides = {}) => {
    const params = {
      category: newOverrides.category !== undefined ? newOverrides.category : selectedCategory,
      priority: newOverrides.priority !== undefined ? newOverrides.priority : selectedPriority,
      status: newOverrides.status !== undefined ? newOverrides.status : selectedStatus,
      search: newOverrides.search !== undefined ? newOverrides.search : searchQuery,
    };

    router.get('/admin/notifications', params, { preserveState: true, replace: true });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters({ search: searchQuery });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(notifications.data.map(n => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkAction = (action) => {
    if (selectedIds.length === 0) return;

    setProcessing(true);
    router.post('/admin/notifications/bulk', {
      ids: selectedIds,
      action: action,
    }, {
      onSuccess: () => {
        setSelectedIds([]);
        setProcessing(false);
      },
      onError: () => setProcessing(false),
    });
  };

  const handleMarkAsRead = (id) => {
    router.post(`/admin/notifications/${id}/read`, {}, { preserveScroll: true });
  };

  const handleMarkAllRead = () => {
    router.post('/admin/notifications/read-all', { category: selectedCategory }, { preserveScroll: true });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to remove this notification?')) {
      router.delete(`/admin/notifications/${id}`, { preserveScroll: true });
    }
  };

  const renderIcon = (cat, priority) => {
    if (priority === 'CRITICAL') return <AlertOctagon className="w-5 h-5 text-rose-600 animate-pulse" />;
    if (priority === 'URGENT') return <AlertTriangle className="w-5 h-5 text-amber-600" />;

    switch (String(cat).toUpperCase()) {
      case 'ORDER':
      case 'PAYMENT':
        return <ShoppingBag className="w-5 h-5 text-indigo-600" />;
      case 'COURIER':
        return <Truck className="w-5 h-5 text-emerald-600" />;
      case 'FRAUD':
        return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      case 'INVENTORY':
        return <Warehouse className="w-5 h-5 text-amber-600" />;
      case 'SMS':
        return <Radio className="w-5 h-5 text-purple-600" />;
      case 'SYSTEM':
      case 'SECURITY':
        return <Cpu className="w-5 h-5 text-cyan-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const renderPriorityBadge = (p) => {
    switch (p) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase tracking-wider animate-pulse">CRITICAL</span>;
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-bold uppercase tracking-wider">URGENT</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">HIGH</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium uppercase tracking-wider">LOW</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold uppercase tracking-wider">NORMAL</span>;
    }
  };

  return (
    <AdminShell title="Notification Center">
      <Head title="Notification & Alert Center — TechMarket Admin" />

      <div className="space-y-6 w-full max-w-none pb-12">
        {/* Top Header Bar */}
        <AdminPageHeader
          title="Notification & Alert Center"
          subtitle="Central operational telemetry, risk signals, order events, and system alerts"
          badge="Live Feed"
          actions={
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span>Mark All Read</span>
              </button>

              <Link
                href="/admin/settings/notifications"
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Preferences</span>
              </Link>
            </div>
          }
        />

        {/* 4 KPI Metrics Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4.5 space-y-1 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unread Alerts</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-heading font-mono">{stats.total_unread}</div>
            <p className="text-[11px] text-slate-400">Requires attention</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4.5 space-y-1 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Traffic</span>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 font-heading font-mono">{stats.today_count}</div>
            <p className="text-[11px] text-slate-400">Dispatched last 24h</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4.5 space-y-1 shadow-2xs">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">High Priority</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-heading font-mono">{stats.high_priority_count}</div>
            <p className="text-[11px] text-slate-400">Action recommended</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4.5 space-y-1 shadow-2xs bg-rose-50/20">
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Critical Alerts</span>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 font-heading font-mono animate-pulse">{stats.critical_count}</div>
            <p className="text-[11px] text-rose-600/80 font-medium">Immediate intervention</p>
          </div>
        </div>

        {/* Filter Controls Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 space-y-3.5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {Object.entries(categories).map(([catKey, catLabel]) => (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(catKey);
                    applyFilters({ category: catKey });
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    selectedCategory === catKey
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80'
                  }`}
                >
                  {catLabel}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search alert title, message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden font-medium"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>

          {/* Secondary Filters & Bulk Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            
            {/* Priority & Status dropdowns */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Priority:</span>
                <select
                  value={selectedPriority}
                  onChange={(e) => {
                    setSelectedPriority(e.target.value);
                    applyFilters({ priority: e.target.value });
                  }}
                  className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden cursor-pointer"
                >
                  {priorities.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    applyFilters({ status: e.target.value });
                  }}
                  className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Alerts</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read Only</option>
                </select>
              </div>
            </div>

            {/* Bulk Action Buttons */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 animate-in fade-in">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">{selectedIds.length} selected</span>
                <button
                  type="button"
                  onClick={() => handleBulkAction('mark_read')}
                  disabled={processing}
                  className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold cursor-pointer"
                >
                  Mark Read
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkAction('delete')}
                  disabled={processing}
                  className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-bold cursor-pointer"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notifications Table / List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-2xs">
          {notifications.data.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Bell className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm font-heading">No notifications found</h4>
              <p className="text-xs text-slate-500">There are no operational alerts matching your filter criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              
              {/* Select All Row */}
              <div className="p-3 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between text-xs text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === notifications.data.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Select Page ({notifications.data.length})</span>
                </label>
                <span>Total {notifications.total} alert(s)</span>
              </div>

              {/* Items */}
              {notifications.data.map((n) => {
                const isUnread = !n.read_at;
                const isCritical = n.priority === 'CRITICAL';
                const isUrgent = n.priority === 'URGENT';
                const isChecked = selectedIds.includes(n.id);

                return (
                  <div
                    key={n.id}
                    className={`p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isCritical
                        ? 'bg-rose-50/60 dark:bg-rose-950/20 border-l-4 border-rose-500'
                        : isUrgent
                        ? 'bg-amber-50/60 dark:bg-amber-950/20 border-l-4 border-amber-500'
                        : isUnread
                        ? 'bg-indigo-50/30 dark:bg-indigo-950/10 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(n.id)}
                        className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer shrink-0"
                      />

                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isCritical ? 'bg-rose-100 text-rose-600' :
                        isUrgent ? 'bg-amber-100 text-amber-600' :
                        isUnread ? 'bg-indigo-100 text-indigo-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {renderIcon(n.category, n.priority)}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm font-heading">
                            {n.title || n.type}
                          </span>
                          {renderPriorityBadge(n.priority)}
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 font-mono">
                            {n.category}
                          </span>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                          {n.message || (n.data && n.data.message) || ''}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-0.5">
                          <span>{new Date(n.created_at).toLocaleString()}</span>
                          {n.read_at && <span>• Read at {new Date(n.read_at).toLocaleTimeString()}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {n.action_url && (
                        <Link
                          href={n.action_url}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>{n.action_label || 'View'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}

                      {isUnread && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(n.id)}
                          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(n.id)}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {notifications.last_page > 1 && (
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Page <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{notifications.current_page}</span> of <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{notifications.last_page}</span>
              </span>
              <div className="flex items-center gap-2">
                {notifications.prev_page_url && (
                  <Link
                    href={notifications.prev_page_url}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Previous
                  </Link>
                )}
                {notifications.next_page_url && (
                  <Link
                    href={notifications.next_page_url}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </AdminShell>
  );
}
