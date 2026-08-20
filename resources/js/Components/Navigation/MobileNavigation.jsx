import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { X, Search, Cpu, Wrench, CreditCard, Tag, Sparkles, Building2, BookOpen } from 'lucide-react';
import MobileCategoryTree from './MobileCategoryTree';

export default function MobileNavigation({ isOpen, onClose, categories = [], auth = {} }) {
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/catalog?search=${encodeURIComponent(searchQuery.trim())}`;
            onClose();
        }
    };

    const visibleCategories = (categories || []).filter(c => 
        c.is_nav_visible !== false && 
        c.is_nav_visible !== 0 && 
        c.is_nav_visible !== '0'
    );

    return (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />

            {/* Slide-out Drawer Panel */}
            <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
                {/* Header */}
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center font-bold text-white text-sm tracking-wider">
                            TM
                        </div>
                        <div className="leading-tight">
                            <h3 className="font-extrabold text-sm tracking-tight text-white">TECHMARKET BD</h3>
                            <span className="text-[10px] text-gray-400">Category Navigation</span>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
                        aria-label="Close navigation menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Mobile Search Bar */}
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search hardware, laptops, GPUs..."
                            className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-gray-300 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                        />
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </form>
                </div>

                {/* Quick Action Shortcuts */}
                <div className="grid grid-cols-3 gap-1 p-2 bg-white border-b border-gray-200 text-center text-[11px] font-semibold text-gray-700">
                    <Link
                        href="/pc-builder"
                        onClick={onClose}
                        className="flex flex-col items-center py-2 px-1 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <Cpu className="w-4 h-4 text-red-600 mb-1" />
                        <span>PC Builder</span>
                    </Link>
                    <Link
                        href="/servicing"
                        onClick={onClose}
                        className="flex flex-col items-center py-2 px-1 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <Wrench className="w-4 h-4 text-red-600 mb-1" />
                        <span>Servicing</span>
                    </Link>
                    <Link
                        href="/emi-info"
                        onClick={onClose}
                        className="flex flex-col items-center py-2 px-1 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <CreditCard className="w-4 h-4 text-red-600 mb-1" />
                        <span>0% EMI</span>
                    </Link>
                </div>

                {/* Categories Accordion Section */}
                <div className="flex-1 overflow-y-auto p-3">
                    <div className="text-[11px] font-extrabold uppercase text-gray-400 tracking-wider mb-2 px-2">
                        All Categories
                    </div>
                    <MobileCategoryTree
                        categories={visibleCategories}
                        depth={0}
                        onClose={onClose}
                    />

                    {/* Secondary Navigation Links */}
                    <div className="mt-6 pt-4 border-t border-gray-200 space-y-1 text-xs">
                        <div className="text-[11px] font-extrabold uppercase text-gray-400 tracking-wider mb-2 px-2">
                            Quick Links
                        </div>
                        <Link
                            href="/brands"
                            onClick={onClose}
                            className="flex items-center gap-2.5 py-2 px-2.5 rounded font-medium text-gray-700 hover:bg-gray-100 hover:text-red-600"
                        >
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span>Official Brands Directory</span>
                        </Link>
                        <Link
                            href="/blog"
                            onClick={onClose}
                            className="flex items-center gap-2.5 py-2 px-2.5 rounded font-medium text-gray-700 hover:bg-gray-100 hover:text-red-600"
                        >
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span>Tech Blog & Guides</span>
                        </Link>
                        <Link
                            href="/about-us"
                            onClick={onClose}
                            className="flex items-center gap-2.5 py-2 px-2.5 rounded font-medium text-gray-700 hover:bg-gray-100 hover:text-red-600"
                        >
                            <Sparkles className="w-4 h-4 text-gray-400" />
                            <span>About TechMarket BD</span>
                        </Link>
                    </div>
                </div>

                {/* Footer User Account Area */}
                <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs">
                    {auth.user ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-gray-900 truncate">{auth.user.name}</p>
                                <p className="text-[10px] text-gray-500">{auth.user.email}</p>
                            </div>
                            <Link
                                href="/dashboard"
                                onClick={onClose}
                                className="px-3 py-1 bg-red-600 text-white rounded font-bold text-xs hover:bg-red-700 transition-colors"
                            >
                                Account
                            </Link>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { tab: 'login' } }));
                                }}
                                className="flex-1 py-2 text-center bg-slate-200 text-slate-800 rounded-lg font-bold text-xs hover:bg-slate-300 transition-colors"
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { tab: 'register' } }));
                                }}
                                className="flex-1 py-2 text-center bg-[#002a5c] text-white rounded-lg font-bold text-xs hover:bg-[#001f44] transition-colors"
                            >
                                Register
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
