import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/products/ProductCard';
import { HeroBannerSlider } from '../components/home/HeroBannerSlider';

export const Home: React.FC = () => {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const prodData = await api.getProducts();

        const best = prodData.filter(p => p.is_best_seller || (Number(p.rating || 0) >= 4.5));
        setBestSellers(best.length > 0 ? best : prodData.slice(0, 8));

        const feat = prodData.filter(p => p.is_featured);
        setFeaturedProducts(feat.length > 0 ? feat : prodData);
      } catch (err) {
        console.error('Failed to load home page data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-10 pb-12">
      {/* Animated Hero Banner Slider matching demo screenshot design */}
      <HeroBannerSlider />

      {/* Best Selling Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#C97B4A] uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 fill-current" />
              <span>জনপ্রিয় পণ্যসমূহ</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A]">
              বেস্ট সেলিং গ্যাজেট
            </h2>
          </div>

          <Link
            to="/products"
            className="flex items-center space-x-1 text-xs sm:text-sm font-bold text-[#6B7A4F] hover:underline"
          >
            <span>সব দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Special Offer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4 sm:my-8">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-[#6B7A4F] to-[#424F2F] text-white p-4 sm:p-8 md:p-12 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-2 sm:space-y-4">
            <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#C97B4A] text-white font-bold text-[11px] sm:text-xs">
              🔥 লিমিটেড টাইম ধামাকা অফার
            </span>
            <h3 className="text-base sm:text-2xl md:text-3xl font-medium leading-snug sm:leading-tight">
              আজকের যেকোনো ২ টি গ্যাজেট অর্ডারে সম্পূর্ণ ফ্রি সারা দেশ ডেলিভারি!
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-white/90 font-normal">
              আপনার পছন্দের ইয়ারবাডস, স্মার্টওয়াচ বা পাওয়ার ব্যাংক এখনই অর্ডার করুন। স্টক সীমিত!
            </p>
            <div className="pt-1 sm:pt-2">
              <Link
                to="/products"
                className="inline-flex items-center space-x-1.5 px-5 py-2 sm:px-8 sm:py-3.5 rounded-xl bg-white text-[#1A1A1A] font-extrabold text-xs sm:text-sm hover:bg-[#F7F5EF] transition-all shadow-md active:scale-95"
              >
                <span>অফারটি লুফে নিন</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6B7A4F]" />
              </Link>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};
