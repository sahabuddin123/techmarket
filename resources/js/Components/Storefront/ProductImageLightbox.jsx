import React, { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

export default function ProductImageLightbox({
  isOpen,
  onClose,
  images = [],
  currentIndex = 0,
  onSelectIndex,
  productTitle = '',
  price = 0,
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const activeImage = images[currentIndex] || images[0] || '';

  // Reset zoom when image changes or modal opens
  useEffect(() => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex, isOpen]);

  const handlePrev = useCallback(() => {
    if (!images.length) return;
    onSelectIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  }, [currentIndex, images.length, onSelectIndex]);

  const handleNext = useCallback(() => {
    if (!images.length) return;
    onSelectIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, images.length, onSelectIndex]);

  // Keyboard navigation (Escape to close, Left/Right arrow to navigate, +/- to zoom)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === '+' || e.key === '=') {
        setZoomLevel((prev) => Math.min(prev + 0.5, 3));
      } else if (e.key === '-' || e.key === '_') {
        setZoomLevel((prev) => Math.max(prev - 0.5, 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  // Prevent background body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleZoom = () => {
    if (zoomLevel > 1) {
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setZoomLevel(2);
    }
  };

  const handleMouseDown = (e) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200"
      onClick={onClose}
      onMouseUp={handleMouseUp}
    >
      {/* 1. TOP HEADER TOOLBAR */}
      <div 
        className="w-full px-4 sm:px-6 py-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-3 text-white max-w-xl truncate">
          <span className="px-2.5 py-1 rounded-md bg-white/10 text-xs font-mono font-bold text-slate-200 border border-white/10">
            {currentIndex + 1} / {images.length || 1}
          </span>
          <div className="truncate">
            <h3 className="text-sm sm:text-base font-bold text-white truncate drop-shadow-sm">
              {productTitle}
            </h3>
            {price > 0 && (
              <span className="text-xs font-semibold text-emerald-400">
                ৳{Number(price).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center space-x-2">
          {/* Zoom In / Out Controls */}
          <div className="hidden sm:flex items-center bg-white/10 rounded-xl p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.5, 1))}
              disabled={zoomLevel <= 1}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono font-bold text-slate-200">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.min(prev + 0.5, 3))}
              disabled={zoomLevel >= 3}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {zoomLevel > 1 && (
              <button
                type="button"
                onClick={() => {
                  setZoomLevel(1);
                  setPosition({ x: 0, y: 0 });
                }}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-600 text-white border border-white/10 hover:border-rose-500 transition-colors cursor-pointer shadow-lg"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. CENTER IMAGE DISPLAY & NAVIGATION ARROWS */}
      <div 
        className="flex-1 relative w-full h-full flex items-center justify-center p-4 sm:p-8 overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 sm:left-8 z-30 p-3.5 rounded-full bg-black/60 hover:bg-white text-white hover:text-slate-900 border border-white/20 hover:border-white transition-all shadow-2xl cursor-pointer group"
            title="Previous Image (←)"
          >
            <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
          </button>
        )}

        {/* Main Image Stage */}
        <div
          className="max-w-4xl max-h-[70vh] sm:max-h-[75vh] w-full h-full flex items-center justify-center cursor-zoom-in"
          onClick={(e) => {
            e.stopPropagation();
            toggleZoom();
          }}
          onMouseDown={handleMouseDown}
          style={{
            cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          }}
        >
          <img
            src={activeImage}
            alt={productTitle}
            draggable={false}
            className="max-h-full max-w-full object-contain transition-transform duration-200 drop-shadow-2xl"
            style={{
              transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
            }}
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 sm:right-8 z-30 p-3.5 rounded-full bg-black/60 hover:bg-white text-white hover:text-slate-900 border border-white/20 hover:border-white transition-all shadow-2xl cursor-pointer group"
            title="Next Image (→)"
          >
            <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {/* 3. BOTTOM THUMBNAILS STRIP */}
      {images.length > 1 && (
        <div 
          className="w-full py-4 px-4 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center space-x-2.5 overflow-x-auto max-w-2xl px-2 py-1 custom-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectIndex(idx)}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 p-1 bg-white/5 shrink-0 transition-all cursor-pointer overflow-hidden ${
                  currentIndex === idx
                    ? 'border-indigo-400 ring-2 ring-indigo-400/40 bg-white/20 scale-105 shadow-md'
                    : 'border-white/20 hover:border-white/60 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
