import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
  Search, ShoppingBag, User, Menu, X, Gift, 
  ChevronDown, ChevronRight, LogOut, Package, 
  ShieldCheck, LayoutGrid, Heart, Sparkles, Phone, Mail,
  Cpu, KeyRound, Bell, Settings
} from 'lucide-react';
import AuthModal from '@/Components/AuthModal';
import TopUtilityBarV3 from './TopUtilityBarV3';

// Social Icon SVGs
const FacebookIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const YoutubeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TiktokIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

export default function NavbarV3({ onOpenCart }) {
  const { auth, cart = { count: 0, total: 0 }, categories = [], settings = {} } = usePage().props;
  const [searchQuery, setSearchQuery] = useState('');
  const [browseOpen, setBrowseOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState('menu'); // 'menu' | 'categories'
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id || null);

  const browseRef = useRef(null);
  const accountRef = useRef(null);
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  // Outside click listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (browseRef.current && !browseRef.current.contains(e.target)) {
        setBrowseOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.get('/catalog', { search: searchQuery.trim() });
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/catalog' },
    { label: 'Brands', href: '/brands' },
    { label: 'Top Trending', href: '/catalog?sort=trending' },
    { label: 'About Us', href: '/about-us' },
    { label: 'Contact Us', href: '/about-us#contact' },
    { label: 'Track Order', href: '/track-order' },
  ];

  return (
    <header className="storefront-v3-header w-full bg-white sticky top-0 z-50 select-none shadow-xs font-sans">
      {/* 1. Blue Announcement Utility Strip */}
      <TopUtilityBarV3 settings={settings} />

      {/* 2. Main Branding & Search Header Row */}
      <div className="w-full border-b border-slate-100 py-3 sm:py-4 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Mobile Menu Trigger + Logo */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#0153FD] hover:bg-slate-50 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-1.5 shrink-0">
              {settings.site_logo ? (
                <img src={settings.site_logo} alt={settings.site_name || 'TechMarket BD'} className="h-7 sm:h-10 w-auto object-contain" />
              ) : (
                <div className="flex items-center space-x-1.5 font-black text-lg sm:text-2xl tracking-tight">
                  <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-lg bg-[#0153FD] text-white flex items-center justify-center font-black text-[11px] sm:text-xs shadow-sm tracking-tighter">
                    TM
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-[#0153FD] font-black">{settings.site_name ? settings.site_name.split(' ')[0] : 'TechMarket'}</span>
                    <span className="text-[#002268] font-black ml-1">{settings.site_name ? settings.site_name.split(' ').slice(1).join(' ') : 'BD'}</span>
                  </div>
                </div>
              )}
            </Link>
          </div>

          {/* Centered Search Bar (Desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4 relative">
            <div className="w-full relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products"
                className="w-full bg-[#f8fafc] hover:bg-white focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 pl-4 pr-12 py-2.5 rounded-full border border-slate-200 focus:border-[#0153FD] focus:outline-none transition-all shadow-2xs"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-1.5 w-8 h-8 rounded-full bg-[#0153FD] hover:bg-[#0042cf] text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right Action Icons (Offers, Account, Cart) */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Offers Button */}
            <Link
              href="/offers"
              className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#0153FD] hover:bg-[#0042cf] text-white text-[11px] sm:text-xs font-semibold flex items-center space-x-1 shadow-xs transition-colors"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Offers</span>
            </Link>

            {/* Account Icon (hidden on small mobile, accessible in drawer and bottom nav) */}
            <div className="relative hidden sm:block" ref={accountRef}>
              <button
                type="button"
                onClick={() => {
                  if (auth?.user) {
                    setAccountOpen(!accountOpen);
                  } else {
                    setAuthModalOpen(true);
                  }
                }}
                className="w-8 sm:w-9 h-8 sm:h-9 rounded-full border border-slate-200 hover:border-[#0153FD] text-slate-700 hover:text-[#0153FD] flex items-center justify-center transition-colors cursor-pointer"
                title={auth?.user ? auth.user.name : 'Account'}
              >
                <User className="w-4 h-4" />
              </button>

              {/* Account Dropdown Menu */}
              {accountOpen && auth?.user && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-100 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 text-xs divide-y divide-slate-100">
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50/50 to-transparent">
                    <p className="font-extrabold text-slate-900 truncate">{auth.user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{auth.user.email}</p>
                  </div>

                  <div className="py-1">
                    {auth.user.is_admin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-[#0153FD] font-semibold transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#0153FD]" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <Link
                      href="/account/profile"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-[#0153FD] transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile & Dashboard</span>
                    </Link>
                    <Link
                      href="/account/orders/history"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-[#0153FD] transition-colors"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      <span>Order History</span>
                    </Link>
                    <Link
                      href="/account/saved-pc-builds"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-[#0153FD] transition-colors"
                    >
                      <Cpu className="w-4 h-4 text-slate-400" />
                      <span>Saved PC Builds</span>
                    </Link>
                    <Link
                      href="/account/reward-points"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-[#0153FD] transition-colors"
                    >
                      <Gift className="w-4 h-4 text-slate-400" />
                      <span>Reward Points</span>
                    </Link>
                    <Link
                      href="/account/password/change"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-[#0153FD] transition-colors"
                    >
                      <KeyRound className="w-4 h-4 text-slate-400" />
                      <span>Change Password</span>
                    </Link>
                  </div>

                  <div className="pt-1">
                    <Link
                      href="/logout"
                      method="post"
                      as="button"
                      onClick={() => setAccountOpen(false)}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 font-semibold text-left transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button (Black round button with Blue count badge) */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-[#1e293b] hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cart.count > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0153FD] text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                  {cart.count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearch} className="md:hidden mt-3 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products"
            className="w-full bg-[#f8fafc] text-xs text-slate-800 placeholder-slate-400 pl-4 pr-10 py-2 rounded-full border border-slate-200 focus:border-[#0153FD] focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-1 top-1 bottom-1 px-3 bg-[#0153FD] text-white rounded-full flex items-center justify-center"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 3. Sub-Navigation Bar: Browse Categories + Navigation Links + Social Icons */}
      <div className="w-full bg-white border-b border-slate-100 hidden md:block">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          <div className="flex items-center space-x-6">
            {/* "Browse Categories" Dropdown Trigger & Two-Panel Mega Menu */}
            <div 
              className="relative" 
              ref={browseRef}
              onMouseEnter={() => setBrowseOpen(true)}
              onMouseLeave={() => setBrowseOpen(false)}
            >
              <button
                type="button"
                onClick={() => setBrowseOpen(!browseOpen)}
                className="bg-[#0153FD] hover:bg-[#0042cf] text-white font-bold text-xs sm:text-[13px] px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <Menu className="w-4 h-4" />
                <span>Browse Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${browseOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Two-Panel Mega Menu Dropdown */}
              {browseOpen && (
                <div 
                  className="absolute top-full left-0 mt-1.5 flex bg-white rounded-2xl border border-[#8BB1FF]/50 shadow-[0_15px_40px_rgba(1,83,253,0.18)] z-50 animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden min-w-[760px] lg:min-w-[880px]"
                  onMouseEnter={() => setBrowseOpen(true)}
                  onMouseLeave={() => setBrowseOpen(false)}
                >
                  {/* 1. LEFT PANEL: Parent Categories List */}
                  <div className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 select-none">
                    <div className="max-h-[440px] overflow-y-auto py-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-[#0153FD]/40">
                      {categories.map((category) => {
                        const isCurrentActive = activeCategoryId 
                          ? activeCategoryId === category.id 
                          : (categories[0]?.id === category.id);

                        return (
                          <div
                            key={category.id}
                            onMouseEnter={() => setActiveCategoryId(category.id)}
                            className={`group transition-all ${
                              isCurrentActive 
                                ? 'bg-blue-50/90 text-[#0153FD] font-black border-l-3 border-[#0153FD]' 
                                : 'text-slate-700 hover:bg-slate-50 hover:text-[#0153FD] font-semibold border-l-3 border-transparent'
                            }`}
                          >
                            <Link
                              href={`/catalog?category=${category.slug}`}
                              onClick={() => setBrowseOpen(false)}
                              className="flex items-center justify-between px-4 py-2.5 text-xs transition-colors cursor-pointer"
                            >
                              <span className="truncate">{category.name}</span>
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                                isCurrentActive ? 'text-[#0153FD] translate-x-0.5' : 'text-slate-300 group-hover:text-[#0153FD]'
                              }`} />
                            </Link>
                          </div>
                        );
                      })}
                    </div>

                    {/* View All Categories Link */}
                    <div className="border-t border-slate-100 p-2.5 bg-slate-50/70">
                      <Link
                        href="/catalog"
                        onClick={() => setBrowseOpen(false)}
                        className="flex items-center justify-between px-3 py-1.5 text-xs text-[#0153FD] font-bold hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <span>View All Categories</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* 2. RIGHT PANEL: Subcategories & Grandchildren Mega Grid */}
                  {(() => {
                    const activeCategory = categories.find(c => c.id === activeCategoryId) || categories[0];
                    if (!activeCategory) return null;

                    const hasRealChildren = activeCategory.children && activeCategory.children.length > 0;

                    return (
                      <div className="flex-1 bg-[#F4F7FC]/70 p-5 flex flex-col justify-between max-h-[490px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
                        <div className="space-y-4">
                          {/* Top Header of Active Category */}
                          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                            <div className="flex items-center space-x-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#0153FD]" />
                              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wide">
                                {activeCategory.name}
                              </h3>
                            </div>

                            <Link
                              href={`/catalog?category=${activeCategory.slug}`}
                              onClick={() => setBrowseOpen(false)}
                              className="text-xs font-bold text-[#0153FD] hover:underline flex items-center gap-1"
                            >
                              <span>Explore All</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>

                          {/* Subcategories Grid */}
                          {hasRealChildren ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                              {activeCategory.children.map((sub) => (
                                <div key={sub.id} className="space-y-2">
                                  <Link
                                    href={`/catalog?category=${sub.slug}`}
                                    onClick={() => setBrowseOpen(false)}
                                    className="font-bold text-xs text-slate-900 hover:text-[#0153FD] flex items-center space-x-1.5 group"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#0153FD] transition-colors" />
                                    <span>{sub.name}</span>
                                  </Link>

                                  {sub.children && sub.children.length > 0 && (
                                    <ul className="pl-3 space-y-1 text-[11px] text-slate-600">
                                      {sub.children.slice(0, 5).map((child) => (
                                        <li key={child.id}>
                                          <Link
                                            href={`/catalog?category=${child.slug}`}
                                            onClick={() => setBrowseOpen(false)}
                                            className="hover:text-[#0153FD] hover:underline transition-colors block truncate"
                                          >
                                            {child.name}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            /* Smart Dynamic Subcategory Blocks for Top Gadget Categories */
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
                                <h4 className="font-bold text-xs text-[#0153FD] flex items-center space-x-1.5">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Popular Series</span>
                                </h4>
                                <ul className="space-y-1.5 text-[11px] text-slate-600">
                                  <li>
                                    <Link href={`/catalog?category=${activeCategory.slug}&sort=best_seller`} onClick={() => setBrowseOpen(false)} className="hover:text-[#0153FD] hover:underline block">
                                      Best Selling {activeCategory.name}
                                    </Link>
                                  </li>
                                  <li>
                                    <Link href={`/catalog?category=${activeCategory.slug}&sort=trending`} onClick={() => setBrowseOpen(false)} className="hover:text-[#0153FD] hover:underline block">
                                      Trending Gadgets
                                    </Link>
                                  </li>
                                  <li>
                                    <Link href={`/catalog?category=${activeCategory.slug}&sort=newest`} onClick={() => setBrowseOpen(false)} className="hover:text-[#0153FD] hover:underline block">
                                      New Arrivals 2026
                                    </Link>
                                  </li>
                                </ul>
                              </div>

                              <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
                                <h4 className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                                  <Package className="w-3.5 h-3.5 text-[#0153FD]" />
                                  <span>Top Brands</span>
                                </h4>
                                <ul className="space-y-1.5 text-[11px] text-slate-600">
                                  {['Xiaomi', 'SOLOVE', 'JYSUPER', 'Weidasi', 'Awei', 'SKE'].map((brand) => (
                                    <li key={brand}>
                                      <Link href={`/catalog?brand=${brand.toLowerCase()}&category=${activeCategory.slug}`} onClick={() => setBrowseOpen(false)} className="hover:text-[#0153FD] hover:underline block">
                                        {brand} Official
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="space-y-2 bg-gradient-to-br from-blue-600 to-[#0153FD] text-white p-4 rounded-xl shadow-md flex flex-col justify-between">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block">
                                    SPECIAL PROMO
                                  </span>
                                  <h5 className="font-black text-xs text-white leading-tight pt-1">
                                    Genuine {activeCategory.name} with Official Warranty
                                  </h5>
                                </div>
                                <Link
                                  href={`/catalog?category=${activeCategory.slug}`}
                                  onClick={() => setBrowseOpen(false)}
                                  className="mt-3 bg-white hover:bg-slate-100 text-[#0153FD] font-bold text-[11px] px-3 py-1.5 rounded-lg text-center shadow-xs transition-colors"
                                >
                                  Shop Collection
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center space-x-5 text-xs sm:text-[13px] font-semibold text-slate-700">
              {navLinks.map((link) => {
                const isActive = currentPath === link.href || (link.href !== '/' && currentPath.startsWith(link.href));
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`transition-colors py-2.5 relative ${
                      isActive
                        ? 'text-[#0153FD] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0153FD] after:rounded-full'
                        : 'hover:text-[#0153FD]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Social Icons on Right */}
          <div className="flex items-center space-x-3 text-slate-600">
            <a href={settings.facebook_url || 'https://facebook.com'} target="_blank" rel="noreferrer" className="hover:text-[#0153FD] transition-colors" title="Facebook">
              <FacebookIcon />
            </a>
            <a href={settings.instagram_url || 'https://instagram.com'} target="_blank" rel="noreferrer" className="hover:text-pink-600 transition-colors" title="Instagram">
              <InstagramIcon />
            </a>
            <a href={settings.youtube_url || 'https://youtube.com'} target="_blank" rel="noreferrer" className="hover:text-red-600 transition-colors" title="YouTube">
              <YoutubeIcon />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors" title="TikTok">
              <TiktokIcon />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Side Panel (Sliding in from Left) */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-50 w-[300px] sm:w-[320px] max-w-[85vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* 1. Top Search Bar Inside Mobile Drawer */}
        <div className="p-3.5 border-b border-slate-100 bg-white">
          <form onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false); }} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products"
              className="w-full bg-[#f8fafc] text-xs text-slate-800 placeholder-slate-400 pl-3.5 pr-10 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0153FD]"
            />
            <button
              type="submit"
              className="absolute right-2.5 text-slate-400 hover:text-[#0153FD] p-1 cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* 2. MENU | CATEGORIES Tab Switcher (Exact Reference Match) */}
        <div className="grid grid-cols-2 bg-[#f1f5f9] text-center text-xs font-bold shrink-0 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setMobileTab('menu')}
            className={`py-3 transition-colors uppercase tracking-wider cursor-pointer ${
              mobileTab === 'menu'
                ? 'bg-white text-slate-900 border-b-2 border-[#0153FD] font-black shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            MENU
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('categories')}
            className={`py-3 transition-colors uppercase tracking-wider cursor-pointer ${
              mobileTab === 'categories'
                ? 'bg-white text-slate-900 border-b-2 border-[#0153FD] font-black shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            CATEGORIES
          </button>
        </div>

        {/* 3. Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {mobileTab === 'menu' ? (
            /* MENU TAB (Exact Match with Screenshot 1) */
            <div className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-5 py-3.5 hover:bg-slate-50 hover:text-[#0153FD] transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {/* User Account / Auth Section at Bottom of Menu */}
              <div className="p-4 bg-slate-50/70">
                {auth?.user ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-slate-900 font-bold">
                      <User className="w-4 h-4 text-[#0153FD]" />
                      <span className="truncate">{auth.user.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href="/account/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-[11px] font-bold text-center py-2 rounded-lg bg-[#0153FD] text-white"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/logout"
                        method="post"
                        as="button"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-[11px] font-bold text-center py-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-200"
                      >
                        Sign Out
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setAuthModalTab('login');
                        setAuthModalOpen(true);
                      }}
                      className="py-2 bg-[#0153FD] text-white text-[11px] font-bold rounded-lg text-center cursor-pointer"
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setAuthModalTab('register');
                        setAuthModalOpen(true);
                      }}
                      className="py-2 bg-white border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg text-center hover:bg-slate-50 cursor-pointer"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* CATEGORIES TAB (Exact Match with Screenshots 2 & 3 with Expandable Blue Accordion) */
            <div className="divide-y divide-slate-100 text-xs text-slate-800">
              {categories.map((cat) => {
                const hasChildren = Array.isArray(cat.children) && cat.children.length > 0;
                const isExpanded = expandedCategoryId === cat.id;

                return (
                  <div key={cat.id} className="w-full">
                    <div className="flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <Link
                        href={`/catalog?category=${cat.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex-1 py-3.5 pl-5 pr-2 font-medium truncate ${
                          isExpanded ? 'text-[#0153FD] font-bold' : 'text-slate-800'
                        }`}
                      >
                        {cat.name}
                      </Link>

                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}
                          className={`w-11 h-11 flex items-center justify-center shrink-0 border-l border-slate-100 transition-colors cursor-pointer ${
                            isExpanded ? 'bg-[#0153FD] text-white' : 'text-slate-400 hover:text-slate-700'
                          }`}
                          aria-label={`Toggle ${cat.name} subcategories`}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      ) : (
                        <div className="w-6 shrink-0" />
                      )}
                    </div>

                    {/* Subcategories Accordion Dropdown (Screenshot 3) */}
                    {hasChildren && isExpanded && (
                      <div className="bg-slate-50/60 divide-y divide-slate-100/80 border-t border-slate-100">
                        {cat.children.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/catalog?category=${sub.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-2.5 pl-8 pr-4 text-[11px] font-medium text-slate-600 hover:text-[#0153FD] hover:bg-blue-50/50 transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          initialTab={authModalTab}
          onClose={() => setAuthModalOpen(false)}
        />
      )}
    </header>
  );
}
