import React, { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { Zap, Clock, ShoppingCart, Check } from 'lucide-react';
import { trackAddToCart } from '@/lib/tracking';

export default function DealOfDayV2({ dealProduct = null, flashSale = null }) {
  // Live Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });
  const [added, setAdded] = useState(false);

  useEffect(() => {
    // If flash sale end time is provided, calculate diff
    if (flashSale?.end_time) {
      const target = new Date(flashSale.end_time).getTime();
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = Math.max(0, target - now);
        const hours = Math.floor((diff / (1000 * 60 * 60)));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
          if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
          if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
          return { hours: 12, minutes: 0, seconds: 0 };
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [flashSale?.end_time]);

  // Use dynamic deal product or first flash sale product or curated fallback
  const product = dealProduct || (flashSale?.products && flashSale.products[0]) || {
    id: 'deal-default',
    title: 'Anker Soundcore Mini 3 Portable Bluetooth Speaker',
    slug: 'anker-soundcore-mini-3',
    price: 2050,
    regular_price: 2800,
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop',
  };

  const currentPrice = Number(product.flash_price || product.price || 2050);
  const regularPrice = Number(product.regular_price || currentPrice * 1.3);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.id && typeof product.id === 'number') {
      trackAddToCart(product, 1);
      router.post('/cart/add', { product_id: product.id, quantity: 1 }, {
        preserveScroll: true,
        onSuccess: () => {
          setAdded(true);
          setTimeout(() => setAdded(false), 1800);
        }
      });
    } else {
      router.visit('/catalog?flash_sale=true');
    }
  };

  return (
    <div className="storefront-v2-deal-card bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full font-sans relative">
      <div>
        {/* Deal Header */}
        <div className="text-center mb-4">
          <h3 className="font-extrabold text-blue-600 text-sm tracking-wider uppercase">
            DEAL OF THE DAY
          </h3>
        </div>

        {/* Compact Dark Navy Countdown Boxes */}
        <div className="flex items-center justify-center space-x-2 mb-5">
          <div className="bg-[#0b1329] text-white rounded-lg px-2.5 py-1.5 text-center min-w-[48px] shadow-sm">
            <span className="block font-black text-sm sm:text-base leading-none font-mono text-sky-400">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              HOURS
            </span>
          </div>

          <div className="bg-[#0b1329] text-white rounded-lg px-2.5 py-1.5 text-center min-w-[48px] shadow-sm">
            <span className="block font-black text-sm sm:text-base leading-none font-mono text-sky-400">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              MINS
            </span>
          </div>

          <div className="bg-[#0b1329] text-white rounded-lg px-2.5 py-1.5 text-center min-w-[48px] shadow-sm">
            <span className="block font-black text-sm sm:text-base leading-none font-mono text-sky-400">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              SECS
            </span>
          </div>
        </div>

        {/* Product Image Area */}
        <Link
          href={product.slug ? `/product/${product.slug}` : '/catalog?flash_sale=true'}
          className="block aspect-square w-full rounded-xl bg-slate-50/60 p-4 flex items-center justify-center mb-4 group overflow-hidden"
        >
          <img
            src={product.image || 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop'}
            alt={product.title}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Product Title */}
        <Link
          href={product.slug ? `/product/${product.slug}` : '/catalog?flash_sale=true'}
          className="block font-bold text-xs sm:text-sm text-slate-900 hover:text-blue-600 transition-colors text-center line-clamp-2 leading-snug mb-3"
          title={product.title}
        >
          {product.title}
        </Link>

        {/* Price Row */}
        <div className="flex items-center justify-center space-x-2 text-center mb-5">
          {regularPrice > currentPrice && (
            <span className="text-xs text-slate-400 line-through">
              ৳{regularPrice.toLocaleString()}
            </span>
          )}
          <span className="text-base sm:text-lg font-black text-blue-600">
            ৳{currentPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* CTA Button */}
      <Link
        href={product.slug ? `/product/${product.slug}` : '/catalog?flash_sale=true'}
        className="w-full py-3 bg-[#0b1329] hover:bg-[#14213d] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md text-center block"
      >
        SHOP NOW
      </Link>
    </div>
  );
}
