import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
  Layers, Phone, Mail, MapPin, Clock, 
  Globe, ShieldCheck, Heart, ArrowUp, MessageCircle
} from 'lucide-react';
import ChatbotWidget from '@/Components/Chatbot/ChatbotWidget';
import MobileBottomNav from '@/Components/MobileBottomNav';

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

export default function FooterV2({ onOpenCart }) {
  const { settings = {} } = usePage().props;
  const currentYear = new Date().getFullYear();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setShowBackToTop(window.scrollY > 300);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showFloatingWhatsApp = settings.footer_show_whatsapp !== '0' && (settings.whatsapp_number || settings.hotline);
  const whatsappNumber = (settings.whatsapp_number || settings.hotline || '+8801312345678').replace(/[^0-9]/g, '');
  const showFloatingHotline = settings.footer_show_hotline !== '0' && (settings.hotline || settings.support_phone);

  return (
    <footer className="storefront-v2-footer bg-white border-t border-slate-200/90 text-slate-700 font-sans pt-12 pb-6 mt-16 select-none relative">
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-100">
          
          {/* Column 1: Brand & Social */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              {settings.site_logo ? (
                <img 
                  src={settings.site_logo} 
                  alt={settings.site_name || 'TechMarket BD'} 
                  className="h-8 object-contain"
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-black text-slate-900 tracking-tight leading-none">
                      TECH
                    </span>
                    <span className="text-[9px] font-extrabold text-blue-600 tracking-widest leading-none mt-0.5">
                      MARKET
                    </span>
                  </div>
                </div>
              )}
            </Link>

            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              {settings.site_tagline || 'Your trusted partner for premium security solutions and technology products.'}
            </p>

            {/* Circular Blue Social Buttons */}
            <div className="flex items-center space-x-2 pt-1">
              <a
                href={settings.facebook_url || "https://facebook.com"}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-xs hover:scale-105"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href={settings.youtube_url || "https://youtube.com"}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-xs hover:scale-105"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
              <a
                href="/"
                aria-label="Website"
                className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-xs hover:scale-105"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${settings.support_email || 'info@techmarket.com.bd'}`}
                aria-label="Email"
                className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-xs hover:scale-105"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href={settings.instagram_url || "https://instagram.com"}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-xs hover:scale-105"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-blue-600 transition-colors">Products</Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-blue-600 transition-colors">Brands</Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
              </li>
              <li>
                <Link href="/about-us" className="hover:text-blue-600 transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              Customer Service
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/account/profile" className="hover:text-blue-600 transition-colors">My Account</Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-blue-600 transition-colors">Track Order</Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-blue-600 transition-colors">Wishlist</Link>
              </li>
              <li>
                <Link href="/refund-and-return-policy" className="hover:text-blue-600 transition-colors">Returns</Link>
              </li>
              <li>
                <Link href="/servicing" className="hover:text-blue-600 transition-colors">Support</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Our Services */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              Our Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/servicing" className="hover:text-blue-600 transition-colors">CCTV Installation</Link>
              </li>
              <li>
                <Link href="/servicing" className="hover:text-blue-600 transition-colors">Access Control</Link>
              </li>
              <li>
                <Link href="/category/networking" className="hover:text-blue-600 transition-colors">Networking Solution</Link>
              </li>
              <li>
                <Link href="/servicing" className="hover:text-blue-600 transition-colors">Maintenance</Link>
              </li>
              <li>
                <Link href="/servicing" className="hover:text-blue-600 transition-colors">Consultation</Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Contact Us */}
          <div className="space-y-3 text-xs text-slate-600">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              Contact Us
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-start space-x-2.5">
                <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <a href={`tel:${settings.hotline || '+880 1234-567890'}`} className="hover:text-blue-600 font-bold text-slate-800">
                  {settings.hotline || '+880 1234-567890'}
                </a>
              </div>

              <div className="flex items-start space-x-2.5">
                <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <a href={`mailto:${settings.support_email || 'info@techmarket.com.bd'}`} className="hover:text-blue-600">
                  {settings.support_email || 'info@techmarket.com.bd'}
                </a>
              </div>

              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {settings.company_address ? settings.company_address.split(',')[0] : 'Mirpur, Dhaka, Bangladesh'}
                </span>
              </div>

              <div className="flex items-start space-x-2.5">
                <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  {settings.working_hours ? settings.working_hours.split('(')[0] : '10:00 AM - 08:00 PM'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Footer Copyright Row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © {currentYear} {settings.site_name || 'TECH MARKET'}. All Rights Reserved.
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/privacy-policy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms-and-conditions" className="hover:text-blue-600 transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>

      {/* Floating Utilities (Scroll-To-Top, WhatsApp, Hotline) */}
      <div className="fixed bottom-20 sm:bottom-6 right-3.5 sm:right-6 z-40 sm:z-50 flex flex-col items-center space-y-2.5 select-none">
        {/* Scroll to Top */}
        <button
          type="button"
          onClick={scrollToTop}
          className={`w-11 h-11 rounded-full bg-slate-900/95 hover:bg-slate-800 text-white flex items-center justify-center shadow-xl border border-slate-700/80 transition-all duration-300 cursor-pointer ${
            showBackToTop
              ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
              : 'opacity-0 translate-y-4 pointer-events-none scale-90'
          }`}
          title="Scroll to Top"
          aria-label="Scroll to Top"
        >
          <ArrowUp className="w-4 h-4 text-amber-400" />
        </button>

        {/* WhatsApp Support */}
        {showFloatingWhatsApp && (
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            className="w-11 h-11 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-xl transition-all hover:scale-108"
            title="Chat on WhatsApp"
            aria-label="WhatsApp Support"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
          </a>
        )}

        {/* Hotline Call */}
        {showFloatingHotline && (
          <a
            href={`tel:${settings.hotline || '+8809613562601'}`}
            className="w-11 h-11 rounded-full bg-[#1c4289] hover:bg-[#15326b] text-white flex items-center justify-center shadow-xl border border-blue-900/60 transition-all hover:scale-108"
            title="Call Hotline"
            aria-label="Call Hotline"
          >
            <Phone className="w-4 h-4 text-white" />
          </a>
        )}
      </div>

      {/* Floating AI Chatbot Assistant Widget */}
      <ChatbotWidget />

      {/* Fixed Mobile Bottom Navigation Bar */}
      <MobileBottomNav onOpenCart={onOpenCart} />
    </footer>
  );
}
