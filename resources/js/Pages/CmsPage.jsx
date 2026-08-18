import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

export default function CmsPage({ 
  title = 'Policy', 
  slug = 'privacy-policy', 
  content = '', 
  sections = null,
  updated_at = '15 July, 2026' 
}) {
  const [cartOpen, setCartOpen] = useState(false);
  const { settings = {} } = usePage().props;

  const isPrivacyPolicy = slug === 'privacy-policy' || title.toLowerCase().includes('privacy');
  const isWarrantyPolicy = slug === 'warranty-policy' || title.toLowerCase().includes('warranty');
  const isDeliveryPolicy = slug === 'delivery-policy' || title.toLowerCase().includes('delivery');
  const isPaymentTerms = slug === 'payment-terms' || title.toLowerCase().includes('payment');
  const isRefundPolicy = slug === 'refund-and-return-policy' || title.toLowerCase().includes('refund');
  const isTerms = slug === 'terms-and-conditions' || title.toLowerCase().includes('terms');

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 font-sans flex flex-col selection:bg-[#1c4289] selection:text-white">
      <Head title={`${title} - TechMarket BD`} />
      <Navbar onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 md:p-12 shadow-xs max-w-5xl mx-auto space-y-8">
          
          {/* Top Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {title}
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                {isPrivacyPolicy && 'How we collect, use, and protect your information'}
                {isWarrantyPolicy && 'Learn about our warranty terms and conditions'}
                {isDeliveryPolicy && 'How we deliver your products across Bangladesh'}
                {isPaymentTerms && 'Learn about our payment methods and terms'}
                {isRefundPolicy && 'Learn about our product return and refund procedures'}
                {isTerms && 'Please review our terms and conditions before making a purchase'}
                {!isPrivacyPolicy && !isWarrantyPolicy && !isDeliveryPolicy && !isPaymentTerms && !isRefundPolicy && !isTerms && `Official ${title} and guidelines`}
              </p>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Last Updated: {updated_at || '15 July, 2026'}
            </div>
          </div>

          {/* Dynamic Structured Sections Layout */}
          {Array.isArray(sections) && sections.length > 0 ? (
            <div className="space-y-7 text-xs text-slate-700 leading-relaxed">
              {sections.map((sec, idx) => (
                <div key={idx} className="space-y-3">
                  {sec.badge && (
                    <div className="inline-block bg-[#1c4289] text-white px-3.5 py-1.5 rounded text-xs font-bold shadow-2xs">
                      {sec.badge}
                    </div>
                  )}

                  <div className="space-y-2 pt-0.5">
                    {Array.isArray(sec.paragraphs) ? (
                      sec.paragraphs.map((p, pIdx) => (
                        <p key={pIdx} className="leading-relaxed">
                          {p}
                        </p>
                      ))
                    ) : (
                      <p className="leading-relaxed">{sec.content || sec.paragraphs}</p>
                    )}
                  </div>

                  {/* Pickup Points Button on Delivery Policy */}
                  {isDeliveryPolicy && sec.badge && sec.badge.includes('পিকআপ') && (
                    <div className="pt-2">
                      <Link
                        href="/tools/third-party-pickup-points"
                        className="inline-flex items-center space-x-2 bg-[#1c4289] hover:bg-[#15326b] text-white px-4 py-2 rounded text-xs font-bold transition-colors shadow-xs"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>View Pickup Points</span>
                      </Link>
                    </div>
                  )}
                </div>
              ))}

              {/* Refund Policy: Submit a Complaint Button (Matching Reference Screenshot) */}
              {isRefundPolicy && (
                <div className="pt-6 flex justify-center border-t border-slate-100">
                  <Link
                    href="/complain-box"
                    className="inline-flex items-center space-x-2 bg-[#1c4289] hover:bg-[#15326b] text-white px-6 py-2.5 rounded text-xs font-bold transition-colors shadow-sm cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Submit a Complaint</span>
                  </Link>
                </div>
              )}

              {/* Delivery Policy: Need Help With Delivery Card */}
              {isDeliveryPolicy && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="inline-block bg-[#1c4289] text-white px-3.5 py-1.5 rounded text-xs font-bold shadow-2xs">
                    Need Help With Delivery?
                  </div>
                  <p>
                    If you have any questions about our delivery service or need assistance with your order, please don't hesitate to contact us.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={`tel:${settings.hotline || '+8809613562601'}`}
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded bg-[#1c4289] hover:bg-[#15326b] text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call: {settings.hotline || '09613562601'}</span>
                    </a>

                    <Link
                      href="/servicing"
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#1c4289]" />
                      <span>Visit Our Stores</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Privacy Policy: Contact Us Card */}
              {isPrivacyPolicy && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="inline-block bg-[#1c4289] text-white px-3.5 py-1.5 rounded text-xs font-bold shadow-2xs">
                    Contact Us
                  </div>
                  <p>
                    If you have any questions about our privacy policy or practices, please contact us:
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={`mailto:${settings.support_email || 'info@techmarketbd.com'}`}
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#1c4289]" />
                      <span>{settings.support_email || 'info@techmarketbd.com'}</span>
                    </a>

                    <a
                      href={`tel:${settings.hotline || '+8809613562601'}`}
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded bg-[#1c4289] hover:bg-[#15326b] text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call: {settings.hotline || '09613562601'}</span>
                    </a>

                    <Link
                      href="/servicing"
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#1c4289]" />
                      <span>Visit Our Stores</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* General HTML Fallback */
            <div className="text-xs text-slate-700 leading-relaxed space-y-4">
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <p>Official policy and documentation for TechMarket BD customer service and hardware sales in Bangladesh.</p>
              )}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
