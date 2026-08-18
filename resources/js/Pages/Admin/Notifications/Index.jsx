import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
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
    if (priority === 'CRITICAL') return <AlertOctagon className="w-5 h-5 text-rose-500 animate-pulse" />;
    if (priority === 'URGENT') return <AlertTriangle className="w-5 h-5 text-amber-500" />;

    switch (String(cat).toUpperCase()) {
      case 'ORDER':
      case 'PAYMENT':
        return <ShoppingBag className="w-5 h-5 text-blue-400" />;
      case 'COURIER':
        return <Truck className="w-5 h-5 text-emerald-400" />;
      case 'FRAUD':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'INVENTORY':
        return <Warehouse className="w-5 h-5 text-amber-400" />;
      case 'SMS':
        return <Radio className="w-5 h-5 text-purple-400" />;
      case 'SYSTEM':
      case 'SECURITY':
        return <Cpu className="w-5 h-5 text-cyan-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const renderPriorityBadge = (p) => {
    switch (p) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black uppercase tracking-wider animate-pulse">CRITICAL</span>;
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[10px] font-black uppercase tracking-wider">URGENT</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider">HIGH</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-medium uppercase tracking-wider">LOW</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-semibold uppercase tracking-wider">NORMAL</span>;
    }
  };

  return (
    <AdminLayout title="Notification Center">
      <Head title="Notification & Alert Center — TechMarket BD" />

      <div className="space-y-6 font-['Hind_Siliguri',sans-serif]">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Bell className="w-6 h-6 text-amber-400" />
              <span>Notification & Alert Center</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Central operational telemetry, risk signals, order events, and system alerts
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Mark All Read</span>
            </button>

            <Link
              href="/admin/settings/notifications"
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-md hover:scale-105 cursor-pointer"
            >
              <span>Preferences</span>
            </Link>
          </div>
        </div>

        {/* 4 KPI Metrics Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unread Alerts</span>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.total_unread}</div>
            <p className="text-[10px] text-slate-500">Requires attention</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Traffic</span>
            <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">{stats.today_count}</div>
            <p className="text-[10px] text-slate-500">Dispatched last 24h</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">High Priority</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{stats.high_priority_count}</div>
            <p className="text-[10px] text-slate-500">Action recommended</p>
          </div>

          <div className="bg-slate-900/90 border border-rose-900/50 rounded-2xl p-4 space-y-1 shadow-lg bg-rose-950/10">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Critical Alerts</span>
            <div className="text-2xl sm:text-3xl font-black text-rose-500 font-mono animate-pulse">{stats.critical_count}</div>
            <p className="text-[10px] text-rose-400/80">Immediate intervention</p>
          </div>
        </div>

        {/* Filter Controls Panel */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-xl">
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
                      ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {catLabel}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search alert title, message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 text-slate-200 pl-8 pr-3 py-1.5 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
              <button
                type="submit"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>

          {/* Secondary Filters & Bulk Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
            
            {/* Priority & Status dropdowns */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Priority:</span>
                <select
                  value={selectedPriority}
                  onChange={(e) => {
                    setSelectedPriority(e.target.value);
                    applyFilters({ priority: e.target.value });
                  }}
                  className="bg-slate-900 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 text-xs focus:outline-none cursor-pointer"
                >
                  {priorities.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    applyFilters({ status: e.target.value });
                  }}
                  className="bg-slate-900 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="all">All Alerts</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read Only</option>
                </select>
              </div>
            </div>

            {/* Bulk Action Buttons */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 animate-in fade-in">
                <span className="text-[11px] font-bold text-amber-400 font-mono">{selectedIds.length} selected</span>
                <button
                  type="button"
                  onClick={() => handleBulkAction('mark_read')}
                  disabled={processing}
                  className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[11px] font-bold cursor-pointer"
                >
                  Mark Read
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkAction('delete')}
                  disabled={processing}
                  className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[11px] font-bold cursor-pointer"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notifications Table / List */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {notifications.data.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Bell className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="font-bold text-slate-300 text-sm">No notifications found</h4>
              <p className="text-xs text-slate-500">There are no operational alerts matching your filter criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              
              {/* Select All Row */}
              <div className="p-3 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400 font-bold">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === notifications.data.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer"
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
                        ? 'bg-rose-950/20 border-l-4 border-rose-500'
                        : isUrgent
                        ? 'bg-amber-950/20 border-l-4 border-amber-500'
                        : isUnread
                        ? 'bg-slate-900/50 border-l-4 border-blue-500'
                        : 'hover:bg-slate-900/30 opacity-80'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(n.id)}
                        className="mt-1 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer shrink-0"
                      />

                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isCritical ? 'bg-rose-500/20 text-rose-400' :
                        isUrgent ? 'bg-amber-500/20 text-amber-400' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {renderIcon(n.category, n.priority)}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-white text-sm">
                            {n.title || n.type}
                          </span>
                          {renderPriorityBadge(n.priority)}
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-400 font-mono">
                            {n.category}
                          </span>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-normal">
                          {n.message || (n.data && n.data.message) || ''}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono pt-0.5">
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
                          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>{n.action_label || 'View'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}

                      {isUnread && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(n.id)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(n.id)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
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
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Page {notifications.current_page} of {notifications.last_page}
              </span>
              <div className="flex items-center gap-2">
                {notifications.prev_page_url && (
                  <Link
                    href={notifications.prev_page_url}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 font-bold hover:bg-slate-700"
                  >
                    Previous
                  </Link>
                )}
                {notifications.next_page_url && (
                  <Link
                    href={notifications.next_page_url}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 font-bold hover:bg-slate-700"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
