import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import NavbarV3 from './Components/NavbarV3';
import FooterV3 from './Components/FooterV3';
import CartDrawer from '@/Components/CartDrawer';
import ProductCardV3 from './Components/ProductCardV3';
import SectionBoxV3 from './Components/SectionBoxV3';
import MobileBottomNavV3 from './Components/MobileBottomNavV3';
import ProductImageLightbox from '@/Components/Storefront/ProductImageLightbox';
import { 
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Minus, Plus, ShoppingBag, 
  Check, Heart, ArrowRightLeft, ShieldCheck, Truck, RefreshCw, Star, Play, ZoomIn
} from 'lucide-react';
import { trackAddToCart } from '@/lib/tracking';

export default function ProductDetailV3({
  product = {},
  specifications = [],
  relatedProducts = [],
  settings = {},
  flashSale = null,
  reviews = [],
}) {
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(product?.image || '');
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || 'Default');
  const [activeTab, setActiveTab] = useState('specification');
  const [added, setAdded] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!product) return null;

  // Defensive normalization of specifications so it NEVER crashes React under any data format
  const normalizedSpecifications = React.useMemo(() => {
    const result = [];
    const source = specifications || product?.specifications || product?.key_specs;

    if (Array.isArray(source)) {
      source.forEach((group, gIdx) => {
        if (!group) return;
        if (typeof group === 'object' && !Array.isArray(group)) {
          const groupName = group.group || group.name || `Specification Section ${gIdx + 1}`;
          const rawAttrs = group.attributes || group.items || [];
          const attrs = [];

          if (Array.isArray(rawAttrs)) {
            rawAttrs.forEach(a => {
              if (!a) return;
              if (typeof a === 'string') {
                const parts = a.split(':');
                attrs.push({ name: parts[0]?.trim() || 'Feature', value: parts.slice(1).join(':')?.trim() || a });
              } else if (typeof a === 'object') {
                attrs.push({
                  name: a.name || a.key || a.attribute_name || a.title || 'Feature',
                  value: String(a.value ?? a.attribute_value ?? a.val ?? '—'),
                });
              }
            });
          } else if (typeof rawAttrs === 'object') {
            Object.entries(rawAttrs).forEach(([k, v]) => {
              attrs.push({ name: k, value: String(v ?? '—') });
            });
          }

          if (attrs.length > 0) {
            result.push({ group: groupName, attributes: attrs });
          }
        } else if (typeof group === 'string') {
          const parts = group.split(':');
          result.push({
            group: 'General',
            attributes: [{ name: parts[0]?.trim() || 'Feature', value: parts.slice(1).join(':')?.trim() || group }]
          });
        }
      });
    } else if (typeof source === 'object' && source !== null) {
      Object.entries(source).forEach(([groupName, groupContent]) => {
        const attrs = [];
        if (Array.isArray(groupContent)) {
          groupContent.forEach(a => {
            if (typeof a === 'string') {
              const parts = a.split(':');
              attrs.push({ name: parts[0]?.trim() || 'Feature', value: parts.slice(1).join(':')?.trim() || a });
            } else if (typeof a === 'object' && a !== null) {
              attrs.push({
                name: a.name || a.key || 'Feature',
                value: String(a.value ?? '—'),
              });
            }
          });
        } else if (typeof groupContent === 'object' && groupContent !== null) {
          Object.entries(groupContent).forEach(([k, v]) => {
            attrs.push({ name: k, value: String(v ?? '—') });
          });
        } else if (typeof groupContent === 'string') {
          attrs.push({ name: groupName, value: groupContent });
        }

        if (attrs.length > 0) {
          result.push({ group: groupName, attributes: attrs });
        }
      });
    }

    return result;
  }, [specifications, product]);

  const currentPrice = Number(product.flash_price || product.price || 0);
  const regularPrice = Number(product.regular_price || 0);
  const discountPercent = (regularPrice > currentPrice && regularPrice > 0)
    ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100)
    : (product.discount_percent || 0);

  const isOutOfStock = product.stock <= 0 && !product.is_deal_of_day;

  // Resolve gallery images
  const gallery = [
    product.image,
    ...(product.gallery || []),
    ...(product.images || []),
  ].filter(Boolean);

  const uniqueGallery = Array.from(new Set(gallery));

  const handleAddToCart = (buyNow = false) => {
    trackAddToCart(product, quantity);

    if (buyNow) {
      router.post('/cart/add', {
        product_id: product.id,
        quantity: quantity,
        color: selectedColor !== 'Default' ? selectedColor : undefined,
        buy_now: 1,
      }, {
        onError: () => {
          window.location.href = `/checkout?product_id=${product.id}&quantity=${quantity}`;
        }
      });
      return;
    }

    router.post('/cart/add', {
      product_id: product.id,
      quantity: quantity,
      color: selectedColor !== 'Default' ? selectedColor : undefined,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setAdded(true);
        setCartOpen(true);
        setTimeout(() => setAdded(false), 2000);
      }
    });
  };

  const handleWishlist = () => {
    router.post('/wishlist/toggle', { product_id: product.id }, { preserveScroll: true });
  };

  return (
    <div className="storefront-v3 min-h-screen bg-[#F4F7FC] text-slate-900 font-sans flex flex-col selection:bg-[#0153FD] selection:text-white">
      <Head title={`${product.title} - ${settings.site_name || 'TechMarket BD'}`} />

      {/* 1. Navbar */}
      <NavbarV3 onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* 2. Breadcrumbs matching Screenshot 5 */}
      <div className="w-full bg-white border-b border-slate-100 py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center space-x-2 truncate">
            <Link href="/" className="hover:text-[#0153FD] transition-colors">Home</Link>
            {product.category && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <Link href={`/catalog?category=${product.category.slug}`} className="hover:text-[#0153FD] transition-colors">
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold truncate max-w-xs">{product.title}</span>
          </div>
        </div>
      </div>

      {/* 3. Product Single Layout */}
      <main className="flex-1 max-w-[1240px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Main Product Presentation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT: GALLERY & THUMBNAILS (Exact Reference Match with Vertical Rail) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 items-stretch">
            
            {/* Vertical Thumbnail Box with Up & Down Arrows */}
            {uniqueGallery.length > 1 && (
              <div className="bg-white border border-[#8BB1FF]/70 rounded-[22px] p-2 sm:p-2.5 shadow-[0_0_12px_rgba(202,224,255,0.5)] flex sm:flex-col items-center justify-between gap-2 shrink-0">
                {/* Up Arrow */}
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="hidden sm:flex w-7 h-7 rounded-full hover:bg-slate-100 text-slate-500 hover:text-[#0153FD] items-center justify-center transition-colors cursor-pointer"
                  aria-label="Previous Image"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>

                {/* Thumbnails Stack */}
                <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto max-h-[380px] no-scrollbar">
                  {uniqueGallery.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white border-2 p-1 flex items-center justify-center transition-all cursor-pointer overflow-hidden ${
                        (selectedImage || product.image) === img
                          ? 'border-[#0153FD] shadow-xs scale-102'
                          : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} className="max-h-full max-w-full object-contain" />
                    </button>
                  ))}
                </div>

                {/* Down Arrow */}
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="hidden sm:flex w-7 h-7 rounded-full hover:bg-slate-100 text-slate-500 hover:text-[#0153FD] items-center justify-center transition-colors cursor-pointer"
                  aria-label="Next Image"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Large Main Showcase Image */}
            <div 
              onClick={() => setIsLightboxOpen(true)}
              className="relative flex-1 w-full bg-white border border-[#8BB1FF]/70 rounded-[22px] p-6 shadow-[0_0_15px_rgba(202,224,255,0.6)] aspect-square flex items-center justify-center overflow-hidden group cursor-pointer hover:border-[#0153FD] transition-all"
              title="Click to view full image and zoom"
            >
              {discountPercent > 0 && (
                <div className="absolute top-4 right-4 z-10 bg-black text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  -{discountPercent}%
                </div>
              )}

              <img
                src={selectedImage || product.image || '/images/placeholder.png'}
                alt={product.title}
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
              />

              {/* Hover Zoom & Expand Overlay Pill */}
              <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 backdrop-blur-xs text-white rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1.5 shadow-md">
                <ZoomIn className="w-3.5 h-3.5 text-sky-400" />
                <span>Click to Zoom</span>
              </div>

              {/* Video Play Pill Button */}
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-4 left-4 z-10 w-9 h-9 rounded-full bg-white/90 border border-slate-200 text-slate-800 flex items-center justify-center shadow-md hover:bg-[#0153FD] hover:text-white transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT: PRODUCT INFO CARD (Screenshot 5) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 bg-white border border-[#8BB1FF]/70 rounded-[22px] p-6 sm:p-8 shadow-[0_0_15px_rgba(202,224,255,0.6)] space-y-5">
            
            {/* Brand Tag */}
            {product.brand?.name ? (
              <span className="inline-block px-3 py-1 rounded-md bg-[#F4F7FC] text-[#0153FD] text-xs font-bold uppercase tracking-wider">
                {product.brand.name}
              </span>
            ) : (
              <span className="inline-block px-3 py-1 rounded-md bg-[#F4F7FC] text-[#0153FD] text-xs font-bold uppercase tracking-wider">
                GENUINE TECH
              </span>
            )}

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug tracking-tight">
              {product.title}
            </h1>

            {/* Pricing Row */}
            <div className="flex items-center space-x-3">
              {regularPrice > currentPrice && (
                <span className="text-base sm:text-lg text-slate-400 line-through font-semibold">
                  {regularPrice.toLocaleString()}৳
                </span>
              )}
              <span className="text-2xl sm:text-3xl font-black text-[#0153FD] tracking-tight">
                {currentPrice.toLocaleString()}৳
              </span>
            </div>

            {/* Warranty Badge */}
            <div className="flex items-center space-x-3 text-xs">
              <span className="font-semibold text-slate-600">Warranty :</span>
              <span className="px-3 py-1 rounded-md bg-[#F4F7FC] border border-slate-200 text-slate-800 font-semibold">
                {product.warranty || '3 Months Warranty'}
              </span>
            </div>

            {/* Interactive Color Swatches Row (Matching Reference Screenshot) */}
            <div className="flex items-center space-x-3 text-xs">
              <span className="font-semibold text-slate-600">Color :</span>
              <div className="flex items-center space-x-2.5">
                {(product.colors && product.colors.length > 0 ? product.colors : ['White', 'Slate Grey', 'Rose Pink']).map((color, cIdx) => {
                  const colorLower = color.toLowerCase();
                  const bgHex = colorLower.includes('white') ? '#FFFFFF'
                    : colorLower.includes('black') ? '#1e293b'
                    : colorLower.includes('pink') || colorLower.includes('rose') ? '#ffe4e6'
                    : colorLower.includes('grey') || colorLower.includes('gray') ? '#64748b'
                    : colorLower.includes('blue') ? '#0153FD'
                    : '#cbd5e1';

                  const isSelected = selectedColor === color || (selectedColor === 'Default' && cIdx === 0);

                  return (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-6 h-6 rounded-full border transition-all cursor-pointer shadow-2xs ${
                        isSelected
                          ? 'border-[#0153FD] ring-2 ring-offset-2 ring-[#0153FD] scale-110'
                          : 'border-slate-300 hover:border-slate-400 hover:scale-105'
                      }`}
                      style={{ backgroundColor: bgHex }}
                      title={color}
                    />
                  );
                })}
              </div>
            </div>

            {/* Action Row: Quantity + Add To Cart + Buy Now */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Quantity Pill */}
              <div className="flex items-center border border-slate-200 rounded-full px-3 py-1.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-slate-500 hover:text-slate-900 p-1"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 font-bold text-xs sm:text-sm text-slate-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-slate-500 hover:text-slate-900 p-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart Black Pill Button */}
              <button
                type="button"
                onClick={() => handleAddToCart(false)}
                disabled={isOutOfStock}
                className="px-6 sm:px-8 py-2.5 rounded-full bg-[#1c1c1c] hover:bg-black text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {added ? 'Added to Cart' : 'Add To Cart'}
              </button>

              {/* Buy Now Bright Blue Pill Button */}
              <button
                type="button"
                onClick={() => handleAddToCart(true)}
                disabled={isOutOfStock}
                className="px-6 sm:px-8 py-2.5 rounded-full bg-[#0153FD] hover:bg-[#0042cf] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>
            <div className="pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
              {product.sku && <div><strong className="text-slate-700">SKU:</strong> {product.sku}</div>}
              {product.category && <div><strong className="text-slate-700">Categories:</strong> {product.category.name}</div>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <button type="button" onClick={() => setActiveTab('specification')} className={`px-6 py-2 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer ${activeTab === 'specification' ? 'bg-[#0153FD] text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}>Specification</button>
            <button type="button" onClick={() => setActiveTab('description')} className={`px-6 py-2 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer ${activeTab === 'description' ? 'bg-[#0153FD] text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}>Description</button>
            <button type="button" onClick={() => setActiveTab('reviews')} className={`px-6 py-2 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer ${activeTab === 'reviews' ? 'bg-[#0153FD] text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}>Reviews ({product.reviews?.length || 0})</button>
          </div>

          <div className="bg-white border border-[#8BB1FF]/70 rounded-[22px] p-6 sm:p-8 shadow-[0_0_15px_rgba(202,224,255,0.6)]">
            {activeTab === 'specification' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                    Technical Specifications
                  </h3>
                  <span className="text-[11px] font-bold text-[#0153FD] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    Official Authentic Info
                  </span>
                </div>

                {normalizedSpecifications.length > 0 ? (
                  <div className="space-y-4">
                    {normalizedSpecifications.map((group, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="bg-[#F4F7FC] border-l-4 border-[#0153FD] px-3.5 py-2 rounded-r-lg font-extrabold text-xs sm:text-sm text-slate-900">
                          {group.group || group.name || 'General Specifications'}
                        </div>
                        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs sm:text-sm">
                          {(group.attributes || []).map((attr, aIdx) => (
                            <div key={aIdx} className="grid grid-cols-1 sm:grid-cols-3 p-3 hover:bg-slate-50 transition-colors">
                              <div className="font-semibold text-slate-500 sm:col-span-1">
                                {attr.name}
                              </div>
                              <div className="font-bold text-slate-800 sm:col-span-2 mt-0.5 sm:mt-0">
                                {attr.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs sm:text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3 bg-slate-50/50">
                      <div className="font-semibold text-slate-500">Product / Model</div>
                      <div className="font-bold text-slate-800 sm:col-span-2">{product.title}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
                      <div className="font-semibold text-slate-500">Brand</div>
                      <div className="font-bold text-slate-800 sm:col-span-2">{product.brand?.name || 'Original Genuine Series'}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3 bg-slate-50/50">
                      <div className="font-semibold text-slate-500">Category</div>
                      <div className="font-bold text-slate-800 sm:col-span-2">{product.category?.name || 'Consumer Gadget'}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
                      <div className="font-semibold text-slate-500">SKU / Item Code</div>
                      <div className="font-bold text-slate-800 sm:col-span-2">{product.sku || 'X10-FL-001'}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3 bg-slate-50/50">
                      <div className="font-semibold text-slate-500">Warranty</div>
                      <div className="font-bold text-slate-800 sm:col-span-2">{product.warranty || '6 Months Official Warranty'}</div>
                    </div>
                    {product.key_features && product.key_features.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
                        <div className="font-semibold text-slate-500">Key Highlights</div>
                        <div className="font-bold text-slate-800 sm:col-span-2 space-y-1">
                          {product.key_features.map((k, i) => (
                            <div key={i} className="flex items-center space-x-1.5">
                              <Check className="w-3.5 h-3.5 text-[#0153FD] shrink-0" />
                              <span>{typeof k === 'string' ? k : k.value || k.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : activeTab === 'description' ? (
              <div className="prose max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <p>Comprehensive official specifications and product overview for {product.title}.</p>
                )}
                {product.key_features && product.key_features.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm">Key Features:</h3>
                    <ul className="space-y-1.5">
                      {product.key_features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start space-x-2">
                          <Check className="w-4 h-4 text-[#0153FD] shrink-0 mt-0.5" />
                          <span>{typeof feat === 'string' ? feat : feat.value || feat.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-slate-600 space-y-4">
                <p>No customer reviews submitted yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>

        {relatedProducts && relatedProducts.length > 0 && (
          <SectionBoxV3 title="You May Also Like" badgeText="You May Also Like">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pt-2">
              {relatedProducts.slice(0, 5).map((relProduct) => (
                <ProductCardV3 key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </SectionBoxV3>
        )}

      </main>

      {/* 4. Product Image Lightbox Modal */}
      <ProductImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={uniqueGallery}
        currentIndex={Math.max(0, uniqueGallery.indexOf(selectedImage || product.image))}
        onSelectIndex={(idx) => setSelectedImage(uniqueGallery[idx] || product.image)}
        productTitle={product.title}
        price={currentPrice}
      />

      {/* 5. Footer */}
      <FooterV3 onOpenCart={() => setCartOpen(true)} />

      {/* 6. Mobile Bottom Nav */}
      <MobileBottomNavV3 onOpenCart={() => setCartOpen(true)} />
    </div>
  );
}
