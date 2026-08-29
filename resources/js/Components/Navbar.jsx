import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
  Search, ShoppingCart, Heart, User, Cpu, Phone, 
  Menu, X, GitCompare, Tag, Sliders, Wrench, CreditCard,
  Sparkles, ChevronRight, ArrowRight, ShieldCheck, Mail,
  Bell, Award, Package, Monitor, KeyRound, LogOut, ChevronDown, Shield, Video
} from 'lucide-react';
import DesktopNavigation from './Navigation/DesktopNavigation';
import MobileNavigation from './Navigation/MobileNavigation';
import AuthModal from './AuthModal';
import NavbarV2 from '@/Pages/Storefront/Version2/Components/NavbarV2';
import NavbarV3 from '@/Pages/Storefront/Version3/Components/NavbarV3';

export default function Navbar({ onOpenCart }) {
  const { auth, cart = { count: 0, total: 0 }, categories = [], settings = {}, footerNavigations = {}, unreadCount = 0, compareCount = 0, wishlistCount = 0, storefront_version } = usePage().props;
  const version = storefront_version || settings.storefront_version || 'v1';

  if (version === 'v3') {
    return <NavbarV3 onOpenCart={onOpenCart} />;
  }

  if (version === 'v2') {
    return <NavbarV2 onOpenCart={onOpenCart} />;
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const dropdownRef = useRef(null);

  // Listen to custom window event for opening AuthModal anywhere in the app
  useEffect(() => {
    const handleOpenAuthModal = (e) => {
      const targetTab = e?.detail?.tab || 'login';
      setAuthModalTab(targetTab);
      setAuthModalOpen(true);
    };

    window.addEventListener('open-auth-modal', handleOpenAuthModal);
    return () => window.removeEventListener('open-auth-modal', handleOpenAuthModal);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
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

  // Top Announcement Banner settings
  const announcementEnabled = settings.header_announcement_enabled === '1' || settings.header_announcement_enabled === true;
  const announcementText = settings.header_announcement_text;
  const announcementLink = settings.header_announcement_link || '/offers';
  const announcementBg = settings.header_announcement_bg || '#0084ff';
  const announcementTextColor = settings.header_announcement_text_color || '#ffffff';

  // Action Button Toggles
  const showOffers = settings.header_show_offers !== '0';
  const showEmi = settings.header_show_emi !== '0';
  const showPcBuilder = settings.header_show_pc_builder !== '0';
  const showCompare = settings.header_show_compare !== '0';
  const showWishlist = settings.header_show_wishlist !== '0';

  const customHeaderLinks = footerNavigations?.header || [];

  return (
    <header className="w-full bg-[#0f172a] text-slate-100 sticky top-0 z-50 shadow-md font-sans select-none">
      {/* 0. DYNAMIC TOP ANNOUNCEMENT TICKER BANNER (Controlled by Admin) */}
      {announcementEnabled && announcementText && (
        <div 
          style={{ backgroundColor: announcementBg, color: announcementTextColor }}
          className="w-full text-xs py-2 px-4 font-bold tracking-wide transition-colors"
        >
          <div className="max-w-[1640px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-300 animate-pulse" />
              <span className="truncate">{announcementText}</span>
            </div>

            {announcementLink && (
              <Link 
                href={announcementLink}
                className="hidden sm:inline-flex items-center gap-1 shrink-0 uppercase tracking-widest text-[11px] hover:underline font-black"
              >
                <span>Explore Deal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 1. TOP MAIN HEADER */}
      <div className="max-w-[1640px] mx-auto px-4 py-3 flex items-center justify-between gap-2 sm:gap-3 lg:gap-8">
        {/* Mobile Left: Hamburger Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-1.5 -ml-1 rounded text-white hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Brand Logo Area (Centered on mobile, left on desktop) */}
        <Link href="/" className="flex-1 md:flex-initial flex items-center justify-center md:justify-start group shrink-0 px-2">
          <div className="flex items-center justify-center">
            {settings.site_logo ? (
              <img
                src={settings.site_logo_dark || settings.site_logo}
                alt={settings.site_name || 'TechMarket BD'}
                className="h-7 sm:h-8 md:h-10 w-auto object-contain max-w-[175px] sm:max-w-[220px] transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.style.display = 'inline';
                }}
              />
            ) : null}
            <span className={`text-xl sm:text-2xl md:text-[28px] font-black tracking-tight text-white font-sans ${settings.site_logo ? 'hidden' : ''}`}>
              {settings.site_name || 'TechMarket BD'}
            </span>
          </div>
        </Link>

        {/* Center: Large Desktop Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative hidden md:block">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder={settings.search_placeholder || "Type a product, brand or model..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm rounded-l pl-4 pr-10 py-2.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0084ff] transition-all font-medium"
            />
            <button
              type="submit"
              className="bg-[#0084ff] hover:bg-[#0070d6] text-white px-6 py-2.5 rounded-r font-bold text-sm flex items-center transition-colors shrink-0 shadow cursor-pointer"
            >
              <Search className="w-4 h-4 mr-1.5" />
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Right: Quick Action Buttons & Badges */}
        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-3.5 shrink-0 text-xs sm:text-[13px]">
          {/* Custom Header Links from Admin Builder */}
          {customHeaderLinks.map((hLink) => (
            <Link
              key={hLink.id}
              href={hLink.url}
              target={hLink.open_new_tab ? '_blank' : '_self'}
              className="hidden 2xl:inline-block px-2.5 py-1.5 rounded hover:bg-slate-800 text-slate-300 font-bold text-xs transition-colors"
            >
              {hLink.title}
            </Link>
          ))}

          {/* CCTV Estimator Button */}
          <Link
            href="/cctv-estimator"
            className="hidden xl:flex items-center space-x-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-extrabold border border-slate-700 hover:border-slate-600 transition-colors uppercase tracking-wider text-xs shadow-xs"
            title="CCTV System Builder & Quotation Estimator"
          >
            <Video className="w-4 h-4 text-[#0084ff]" />
            <span className="text-white">CCTV EST</span>
          </Link>

          {/* TOOLS Button */}
          <Link
            href="/tools"
            className="hidden xl:flex items-center space-x-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-extrabold border border-slate-700 hover:border-slate-600 transition-colors uppercase tracking-wider text-xs shadow-xs"
            title="Customer Useful Tools & Calculators"
          >
            <Wrench className="w-4 h-4 text-[#0084ff]" />
            <span className="text-white">TOOLS</span>
          </Link>

          {/* PC BUILDER Button */}
          {showPcBuilder && (
            <Link
              href="/pc-builder"
              className="hidden lg:flex items-center space-x-1.5 px-3.5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-extrabold border border-slate-700 hover:border-slate-600 transition-colors uppercase tracking-wider text-xs shadow-xs"
            >
              <Cpu className="w-4 h-4 text-[#0084ff]" />
              <span className="text-white">PC BUILDER</span>
            </Link>
          )}

          {/* Compare Button (Boxed like PC Builder & CCTV) */}
          {showCompare && (
            <Link 
              href="/compare" 
              className="hidden sm:flex items-center justify-center px-2.5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 transition-colors relative shadow-xs"
              title="Compare Products"
            >
              <GitCompare className="w-4 h-4 text-[#0084ff]" />
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#0084ff] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-slate-900 shadow-xs animate-scale-in">
                  {compareCount}
                </span>
              )}
            </Link>
          )}

          {/* Wishlist Button (Boxed like PC Builder & CCTV) */}
          {showWishlist && (
            <Link 
              href="/wishlist" 
              className="hidden sm:flex items-center justify-center px-2.5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 transition-colors relative shadow-xs"
              title="Wishlist"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-slate-900 shadow-xs animate-scale-in">
                  {wishlistCount}
                </span>
              )}
            </Link>
          )}

          {/* Mobile Search Icon (Toggles sleek search bar) */}
          <button 
            type="button"
            onClick={() => setMobileSearchOpen(prev => !prev)}
            className="md:hidden p-2 rounded text-slate-200 hover:text-white transition-colors"
            title="Search Catalog"
            aria-label="Toggle Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Cart Icon & Badge */}
          <button
            onClick={onOpenCart}
            className="flex items-center space-x-1.5 px-3 py-2 rounded bg-[#0084ff] hover:bg-[#0070d6] text-white font-bold transition-colors shadow cursor-pointer"
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4" />
              {cart.count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-white">
                  {cart.count}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs sm:text-[13px] font-mono ml-1 font-bold">
              ৳{Number(cart.total || 0).toLocaleString()}
            </span>
          </button>

          {/* Account / Login Dropdown */}
          {auth?.user ? (
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-bold truncate max-w-[90px] sm:max-w-[120px] text-xs">
                  {auth.user.name}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${accountDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {accountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl border border-[#d9dde3] py-2 z-50 text-slate-700 animate-in fade-in-50 duration-150 font-sans">
                  {/* Top Customer Info Header */}
                  <div className="px-4 py-2.5 flex items-center space-x-3 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="truncate min-w-0">
                      <div className="font-bold text-[13px] text-slate-800 truncate">
                        {auth.user.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        Reward: {auth.user.reward_points ?? 0} pts
                      </div>
                    </div>
                  </div>

                  {/* Account Navigation Links */}
                  <div className="py-1 text-[13px]">
                    <Link
                      href="/account/profile"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-[#274a7d] transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/account/notifications"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center justify-between px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-[#274a7d] transition-colors"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Bell className="w-4 h-4 text-slate-400" />
                        <span>Notifications</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/account/orders/history"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-[#274a7d] transition-colors"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      <span>Order History</span>
                    </Link>

                    <Link
                      href="/account/reward-points"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-[#274a7d] transition-colors"
                    >
                      <Award className="w-4 h-4 text-slate-400" />
                      <span>Reward Points</span>
                    </Link>

                    <Link
                      href="/account/saved-pc-builds"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-[#274a7d] transition-colors"
                    >
                      <Monitor className="w-4 h-4 text-slate-400" />
                      <span>Saved PC Builds</span>
                    </Link>

                    <Link
                      href="/account/service-requests"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-[#274a7d] transition-colors"
                    >
                      <Wrench className="w-4 h-4 text-slate-400" />
                      <span>Service Requests</span>
                    </Link>

                    <Link
                      href="/account/password/change"
                      onClick={() => setAccountDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-[#274a7d] transition-colors"
                    >
                      <KeyRound className="w-4 h-4 text-slate-400" />
                      <span>Password</span>
                    </Link>

                    {auth.user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-amber-600 hover:bg-amber-50 font-bold transition-colors"
                      >
                        <Shield className="w-4 h-4 text-amber-500" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100 my-1" />

                  {/* Logout */}
                  <Link
                    href="/logout"
                    method="post"
                    as="button"
                    onClick={() => setAccountDropdownOpen(false)}
                    className="w-full flex items-center space-x-2.5 px-4 py-2 text-[13px] font-semibold text-[#d94343] hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-[#d94343]" />
                    <span>Logout</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAuthModalTab('login');
                setAuthModalOpen(true);
              }}
              className="hidden sm:flex p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors shadow-xs"
              title="Account Login / Register"
              aria-label="Account Login"
            >
              <User className="w-4 h-4 text-blue-400" />
            </button>
          )}

          {/* Desktop/Tablet Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="hidden sm:inline-flex lg:hidden p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 1.1 MOBILE SEARCH BAR (Smoothly toggles when clicking Search icon) */}
      {mobileSearchOpen && (
        <div className="px-4 pb-2.5 pt-0 block md:hidden max-w-[1640px] mx-auto animate-in slide-in-from-top-2 duration-150">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input
              type="text"
              autoFocus
              placeholder={settings.search_placeholder || "Type a product, brand or model..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 placeholder-slate-400 text-xs rounded-l pl-3 pr-8 py-2 border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0084ff]"
            />
            <button
              type="submit"
              className="bg-[#0084ff] hover:bg-[#0070d6] text-white px-3.5 py-2 rounded-r flex items-center justify-center shrink-0"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* 2. DESKTOP FULL-WIDTH MEGA MENU / CATEGORY NAVIGATION BAR */}
      <DesktopNavigation categories={categories} />

      {/* 3. MOBILE RESPONSIVE DRAWER */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        categories={categories}
      />

      {/* 4. IN-SITE AUTHENTICATION MODAL (Customer Login / Register / Forgot Password) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </header>
  );
}
