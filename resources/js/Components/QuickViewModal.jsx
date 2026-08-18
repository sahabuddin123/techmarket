import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { X, ShoppingBag, Check, ShieldCheck, Truck, Zap } from 'lucide-react';

export default function QuickViewModal({ product, isOpen, onClose }) {
  if (!isOpen || !product) return null;

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    router.post('/cart/add', { product_id: product.id, quantity }, {
      preserveScroll: true,
      onSuccess: () => {
        setAdded(true);
        setTimeout(() => {
          setAdded(false);
          onClose();
        }, 1200);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-slate-900 border border-slate-800 rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Image */}
            <div className="bg-slate-950 rounded-lg overflow-hidden border border-slate-800 aspect-square flex items-center justify-center">
              <img
                src={product.image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop'}
                alt={product.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Details */}
            <div className="flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                  {product.brand?.name} | {product.category?.name}
                </span>
                <h3 className="text-base font-bold text-white mt-1 leading-snug">
                  {product.title}
                </h3>
                <div className="text-xs text-slate-400 mt-1">SKU: <span className="text-slate-200">{product.sku}</span></div>

                {/* Price */}
                <div className="mt-4 p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Special Cash Price</div>
                    <div className="text-xl font-black text-amber-400">৳{Number(product.price).toLocaleString()}</div>
                  </div>
                  {product.regular_price && (
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase">Regular Price</div>
                      <div className="text-sm text-slate-500 line-through">৳{Number(product.regular_price).toLocaleString()}</div>
                    </div>
                  )}
                </div>

                {/* Key Specs */}
                {product.key_specs && (
                  <div className="mt-4">
                    <div className="text-xs font-bold text-slate-200 mb-1.5">Key Highlights:</div>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {product.key_specs.map((s, idx) => (
                        <li key={idx} className="flex items-center text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-slate-800 border border-slate-700 rounded px-2 py-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2 text-slate-300 hover:text-white font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-2 text-slate-300 hover:text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={handleAdd}
                    className={`flex-1 py-2.5 px-4 rounded font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                      added ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    }`}
                  >
                    {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                    <span>{added ? 'ADDED TO CART' : 'ADD TO CART'}</span>
                  </button>
                </div>
                <Link
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="block text-center text-xs text-amber-400 hover:underline font-semibold"
                >
                  View Full Product Details & Technical Specs →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
