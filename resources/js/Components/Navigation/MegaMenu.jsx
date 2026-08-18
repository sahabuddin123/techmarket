import React from 'react';
import { Link } from '@inertiajs/react';
import MegaMenuColumn from './MegaMenuColumn';
import MegaMenuPromotion from './MegaMenuPromotion';

export default function MegaMenu({ category, isOpen, onClose, align = 'left' }) {
    if (!isOpen || !category) return null;

    const displayType = category.mega_menu_type || 'auto';
    const layout = category.mega_menu_layout || 'auto';
    const config = category.mega_menu_config || {};

    // 1. Simple Dropdown Mode
    if (displayType === 'simple_dropdown' || (!category.children?.length && displayType === 'auto')) {
        const items = category.children || [];
        if (!items.length && !config.promo_enabled) return null;

        return (
            <div 
                className={`absolute top-full ${align === 'right' ? 'right-0' : 'left-0'} z-50 w-64 bg-white rounded-b-xl shadow-2xl border border-gray-200/90 py-2.5 before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:bg-transparent animate-in fade-in slide-in-from-top-1 duration-150 pointer-events-auto`}
            >
                <div className="px-4 py-1.5 border-b border-gray-100 mb-1 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                        All {category.name}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50/50">
                    {items.map((child) => (
                        <Link
                            key={child.id}
                            href={`/category/${child.slug}`}
                            onClick={onClose}
                            className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50/60 transition-colors"
                        >
                            {child.name}
                        </Link>
                    ))}
                </div>
                <div className="px-4 pt-2.5 mt-1 border-t border-gray-100">
                    <Link
                        href={`/category/${category.slug}`}
                        onClick={onClose}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center justify-between hover:underline"
                    >
                        <span>View All {category.name}</span>
                        <span>&rarr;</span>
                    </Link>
                </div>
            </div>
        );
    }

    // 2. Derive Columns for Auto vs Manual mode
    let columns = [];
    if (displayType === 'manual' && config.manual_groups?.length) {
        columns = config.manual_groups;
    } else {
        columns = category.children || [];
    }

    if (!columns.length && !config.promo_enabled) {
        return null;
    }

    // Determine grid column class
    let gridColsClass = 'grid-cols-3';
    if (layout === '2_columns') gridColsClass = 'grid-cols-2';
    else if (layout === '3_columns') gridColsClass = 'grid-cols-3';
    else if (layout === '4_columns') gridColsClass = 'grid-cols-4';
    else {
        // Auto calculate based on columns length
        if (columns.length <= 2) gridColsClass = 'grid-cols-2';
        else if (columns.length === 3) gridColsClass = 'grid-cols-3';
        else gridColsClass = 'grid-cols-4';
    }

    const hasPromo = config.promo_enabled !== false && (config.promo_title || config.promo_image);

    return (
        <div 
            className={`absolute top-full ${align === 'right' ? 'right-0' : 'left-0'} z-50 bg-white rounded-b-2xl shadow-2xl border border-gray-200/90 p-5 before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:bg-transparent animate-in fade-in slide-in-from-top-1 duration-150 transition-all pointer-events-auto`}
            style={{ 
                minWidth: hasPromo ? '780px' : columns.length > 2 ? '680px' : '480px', 
                maxWidth: '94vw' 
            }}
        >
            <div className="flex gap-6 items-stretch">
                {/* Left Area: Multi-Column Hierarchy */}
                <div className="flex-1">
                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-600"></span>
                            <span className="text-xs font-black uppercase tracking-wider text-gray-900">
                                {category.name} Catalog & Components
                            </span>
                        </div>
                        <Link
                            href={`/category/${category.slug}`}
                            onClick={onClose}
                            className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
                        >
                            <span>View All {category.name}</span>
                            <span>&rarr;</span>
                        </Link>
                    </div>

                    <div className={`grid ${gridColsClass} gap-x-6 gap-y-5`}>
                        {columns.map((group, idx) => (
                            <MegaMenuColumn
                                key={group.id || idx}
                                group={group}
                                onClose={onClose}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Area: Promotional Banner */}
                {hasPromo && (
                    <MegaMenuPromotion
                        config={config}
                        defaultCategorySlug={category.slug}
                    />
                )}
            </div>
        </div>
    );
}
