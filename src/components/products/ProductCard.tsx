import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Zap } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { openCheckout } = useCart();

  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const currentPrice = product.discount_price || product.price;

  let discountPercent = 0;
  if (hasDiscount) {
    discountPercent = Math.round(((product.price - product.discount_price!) / product.price) * 100);
  }

  // Default selected variant if exists
  const defaultVariant = product.variants?.[0]?.options?.[0];

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openCheckout(product, defaultVariant);
  };

  return (
    <div className="group bg-white rounded-2xl border border-[#E5E3DA] overflow-hidden hover:shadow-xl hover:border-[#6B7A4F]/40 transition-all duration-300 flex flex-col h-full relative">
      {/* Badges Container */}
      <div className="absolute top-1.5 left-2 right-2 z-10 flex items-center justify-between pointer-events-none gap-1 flex-wrap">
        <div className="flex items-center space-x-1">
          {hasDiscount && (
            <span className="bg-[#C97B4A] text-white font-bold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full shadow-sm tracking-tight inline-block">
              {discountPercent}% ছাড়
            </span>
          )}
          {product.stock > 0 && product.stock <= (product.low_stock_threshold ?? 10) && (
            <span className="bg-amber-600 text-white font-bold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full shadow-sm tracking-tight inline-block animate-pulse">
              ⚠️ লিমিটেড স্টক
            </span>
          )}
        </div>
        <div>
          {product.is_best_seller && (
            <span className="bg-[#6B7A4F] text-white font-semibold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full shadow-sm tracking-tight inline-block">
              বেস্ট সেলার
            </span>
          )}
        </div>
      </div>

      {/* Product Image Link */}
      <Link to={`/products/${product.slug || product.id}`} state={{ product }} className="block relative aspect-square bg-[#F7F5EF] overflow-hidden">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Details Area */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          {/* Category */}
          <div className="text-[11px] text-[#6B6B6B] font-medium mb-1">
            {product.category_name || 'গ্যাজেট'}
          </div>

          {/* Title */}
          <Link to={`/products/${product.slug || product.id}`} state={{ product }}>
            <h3 className="font-bold text-sm sm:text-base text-[#1A1A1A] truncate block hover:text-[#6B7A4F] transition-colors leading-snug" title={product.name}>
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center space-x-0.5 mt-1 mb-0.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
            </div>
            <span className="text-[11px] text-[#6B6B6B] font-medium ml-1">
              {product.rating || 4.9} ({product.reviews_count || 45})
            </span>
          </div>
        </div>

        <div>
          {/* Price */}
          <div className="flex items-baseline space-x-2 mt-0.5 mb-1">
            <span className="font-extrabold text-xl text-[#6B7A4F]">
              <span className="text-[#6B7A4F] mr-0.5">৳</span>{currentPrice.toLocaleString('bn-BD')}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#6B6B6B] line-through">
                ৳{product.price.toLocaleString('bn-BD')}
              </span>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-1.5 pt-1.5 border-t border-[#E5E3DA]/60">
            <button
              onClick={handleBuyNow}
              className="w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold bg-[#6B7A4F] text-white hover:bg-[#586640] transition-colors flex items-center justify-center space-x-1.5 shadow-sm active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>অর্ডার করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
