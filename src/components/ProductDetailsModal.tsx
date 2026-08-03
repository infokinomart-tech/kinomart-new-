import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import {
  Star,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  ZoomIn,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Image as ImageIcon,
  PlayCircle,
  Flame
} from 'lucide-react';
import { ProductCard } from './ProductCard';
import { BenefitsGrid } from './BenefitsGrid';

interface ProductDetailsModalProps {
  product: Product;
  onClose?: () => void;
}

const toBnNum = (n: number | string): string => {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n)
    .padStart(2, '0')
    .split('')
    .map((char) => bn[parseInt(char, 10)] ?? char)
    .join('');
};

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product }) => {
  const {
    products,
    categories,
    setActiveClientPage,
    setSelectedProduct,
    setQuickOrderProduct,
    setIsQuickOrderOpen,
    setSelectedCategory
  } = useStore();

  const [selectedImage, setSelectedImage] = useState<string>(product.thumbnail);
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0] : 'MINT'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'spec' | 'delivery' | 'guarantee'>('desc');
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 23,
    minutes: 56,
    seconds: 43
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Gallery list combining thumbnail and gallery array
  const allImages = Array.from(new Set([product.thumbnail, ...(product.gallery || [])]));
  const [currentThumbIdx, setCurrentThumbIdx] = useState<number>(0);

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const displayPrice = product.discountPrice || product.price;
  const totalPrice = displayPrice * quantity;

  // Variants list
  const variantList = product.colors && product.colors.length > 0
    ? product.colors
    : ['MINT', 'PEACE', 'WATERMELON', 'GRAPE'];

  // Handle order now
  const handleOrderNow = () => {
    setQuickOrderProduct({
      ...product,
      colors: [selectedColor]
    });
    setIsQuickOrderOpen(true);
  };

  // Helper to construct YouTube Embed URL safely
  const getEmbedUrl = (url?: string) => {
    if (!url) return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    if (url.includes('embed/')) return url;
    if (url.includes('watch?v=')) {
      const id = url.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  };

  // Related Products
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.status === 'ACTIVE')
    .slice(0, 4);

  const handlePrevThumb = () => {
    const nextIdx = (currentThumbIdx - 1 + allImages.length) % allImages.length;
    setCurrentThumbIdx(nextIdx);
    setSelectedImage(allImages[nextIdx]);
  };

  const handleNextThumb = () => {
    const nextIdx = (currentThumbIdx + 1) % allImages.length;
    setCurrentThumbIdx(nextIdx);
    setSelectedImage(allImages[nextIdx]);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 lg:pb-6 space-y-6 animate-fadeIn">
      {/* Category Sub Navigation Bar (Hidden on mobile) */}
      <div className="hidden lg:block bg-white border border-[#E8E3D9] rounded-2xl p-2.5 overflow-x-auto shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold whitespace-nowrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.name);
                setActiveClientPage('products');
              }}
              className={`px-3 py-1.5 rounded-full border transition-all ${
                product.category === cat.name
                  ? 'bg-[#5E6A45] text-white border-[#5E6A45]'
                  : 'bg-[#FAF8F5] text-[#2E3B2B] border-[#E8E3D9] hover:bg-[#EFECE6]'
              }`}
            >
              {cat.name}
            </button>
          ))}
          <button
            onClick={() => {
              setSelectedCategory(null);
              setActiveClientPage('products');
            }}
            className="px-3 py-1.5 rounded-full bg-[#1F241E] text-white border border-[#1F241E] hover:bg-black transition-all"
          >
            অল ক্যাটাগরি গ্যাজেট
          </button>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-[#6B7264] px-1">
        <button onClick={() => setActiveClientPage('home')} className="hover:text-[#5E7A3B] font-semibold">
          হোম
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button
          onClick={() => {
            setSelectedCategory(product.category);
            setActiveClientPage('products');
          }}
          className="hover:text-[#5E7A3B] font-semibold"
        >
          {product.category || 'গ্যাজেট'}
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-extrabold text-[#1F241E] truncate max-w-xs sm:max-w-md">
          {product.name}
        </span>
      </nav>

      {/* Main Top Section Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 bg-white border border-[#E8E3D9] rounded-3xl p-4 sm:p-8 shadow-xs">
        {/* Left Column: Image Showcase & Gallery Slider */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full bg-[#FFDC33] rounded-2xl overflow-hidden border border-[#E8E3D9] shadow-inner group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />

            {/* Discount Badge */}
            {discountPercent > 0 && (
              <span className="absolute top-3 left-3 bg-[#CB6532] text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                {discountPercent}% ছাড়
              </span>
            )}

            {/* Zoom Overlay Button */}
            <button
              onClick={() => setIsZoomOpen(true)}
              className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-xs transition-all shadow-md cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>ছবিতে মাউস রেখে জুম করুন</span>
            </button>
          </div>

          {/* Thumbnail Slider Bar */}
          {allImages.length > 0 && (
            <div className="relative flex items-center gap-2 px-1">
              <button
                onClick={handlePrevThumb}
                className="p-2 rounded-full bg-[#FAF8F5] border border-[#E8E3D9] hover:bg-[#EFECE6] text-[#1F241E] shadow-2xs shrink-0 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none w-full justify-center">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImage(img);
                      setCurrentThumbIdx(idx);
                    }}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      selectedImage === img
                        ? 'border-[#5E6A45] ring-2 ring-[#5E6A45]/30 scale-105'
                        : 'border-[#E8E3D9] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextThumb}
                className="p-2 rounded-full bg-[#FAF8F5] border border-[#E8E3D9] hover:bg-[#EFECE6] text-[#1F241E] shadow-2xs shrink-0 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Details & Ordering */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            {/* Category & Stock Status Header */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#6B7264] uppercase tracking-wider">
                {product.category || 'স্মার্টওয়াচ'}
              </span>
              <span className="bg-[#DCFCE7] text-[#15803D] text-xs font-black px-3.5 py-1 rounded-full border border-[#BBF7D0]">
                ইন স্টক ({toBnNum(product.stock || 50)} টি এভেলেবল)
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-[#1F241E] leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars & Reviews */}
            <div className="flex items-center gap-2 text-xs text-[#6B7264]">
              <div className="flex text-[#F59E0B]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 5) ? 'fill-[#F59E0B]' : 'text-gray-200 fill-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="font-extrabold text-[#1F241E] text-sm">
                {product.rating ? product.rating.toFixed(1) : '5.0'}
              </span>
              <span className="text-gray-500 font-semibold">({toBnNum(product.reviewsCount || 1)} টি রিভিউ)</span>
            </div>

            {/* Large Price Box */}
            <div className="bg-[#F4F4F5] rounded-2xl p-4 sm:p-5 border border-gray-200/60 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-[#1F241E]">
                ৳{displayPrice.toLocaleString('bn-BD')}
              </span>
              {product.discountPrice && (
                <span className="text-base sm:text-lg text-gray-400 line-through font-bold">
                  ৳{product.price.toLocaleString('bn-BD')}
                </span>
              )}
            </div>

            {/* Offer Countdown Banner */}
            <div className="bg-[#23311A] text-white p-3.5 rounded-2xl border border-[#3B4D2B] flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#3B4D2B] flex items-center justify-center text-amber-400 shrink-0">
                  <Flame className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <div className="font-black text-amber-300 text-xs sm:text-sm">
                    অফারটি শেষ হতে বাকি:
                  </div>
                  <div className="text-[11px] text-gray-300 font-medium">
                    অফারের সময় সীমিত! দ্রুত অর্ডার করুন।
                  </div>
                </div>
              </div>

              {/* Countdown Digits */}
              <div className="flex items-center gap-1.5 text-xs font-black">
                <div className="flex flex-col items-center">
                  <span className="bg-[#151E10] px-2.5 py-1 rounded-lg text-white font-mono text-sm border border-[#3B4D2B]">
                    {toBnNum(timeLeft.days)}
                  </span>
                  <span className="text-[9px] text-gray-400 mt-0.5">দিন</span>
                </div>
                <span className="text-amber-300 pb-3">:</span>
                <div className="flex flex-col items-center">
                  <span className="bg-[#151E10] px-2.5 py-1 rounded-lg text-white font-mono text-sm border border-[#3B4D2B]">
                    {toBnNum(timeLeft.hours)}
                  </span>
                  <span className="text-[9px] text-gray-400 mt-0.5">ঘণ্টা</span>
                </div>
                <span className="text-amber-300 pb-3">:</span>
                <div className="flex flex-col items-center">
                  <span className="bg-[#151E10] px-2.5 py-1 rounded-lg text-white font-mono text-sm border border-[#3B4D2B]">
                    {toBnNum(timeLeft.minutes)}
                  </span>
                  <span className="text-[9px] text-gray-400 mt-0.5">মিন</span>
                </div>
                <span className="text-amber-300 pb-3">:</span>
                <div className="flex flex-col items-center">
                  <span className="bg-[#151E10] px-2.5 py-1 rounded-lg text-white font-mono text-sm border border-[#3B4D2B]">
                    {toBnNum(timeLeft.seconds)}
                  </span>
                  <span className="text-[9px] text-gray-400 mt-0.5">সে</span>
                </div>
              </div>
            </div>

            {/* Short Description Box */}
            <div className="bg-[#F4F4F5] rounded-2xl p-4 text-xs sm:text-sm text-[#374151] font-medium leading-relaxed border border-gray-200/50">
              {product.shortDescription ||
                'Discover the pure taste of Africa with Organic Wild Honey, harvested from the untouched wilderness where wild bees thrive on diverse native blossoms.'}
            </div>

            {/* Color / Variant Selection */}
            {variantList && variantList.length > 0 && (
              <div className="space-y-2 pt-1">
                <label className="text-xs sm:text-sm font-extrabold text-[#1F241E] block">
                  কালার: <span className="text-[#5E6A45]">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {variantList.map((variant, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColor(variant)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer uppercase ${
                        selectedColor === variant
                          ? 'bg-[#5E6A45] text-white shadow-sm ring-2 ring-[#5E6A45]/40'
                          : 'bg-white border border-gray-300 text-[#1F241E] hover:bg-gray-100'
                      }`}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector Box */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs sm:text-sm font-bold text-[#1F241E]">
              <span>পরিমাণ (Quantity):</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-[#F4F4F5]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-200 text-[#1F241E] transition-colors cursor-pointer font-extrabold"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 font-black text-sm text-[#1F241E]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-200 text-[#1F241E] transition-colors cursor-pointer font-extrabold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs font-extrabold text-[#374151]">
                  মোট দাম: ৳{totalPrice.toLocaleString('bn-BD')}
                </span>
              </div>
            </div>

            {/* Main Order Button */}
            <button
              onClick={handleOrderNow}
              className="w-full bg-[#5E6A45] hover:bg-[#485333] active:scale-[0.98] text-white text-base sm:text-lg font-black py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer mt-2"
            >
              <Zap className="w-5 h-5 fill-white text-amber-300" />
              <span>এখনই অর্ডার করুন</span>
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-[#F4F4F5] p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-[#374151]">
                <Truck className="w-4 h-4 text-[#5E6A45] shrink-0" />
                <span>১-৩ দিনে হোম ডেলিভারি</span>
              </div>
              <div className="bg-[#F4F4F5] p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-[#374151]">
                <ShieldCheck className="w-4 h-4 text-[#5E6A45] shrink-0" />
                <span>ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="bg-[#F4F4F5] p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-[#374151]">
                <RotateCcw className="w-4 h-4 text-[#5E6A45] shrink-0" />
                <span>৭ দিনের সহজ রিটার্ন</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs Container */}
      <div className="bg-white border border-[#E8E3D9] rounded-3xl p-4 sm:p-8 shadow-xs space-y-6">
        {/* Navigation Tabs Header */}
        <div className="flex border-b border-[#E8E3D9] overflow-x-auto gap-4 sm:gap-8 text-xs sm:text-sm font-bold text-[#6B7264] pb-2">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-2.5 transition-colors relative whitespace-nowrap cursor-pointer ${
              activeTab === 'desc'
                ? 'text-[#5E6A45] font-black border-b-2 border-[#5E6A45]'
                : 'hover:text-[#1F241E]'
            }`}
          >
            প্রোডাক্ট বিবরণ
          </button>
          <button
            onClick={() => setActiveTab('spec')}
            className={`pb-2.5 transition-colors relative whitespace-nowrap cursor-pointer ${
              activeTab === 'spec'
                ? 'text-[#5E6A45] font-black border-b-2 border-[#5E6A45]'
                : 'hover:text-[#1F241E]'
            }`}
          >
            স্পেসিফিকেশন ({product.specifications?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`pb-2.5 transition-colors relative whitespace-nowrap cursor-pointer ${
              activeTab === 'delivery'
                ? 'text-[#5E6A45] font-black border-b-2 border-[#5E6A45]'
                : 'hover:text-[#1F241E]'
            }`}
          >
            ডেলিভারি ও রিটার্ন
          </button>
          <button
            onClick={() => setActiveTab('guarantee')}
            className={`pb-2.5 transition-colors relative whitespace-nowrap cursor-pointer ${
              activeTab === 'guarantee'
                ? 'text-[#5E6A45] font-black border-b-2 border-[#5E6A45]'
                : 'hover:text-[#1F241E]'
            }`}
          >
            আমাদের গ্যারান্টি
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'desc' && (
            <div className="space-y-8">
              {/* Special Guarantee Yellow Alert Box */}
              <div className="bg-[#FFFDF5] border border-[#E6DBBF] p-5 rounded-2xl space-y-3 shadow-2xs">
                <h3 className="font-extrabold text-[#1F241E] text-sm sm:text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#5E6A45]" />
                  <span>কেন কীনোমার্ট থেকে কেনাকাটা করবেন?</span>
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-[#3D4738] font-medium pl-1">
                  <li className="flex items-center gap-2">• ১০০% অরিজিনাল অফিশিয়াল বা ইম্পোর্টেড প্রিমিয়াম গ্যাজেট</li>
                  <li className="flex items-center gap-2">• সরাসরি প্রস্তুতকারক ও ইম্পোর্টার থেকে সংগৃহীত</li>
                  <li className="flex items-center gap-2">• দ্রুততম সময়ে সারা বাংলাদেশে ক্যাশ অন হোম ডেলিভারি</li>
                  <li className="flex items-center gap-2">• ডেলিভারিম্যানের সামনে চেক করে দেখে নেওয়ার সুযোগ</li>
                </ul>
              </div>

              {/* Main Description Text */}
              <div className="text-xs sm:text-sm text-[#3D4738] leading-relaxed whitespace-pre-line font-medium space-y-2">
                <p>{product.shortDescription}</p>
                <p>{product.longDescription}</p>
              </div>

              {/* Real Product Gallery Posters / Photos */}
              <div className="space-y-4 border-t border-[#E8E3D9] pt-6">
                <h3 className="font-black text-[#1F241E] text-base sm:text-lg flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#5E6A45]" />
                  <span>প্রোডাক্টের বাস্তব ছবিসমূহ (গ্যালারি)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square w-full rounded-2xl overflow-hidden border border-[#E8E3D9] bg-[#FAF8F5] shadow-2xs hover:shadow-md transition-shadow"
                    >
                      <img
                        src={img}
                        alt={`Real Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Video Review / Demo Frame */}
              <div className="space-y-4 border-t border-[#E8E3D9] pt-6">
                <h3 className="font-black text-[#1F241E] text-base sm:text-lg flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-red-600" />
                  <span>প্রোডাক্টের ভিডিও রিভিউ / ডেমো</span>
                </h3>

                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-[#E8E3D9] bg-black shadow-md">
                  <iframe
                    src={getEmbedUrl(product.videoUrl)}
                    title="Product Video Review"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'spec' && (
            <div className="space-y-4">
              {product.specifications && product.specifications.length > 0 ? (
                <div className="border border-[#E8E3D9] rounded-2xl overflow-hidden divide-y divide-[#E8E3D9]">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="flex p-3 sm:p-4 text-xs sm:text-sm bg-white">
                      <span className="w-1/3 font-black text-[#1F241E]">{spec.key}</span>
                      <span className="w-2/3 text-[#4A5343] font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6B7264] italic">কোনো অতিরিক্ত স্পেসিফিকেশন দেওয়া হয়নি।</p>
              )}
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-3 text-xs sm:text-sm text-[#3D4738] font-medium leading-relaxed">
              <p>• <strong>ঢাকা সিটি এলাকা:</strong> ১ দিনে ক্যাশ অন হোম ডেলিভারি (চার্জ ৳৬০)</p>
              <p>• <strong>ঢাকার বাইরে সারা দেশ:</strong> ২-৩ দিনে ক্যাশ অন ডেলিভারি (চার্জ ৳১২০)</p>
              <p>• প্রোডাক্ট ডেলিভারিম্যানের থেকে বুঝে পাওয়ার পর চেক করে মূল্য পরিশোধ করবেন।</p>
            </div>
          )}

          {activeTab === 'guarantee' && (
            <div className="space-y-3 text-xs sm:text-sm text-[#3D4738] font-medium leading-relaxed">
              <p>• ১০০% অরিজিনাল ও ইনট্যাক্ট গ্যাজেটের গ্যারান্টি।</p>
              <p>• কোনো ধরনের ম্যানুফ্যাকচারিং ত্রুটি থাকলে ৭ দিনের মধ্যে সহজ রিটার্ন ও রিপ্লেসমেন্ট।</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl sm:text-2xl font-black text-[#1F241E]">
          সম্পর্কিত অন্যান্য গ্যাজেট
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {relatedProducts.map((relProduct) => (
            <div
              key={relProduct.id}
              onClick={() => {
                setSelectedProduct(relProduct);
                setActiveClientPage('product-detail');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <ProductCard product={relProduct} />
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Trust Badges Grid */}
      <BenefitsGrid />

      {/* Product Details Tabs Container */}
      <div className="bg-white border border-[#E8E3D9] rounded-3xl p-4 sm:p-8 shadow-xs space-y-6">
        {/* Navigation Tabs Header */}
        <div className="flex border-b border-[#E8E3D9] overflow-x-auto gap-4 sm:gap-8 text-xs sm:text-sm font-bold text-[#6B7264] pb-2">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-2.5 transition-colors relative whitespace-nowrap cursor-pointer ${
              activeTab === 'desc'
                ? 'text-[#5E6A45] font-black border-b-2 border-[#5E6A45]'
                : 'hover:text-[#1F241E]'
            }`}
          >
            প্রোডাক্ট বিবরণ
          </button>
          <button
            onClick={() => setActiveTab('spec')}
            className={`pb-2.5 transition-colors relative whitespace-nowrap cursor-pointer ${
              activeTab === 'spec'
                ? 'text-[#5E6A45] font-black border-b-2 border-[#5E6A45]'
                : 'hover:text-[#1F241E]'
            }`}
          >
            স্পেসিফিকেশন ({product.specifications?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`pb-2.5 transition-colors relative whitespace-nowrap cursor-pointer ${
              activeTab === 'delivery'
                ? 'text-[#5E6A45] font-black border-b-2 border-[#5E6A45]'
                : 'hover:text-[#1F241E]'
            }`}
          >
            ডেলিভারি ও রিটার্ন
          </button>
          <button
            onClick={() => setActiveTab('guarantee')}
            className={`pb-2.5 transition-colors relative whitespace-nowrap cursor-pointer ${
              activeTab === 'guarantee'
                ? 'text-[#5E6A45] font-black border-b-2 border-[#5E6A45]'
                : 'hover:text-[#1F241E]'
            }`}
          >
            আমাদের গ্যারান্টি
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'desc' && (
            <div className="space-y-8">
              {/* Special Guarantee Yellow Alert Box */}
              <div className="bg-[#FFFDF5] border border-[#E6DBBF] p-5 rounded-2xl space-y-3 shadow-2xs">
                <h3 className="font-extrabold text-[#1F241E] text-sm sm:text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#5E6A45]" />
                  <span>কেন কীনোমার্ট থেকে কেনাকাটা করবেন?</span>
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-[#3D4738] font-medium pl-1">
                  <li className="flex items-center gap-2">• ১০০% অরিজিনাল অফিশিয়াল বা ইম্পোর্টেড প্রিমিয়াম গ্যাজেট</li>
                  <li className="flex items-center gap-2">• সরাসরি প্রস্তুতকারক ও ইম্পোর্টার থেকে সংগৃহীত</li>
                  <li className="flex items-center gap-2">• দ্রুততম সময়ে সারা বাংলাদেশে ক্যাশ অন হোম ডেলিভারি</li>
                  <li className="flex items-center gap-2">• ডেলিভারিম্যানের সামনে চেক করে দেখে নেওয়ার সুযোগ</li>
                </ul>
              </div>

              {/* Main Description Text */}
              <div className="text-xs sm:text-sm text-[#3D4738] leading-relaxed whitespace-pre-line font-medium space-y-2">
                <p>{product.shortDescription}</p>
                <p>{product.longDescription}</p>
              </div>

              {/* Real Product Gallery Posters / Photos */}
              <div className="space-y-4 border-t border-[#E8E3D9] pt-6">
                <h3 className="font-black text-[#1F241E] text-base sm:text-lg flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#5E6A45]" />
                  <span>প্রোডাক্টের বাস্তব ছবিসমূহ (গ্যালারি)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square w-full rounded-2xl overflow-hidden border border-[#E8E3D9] bg-[#FAF8F5] shadow-2xs hover:shadow-md transition-shadow"
                    >
                      <img
                        src={img}
                        alt={`Real Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Video Review / Demo Frame */}
              <div className="space-y-4 border-t border-[#E8E3D9] pt-6">
                <h3 className="font-black text-[#1F241E] text-base sm:text-lg flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-red-600" />
                  <span>প্রোডাক্টের ভিডিও রিভিউ / ডেমো</span>
                </h3>

                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-[#E8E3D9] bg-black shadow-md">
                  <iframe
                    src={getEmbedUrl(product.videoUrl)}
                    title="Product Video Review"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'spec' && (
            <div className="space-y-4">
              {product.specifications && product.specifications.length > 0 ? (
                <div className="border border-[#E8E3D9] rounded-2xl overflow-hidden divide-y divide-[#E8E3D9]">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="flex p-3 sm:p-4 text-xs sm:text-sm bg-white">
                      <span className="w-1/3 font-black text-[#1F241E]">{spec.key}</span>
                      <span className="w-2/3 text-[#4A5343] font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6B7264] italic">কোনো অতিরিক্ত স্পেসিফিকেশন দেওয়া হয়নি।</p>
              )}
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-3 text-xs sm:text-sm text-[#3D4738] font-medium leading-relaxed">
              <p>• <strong>ঢাকা সিটি এলাকা:</strong> ১ দিনে ক্যাশ অন হোম ডেলিভারি (চার্জ ৳৬০)</p>
              <p>• <strong>ঢাকার বাইরে সারা দেশ:</strong> ২-৩ দিনে ক্যাশ অন ডেলিভারি (চার্জ ৳১২০)</p>
              <p>• প্রোডাক্ট ডেলিভারিম্যানের থেকে বুঝে পাওয়ার পর চেক করে মূল্য পরিশোধ করবেন।</p>
            </div>
          )}

          {activeTab === 'guarantee' && (
            <div className="space-y-3 text-xs sm:text-sm text-[#3D4738] font-medium leading-relaxed">
              <p>• ১০০% অরিজিনাল ও ইনট্যাক্ট গ্যাজেটের গ্যারান্টি।</p>
              <p>• কোনো ধরনের ম্যানুফ্যাকচারিং ত্রুটি থাকলে ৭ দিনের মধ্যে সহজ রিটার্ন ও রিপ্লেসমেন্ট।</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl sm:text-2xl font-black text-[#1F241E]">
          সম্পর্কিত অন্যান্য গ্যাজেট
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {relatedProducts.map((relProduct) => (
            <div
              key={relProduct.id}
              onClick={() => {
                setSelectedProduct(relProduct);
                setActiveClientPage('product-detail');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <ProductCard product={relProduct} />
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Trust Badges Grid */}
      <BenefitsGrid />

      {/* Mobile Sticky Order Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E8E3D9] p-3 shadow-2xl z-40 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-gray-500 block">মোট মূল্য ({quantity}টি):</span>
          <span className="text-base font-black text-[#5E6A45]">
            ৳{totalPrice.toLocaleString('bn-BD')}
          </span>
        </div>
        <button
          onClick={handleOrderNow}
          className="flex-1 bg-[#5E6A45] hover:bg-[#485333] active:scale-95 text-white font-extrabold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-white text-amber-300" />
          <span>এখনই অর্ডার করুন</span>
        </button>
      </div>

      {/* Fullscreen Image Zoom Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute -top-12 right-0 text-white font-bold text-xs sm:text-sm bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full cursor-pointer"
            >
              ✕ বন্ধ করুন
            </button>
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full max-h-[82vh] object-contain rounded-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
