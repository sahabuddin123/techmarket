import React from 'react';
import { Link } from '@inertiajs/react';
import { Monitor, Wrench, MessageSquare, Calculator, Cpu } from 'lucide-react';

export default function QuickActionCardsV2({ quickActions = [], className = '' }) {
  const defaultActions = [
    {
      id: 'qa-1',
      title: 'PC Builder',
      subtitle: 'Configure your ideal PC',
      url: '/pc-builder',
      icon: Monitor,
    },
    {
      id: 'qa-2',
      title: 'Book a Service',
      subtitle: 'Repairs and home visits',
      url: '/servicing',
      icon: Wrench,
    },
    {
      id: 'qa-3',
      title: 'Complain Box',
      subtitle: 'Share concerns with us',
      url: '/complain-box',
      icon: MessageSquare,
    },
    {
      id: 'qa-4',
      title: 'Tools',
      subtitle: 'Calculators and utilities',
      url: '/tools',
      icon: Calculator,
    },
  ];

  const getActionIcon = (title, iconKey) => {
    const t = `${title || ''} ${iconKey || ''}`.toLowerCase();
    if (t.includes('pc') || t.includes('builder') || t.includes('computer')) return Monitor;
    if (t.includes('service') || t.includes('repair') || t.includes('fix')) return Wrench;
    if (t.includes('complain') || t.includes('feedback') || t.includes('box')) return MessageSquare;
    if (t.includes('tool') || t.includes('calc') || t.includes('calculator')) return Calculator;
    return Cpu;
  };

  let items = defaultActions;
  if (quickActions && quickActions.length >= 4) {
    items = quickActions.slice(0, 4).map((qa) => ({
      id: qa.id,
      title: qa.title,
      subtitle: qa.subtitle,
      url: qa.url,
      icon: getActionIcon(qa.title, qa.icon),
    }));
  }

  return (
    <div className={`storefront-v2-quick-actions ${className}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {items.map((item) => {
          const IconComp = item.icon || Monitor;

          return (
            <Link
              key={item.id || item.title}
              href={item.url}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-[0_10px_25px_rgba(37,99,235,0.12)] p-3.5 sm:p-4 flex items-center space-x-3 sm:space-x-3.5 transition-all duration-300 group transform hover:-translate-y-1.5 cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#16294A] group-hover:bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs transition-all duration-300 group-hover:scale-110">
                <IconComp className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight leading-tight group-hover:text-blue-600 transition-colors truncate">
                  {item.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
