import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart } = usePage().props;

  if (!isOpen) return null;

  const updateQty = (productId, newQty) => {
    if (newQty < 1) return;
    router.post('/cart/update', { product_id: productId, quantity: newQty }, { preserveScroll: true });
  };

  const removeItem = (productId) => {
    router.post('/cart/remove', { product_id: productId }, { preserveScroll: true });
  };

  const clearCart = () => {
    router.post('/cart/clear', {}, { preserveScroll: true });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base text-white">Your Shopping Cart</h3>
              <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full font-bold">
                {cart.count} items
              </span>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 divide-y divide-slate-800/60">
            {cart.items && cart.items.length > 0 ? (
              cart.items.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex space-x-4 items-center">
                  <img 
                    src={item.image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=150&auto=format&fit=crop'} 
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-md border border-slate-700 bg-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-slate-200 truncate leading-snug hover:text-amber-400 transition-colors">
                      {item.title}
                    </h4>
                    <div className="text-[11px] text-slate-400 mt-0.5">SKU: {item.sku}</div>
                    <div className="text-xs font-bold text-amber-400 mt-1">
                      ৳{item.price.toLocaleString()}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center bg-slate-800 rounded border border-slate-700">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-slate-400 hover:text-white hover:bg-slate-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-200">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-slate-400 hover:text-white hover:bg-slate-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-500 hover:text-rose-400 text-xs p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-500">
                <ShoppingBag className="w-16 h-16 stroke-1 text-slate-700 mb-3" />
                <p className="text-sm font-medium text-slate-400">Your cart is currently empty</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">Explore our tech catalog and add your favorite hardware.</p>
                <Link
                  href="/catalog"
                  onClick={onClose}
                  className="mt-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.items && cart.items.length > 0 && (
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Subtotal:</span>
                <span className="text-sm font-bold text-white">৳{(cart.total || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span>Shipping:</span>
                <span>Calculated at checkout (Dhaka ৳60 / Outside ৳120)</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex gap-2">
                <button
                  onClick={clearCart}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900 rounded font-medium transition-colors"
                >
                  Clear Cart
                </button>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2.5 rounded flex items-center justify-center space-x-1 shadow-lg shadow-amber-500/10 transition-colors"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
