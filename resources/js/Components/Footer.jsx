import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
  Phone, Mail, MapPin, MessageSquare, MessageCircle, ArrowUp,
  ShieldCheck, Zap, CreditCard, Wrench, Sparkles, Send,
  ChevronRight, ExternalLink, Award, CheckCircle2, Clock
} from 'lucide-react';
import ChatbotWidget from '@/Components/Chatbot/ChatbotWidget';
import MobileBottomNav from '@/Components/MobileBottomNav';
import FooterV2 from '@/Pages/Storefront/Version2/Components/FooterV2';
import FooterV3 from '@/Pages/Storefront/Version3/Components/FooterV3';

export default function Footer({ onOpenCart }) {
  const { settings = {}, footerNavigations = {}, storefront_version } = usePage().props;
  const version = storefront_version || settings.storefront_version || 'v1';

  if (version === 'v3') {
    return <FooterV3 onOpenCart={onOpenCart} />;
  }

  if (version === 'v2') {
    return <FooterV2 onOpenCart={onOpenCart} />;
  }

  const [showBackToTop, setShowBackToTop] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail && newsletterEmail.includes('@')) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  // Fallback links if database is empty
  const defaultInfoLinks = [
    { id: 'def-1', title: 'About Us', url: '/about-us', open_new_tab: false },
    { id: 'def-2', title: 'Brands Directory', url: '/brands', open_new_tab: false },
    { id: 'def-3', title: 'PC Builder Studio', url: '/pc-builder', open_new_tab: false },
    { id: 'def-4', title: 'Customer Tools & Calculators', url: '/tools', open_new_tab: false },
    { id: 'def-5', title: '0% EMI Financing Facilities', url: '/emi-info', open_new_tab: false },
    { id: 'def-6', title: 'Exclusive Deals & Campaigns', url: '/offers', open_new_tab: false },
  ];

  const defaultPolicyLinks = [
    { id: 'pol-1', title: 'Official Warranty Policy', url: '/page/warranty-policy', open_new_tab: false },
    { id: 'pol-2', title: 'Delivery & Shipping Coverage', url: '/page/delivery-policy', open_new_tab: false },
    { id: 'pol-3', title: 'Terms & Conditions', url: '/page/terms-and-conditions', open_new_tab: false },
    { id: 'pol-4', title: 'Refund & Return Policy', url: '/page/refund-and-return-policy', open_new_tab: false },
    { id: 'pol-5', title: 'Privacy Policy', url: '/privacy-policy', open_new_tab: false },
    { id: 'pol-6', title: 'Third Party Pickup Points', url: '/tools/third-party-pickup-points', open_new_tab: false },
  ];

  const infoLinks = (footerNavigations.info && footerNavigations.info.length > 0)
    ? footerNavigations.info
    : defaultInfoLinks;

  const policyLinks = (footerNavigations.policies && footerNavigations.policies.length > 0)
    ? footerNavigations.policies
    : defaultPolicyLinks;

  // Floating controls toggles
  const showScrollTop = settings.floating_scroll_top_enabled !== '0';
  const showFloatingWhatsApp = settings.floating_whatsapp_enabled !== '0';
  const showFloatingHotline = settings.floating_hotline_enabled !== '0';

  // Social media URLs
  const facebookUrl = settings.facebook_url || 'https://facebook.com';
  const youtubeUrl = settings.youtube_url || 'https://youtube.com';
  const instagramUrl = settings.instagram_url || 'https://instagram.com';
  const twitterUrl = settings.twitter_url || 'https://twitter.com';
  const linkedinUrl = settings.linkedin_url || 'https://linkedin.com';
  const whatsappNumber = (settings.whatsapp_number || '8801711223344').replace(/[^0-9]/g, '');

  return (
    <footer className="bg-[#090d16] text-slate-400 text-xs font-sans border-t border-slate-800/90 select-none relative overflow-hidden">
      
      {/* 1. TOP NEWSLETTER & VIP TECH DROPS STRIP */}
      <div className="border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-[#0d1527] to-slate-950">
        <div className="max-w-[1640px] mx-auto px-4 py-7 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3.5 text-center lg:text-left">
            <div className="w-11 h-11 rounded-xl bg-[#0084ff]/15 border border-[#0084ff]/30 text-[#0084ff] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-extrabold text-sm sm:text-base tracking-tight font-heading">
                Stay Ahead in Tech — Join {settings.site_name || 'TechMarket BD'} Insider
              </h4>
              <p className="text-slate-400 text-xs sm:text-[13px] mt-0.5">
                Receive weekly hardware flash deal drops, price drop alerts & official launch updates.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex items-center max-w-md gap-2">
            <div className="relative flex-1">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 text-xs sm:text-sm rounded-xl px-4 py-3 border border-slate-800 focus:outline-none focus:border-[#0084ff] font-medium"
              />
            </div>
            <button
              type="submit"
              className="bg-[#0084ff] hover:bg-[#0070d6] text-white px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center space-x-1.5 transition-all shrink-0 cursor-pointer shadow-sm"
            >
              <span>{subscribed ? 'Joined! ✓' : 'Subscribe'}</span>
              {!subscribed && <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>

      {/* 2. MAIN 4-COLUMN FOOTER CONTAINER */}
      <div className="max-w-[1640px] mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* Column 1: Brand Story, Hotline & Contacts (Span 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center space-x-2.5 group">
              <div className="flex items-center">
                {settings.site_logo ? (
                  <img
                    src={settings.site_logo_dark || settings.site_logo}
                    alt={settings.site_name || 'TechMarket BD'}
                    className="h-8 sm:h-9 w-auto object-contain max-w-[210px] transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) fallback.style.display = 'inline';
                    }}
                  />
                ) : null}
                <span className={`text-xl font-black tracking-tight text-white font-heading ${settings.site_logo ? 'hidden' : ''}`}>
                  {settings.site_name || 'TechMarket BD'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#0084ff]/15 text-[#0084ff] border border-[#0084ff]/30 text-[10px] font-bold">
                Official Store
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {settings.site_tagline || 'Leading authentic computer hardware, gaming rigs, workstations, laptops & electronics retailer in Bangladesh.'}
            </p>
          </div>

          <div className="space-y-2.5 text-slate-300 pt-1">
            <a 
              href={`tel:${settings.hotline || '+8809613562601'}`}
              className="flex items-center space-x-2.5 group cursor-pointer hover:text-[#0084ff] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[#0084ff] group-hover:bg-[#0084ff] group-hover:text-white transition-colors shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Direct Hotline (9 AM - 9 PM)</span>
                <span className="font-extrabold text-white text-xs font-mono group-hover:text-[#0084ff] transition-colors">
                  {settings.hotline || '(+880) 09613-562601'}
                </span>
              </div>
            </a>

            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Official Support Desk</span>
                <span className="text-xs text-slate-200 font-medium">
                  {settings.support_email || 'support@techmarketbd.com'}
                </span>
              </div>
            </div>

            {settings.company_address && (
              <div className="flex items-start space-x-2.5 pt-1 text-[11px] text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="leading-snug pt-1">
                  {settings.company_address}
                </span>
              </div>
            )}
          </div>

          {/* Social Media Link Pills */}
          <div className="flex items-center space-x-2 pt-2">
            <a 
              href={facebookUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] flex items-center justify-center transition-all shadow-xs"
              title="Facebook"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            <a 
              href={youtubeUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-[#FF0000] hover:border-[#FF0000] flex items-center justify-center transition-all shadow-xs"
              title="YouTube"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>

            <a 
              href={instagramUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-[#E1306C] hover:border-[#E1306C] flex items-center justify-center transition-all shadow-xs"
              title="Instagram"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            <a 
              href={`https://wa.me/${whatsappNumber}`} 
              target="_blank" 
              rel="noreferrer" 
              className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-[#25D366] hover:border-[#25D366] flex items-center justify-center transition-all shadow-xs"
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
            </a>
          </div>
        </div>

        {/* Column 2: Information & Tools (Span 2.5) */}
        <div className="lg:col-span-2 space-y-3.5">
          <h3 className="text-white font-extrabold text-xs uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
            <span>{settings.footer_info_heading || 'Explore Tech'}</span>
          </h3>
          <ul className="space-y-2 text-xs">
            {infoLinks.map((item) => (
              <li key={item.id}>
                <Link 
                  href={item.url} 
                  target={item.open_new_tab ? '_blank' : '_self'}
                  className="text-slate-400 hover:text-amber-400 transition-colors flex items-center group py-0.5"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition-colors mr-1 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Customer Care & Policies (Span 2.5) */}
        <div className="lg:col-span-2 space-y-3.5">
          <h3 className="text-white font-extrabold text-xs uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"></span>
            <span>{settings.footer_policy_heading || 'Customer Care'}</span>
          </h3>
          <ul className="space-y-2 text-xs">
            {policyLinks.map((item) => (
              <li key={item.id}>
                <Link 
                  href={item.url} 
                  target={item.open_new_tab ? '_blank' : '_self'}
                  className="text-slate-400 hover:text-blue-400 transition-colors flex items-center group py-0.5"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 transition-colors mr-1 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Premium Value Guarantees (Span 3.5 - Replacing Affiliation Box) */}
        <div className="lg:col-span-4 space-y-3.5">
          <h3 className="text-white font-extrabold text-xs uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            <span>Why Choose TechMarket BD</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Feature 1 */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-start space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-slate-200 font-bold text-xs">100% Genuine</h5>
                <p className="text-slate-400 text-[10.5px] leading-tight">Official warranty</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-start space-x-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-slate-200 font-bold text-xs">Fast Delivery</h5>
                <p className="text-slate-400 text-[10.5px] leading-tight">All 64 districts</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-start space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-slate-200 font-bold text-xs">0% Easy EMI</h5>
                <p className="text-slate-400 text-[10.5px] leading-tight">Up to 36 months</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-start space-x-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-slate-200 font-bold text-xs">Expert Lab</h5>
                <p className="text-slate-400 text-[10.5px] leading-tight">Physical service hubs</p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <Link
              href="/servicing"
              className="flex-1 text-center py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[11px] font-bold transition-colors"
            >
              Our Showrooms
            </Link>
            <Link
              href="/account/service-requests"
              className="flex-1 text-center py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[11px] font-bold transition-colors"
            >
              Track Repair
            </Link>
          </div>
        </div>

      </div>

      {/* 3. BOTTOM COPYRIGHT & SECURE PAYMENTS BAR */}
      <div className="border-t border-slate-800/80 bg-[#050811]">
        <div className="max-w-[1640px] mx-auto px-4 py-4.5 flex flex-col md:flex-row items-center justify-between gap-3 text-slate-500 text-xs">
          <div className="flex items-center space-x-2 flex-wrap text-slate-500">
            <span>{settings.copyright_text || 'Copyright © 2026 TechMarket BD. All Rights Reserved.'}</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="text-slate-500">
              Developed by <a href="https://innographixbd.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-400 font-semibold transition-colors">Innographix</a>
            </span>
          </div>

          {/* Secure Payment Badges / Banner Image */}
          <div className="flex items-center">
            {settings.footer_payment_methods_image ? (
              <img
                src={settings.footer_payment_methods_image}
                alt="Accepted Payment Methods (bKash, Nagad, Rocket, VISA, MasterCard, COD)"
                className="h-7 sm:h-8 w-auto object-contain max-w-[340px] transition-all"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`flex items-center flex-wrap gap-1.5 font-mono text-[10px] font-bold ${settings.footer_payment_methods_image ? 'hidden' : 'flex'}`}>
              <span className="bg-slate-900 border border-slate-800 text-slate-200 px-2 py-1 rounded-lg">VISA</span>
              <span className="bg-slate-900 border border-slate-800 text-slate-200 px-2 py-1 rounded-lg">MasterCard</span>
              <span className="bg-[#E2136E]/20 border border-[#E2136E]/40 text-[#E2136E] px-2 py-1 rounded-lg">bKash</span>
              <span className="bg-[#F7941D]/20 border border-[#F7941D]/40 text-[#F7941D] px-2 py-1 rounded-lg">Nagad</span>
              <span className="bg-[#8C3494]/20 border border-[#8C3494]/40 text-[#8C3494] px-2 py-1 rounded-lg">Rocket</span>
              <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-2 py-1 rounded-lg">COD</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FLOATING UTILITY CONTROLS (Bottom Right) */}
      <div className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-30 sm:z-50 flex flex-col items-center space-y-2.5 select-none">
        {/* Scroll to Top */}
        {showScrollTop && (
          <button
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
        )}

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
            className="w-11 h-11 rounded-full bg-[#0084ff] hover:bg-[#0070d6] text-white flex items-center justify-center shadow-xl border border-blue-900/60 transition-all hover:scale-108"
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
