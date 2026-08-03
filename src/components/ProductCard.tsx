import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Star, Zap, AlertTriangle, BellRing } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProduct, setQuickOrderProduct, setIsQuickOrderOpen, setActiveClientPage } = useStore();

  const isOutOfStock = product.stock <= 0 || product.status === 'INACTIVE';

  const handleCardClick = () => {
    setSelectedProduct(product);
    setActiveClientPage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) {
      handleCardClick();
      return;
    }
    setQuickOrderProduct(product);
    setIsQuickOrderOpen(true);
  };

  // Calculate discount percentage if discountPrice exists
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const displayPrice = product.discountPrice || product.price;

  const isLimitedStock =
    product.stock > 0 &&
    product.stock <= (product.limitedStockThreshold || 10);

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl border border-[#E8E3D9] p-2.5 sm:p-3 flex flex-col justify-between hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden"
    >
      {/* Image Area */}
      <div>
        <div className="relative w-full aspect-square bg-[#F5F2EA] rounded-xl overflow-hidden flex items-center justify-center mb-3">
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap items-center gap-1.5 z-10 max-w-[90%]">
            {isOutOfStock ? (
              <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                আউট অব স্টক
              </span>
            ) : (
              <>
                {discountPercent > 0 && (
                  <span className="bg-[#E65100] text-white text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                    {discountPercent}% ছাড়
                  </span>
                )}

                {product.isBestSeller && (
                  <span className="bg-[#5E6A45] text-white text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                    বেস্ট সেলার
                  </span>
                )}

                {isLimitedStock && !discountPercent && !product.isBestSeller && (
                  <span className="bg-[#E67E22] text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs whitespace-nowrap">
                    <AlertTriangle className="w-3 h-3 text-yellow-200 fill-yellow-200" />
                    লিমিটেড স্টক
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1">
          <span className="text-[10px] font-medium text-[#7C8573] uppercase tracking-wider block">
            {product.category || 'গ্যাজেট'}
          </span>

          <h3 className="text-xs sm:text-sm font-extrabold text-[#1F241E] line-clamp-2 min-h-[32px] sm:min-h-[38px] group-hover:text-[#5E7A3B] transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 text-[11px] text-[#6B7264] pt-0.5">
            <div className="flex items-center text-[#F59E0B]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating || 5)
                      ? 'fill-[#F59E0B]'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold text-gray-700 ml-1">
              {product.rating ? product.rating.toFixed(1) : '5.0'} ({product.reviewsCount || 1})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-sm sm:text-lg font-black text-[#5E7A3B]">
              ৳{displayPrice.toLocaleString('bn-BD')}
            </span>
            {product.discountPrice && (
              <span className="text-xs text-gray-400 line-through">
                ৳{product.price.toLocaleString('bn-BD')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Order / Notify Me Button */}
      <div className="pt-3">
        {isOutOfStock ? (
          <button
            onClick={handleCardClick}
            className="w-full bg-[#374151] hover:bg-[#1F241E] active:scale-[0.98] text-white text-xs sm:text-sm font-bold py-2 sm:py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <BellRing className="w-3.5 h-3.5 text-amber-300" />
            <span>স্টকে ফিরলে জানান</span>
          </button>
        ) : (
          <button
            onClick={handleQuickOrder}
            className="w-full bg-[#5E6A45] hover:bg-[#485333] active:scale-[0.98] text-white text-xs sm:text-sm font-bold py-2 sm:py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-white text-white animate-pulse" />
            <span>অর্ডার করুন</span>
          </button>
        )}
      </div>
    </div>
  );
};
