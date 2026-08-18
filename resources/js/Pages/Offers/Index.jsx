import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import {
  Search, Clock, Calendar, Sparkles, Flame,
  ChevronRight, Tag, ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function OffersIndex(props) {
  const offers = props?.offers && typeof props.offers === 'object' ? props.offers : { data: [] };
  const filters = props?.filters && typeof props.filters === 'object' && !Array.isArray(props.filters) ? props.filters : {};
  const totalActiveCount = typeof props?.totalActiveCount === 'number' ? props.totalActiveCount : 0;
  const totalOffersCount = typeof props?.totalOffersCount === 'number' ? props.totalOffersCount : 0;

  const [search, setSearch] = useState(typeof filters.search === 'string' ? filters.search : '');
  const [status, setStatus] = useState(typeof filters.status === 'string' ? filters.status : 'active');
  const [sort, setSort] = useState(typeof filters.sort === 'string' ? filters.sort : 'default');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Live countdown ticker state updater
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFilterChange = (key, value) => {
    const updatedFilters = {
      ...filters,
      [key]: value,
      page: 1,
    };
    if (!value || value === 'default') delete updatedFilters[key];

    router.get('/offers', updatedFilters, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleFilterChange('search', search);
  };

  // Helper to calculate countdown badge text matching reference screenshot (e.g. "04d 22h 16m" or "Ongoing")
  const getCountdownBadge = (offer) => {
    if (!offer) {
      return { text: 'Active Offer', className: 'text-amber-700 bg-amber-50 border-amber-200' };
    }

    if (!offer.end_at) {
      return { text: '∞ Ongoing', className: 'text-amber-600 bg-amber-50 border-amber-200' };
    }

    try {
      const endDate = new Date(offer.end_at);
      const startDate = offer.start_at ? new Date(offer.start_at) : null;

      if (isNaN(endDate.getTime())) {
        return { text: '∞ Ongoing', className: 'text-amber-600 bg-amber-50 border-amber-200' };
      }

      const diff = endDate.getTime() - now.getTime();

      if (startDate && !isNaN(startDate.getTime()) && startDate.getTime() > now.getTime()) {
        const startDiff = startDate.getTime() - now.getTime();
        const days = Math.floor(startDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((startDiff / (1000 * 60 * 60)) % 24);
        return {
          text: `Starts in ${days}d ${hours}h`,
          className: 'text-blue-600 bg-blue-50 border-blue-200 font-bold'
        };
      }

      if (diff <= 0 || offer.status === 'expired' || offer.computed_status === 'expired') {
        return { text: 'Expired', className: 'text-gray-500 bg-gray-100 border-gray-200 font-semibold' };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      const pad = (n) => String(n).padStart(2, '0');
      return {
        text: `${pad(days)}d ${pad(hours)}h ${pad(minutes)}m`,
        className: 'text-amber-700 bg-amber-50 border-amber-200 font-bold'
      };
    } catch (err) {
      return { text: 'Active Offer', className: 'text-amber-700 bg-amber-50 border-amber-200 font-bold' };
    }
  };

  // Format date range e.g. "13 Aug - 21 Aug 2026"
  const formatDateRange = (offer) => {
    if (!offer) return 'Special Offer';
    if (offer.offer_validity_text) return offer.offer_validity_text;
    if (!offer.start_at && !offer.end_at) return 'Special Promotional Offer';

    try {
      const options = { day: 'numeric', month: 'short' };
      const yearOptions = { year: 'numeric' };

      const startStr = offer.start_at ? new Date(offer.start_at).toLocaleDateString('en-GB', options) : 'Ongoing';
      const endStr = offer.end_at ? new Date(offer.end_at).toLocaleDateString('en-GB', { ...options, ...yearOptions }) : 'Indefinite';

      return `${startStr} – ${endStr}`;
    } catch (e) {
      return 'Special Promotional Offer';
    }
  };

  const offersList = Array.isArray(offers?.data) ? offers.data : [];
  const totalCount = typeof offers?.total === 'number' ? offers.total : offersList.length;
  const paginationLinks = Array.isArray(offers?.links) ? offers.links : [];

  return (
    <div className="min-h-screen bg-[#f4f7f9] text-gray-800 font-sans flex flex-col selection:bg-red-500 selection:text-white">
      <Head>
        <title>All Exclusive Offers & Campaigns | TechMarket BD</title>
        <meta name="description" content="Explore special seasonal discounts, bundle gifts, cashback, and official manufacturer promotions on laptops, GPUs, monitors, and IT hardware at TechMarket BD." />
      </Head>

      <Navbar onOpenCart={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 py-5 space-y-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500">
          <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="font-semibold text-gray-900">Offers</span>
        </nav>

        {/* TOP FILTER & HEADER BAR (Matching Reference Screenshot 2) */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Title & Dynamic Count */}
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span>Offers</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {totalCount > 0 ? (
                <>Showing {offersList.length} of {totalCount} campaigns</>
              ) : (
                <>0 campaigns found</>
              )}
            </p>
          </div>

          {/* Search, Status & Sorting Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative min-w-[220px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search offers by name..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </form>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                handleFilterChange('status', e.target.value);
              }}
              className="text-xs rounded-lg border border-gray-300 py-1.5 px-3 bg-white focus:outline-none focus:border-red-600 font-medium text-gray-700"
            >
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="expired">Expired</option>
              <option value="all">All Offers</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                handleFilterChange('sort', e.target.value);
              }}
              className="text-xs rounded-lg border border-gray-300 py-1.5 px-3 bg-white focus:outline-none focus:border-red-600 font-medium text-gray-700"
            >
              <option value="default">Default Order</option>
              <option value="ending_soon">Ending Soon</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* OFFERS 3-COLUMN DESKTOP GRID (Matching Screenshot 2) */}
        {offersList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {offersList.map((offer) => {
              const countdown = getCountdownBadge(offer);
              const bannerSrc = offer.thumbnail_image || offer.banner_image || 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop';

              return (
                <Link
                  key={offer.id}
                  href={`/offers/${offer.slug}`}
                  className="group bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                >
                  {/* Campaign Banner Image */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                    <img
                      src={bannerSrc}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Featured / Special Badge if applicable */}
                    {offer.is_featured && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-xs">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Card Content & Footer */}
                  <div className="p-3.5 flex items-center justify-between gap-3 border-t border-gray-100 mt-auto bg-white">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-gray-900 group-hover:text-red-600 transition-colors truncate">
                        {offer.title}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                        <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">{formatDateRange(offer)}</span>
                      </div>
                    </div>

                    {/* Countdown / Status Tag */}
                    <div className={`shrink-0 px-2 py-1 rounded-md text-[11px] font-bold border flex items-center gap-1 ${countdown.className}`}>
                      <Clock className="w-3 h-3" />
                      <span>{countdown.text}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No active offers match your filter</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Try switching your status filter to "All Offers" or resetting your search keyword.
            </p>
            <button
              onClick={() => router.get('/offers', { status: 'all' })}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              View All Campaigns
            </button>
          </div>
        )}

        {/* Server-Backed Pagination */}
        {paginationLinks.length > 3 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Showing <span className="font-semibold text-gray-900">{offers.from || 0}</span> to{' '}
              <span className="font-semibold text-gray-900">{offers.to || 0}</span> of{' '}
              <span className="font-semibold text-gray-900">{offers.total}</span> offers
            </div>

            <div className="flex items-center gap-1">
              {paginationLinks.map((link, idx) => (
                <button
                  key={idx}
                  disabled={!link.url || link.active}
                  onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${link.active
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : link.url
                        ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
