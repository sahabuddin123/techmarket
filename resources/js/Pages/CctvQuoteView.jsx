import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { getStorefrontVersion } from '@/Core/Storefront/versionRegistry';
import ChatWidgetV3 from '@/Pages/Storefront/Version3/Components/ChatWidgetV3';
import {
  FileText,
  Printer,
  Share2,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
  Copy,
  Check,
  Building,
  Calendar,
  Clock,
  Send,
  ArrowRight,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  ExternalLink
} from 'lucide-react';

export default function CctvQuoteView({
  storefront_version = 'v3',
  quote = {},
  company = {},
  shareUrl = '',
}) {
  const { props } = usePage();
  const activeVersion = getStorefrontVersion(storefront_version || props?.settings?.storefront_version || 'v3');
  const NavbarComponent = activeVersion.Navbar;
  const FooterComponent = activeVersion.Footer;
  const MobileBottomNavComponent = activeVersion.MobileBottomNav;

  const [copied, setCopied] = useState(false);
  const [approving, setApproving] = useState(false);
  const [converting, setConverting] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState(quote.status);
  const [priceChangeAlerts, setPriceChangeAlerts] = useState([]);
  const [actionSuccess, setActionSuccess] = useState(null);

  const isExpired = new Date(quote.valid_until) < new Date();
  const isAccepted = quoteStatus === 'accepted' || quoteStatus === 'converted_to_order';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = `Hello, please review Commercial Surveillance Quotation #${quote.quote_number} for ${quote.customer_name} (Grand Total: ৳${Number(quote.grand_total).toLocaleString()}). Link: ${shareUrl || window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleApproveAndAddToCart = async () => {
    setApproving(true);
    setActionSuccess(null);

    try {
      // 1. Approve Quote
      await axios.post(`/quotes/${quote.share_token}/approve`);
      setQuoteStatus('accepted');

      // 2. Convert to Cart
      setConverting(true);
      const res = await axios.post(`/quotes/${quote.share_token}/convert-to-cart`);
      
      if (res.data.status === 'success') {
        if (res.data.data?.price_changes?.length > 0) {
          setPriceChangeAlerts(res.data.data.price_changes);
        }
        setActionSuccess('Quotation approved & complete surveillance system added to cart!');
        setTimeout(() => {
          window.location.href = '/cart';
        }, 1200);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not approve quotation or transfer items.');
    } finally {
      setApproving(false);
      setConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-800 font-poppins selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <Head title={`Commercial Quotation #${quote.quote_number} | ${company.name}`} />

      {/* Storefront Navbar */}
      {NavbarComponent && <NavbarComponent />}

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
        {/* Top Control Action Bar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                #{quote.quote_number}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase ${
                  isAccepted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : isExpired
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}
              >
                {quoteStatus.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 font-heading">
              Commercial Surveillance Proposal
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Share Link'}</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <a
              href={`/quotes/${quote.share_token}/print`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </a>
          </div>
        </div>

        {/* Action Success or Price Change Alerts */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {priceChangeAlerts.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Live Price Revalidation Updates:</span>
            </div>
            {priceChangeAlerts.map((pc, idx) => (
              <div key={idx} className="font-mono text-[11px]">
                • {pc.product}: Quoted ৳{pc.quoted_price.toLocaleString()} &rarr; Current ৳{pc.current_price.toLocaleString()}
              </div>
            ))}
          </div>
        )}

        {/* Printable Quotation Paper Body */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          {/* Header & Meta */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-1">
              <div className="text-xl font-black text-blue-900 font-heading">{company.name}</div>
              <div className="text-xs text-slate-500">{company.address}</div>
              <div className="text-xs text-slate-500">Tel: {company.phone} • Email: {company.email}</div>
            </div>

            <div className="space-y-1 sm:text-right font-mono text-xs">
              <div className="font-bold text-slate-900">Quotation Date: {new Date(quote.created_at).toLocaleDateString()}</div>
              <div className="text-rose-600 font-bold">Valid Until: {new Date(quote.valid_until).toLocaleDateString()}</div>
              <div className="text-slate-400 text-[11px]">Currency: BDT (৳)</div>
            </div>
          </div>

          {/* Client & Project Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client Details</div>
              <div className="font-bold text-slate-900 text-sm">{quote.customer_name}</div>
              {quote.company_name && <div className="text-xs text-slate-700">{quote.company_name}</div>}
              <div className="text-xs text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {quote.customer_phone}</div>
              {quote.customer_email && <div className="text-xs text-slate-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {quote.customer_email}</div>}
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Surveillance Scope</div>
              <div className="font-bold text-slate-900 text-sm">{quote.estimate?.project_name || 'Surveillance Security Setup'}</div>
              <div className="text-xs text-slate-700">Premises: {quote.estimate?.project_type?.replace('_', ' ').toUpperCase() || 'COMMERCIAL'}</div>
              <div className="text-xs text-slate-500">System Architecture: {quote.estimate?.system_type?.toUpperCase() || 'IP'}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {quote.estimate?.location_district || 'Dhaka'}</div>
            </div>
          </div>

          {/* Bill of Materials Table */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">Itemized Bill of Materials (BOM)</div>
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Item & Specifications</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {quote.estimate?.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.product_name_snapshot}</div>
                        <div className="text-[10px] text-slate-400 font-mono">SKU: {item.product_sku_snapshot}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold">{item.quantity} {item.unit}</td>
                      <td className="py-3 px-4 text-right font-mono">৳{Number(item.unit_price_snapshot).toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ৳{Number(item.subtotal_price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Totals */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 max-w-sm ml-auto space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Hardware Subtotal:</span>
              <span className="font-bold text-slate-900">৳{Number(quote.subtotal).toLocaleString()}</span>
            </div>
            {quote.installation_amount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Installation & Cabling:</span>
                <span className="font-bold text-slate-900">৳{Number(quote.installation_amount).toLocaleString()}</span>
              </div>
            )}
            {quote.discount_amount > 0 && (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Promotional Discount:</span>
                <span>- ৳{Number(quote.discount_amount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black pt-2 border-t border-slate-200 text-slate-900">
              <span>Grand Total:</span>
              <span className="text-emerald-600">৳{Number(quote.grand_total).toLocaleString()}</span>
            </div>
          </div>

          {/* Terms & Warranty */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="font-bold text-slate-900 uppercase text-[11px]">Commercial Terms & Warranty Clauses</div>
            <div className="text-slate-600 whitespace-pre-line leading-relaxed text-[11px]">{company.terms}</div>
            <div className="text-slate-500 text-[11px] italic border-t border-slate-200/60 pt-2">{company.warranty}</div>
          </div>

          {/* Bottom Conversion Action */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              By approving this quotation, you accept the stated specifications, bill of materials, and commercial terms.
            </div>

            <button
              type="button"
              disabled={approving || converting || isExpired}
              onClick={handleApproveAndAddToCart}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 shrink-0"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{approving || converting ? 'Processing Cart...' : 'Approve Proposal & Add to Cart'}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Floating Live Chat for Version 3 */}
      {storefront_version === 'v3' && <ChatWidgetV3 />}

      {/* Mobile Bottom Navigation */}
      {MobileBottomNavComponent && <MobileBottomNavComponent />}

      {/* Storefront Footer */}
      {FooterComponent && <FooterComponent />}
    </div>
  );
}
