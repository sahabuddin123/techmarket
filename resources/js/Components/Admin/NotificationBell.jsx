import React, { useState, useEffect, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import { 
  Bell, CheckCheck, ExternalLink, ShieldAlert, ShoppingBag, 
  Truck, Warehouse, Radio, Cpu, Users, AlertTriangle, AlertOctagon, 
  ChevronRight, Trash2, Check
} from 'lucide-react';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async (cat = activeTab) => {
    try {
      setLoading(true);
      const res = await fetch(`/admin/notifications/feed?category=${cat}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (e) {
      console.error('Failed to fetch notifications feed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications('ALL');

    // Periodic lightweight sync every 45s
    const interval = setInterval(() => {
      fetch(`/admin/notifications/unread-count`)
        .then(r => r.json())
        .then(d => setUnreadCount(d.unread_count || 0))
        .catch(() => {});
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications(activeTab);
    }
    setIsOpen(!isOpen);
  };

  const handleTabChange = (cat) => {
    setActiveTab(cat);
    fetchNotifications(cat);
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`/admin/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json',
        },
      });

      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(`/admin/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ category: activeTab }),
      });

      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      if (activeTab === 'ALL') {
        setUnreadCount(0);
      } else {
        fetchNotifications(activeTab);
      }
    } catch (e) {}
  };

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderIcon = (cat, priority) => {
    if (priority === 'CRITICAL') return <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse" />;
    if (priority === 'URGENT') return <AlertTriangle className="w-4 h-4 text-amber-500" />;

    switch (String(cat).toUpperCase()) {
      case 'ORDER':
      case 'PAYMENT':
        return <ShoppingBag className="w-4 h-4 text-blue-400" />;
      case 'COURIER':
        return <Truck className="w-4 h-4 text-emerald-400" />;
      case 'FRAUD':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'INVENTORY':
        return <Warehouse className="w-4 h-4 text-amber-400" />;
      case 'SMS':
        return <Radio className="w-4 h-4 text-purple-400" />;
      case 'SYSTEM':
      case 'SECURITY':
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const diffSec = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
        title="Notification Center"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white font-mono text-[10px] font-black px-1.5 py-0.2 rounded-full ring-2 ring-slate-950 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col text-xs font-sans animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="p-3.5 bg-slate-900/90 border-b border-slate-800/90 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-white text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center space-x-1 font-medium transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-1 px-3 py-2 bg-slate-900/40 border-b border-slate-800/60 overflow-x-auto text-[11px]">
            {['ALL', 'ORDER', 'COURIER', 'FRAUD', 'INVENTORY', 'SYSTEM'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab 
                    ? 'bg-amber-500 text-slate-950 shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* List of Latest Notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Loading alerts...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-1">
                <Bell className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-slate-400 font-medium">No alerts in this category</p>
                <p className="text-[10px] text-slate-600">All systems operating normally</p>
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.read_at;
                const isCritical = n.priority === 'CRITICAL';
                const isUrgent = n.priority === 'URGENT';

                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (isUnread) handleMarkAsRead(n.id);
                      if (n.action_url) router.visit(n.action_url);
                      setIsOpen(false);
                    }}
                    className={`p-3 transition-colors cursor-pointer flex items-start space-x-3 relative group ${
                      isCritical
                        ? 'bg-rose-950/20 hover:bg-rose-950/40 border-l-2 border-rose-500'
                        : isUrgent
                        ? 'bg-amber-950/20 hover:bg-amber-950/30 border-l-2 border-amber-500'
                        : isUnread
                        ? 'bg-slate-900/60 hover:bg-slate-900 border-l-2 border-blue-500'
                        : 'hover:bg-slate-900/40 opacity-80'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isCritical ? 'bg-rose-500/20 text-rose-400' :
                      isUrgent ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {renderIcon(n.category, n.priority)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-200 truncate pr-1">
                          {n.title || n.type}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {formatRelativeTime(n.created_at)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {n.message || (n.data && n.data.message) || ''}
                      </p>

                      {/* Action Pill if present */}
                      {n.action_url && (
                        <div className="pt-1 flex items-center space-x-1 text-[10px] text-amber-400 font-bold">
                          <span>{n.action_label || 'View'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Single Mark as Read button on hover */}
                    {isUnread && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(n.id, e)}
                        title="Mark as read"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-opacity"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Direct Link to Notification Center */}
          <div className="p-2.5 bg-slate-900 border-t border-slate-800 text-center">
            <Link
              href="/admin/notifications"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center justify-center space-x-1.5"
            >
              <span>Open Notification Center</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
