import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
  Search, ShoppingCart, Heart, User, Cpu, Phone, 
  Menu, X, GitCompare, Tag, Sliders, Wrench, CreditCard,
  Sparkles, ChevronRight, ArrowRight, ShieldCheck, Mail,
  Bell, Award, Package, Monitor, KeyRound, LogOut, ChevronDown, 
  Truck, LayoutGrid, Layers, Check
} from 'lucide-react';
import AuthModal from '@/Components/AuthModal';

// Social Icon SVGs
const FacebookIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const YoutubeIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function NavbarV2({ onOpenCart }) {
  const { auth, cart = { count: 0, total: 0 }, categories = [], settings = {}, compareCount = 0 } = usePage().props;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [browseCategoriesOpen, setBrowseCategoriesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState({});
  const hoverTimeoutRef = useRef(null);
  
  const categoryRef = useRef(null);
  const browseRef = useRef(null);
  const accountRef = useRef(null);
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  // Set default active category when menu opens
  useEffect(() => {
    if (browseCategoriesOpen && !hoveredCategoryId && categories.length > 0) {
      const firstWithChildren = categories.find(c => c.children && c.children.length > 0);
      setHoveredCategoryId(firstWithChildren ? firstWithChildren.id : categories[0].id);
    }
  }, [browseCategoriesOpen, categories, hoveredCategoryId]);

  const handleBrowseMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setBrowseCategoriesOpen(true);
  };

  const handleBrowseMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setBrowseCategoriesOpen(false);
    }, 200);
  };

  const toggleMobileCategory = (catId) => {
    setExpandedMobileCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setBrowseCategoriesOpen(false);
        setCategoryDropdownOpen(false);
        setAccountDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen to custom window event for opening AuthModal
  useEffect(() => {
    const handleOpenAuthModal = (e) => {
      const targetTab = e?.detail?.tab || 'login';
      setAuthModalTab(targetTab);
      setAuthModalOpen(true);
    };

    window.addEventListener('open-auth-modal', handleOpenAuthModal);
    return () => window.removeEventListener('open-auth-modal', handleOpenAuthModal);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
      if (browseRef.current && !browseRef.current.contains(event.target)) {
        setBrowseCategoriesOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = { search: searchQuery.trim() };
      if (selectedCategory && selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      router.get('/catalog', params);
    }
  };

  const activeCategory = categories.find(c => c.id === hoveredCategoryId) || categories[0] || null;

  const navLinks = [
    { label: 'HOME', href: '/' },
    { label: 'SHOP', href: '/catalog' },
    { label: 'DEALS', href: '/offers' },
    { label: 'NEW ARRIVALS', href: '/catalog?sort=latest' },
    { label: 'BLOG', href: '/blog' },
    { label: 'CONTACT US', href: '/about-us' },
  ];

  return (
    <header className="storefront-v2-header w-full sticky top-0 z-50 select-none shadow-sm font-sans">
      
      {/* ========================================================================= */}
      {/* 1. TOP UTILITY BAR (Dark Navy Background) */}
      {/* ========================================================================= */}
      <div className="bg-[#0b1a36] text-slate-300 text-xs py-2 px-4 border-b border-blue-950/60">
        <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Free delivery message */}
          <div className="flex items-center space-x-2 text-[11px] sm:text-xs">
            <Truck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-slate-300 font-medium">
              Free Delivery on orders over <strong className="text-white font-bold">৳{settings.free_shipping_threshold ? Number(settings.free_shipping_threshold).toLocaleString() : '999'}</strong>
            </span>
          </div>

          {/* Right: Phone support & Social links */}
          <div className="flex items-center space-x-4 sm:space-x-6 text-[11px] sm:text-xs">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-sky-400" />
              <span>Support:</span>
              <a 
                href={`tel:${settings.hotline || settings.support_phone || '01312-345678'}`} 
                className="text-white font-bold hover:text-sky-300 transition-colors"
              >
                {settings.hotline || settings.support_phone || '01312-345678'}
              </a>
            </div>

            {/* Social Icons */}
            <div className="hidden sm:flex items-center space-x-2.5 text-slate-400">
              <a 
                href={settings.facebook_url || "https://facebook.com"} 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Facebook"
                className="hover:text-white transition-colors"
              >
                <FacebookIcon className="w-3.5 h-3.5" />
              </a>
              <a 
                href={settings.instagram_url || "https://instagram.com"} 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Instagram"
                className="hover:text-white transition-colors"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
              <a 
                href={settings.youtube_url || "https://youtube.com"} 
                target="_blank" 
                rel="noreferrer" 
                aria-label="YouTube"
                className="hover:text-white transition-colors"
              >
                <YoutubeIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN HEADER (Clean White Background with Central Search & Actions) */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200/80 py-3.5 px-4">
        <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 lg:gap-8">
          
          {/* Mobile Left: Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2.5 shrink-0 group">
            {settings.site_logo ? (
              <img 
                src={settings.site_logo} 
                alt={settings.site_name || 'TechMarket BD'} 
                className="h-8 sm:h-9 object-contain"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
                    TECH
                  </span>
                  <span className="text-[10px] font-extrabold text-blue-600 tracking-widest leading-none mt-0.5">
                    MARKET
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* Central Large Search Bar with Category Dropdown */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearch} className="flex items-center border border-slate-300 rounded-xl overflow-hidden focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all bg-white shadow-2xs">
              
              {/* Category Dropdown Pill */}
              <div className="relative shrink-0" ref={categoryRef}>
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 border-r border-slate-300 transition-colors"
                >
                  <span className="truncate max-w-[110px]">
                    {selectedCategory === 'all' ? 'All Categories' : (categories.find(c => c.slug === selectedCategory)?.name || 'Categories')}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs max-h-72 overflow-y-auto admin-scrollbar">
                    <button
                      type="button"
                      onClick={() => { setSelectedCategory('all'); setCategoryDropdownOpen(false); }}
                      className={`w-full text-left px-3.5 py-2 font-bold hover:bg-blue-50 hover:text-blue-600 transition-colors ${selectedCategory === 'all' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-700'}`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id || cat.slug}
                        type="button"
                        onClick={() => { setSelectedCategory(cat.slug); setCategoryDropdownOpen(false); }}
                        className={`w-full text-left px-3.5 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors ${selectedCategory === cat.slug ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={settings.search_placeholder || "Search for products..."}
                className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-xs sm:text-sm px-4 py-2.5 border-none focus:outline-none focus:ring-0"
              />

              {/* Blue Search Button */}
              <button
                type="submit"
                aria-label="Search"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 font-bold text-xs flex items-center justify-center transition-colors shrink-0"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right: Quick Action Buttons (Compare, Wishlist, Cart, My Account) */}
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 shrink-0 text-xs text-slate-700">
            
            {/* Compare */}
            <Link 
              href="/compare"
              className="hidden sm:flex items-center space-x-1.5 hover:text-blue-600 transition-colors"
              title="Compare Products"
            >
              <div className="relative">
                <GitCompare className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                {compareCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {compareCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline font-bold">Compare</span>
            </Link>

            {/* Wishlist */}
            <Link 
              href="/wishlist"
              className="hidden sm:flex items-center space-x-1.5 hover:text-blue-600 transition-colors"
              title="Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              <span className="hidden lg:inline font-bold">Wishlist</span>
            </Link>

            {/* Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="flex items-center space-x-1.5 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.count || 0}
                </span>
              </div>
              <span className="hidden lg:inline font-bold">Cart</span>
            </button>

            {/* My Account */}
            {auth?.user ? (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center space-x-1.5 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer font-bold text-slate-900"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                  <span className="hidden lg:inline truncate max-w-[100px]">{auth.user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {accountDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs font-bold text-slate-700">
                    <Link href="/account/profile" className="block px-4 py-2 hover:bg-slate-50 hover:text-blue-600">Profile</Link>
                    <Link href="/account/orders/history" className="block px-4 py-2 hover:bg-slate-50 hover:text-blue-600">Orders</Link>
                    {auth?.user?.role === 'admin' && (
                      <Link href="/admin" className="block px-4 py-2 text-amber-600 hover:bg-amber-50">Admin Dashboard</Link>
                    )}
                    <div className="border-t border-slate-100 my-1" />
                    <Link href="/logout" method="post" as="button" className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50">
                      Sign Out
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setAuthModalTab('login'); setAuthModalOpen(true); }}
                className="flex items-center space-x-1.5 hover:text-blue-600 transition-colors cursor-pointer font-bold"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                <span className="hidden lg:inline">My Account</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Row (< md) */}
        <div className="block md:hidden mt-2 pt-2 border-t border-slate-100">
          <form onSubmit={handleSearch} className="flex items-center border border-slate-300 rounded-xl overflow-hidden focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all bg-[#f8fafc]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={settings.search_placeholder || "Search for products..."}
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-xs px-3.5 py-2 border-none focus:outline-none focus:ring-0 font-medium"
            />
            <button
              type="submit"
              aria-label="Search"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-bold text-xs flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN NAVIGATION BAR (Dark Navy Background matching Screenshot) */}
      {/* ========================================================================= */}
      <div className="bg-[#0b1a36] text-white px-4 border-t border-blue-950/60 hidden lg:block relative z-40">
        <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Left: Browse Categories High-Tech Blue Button & Mega Menu */}
          <div 
            className="relative" 
            ref={browseRef}
            onMouseEnter={handleBrowseMouseEnter}
            onMouseLeave={handleBrowseMouseLeave}
          >
            <button
              type="button"
              onClick={() => setBrowseCategoriesOpen(prev => !prev)}
              className="flex items-center space-x-2.5 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs tracking-wider uppercase transition-colors shadow-sm cursor-pointer"
              aria-expanded={browseCategoriesOpen}
              aria-haspopup="true"
            >
              <Menu className="w-4 h-4" />
              <span>BROWSE CATEGORIES</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${browseCategoriesOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Mega Categories Two-Panel Container */}
            {browseCategoriesOpen && (
              <div 
                className="absolute left-0 top-full flex bg-white rounded-b-2xl shadow-[0_25px_60px_rgba(15,23,42,0.25)] border border-slate-200/90 z-50 text-xs text-slate-800 animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden min-w-[760px] lg:min-w-[880px] xl:min-w-[960px]"
                onMouseEnter={handleBrowseMouseEnter}
                onMouseLeave={handleBrowseMouseLeave}
              >
                {/* 1. LEFT PANEL: Parent Categories List */}
                <div className="w-64 sm:w-72 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 select-none">
                  <div className="max-h-[480px] overflow-y-auto py-2 divide-y divide-slate-50 custom-scrollbar">
                    {categories.map((cat) => {
                      const isActive = activeCategory?.id === cat.id;
                      const hasChildren = cat.children && cat.children.length > 0;

                      return (
                        <div
                          key={cat.id || cat.slug}
                          onMouseEnter={() => setHoveredCategoryId(cat.id)}
                          className={`group transition-all ${
                            isActive ? 'bg-blue-50/90 text-blue-600 font-extrabold' : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-bold'
                          }`}
                        >
                          <Link
                            href={`/category/${cat.slug}`}
                            onClick={() => setBrowseCategoriesOpen(false)}
                            className="flex items-center justify-between px-4 py-2.5 transition-colors cursor-pointer"
                          >
                            <span className="truncate">{cat.name}</span>
                            {hasChildren && (
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                                isActive ? 'text-blue-600 translate-x-0.5' : 'text-slate-300 group-hover:text-blue-500'
                              }`} />
                            )}
                          </Link>
                        </div>
                      );
                    })}
                  </div>

                  {/* View All Categories Link */}
                  <div className="border-t border-slate-100 p-2 bg-slate-50/50">
                    <Link
                      href="/catalog"
                      onClick={() => setBrowseCategoriesOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-blue-600 font-extrabold hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <span>View All Categories</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* 2. RIGHT PANEL: Subcategories & Grandchildren Mega Grid */}
                <div className="flex-1 bg-[#f8fafc] p-6 flex flex-col justify-between max-h-[530px] overflow-y-auto custom-scrollbar min-h-[400px]">
                  {activeCategory ? (
                    <div className="space-y-5">
                      {/* Top Header of Active Category */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                            {activeCategory.name}
                          </h3>
                        </div>

                        <Link
                          href={`/category/${activeCategory.slug}`}
                          onClick={() => setBrowseCategoriesOpen(false)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                        >
                          <span>Explore All {activeCategory.name}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {/* Subcategories Grid */}
                      {activeCategory.children && activeCategory.children.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                          {activeCategory.children.map((sub) => {
                            const hasGrandchildren = sub.children && sub.children.length > 0;

                            return (
                              <div key={sub.id || sub.slug} className="space-y-2">
                                <Link
                                  href={`/category/${sub.slug}`}
                                  onClick={() => setBrowseCategoriesOpen(false)}
                                  className="font-extrabold text-xs text-slate-900 hover:text-blue-600 block pb-1 border-b border-slate-200/80 transition-colors group"
                                >
                                  <span className="group-hover:translate-x-0.5 transition-transform inline-block">
                                    {sub.name}
                                  </span>
                                </Link>

                                {hasGrandchildren ? (
                                  <ul className="space-y-1.5 pt-0.5">
                                    {sub.children.map((grand) => (
                                      <li key={grand.id || grand.slug}>
                                        <Link
                                          href={`/category/${grand.slug}`}
                                          onClick={() => setBrowseCategoriesOpen(false)}
                                          className="text-xs text-slate-600 hover:text-blue-600 hover:font-bold transition-all block truncate py-0.5"
                                        >
                                          {grand.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-[11px] text-slate-400 font-medium">
                                    Browse models & specifications
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Package className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-800 text-sm">{activeCategory.name}</h4>
                            <p className="text-xs text-slate-500 max-w-xs mt-1">
                              Browse all authentic products, brand warranties, and best prices in {activeCategory.name}.
                            </p>
                          </div>
                          <Link
                            href={`/category/${activeCategory.slug}`}
                            onClick={() => setBrowseCategoriesOpen(false)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                          >
                            View {activeCategory.name} Products
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Bottom Trust/Promo Bar */}
                  <div className="pt-4 mt-4 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      100% Genuine Tech with Official Manufacturer Warranty
                    </span>
                    <span className="text-slate-400">Fast Nationwide Delivery</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Center: Navigation Links */}
          <nav className="flex items-center space-x-1 xl:space-x-2 font-bold text-xs">
            {navLinks.map((link) => {
              const isActive = currentPath === link.href;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-3.5 py-3 transition-colors relative hover:text-sky-300 ${
                    isActive ? 'text-sky-400 font-black' : 'text-slate-200'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-sky-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Special Offer CTA */}
          <div>
            <Link
              href="/offers"
              className="flex items-center space-x-1.5 text-sky-400 hover:text-sky-300 font-extrabold text-xs tracking-wider uppercase transition-colors"
            >
              <Tag className="w-3.5 h-3.5 text-sky-400" />
              <span>SPECIAL OFFER!</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#0b1a36] text-white">
              <span className="font-bold text-sm">Navigation Menu</span>
              <button 
                type="button" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 flex-1">
              <div className="space-y-1">
                {navLinks.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg font-bold text-sm text-slate-800 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
                  Categories
                </div>
                <div className="space-y-1">
                  {categories.map((cat) => {
                    const isExpanded = expandedMobileCategories[cat.id];
                    const hasChildren = cat.children && cat.children.length > 0;

                    return (
                      <div key={cat.id || cat.slug} className="rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <Link
                            href={`/category/${cat.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex-1 truncate"
                          >
                            {cat.name}
                          </Link>
                          {hasChildren && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMobileCategory(cat.id);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                              aria-label={`Toggle ${cat.name} subcategories`}
                            >
                              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
                            </button>
                          )}
                        </div>

                        {hasChildren && isExpanded && (
                          <div className="bg-slate-50/80 px-4 py-1.5 space-y-1 border-l-2 border-blue-500 ml-3">
                            {cat.children.map((sub) => (
                              <Link
                                key={sub.id || sub.slug}
                                href={`/category/${sub.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-1 text-xs text-slate-600 hover:text-blue-600 font-medium"
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
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs">
              <div className="text-slate-500 mb-1">Customer Support</div>
              <a 
                href={`tel:${settings.hotline || '01312-345678'}`}
                className="font-bold text-slate-900"
              >
                {settings.hotline || '01312-345678'}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Global Auth Modal */}
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
