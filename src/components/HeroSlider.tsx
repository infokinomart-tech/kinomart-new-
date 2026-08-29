import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getOptimizedImageUrl, getResponsiveSrcSet, getRawStorageUrl, markSupabaseTransformFailed } from '../lib/imageUtils';

export const HeroSlider: React.FC = () => {
  const { heroSlides, settings, isDataLoading, setActiveClientPage, setSelectedCategory } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [aspectRatios, setAspectRatios] = useState<Record<string | number, number>>({});
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const activeSlides = useMemo(() => {
    const list = Array.isArray(heroSlides) ? heroSlides : [];
    return list.filter((s) => s.isActive !== false && s.image);
  }, [heroSlides]);

  const slideInterval = settings.heroSliderInterval || 5000;

  // Auto-detect and cache natural aspect ratio for each slide image
  useEffect(() => {
    activeSlides.forEach((slide, index) => {
      const key = slide.id || index;
      if (slide.image && !aspectRatios[key]) {
        const img = new Image();
        img.src = slide.image;
        img.onload = () => {
          if (img.naturalWidth && img.naturalHeight && img.naturalHeight > 0) {
            const ratio = img.naturalWidth / img.naturalHeight;
            if (ratio >= 1.0 && ratio <= 4.5) {
              setAspectRatios(prev => ({ ...prev, [key]: ratio }));
            }
          }
        };
      }
    });
  }, [activeSlides, aspectRatios]);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, slideInterval);
    return () => clearInterval(timer);
  }, [activeSlides.length, slideInterval]);

  // Reset currentSlide if it exceeds length
  useEffect(() => {
    if (currentSlide >= activeSlides.length) {
      setCurrentSlide(0);
    }
  }, [activeSlides.length, currentSlide]);

  if (activeSlides.length === 0) {
    if (isDataLoading) {
      return (
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 mt-2 sm:mt-3 mb-3 sm:mb-6">
          <div className="w-full aspect-[2.4/1] sm:aspect-[2.6/1] md:aspect-[2.8/1] rounded-xl sm:rounded-2xl bg-[#E8E3D9]/60 animate-pulse" />
        </div>
      );
    }
    return null;
  }

  const currentSlideData = activeSlides[currentSlide] || activeSlides[0];
  const activeRatio = currentSlideData
    ? (aspectRatios[currentSlideData.id || currentSlide] || 2.45)
    : 2.45;

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 40) {
      nextSlide();
    } else if (diff < -40) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleSlideClick = (slide: typeof activeSlides[0]) => {
    if (slide.linkType === 'category' && slide.linkValue) {
      setSelectedCategory(slide.linkValue);
      setActiveClientPage('products');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (slide.linkType === 'custom_url' && slide.linkValue) {
      if (slide.linkValue.startsWith('http')) {
        window.open(slide.linkValue, '_blank');
      } else {
        window.location.href = slide.linkValue;
      }
    } else {
      setActiveClientPage('products');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-2 sm:px-4 mt-1.5 sm:mt-3 mb-3 sm:mb-6">
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          aspectRatio: `${activeRatio}`,
        }}
        className="relative w-full max-w-full rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-xs sm:shadow-md bg-[#F4F0E8] group select-none transition-[aspect-ratio] duration-300"
      >
        {/* Slide Images */}
        {activeSlides.map((slide, index) => {
          const isFirst = index === 0;
          const optimizedSrc = getOptimizedImageUrl(slide.image, { width: 1400, quality: 85 });
          const srcSet = getResponsiveSrcSet(slide.image, [480, 768, 1200, 1600], 85);
          const slideKey = slide.id || index;

          return (
            <div
              key={slideKey}
              onClick={() => handleSlideClick(slide)}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out cursor-pointer ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={optimizedSrc}
                srcSet={srcSet || undefined}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1280px"
                alt={slide.title || `Slide ${index + 1}`}
                className="w-full h-full object-contain sm:object-cover object-center"
                referrerPolicy="no-referrer"
                loading={isFirst ? 'eager' : 'lazy'}
                fetchPriority={isFirst ? 'high' : 'auto'}
                decoding="async"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (img.naturalWidth && img.naturalHeight && img.naturalHeight > 0) {
                    const ratio = img.naturalWidth / img.naturalHeight;
                    if (ratio >= 1.0 && ratio <= 4.5) {
                      setAspectRatios(prev => ({ ...prev, [slideKey]: ratio }));
                    }
                  }
                }}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.includes('/render/image/public/')) {
                    markSupabaseTransformFailed();
                  }
                  target.srcset = '';
                  target.src = getRawStorageUrl(slide.image);
                }}
              />
            </div>
          );
        })}

        {/* Navigation Arrows (Show only if more than 1 slide) */}
        {activeSlides.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-black/30 hover:bg-black/60 sm:bg-[#5E5000]/80 sm:hover:bg-[#5E5000] text-white flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer backdrop-blur-xs"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-black/30 hover:bg-black/60 sm:bg-[#5E5000]/80 sm:hover:bg-[#5E5000] text-white flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer backdrop-blur-xs"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </button>
          </>
        )}

        {/* Capsule Pagination Indicator Bar */}
        {activeSlides.length > 1 && (
          <div className="absolute bottom-1.5 sm:bottom-2.5 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-xs px-2 py-0.5 sm:px-3 sm:py-1 rounded-full flex items-center gap-1 sm:gap-1.5 border border-white/15">
            {activeSlides.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(index);
                }}
                className={`transition-all duration-300 cursor-pointer ${
                  index === currentSlide
                    ? 'w-4 sm:w-5 h-1 sm:h-1.5 bg-[#FFC107] rounded-full'
                    : 'w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white/60 hover:bg-white rounded-full'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
