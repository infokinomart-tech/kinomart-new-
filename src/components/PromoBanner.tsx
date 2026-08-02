import React from 'react';
import { useStore } from '../context/StoreContext';
import { Flame, ArrowRight } from 'lucide-react';

export const PromoBanner: React.FC = () => {
  const { setActiveClientPage } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 my-8">
      <div className="bg-[#434F33] text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden flex flex-col items-start gap-4">
        {/* Background Subtle Accent */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        {/* Top Badge */}
        <div className="inline-flex items-center gap-1.5 bg-[#FF6B35] text-white text-xs font-black px-4 py-1.5 rounded-full shadow-xs">
          <Flame className="w-4 h-4 fill-white animate-bounce" />
          <span>লিমিটেড টাইম ধামাকা অফার</span>
        </div>

        {/* Headline */}
        <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold max-w-2xl leading-tight">
          আজকের যেকোনো ২ টি গ্যাজেট অর্ডারে সম্পূর্ণ ফ্রি সারা দেশ ডেলিভারি!
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-base text-amber-100 font-medium max-w-xl">
          আপনার পছন্দের ইয়ারবাডস, স্মার্টওয়াচ বা পাওয়ার ব্যাংক এখনই অর্ডার করুন। স্টক সীমিত!
        </p>

        {/* CTA Button */}
        <button
          onClick={() => {
            setActiveClientPage('products');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="mt-2 bg-white text-[#2E3B2B] hover:bg-amber-100 active:scale-95 text-xs sm:text-sm font-extrabold py-3 px-6 rounded-full flex items-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <span>অফারটি লুফে নিন</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
