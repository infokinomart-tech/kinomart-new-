import React, { useState, useEffect } from 'react';
import { Product, Review } from '../types';
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
  Flame,
  Bell,
  BellRing,
  AlertCircle
} from 'lucide-react';
import { ProductCard } from './ProductCard';

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
  const [activeTab, setActiveTab] = useState<'desc' | 'spec' | 'delivery' | 'reviews' | 'guarantee'>('desc');
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);

  // Hover Zoom State
  const [isHovered, setIsHovered] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Reviews State
  const [reviewsList, setReviewsList] = useState<Review[]>(product.reviews || []);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRating, setReviewerRating] = useState(5);
  const [reviewerComment, setReviewerComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Notify Me State for Out-of-Stock Products
  const [notifyContact, setNotifyContact] = useState('');
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  const isOutOfStock = product.stock <= 0 || product.status === 'INACTIVE';
  const isLowStock = !isOutOfStock && product.stock > 0 && product.stock <= 10;

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyContact.trim()) return;

    try {
      const existingStr = localStorage.getItem('stock_notifications');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      existing.push({
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        contact: notifyContact.trim(),
        date: new Date().toISOString()
      });
      localStorage.setItem('stock_notifications', JSON.stringify(existing));
    } catch {
      // ignore
    }

    setNotifySubmitted(true);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewerComment.trim()) return;

    const newRev: Review = {
      id: Date.now().toString(),
      userName: reviewerName.trim(),
      rating: reviewerRating,
      comment: reviewerComment.trim(),
      date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
      isVerifiedPurchase: true
    };

    setReviewsList([newRev, ...reviewsList]);
    setReviewerName('');
    setReviewerComment('');
    setReviewerRating(5);
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  // Timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 23,
    minutes: 56,
    seconds: 43
  });

  useEffect(() => {
    const updateTime = () => {
      if (product.timerEndTime) {
        const target = new Date(product.timerEndTime).getTime();
        const now = new Date().getTime();
        const diff = Math.max(0, target - now);

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateTime();

    const timer = setInterval(() => {
      if (product.timerEndTime) {
        updateTime();
      } else {
        setTimeLeft((prev) => {
          if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
          if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
          if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
          if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
          return prev;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [product.timerEndTime]);

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
          <div
            className="relative aspect-square w-full bg-[#FFDC33] rounded-2xl overflow-hidden border border-[#E8E3D9] shadow-inner group cursor-zoom-in"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setIsZoomOpen(true)}
          >
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-200 ease-out"
              style={{
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                transform: isHovered ? 'scale(2.4)' : 'scale(1)',
              }}
              referrerPolicy="no-referrer"
            />




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
              {isOutOfStock ? (
                <span className="bg-red-100 text-red-700 text-xs font-black px-3.5 py-1 rounded-full border border-red-200 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  আউট অব স্টক
                </span>
              ) : isLowStock ? (
                <span className="bg-[#FEF3C7] text-[#B45309] text-xs font-black px-3.5 py-1 rounded-full border border-[#FDE68A] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-[#D97706]" />
                  লিমিটেড স্টক ({toBnNum(product.stock)} টি বাকি)
                </span>
              ) : (
                <span className="bg-[#DCFCE7] text-[#15803D] text-xs font-black px-3.5 py-1 rounded-full border border-[#BBF7D0]">
                  ইন স্টক ({toBnNum(product.stock || 50)} টি এভেলেবল)
                </span>
              )}
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

            {/* Low Stock Alert Banner (Shows when stock <= 10) */}
            {isLowStock && (
              <div className="bg-[#FFFDF3] border border-[#FDE68A] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-[#FEF3C7] border border-[#FDE68A]/80 text-[#D97706] flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-[#D97706]" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs sm:text-sm font-extrabold text-[#92400E] flex items-center gap-1">
                    <span>🔥</span>
                    <span>স্টক শেষ হওয়ার আগেই অর্ডার করুন! (Limited Stock)</span>
                  </div>
                  <div className="text-xs text-[#B45309] font-medium">
                    গুদামে আর মাত্র <strong className="font-black text-[#92400E]">{toBnNum(product.stock)} টি</strong> পিস রয়েছে।
                  </div>
                </div>
              </div>
            )}

            {/* Offer Countdown Banner (Shows only if enabled in Admin Panel) */}
            {Boolean(product.hasTimer) && (
              <div className="bg-[#23311A] text-white p-3.5 rounded-2xl border border-[#3B4D2B] flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#3B4D2B] flex items-center justify-center text-amber-400 shrink-0">
                    <Flame className="w-5 h-5 fill-amber-400" />
                  </div>
                  <div>
                    <div className="font-black text-amber-300 text-xs sm:text-sm">
                      {product.timerTitle || 'অফারটি শেষ হতে বাকি:'}
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
            )}

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

            {/* CTA Section: Notify Me (if out of stock) or Quantity + Order Button */}
            {isOutOfStock ? (
              <div id="notify-me-box" className="bg-[#FFFDF5] border border-[#E6DBBF] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs mt-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5E6A45]/15 text-[#5E6A45] flex items-center justify-center shrink-0">
                    <BellRing className="w-5 h-5 text-[#5E6A45]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#1F241E] text-sm sm:text-base">
                      প্রোডাক্টটি আপাতত আউট অব স্টক!
                    </h3>
                    <p className="text-xs text-[#5D6656] font-medium mt-0.5">
                      স্টকে আসামাত্রই নোটিফিকেশন পেতে আপনার ইমেইল বা মোবাইল নম্বর দিন।
                    </p>
                  </div>
                </div>

                {notifySubmitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm p-3.5 rounded-xl font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>ধন্যবাদ! প্রোডাক্টটি স্টকে আসামাত্রই আপনাকে ইমেইল/মেসেজে নোটিফাই করা হবে।</span>
                  </div>
                ) : (
                  <form onSubmit={handleNotifySubmit} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-[#1F241E] mb-1">
                        ইমেইল অথবা মোবাইল নম্বর <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={notifyContact}
                          onChange={(e) => setNotifyContact(e.target.value)}
                          placeholder="যেমন: 01700000000 বা email@example.com"
                          className="w-full bg-white border border-[#D5CEBF] rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-[#1F241E] focus:outline-none focus:ring-2 focus:ring-[#5E6A45]/30 focus:border-[#5E6A45]"
                        />
                        <Bell className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#5E6A45] hover:bg-[#485333] active:scale-[0.98] text-white text-sm sm:text-base font-black py-3 px-5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <BellRing className="w-4.5 h-4.5 text-amber-300" />
                      <span>স্টকে ফিরলে জানান (Notify Me)</span>
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <>
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
              </>
            )}

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
            onClick={() => setActiveTab('reviews')}
            className={`pb-2.5 transition-colors relative whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'text-[#5E6A45] font-black border-b-2 border-[#5E6A45]'
                : 'hover:text-[#1F241E]'
            }`}
          >
            <span>কাস্টমার রিভিউ</span>
            <span className="inline-flex items-center justify-center bg-[#EAE8E1] text-[#3D4738] text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[20px]">
              {reviewsList.length}
            </span>
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

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Rating Summary Header */}
              <div className="bg-[#FAF8F5] border border-[#E8E3D9] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center sm:text-left">
                    <span className="text-3xl sm:text-4xl font-black text-[#1F241E]">
                      {reviewsList.length > 0
                        ? (
                            reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length
                          ).toFixed(1)
                        : (product.rating || 5.0).toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500 font-bold block">/ ৫.০</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 mb-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#4A5343]">
                      মোট {reviewsList.length}টি কাস্টমার রিভিউ
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const el = document.getElementById('review-form-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-[#5E6A45] hover:bg-[#485333] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer"
                >
                  + রিভিউ লিখুন
                </button>
              </div>

              {/* Submit Review Form */}
              <div
                id="review-form-section"
                className="bg-white border border-[#E8E3D9] rounded-2xl p-5 space-y-4 shadow-2xs"
              >
                <h3 className="font-extrabold text-[#1F241E] text-sm sm:text-base">
                  আপনার রিভিউ লিখুন
                </h3>

                {reviewSubmitted && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm p-3.5 rounded-xl font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>আপনার রিভিউটি সফলভাবে যুক্ত হয়েছে! ধন্যবাদ।</span>
                  </div>
                )}

                <form onSubmit={handleAddReview} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1F241E] mb-1">
                      আপনার নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="যেমন: তানভীর আহমেদ"
                      className="w-full bg-[#FAF8F5] border border-[#D5CEBF] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1F241E] focus:outline-none focus:ring-2 focus:ring-[#5E6A45]/30 focus:border-[#5E6A45]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1F241E] mb-1">
                      রেটিং দিন <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5 cursor-pointer">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setReviewerRating(starVal)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              starVal <= reviewerRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-gray-600 ml-2">
                        ({reviewerRating} Star)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1F241E] mb-1">
                      আপনার মতামত বা অভিজ্ঞতা <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={reviewerComment}
                      onChange={(e) => setReviewerComment(e.target.value)}
                      placeholder="প্রোডাক্টের কোয়ালিটি ও সার্ভিস সম্পর্কে বিস্তারিত লিখুন..."
                      className="w-full bg-[#FAF8F5] border border-[#D5CEBF] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1F241E] focus:outline-none focus:ring-2 focus:ring-[#5E6A45]/30 focus:border-[#5E6A45]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#5E6A45] hover:bg-[#485333] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    রিভিউ পোস্ট করুন
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-[#1F241E] text-sm sm:text-base border-b border-[#E8E3D9] pb-2">
                  সকল রিভিউ ({reviewsList.length})
                </h3>

                {reviewsList.length === 0 ? (
                  <div className="text-center py-8 bg-[#FAF8F5] border border-dashed border-[#D5CEBF] rounded-2xl space-y-1">
                    <p className="text-xs sm:text-sm font-bold text-[#6B7264]">
                      এখনো কোনো কাস্টমার রিভিউ নেই।
                    </p>
                    <p className="text-xs text-[#909886]">
                      আপনার মতামত শেয়ার করতে ওপরের ফর্মে প্রথম রিভিউ লিখুন!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviewsList.map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-[#FAF8F5] border border-[#E8E3D9] rounded-2xl p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#5E6A45]/15 text-[#5E6A45] font-black text-xs flex items-center justify-center">
                              {rev.userName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-extrabold text-[#1F241E] text-xs sm:text-sm block">
                                {rev.userName}
                              </span>
                              {rev.isVerifiedPurchase && (
                                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                                  ভেরিফাইড ক্রেতা
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-[#889280]">
                            {rev.date}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>

                        <p className="text-xs sm:text-sm text-[#3D4738] font-medium leading-relaxed">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

      {/* High-Converting Animated CTA Banner matching KinoMart Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1F241E] via-[#2A3324] to-[#121611] p-8 sm:p-12 text-center text-white shadow-2xl border border-[#3E4935]/50 my-6">
        {/* Ambient Animated Glow Effects */}
        <div className="absolute -top-20 -left-20 w-56 h-56 bg-[#5E6A45]/30 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          {/* Animated Heading */}
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md animate-pulse">
            আজই অর্ডার করুন!
          </h2>

          {/* Subheading */}
          <p className="text-xs sm:text-base text-gray-300 font-medium leading-relaxed max-w-lg mx-auto">
            সীমিত স্টক — দেরি না করে এখনই নিশ্চিত করুন আপনার অর্ডার
          </p>

          {/* Glowing Animated Order Button */}
          <div className="pt-3">
            {isOutOfStock ? (
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('notify-me-box');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2.5 bg-[#D9A74A] hover:bg-[#C99639] active:scale-95 text-[#1F241E] font-black text-sm sm:text-base py-3.5 px-7 rounded-2xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-all cursor-pointer"
              >
                <BellRing className="w-5 h-5 text-[#1F241E]" />
                <span>স্টকে ফিরলে জানান (Notify Me)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOrderNow}
                className="inline-flex items-center justify-center gap-2.5 bg-[#D9A74A] hover:bg-[#C99639] active:scale-95 text-[#1F241E] font-black text-sm sm:text-lg py-3.5 sm:py-4 px-8 sm:px-10 rounded-2xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.03] transition-all cursor-pointer group"
              >
                <Zap className="w-5 h-5 fill-[#1F241E] text-[#1F241E] group-hover:scale-125 transition-transform" />
                <span>৳{totalPrice.toLocaleString('bn-BD')} — এখনই কিনুন</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Order Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E8E3D9] p-3 shadow-2xl z-40 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-gray-500 block">স্ট্যাটাস:</span>
          <span className={`text-sm font-black ${isOutOfStock ? 'text-red-600' : 'text-[#5E6A45]'}`}>
            {isOutOfStock ? 'আউট অব স্টক' : `৳${totalPrice.toLocaleString('bn-BD')}`}
          </span>
        </div>
        {isOutOfStock ? (
          <button
            onClick={() => {
              const el = document.getElementById('notify-me-box');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex-1 bg-[#374151] hover:bg-[#1F241E] active:scale-95 text-white font-extrabold text-xs sm:text-sm py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <BellRing className="w-4 h-4 text-amber-300" />
            <span>স্টকে ফিরলে জানান</span>
          </button>
        ) : (
          <button
            onClick={handleOrderNow}
            className="flex-1 bg-[#5E6A45] hover:bg-[#485333] active:scale-95 text-white font-extrabold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-white text-amber-300" />
            <span>এখনই অর্ডার করুন</span>
          </button>
        )}
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
