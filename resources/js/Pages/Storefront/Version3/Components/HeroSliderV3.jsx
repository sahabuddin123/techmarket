import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSliderV3({ slides = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef(null);

  // Pure graphic banner images matching TechJhuli (NO overlapping text overlays)
  const defaultBanners = [
    {
      id: 'banner-1',
      image: '/images/storefront/v3/banner_flashlight.jpg',
      url: '/product/original-x10-laser-flashlight',
      title: '2 In 1 Flashlight & Ambient Light',
    },
    {
      id: 'banner-2',
      image: '/images/storefront/v3/banner_gadgets.jpg',
      url: '/catalog',
      title: 'Your Trusted Gadget Hub',
    },
  ];

  const activeSlides = (slides && slides.length > 0)
    ? slides.map(s => typeof s === 'string' ? { image: s, url: '/catalog' } : s)
    : defaultBanners;

  // Autoplay every 5 seconds
  useEffect(() => {
    if (!isHovered && activeSlides.length > 1) {
      timeoutRef.current = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % activeSlides.length);
      }, 5000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, isHovered, activeSlides.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const currentSlide = activeSlides[currentIndex] || defaultBanners[0];

  return (
    <div
      className="w-full max-w-[1240px] mx-auto px-3 sm:px-4 lg:px-6 mt-4 sm:mt-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative rounded-[22px] overflow-hidden border border-[#8BB1FF]/70 shadow-[0_0_18px_rgba(202,224,255,0.7)] bg-slate-900 group">
        
        {/* Pure Image Banner (Full display without overlapping text) */}
        <Link
          href={currentSlide.url || '/catalog'}
          className="block w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[2.4/1] relative overflow-hidden"
        >
          <img
            src={currentSlide.image_url || currentSlide.image || '/images/storefront/v3/banner_flashlight.jpg'}
            alt={currentSlide.title || 'TechJhuli Banner'}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.01]"
            loading="eager"
          />
        </Link>

        {/* Carousel Arrow Controls */}
        {activeSlides.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-black/40 hover:bg-[#0153FD] text-white flex items-center justify-center backdrop-blur-xs shadow-lg transition-all cursor-pointer opacity-80 group-hover:opacity-100"
              aria-label="Previous Banner"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-black/40 hover:bg-[#0153FD] text-white flex items-center justify-center backdrop-blur-xs shadow-lg transition-all cursor-pointer opacity-80 group-hover:opacity-100"
              aria-label="Next Banner"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1.5 bg-black/50 backdrop-blur-xs px-3 py-1.5 rounded-full">
              {activeSlides.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentIndex(dotIdx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    dotIdx === currentIndex ? 'w-6 bg-[#0153FD]' : 'w-2 bg-white/60 hover:bg-white'
                  }`}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
