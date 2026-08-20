import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { 
  ChevronLeft, ChevronRight, ArrowRight, Sparkles, 
  Fingerprint, Key, CreditCard, Shield, Lock
} from 'lucide-react';

export default function HeroSliderV2({ slides = [] }) {
  const defaultSlides = [
    {
      id: 'v2-slide-1',
      badge: 'NEW ARRIVAL',
      title: 'SMART TECH.',
      highlight: 'BETTER LIFE.',
      subtitle: 'Best quality tech products for your smart lifestyle',
      button_text: 'SHOP NOW',
      button_url: '/catalog',
      image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1000&auto=format&fit=crop',
      features: null,
    },
    {
      id: 'v2-slide-2',
      badge: 'SMART SECURITY',
      secondary_title: 'SMART DOOR LOCK FINGERPRINT ACCESS',
      title: 'UNLOCK WITH',
      highlight: 'YOUR FINGER.',
      subtitle: 'Smart door locks with fingerprint, PIN, card & app access',
      button_text: 'VIEW DOOR LOCKS',
      button_url: '/catalog?search=lock',
      image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1000&auto=format&fit=crop',
      showGlowRing: true,
      features: [
        { icon: Fingerprint, label: 'FINGERPRINT UNLOCK' },
        { icon: Lock, label: 'PIN CODE ACCESS' },
        { icon: CreditCard, label: 'CARD ACCESS' },
        { icon: Key, label: 'MECHANICAL KEY' },
      ],
    },
    {
      id: 'v2-slide-3',
      badge: 'PRO SURVEILLANCE',
      title: 'COLORVU 4K CCTV.',
      highlight: 'DAY & NIGHT CLARITY.',
      subtitle: 'Smart AI human detection, 2-way audio & 24/7 color recording',
      button_text: 'EXPLORE CAMERAS',
      button_url: '/category/cctv',
      image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=1000&auto=format&fit=crop',
      features: null,
    },
  ];

  const activeSlides = (slides && slides.length > 0) ? slides : defaultSlides;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto carousel slide timer
  useEffect(() => {
    if (activeSlides.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [activeSlides.length, isHovered]);

  const prevSlide = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setCurrentIndex((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  };

  const nextSlide = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  return (
    <div 
      className="storefront-v2-hero relative w-full bg-[#091329] overflow-hidden select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Ambient Lighting & Grid */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-600/15 rounded-full blur-[100px] sm:blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-sky-500/10 rounded-full blur-[120px] sm:blur-[160px]" />
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Hero Slides Container */}
      <div className="relative min-h-[460px] sm:min-h-[500px] md:min-h-[560px] lg:min-h-[600px] pb-14 sm:pb-16 md:pb-20 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center z-10">
        
        {/* Slides Loop */}
        {activeSlides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const badgeText = slide.badge || 'SMART TECH';
          const headline = slide.title || 'SMART TECH.';
          const highlightText = slide.highlight || 'BETTER LIFE.';
          const desc = slide.subtitle || slide.description || 'Best quality tech products for your smart lifestyle';
          const buttonUrl = slide.button_url || '/catalog';
          const buttonText = slide.button_text || 'SHOP NOW';
          const imageUrl = slide.image || slide.image_url || defaultSlides[0].image;
          const features = slide.features;

          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 px-4 sm:px-6 lg:px-8 w-full max-w-[1360px] mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center justify-center transition-opacity duration-700 ${
                isActive ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'
              }`}
            >
              {/* Left Column: Headline & Action */}
              <div className="w-full lg:col-span-7 pt-4 sm:pt-6 pb-2 sm:pb-4 lg:py-14 text-center lg:text-left z-20 flex flex-col items-center lg:items-start">
                
                {/* Badge */}
                <div 
                  className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/80 border border-sky-400/30 text-sky-300 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider mb-2.5 sm:mb-4 shadow-sm transition-all duration-700 ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  <span>{badgeText}</span>
                </div>

                {/* Secondary title if available */}
                {slide.secondary_title && (
                  <div className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                    {slide.secondary_title}
                  </div>
                )}

                {/* Main Headline */}
                <h1 
                  className={`text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-2 sm:mb-3.5 transition-all duration-700 delay-100 ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  {headline}{' '}
                  {highlightText && (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-sky-300 drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]">
                      {highlightText}
                    </span>
                  )}
                </h1>

                {/* Subtitle */}
                <p 
                  className={`text-xs sm:text-sm md:text-base text-slate-300 font-normal max-w-lg mb-4 sm:mb-6 leading-relaxed line-clamp-2 sm:line-clamp-none transition-all duration-700 delay-200 ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  {desc}
                </p>

                {/* Feature Icons if available */}
                {Array.isArray(features) && features.length > 0 && (
                  <div className="hidden sm:grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 w-full max-w-lg">
                    {features.map((feat, fIdx) => {
                      const FeatIcon = feat.icon || Shield;
                      return (
                        <div key={fIdx} className="bg-white/5 border border-white/10 rounded-xl p-2 flex items-center space-x-2">
                          <FeatIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="text-[10px] font-bold text-slate-200 truncate">{feat.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* CTA Button */}
                <div 
                  className={`flex items-center space-x-4 transition-all duration-700 delay-300 ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  <Link
                    href={buttonUrl}
                    className="inline-flex items-center space-x-2.5 px-5 sm:px-8 py-2.5 sm:py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-extrabold tracking-wider uppercase rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.45)] hover:shadow-[0_0_30px_rgba(37,99,235,0.7)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>{buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Hero Graphic Composition */}
              <div className="w-full lg:col-span-5 relative h-[160px] sm:h-[220px] md:h-[320px] lg:h-[460px] flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full max-w-[400px] lg:max-w-[500px] flex items-center justify-center">
                  
                  {/* Glowing Neon Blue Ring */}
                  <div className="absolute w-[160px] h-[160px] sm:w-[260px] sm:h-[260px] lg:w-[320px] lg:h-[320px] rounded-full border-2 border-sky-400/40 shadow-[0_0_40px_rgba(56,189,248,0.3)] animate-pulse pointer-events-none" />
                  <div className="absolute w-[130px] h-[130px] sm:w-[200px] sm:h-[200px] lg:w-[260px] lg:h-[260px] rounded-full bg-gradient-to-tr from-blue-600/20 to-sky-400/20 blur-2xl pointer-events-none" />

                  {/* Active Slide Image */}
                  <div className="w-full h-full relative overflow-hidden rounded-2xl flex items-center justify-center z-10 p-2 sm:p-4">
                    <img
                      src={imageUrl}
                      alt={headline}
                      className={`max-w-full max-h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)] select-none pointer-events-none transition-transform duration-[8000ms] ease-out will-change-transform ${
                        isActive 
                          ? (idx % 2 === 0 ? 'scale-105' : 'scale-100 translate-x-1') 
                          : 'scale-95 opacity-0'
                      }`}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slider Left / Right Circular Navigation Buttons (Visible on tablet & desktop) */}
      {activeSlides.length > 1 && (
        <div className="hidden sm:block">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-all hover:scale-110 z-20 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-all hover:scale-110 z-20 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      )}

      {/* Slider Pagination Dots */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-12 sm:bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-20 bg-slate-950/60 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
          {activeSlides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === currentIndex ? 'w-5 sm:w-7 bg-sky-400 shadow-[0_0_8px_#38bdf8]' : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
