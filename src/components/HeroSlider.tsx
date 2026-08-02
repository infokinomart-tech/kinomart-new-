import React, { useState, useEffect } from 'react';
import { HERO_SLIDES } from '../data/mockData';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 mt-3 mb-6">
      <div className="relative h-44 sm:h-72 md:h-96 lg:h-[420px] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md bg-[#FFDC33] group">
        {/* Slide Image */}
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-[#5E5000]/80 hover:bg-[#5E5000] text-white flex items-center justify-center transition-all shadow-md active:scale-95"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-[#5E5000]/80 hover:bg-[#5E5000] text-white flex items-center justify-center transition-all shadow-md active:scale-95"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Capsule Pagination Indicator Bar (Exact as Image 1) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide
                  ? 'w-6 h-2 bg-[#FFC107] rounded-full'
                  : 'w-2 h-2 bg-white/60 hover:bg-white rounded-full'
              }`}
            />
          ))}
          {/* Decorative additional dots to match screenshot design */}
          <span className="w-2 h-2 bg-white/40 rounded-full" />
          <span className="w-2 h-2 bg-white/40 rounded-full" />
          <span className="w-2 h-2 bg-white/40 rounded-full" />
          <span className="w-2 h-2 bg-white/40 rounded-full" />
          <span className="w-2 h-2 bg-white/40 rounded-full" />
        </div>
      </div>
    </div>
  );
};
