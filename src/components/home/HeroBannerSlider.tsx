import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const fallbackBanners = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1587049352847-81a56d773cae?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1508061253366-f7da158b6d96?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1400&q=80'
];

export const HeroBannerSlider: React.FC = () => {
  const { settings } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Compute active banner list from admin settings
  const slides = (settings?.banner_images && settings.banner_images.length > 0)
    ? settings.banner_images.filter(img => img.trim() !== '')
    : (settings?.hero_image ? [settings.hero_image] : fallbackBanners);

  const activeSlides = slides.length > 0 ? slides : fallbackBanners;

  // Auto-advance slide every 4 seconds
  useEffect(() => {
    if (isHovered || activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered, activeSlides.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 my-2 sm:my-4 select-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pure Image Banner Container (No text overlays) */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-[#E5E3DA] bg-gray-100 aspect-[16/7] sm:aspect-[21/8] md:aspect-[24/9] flex items-center justify-center">
        
        {activeSlides.map((imageUrl, idx) => (
          <Link
            key={idx}
            to="/products"
            className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
              idx === currentIndex ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0 pointer-events-none'
            }`}
          >
            <img
              src={imageUrl}
              alt={`KinoMart Banner ${idx + 1}`}
              className="w-full h-full object-cover rounded-2xl sm:rounded-3xl"
            />
          </Link>
        ))}

        {/* Navigation Arrows (Hidden by default, shown on hover) */}
        {activeSlides.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-all duration-300 opacity-0 group-hover:opacity-100 active:scale-90"
              aria-label="Previous Banner"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-all duration-300 opacity-0 group-hover:opacity-100 active:scale-90"
              aria-label="Next Banner"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Slide Indicator Dots at Bottom Center */}
            <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1 sm:py-1.5 rounded-full border border-white/20">
              {activeSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentIndex
                      ? 'w-5 sm:w-6 h-2 bg-amber-400'
                      : 'w-2 h-2 bg-white/60 hover:bg-white'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
};
