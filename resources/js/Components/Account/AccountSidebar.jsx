import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
  User, Bell, Award, Package, Monitor, 
  Wrench, KeyRound, LogOut 
} from 'lucide-react';

export default function AccountSidebar({ unreadCount: propUnreadCount }) {
  const { url, props } = usePage();
  const unreadCount = propUnreadCount ?? props.unreadCount ?? 0;

  const navItems = [
    {
      title: 'My Profile',
      href: '/account/profile',
      icon: User,
      active: url === '/account/profile' || url === '/profile',
    },
    {
      title: 'Notifications',
      href: '/account/notifications',
      icon: Bell,
      active: url === '/account/notifications' || url === '/customer-notifications',
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      title: 'Reward Points',
      href: '/account/reward-points',
      icon: Award,
      active: url === '/account/reward-points',
    },
    {
      title: 'Order History',
      href: '/account/orders/history',
      icon: Package,
      active: url.startsWith('/account/orders') || url === '/dashboard',
    },
    {
      title: 'Saved PC Builds',
      href: '/account/saved-pc-builds',
      icon: Monitor,
      active: url === '/account/saved-pc-builds',
    },
    {
      title: 'Service Requests',
      href: '/account/service-requests',
      icon: Wrench,
      active: url === '/account/service-requests',
    },
    {
      title: 'Password',
      href: '/account/password/change',
      icon: KeyRound,
      active: url === '/account/password/change',
    },
  ];

  return (
    <aside className="w-full lg:w-[320px] xl:w-[340px] shrink-0 font-sans">
      <div className="bg-white border border-[#d9dde3] rounded-[8px] p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        {/* Top NAVIGATION Header */}
        <div className="text-[12px] font-bold tracking-wider text-[#8b95a5] uppercase mb-3 px-3.5">
          NAVIGATION
        </div>

        {/* Menu Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className={`relative flex items-center justify-between h-[46px] px-3.5 text-[13.5px] transition-colors ${
                  item.active
                    ? 'bg-[#eef1f5] text-[#274a7d] font-bold rounded-r-[6px]'
                    : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#1e293b] font-medium rounded-[6px]'
                }`}
              >
                {/* Active Left Dark Navy Vertical Accent Bar */}
                {item.active && (
                  <span className="absolute left-0 top-0 bottom-0 w-[3.5px] bg-[#274a7d] rounded-l-[2px]" />
                )}

                <div className="flex items-center space-x-3 truncate">
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 ${
                      item.active ? 'text-[#274a7d]' : 'text-[#64748b]'
                    }`}
                  />
                  <span className="truncate">{item.title}</span>
                </div>

                {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                  <span className="shrink-0 bg-[#e53e3e] text-white text-[11px] font-bold h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="border-t border-[#e2e8f0] my-2 pt-1" />

          {/* Logout Button */}
          <Link
            href="/logout"
            method="post"
            as="button"
            className="w-full flex items-center space-x-3 h-[46px] px-3.5 text-[13.5px] font-medium text-[#d94343] hover:bg-rose-50 rounded-[6px] transition-colors text-left"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0 text-[#d94343]" />
            <span>Logout</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
