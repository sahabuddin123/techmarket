import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import MegaMenu from './MegaMenu';

export default function DesktopNavigation({ categories = [] }) {
    const [activeCategoryId, setActiveCategoryId] = useState(null);
    const hoverTimeoutRef = useRef(null);
    const navRef = useRef(null);
    const { url = '' } = usePage();

    // Filter only visible top-level categories (strictly handles boolean false, 0, '0')
    const visibleCategories = (categories || []).filter(c => 
        c.is_nav_visible !== false && 
        c.is_nav_visible !== 0 && 
        c.is_nav_visible !== '0'
    );

    const handleMouseEnter = (catId) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        setActiveCategoryId(catId);
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        hoverTimeoutRef.current = setTimeout(() => {
            setActiveCategoryId(null);
        }, 180);
    };

    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                setActiveCategoryId(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        };
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (navRef.current && !navRef.current.contains(e.target)) {
                if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                setActiveCategoryId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav 
            ref={navRef} 
            className="relative bg-white border-b border-gray-200 hidden lg:block select-none shadow-xs z-40"
            aria-label="Main Category Navigation"
        >
            <div className="max-w-[1640px] mx-auto px-4">
                {/* Clean flex container without overflow-x-auto that would clip dropdowns */}
                <div className="flex items-center justify-between py-1 relative">
                    {visibleCategories.map((cat, index) => {
                        const isMegaEnabled = cat.mega_menu_enabled !== false && (cat.children?.length > 0 || cat.mega_menu_config?.promo_enabled);
                        const isDirectLink = cat.mega_menu_type === 'direct_link' || !isMegaEnabled;
                        const isHovered = activeCategoryId === cat.id;
                        const isCurrentRoute = url.startsWith(`/category/${cat.slug}`);

                        // Align dropdown to right for items near the right edge to prevent horizontal viewport overflow
                        const alignRight = index >= Math.max(visibleCategories.length - 4, 3);

                        return (
                            <div
                                key={cat.id}
                                className="relative group shrink-0"
                                onMouseEnter={() => handleMouseEnter(cat.id)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <Link
                                    href={`/category/${cat.slug}`}
                                    onClick={() => {
                                        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                                        setActiveCategoryId(null);
                                    }}
                                    className={`flex items-center gap-1.5 py-2.5 px-2.5 xl:px-3.5 text-[14px] font-bold tracking-tight transition-colors rounded-t cursor-pointer ${
                                        isHovered 
                                            ? 'text-red-600 bg-red-50/60' 
                                            : isCurrentRoute 
                                                ? 'text-red-600 font-extrabold' 
                                                : 'text-gray-800 hover:text-red-600 hover:bg-gray-50'
                                    }`}
                                    aria-expanded={isHovered}
                                    aria-haspopup={!isDirectLink ? 'true' : undefined}
                                >
                                    <span className="truncate">{cat.name}</span>
                                    {!isDirectLink && (
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 text-gray-400 group-hover:text-red-600 ${
                                            isHovered ? 'rotate-180 text-red-600' : ''
                                        }`} />
                                    )}
                                </Link>

                                {/* Active Bottom Indicator Line */}
                                {isHovered && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 z-10 transition-all" />
                                )}

                                {/* Stable Mega Menu Dropdown */}
                                {!isDirectLink && isHovered && (
                                    <MegaMenu
                                        category={cat}
                                        isOpen={isHovered}
                                        onClose={() => {
                                            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                                            setActiveCategoryId(null);
                                        }}
                                        align={alignRight ? 'right' : 'left'}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
