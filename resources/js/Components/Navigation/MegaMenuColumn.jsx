import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

export default function MegaMenuColumn({ group, onClose }) {
    if (!group) return null;

    const groupTitle = group.name || group.title || 'Category';
    const groupSlug = group.slug;
    const items = group.children || group.items || [];

    return (
        <div className="flex flex-col space-y-1.5 min-w-[160px]">
            {/* Column Header */}
            <div className="pb-1 mb-1 border-b border-gray-100">
                {groupSlug ? (
                    <Link
                        href={`/category/${groupSlug}`}
                        onClick={onClose}
                        className="text-[13px] font-bold text-gray-900 hover:text-red-600 transition-colors flex items-center justify-between group/head"
                    >
                        <span>{groupTitle}</span>
                        <ChevronRight className="w-3 h-3 text-gray-400 group-hover/head:text-red-600 transition-transform group-hover/head:translate-x-0.5" />
                    </Link>
                ) : (
                    <h5 className="text-[13px] font-bold text-gray-900 uppercase tracking-tight">
                        {groupTitle}
                    </h5>
                )}
            </div>

            {/* Column Sub-items */}
            <ul className="space-y-1">
                {items.map((item, idx) => {
                    const itemTitle = item.name || item.title;
                    const itemUrl = item.slug ? `/category/${item.slug}` : (item.url || '#');

                    return (
                        <li key={item.id || idx}>
                            <Link
                                href={itemUrl}
                                onClick={onClose}
                                className="text-[12px] text-gray-600 hover:text-red-600 hover:font-medium transition-all block py-0.5 px-1 rounded hover:bg-gray-50 leading-tight"
                            >
                                {itemTitle}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
