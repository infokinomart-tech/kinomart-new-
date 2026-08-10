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
  AlertCircle,
  FileText,
  Maximize2,
  MessageSquareQuote,
  X
} from 'lucide-react';
import { ProductCard } from './ProductCard';
import { BundleSelector } from './BundleSelector';
import { getEffectiveBundles } from '../lib/bundleUtils';
import { trackViewItem, trackAddToCart } from '../lib/dataLayer';

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

  const effectiveBundles = getEffectiveBundles(product);
  const defaultBundle = effectiveBundles.find((b) => b.isPopular) || effectiveBundles[0];

  const [selectedBundleId, setSelectedBundleId] = useState<string>(defaultBundle?.id || '');
  const selectedBundle = effectiveBundles.find((b) => b.id === selectedBundleId) || defaultBundle;

  const [selectedImage, setSelectedImage] = useState<string>(product.thumbnail);
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0] : 'MINT'
  );
  const [quantity, setQuantity] = useState<number>(selectedBundle?.quantity || 1);

  // Sync state whenever product changes
  useEffect(() => {
    setSelectedImage(product.thumbnail || product.gallery?.[0] || '');
    setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : 'MINT');
    const eff = getEffectiveBundles(product);
    const def = eff.find((b) => b.isPopular) || eff[0];
    setSelectedBundleId(def?.id || '');
    setQuantity(def?.quantity || 1);

    // Track view_item event
    trackViewItem(product, def?.quantity || 1, product.colors && product.colors.length > 0 ? product.colors[0] : undefined);
  }, [product]);

  const [reviewSlideIdx, setReviewSlideIdx] = useState<number>(0);

  const reviewImagesList = (product.reviewImages && product.reviewImages.length > 0)
    ? product.reviewImages
    : [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&auto=format&fit=crop&q=80'
      ];

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
  const defaultReviewsList: Review[] = [
    {
      id: 'demo-rev-1',
      userName: 'Rahat Islam',
      userRole: 'CEO, AURORA TECH',
      rating: 5,
      comment: 'PixelCraft did an exceptional job rebuilding our marketing website and brand guides. Our conversion rate increased by 40% in the first month! Highly recommended.'
    },
    {
      id: 'demo-rev-2',
      userName: 'Nusrat Jahan',
      userRole: 'COURSE STUDENT',
      rating: 5,
      comment: 'The Web Development course is unbelievably structured. The manual bKash enrollment process was approved within 15 minutes, and I immediately got access to the Google Drive full of high-quality lessons. Best decision ever!'
    },
    {
      id: 'demo-rev-3',
      userName: 'Mahmudul Hasan',
      userRole: 'INDEPENDENT CONTENT CREATOR',
      rating: 5,
      comment: 'I bought their UI/UX secrets ebook. The design templates and spacing guidelines inside are gold. Totally worth every single taka!'
    },
    {
      id: 'demo-rev-4',
      userName: 'Tanvir Ahmed',
      userRole: 'VERIFIED BUYER',
      rating: 5,
      comment: 'কীনোমার্ট থেকে প্রোডাক্টটি অর্ডার করেছিলাম। প্রিমিয়াম কোয়ালিটি, আসল গ্যাজেট এবং অসাধারণ ফাস্ট সার্ভিস পেয়ে আমি খুবই সন্তুষ্ট!'
    }
  ];

  const activeReviewsList = (product.reviews && product.reviews.length > 0)
    ? product.reviews
    : defaultReviewsList;

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

  const unitPrice = product.discountPrice || product.price;
  const unitOriginalPrice = product.discountPrice ? product.price : null;

  const displayPrice = selectedBundle
    ? selectedBundle.price
    : unitPrice * quantity;

  const displayOriginalPrice = selectedBundle
    ? selectedBundle.originalPrice
    : (unitOriginalPrice ? unitOriginalPrice * quantity : null);

  const totalPrice = displayPrice;

  // Variants list
  const variantList = (product.colors && Array.isArray(product.colors))
    ? product.colors.filter((c) => c && typeof c === 'string' && c.trim() !== '')
    : [];

  const hasShortDesc = Boolean(product.shortDescription && product.shortDescription.trim() !== '');
  const hasLongDesc = Boolean(product.longDescription && product.longDescription.trim() !== '');
  const hasDescription = hasShortDesc || hasLongDesc;

  const validSpecs = (product.specifications || []).filter(
    (s) => s && (s.key?.trim() || s.value?.trim())
  );
  const hasSpecs = validSpecs.length > 0;

  const validGallery = (product.gallery || []).filter(
    (img) => img && typeof img === 'string' && img.trim() !== ''
  );
  const hasGallery = validGallery.length > 0;

  const hasVideo = Boolean(product.videoUrl && product.videoUrl.trim() !== '');

  const hasAnyDetails = hasDescription || hasSpecs || hasGallery || hasVideo;

  // Handle order now
  const handleOrderNow = () => {
    trackAddToCart(product, quantity, selectedColor);
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
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-8 sm:pb-12 space-y-6 animate-fadeIn">
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
            className="relative aspect-square w-full bg-[#FFDC33] rounded-2xl overflow-hidden border border-[#E8E3D9] shadow-inner group cursor-crosshair"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
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
                <span className="bg-[#D97706]/10 text-[#92400E] text-xs font-black px-3.5 py-1 rounded-full border border-[#D97706]/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
                  লিমিটেড স্টক ({toBnNum(product.stock)} টি বাকি)
                </span>
              ) : (
                <span className="bg-[#627048]/12 text-[#3D472B] text-xs font-black px-3.5 py-1 rounded-full border border-[#627048]/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#627048] animate-pulse" />
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
            <div className="bg-[#F4F4F5] rounded-2xl p-4 sm:p-5 border border-gray-200/60 flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-[#1F241E]">
                  ৳{displayPrice.toLocaleString('bn-BD')}
                </span>
                {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                  <span className="text-base sm:text-lg text-gray-400 line-through font-bold">
                    ৳{displayOriginalPrice.toLocaleString('bn-BD')}
                  </span>
                )}
              </div>
              {selectedBundle && (
                <span className="text-xs sm:text-sm font-extrabold bg-[#5E6A45]/15 text-[#5E6A45] px-3.5 py-1.5 rounded-xl border border-[#5E6A45]/20">
                  {selectedBundle.title}
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
            {hasShortDesc && (
              <div className="bg-[#F4F4F5] rounded-2xl p-4 text-xs sm:text-sm text-[#374151] font-medium leading-relaxed border border-gray-200/50">
                {product.shortDescription}
              </div>
            )}

            {/* Color / Variant Selection */}
            {variantList.length > 0 && (
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
                {/* Bundle Package Deals Selection */}
                <BundleSelector
                  bundles={effectiveBundles}
                  selectedBundleId={selectedBundleId}
                  onSelectBundle={(b) => {
                    setSelectedBundleId(b.id);
                    setQuantity(b.quantity);
                  }}
                />

                {/* Quantity Selector & Total Price matching demo image */}
                <div className="space-y-1.5 pt-2 pb-1">
                  <label className="block text-xs sm:text-sm font-extrabold text-[#1F241E]">
                    পরিমাণ (Quantity):
                  </label>
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Quantity Pill Box */}
                    <div className="flex items-center justify-between w-32 sm:w-36 bg-[#F5F4EE] border-2 border-[#D5DCBF] rounded-full px-3.5 py-1.5 sm:py-2 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => {
                          const newQty = Math.max(1, quantity - 1);
                          setQuantity(newQty);
                          const matched = effectiveBundles.find(b => b.quantity === newQty);
                          if (matched) setSelectedBundleId(matched.id);
                          else setSelectedBundleId('');
                        }}
                        disabled={quantity <= 1}
                        className="w-7 h-7 flex items-center justify-center text-[#3D472B] hover:text-black font-black text-xl transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer select-none"
                      >
                        −
                      </button>
                      <span className="font-black text-[#1F241E] text-base sm:text-lg select-none min-w-[20px] text-center">
                        {toBnNum(quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const newQty = quantity + 1;
                          setQuantity(newQty);
                          const matched = effectiveBundles.find(b => b.quantity === newQty);
                          if (matched) setSelectedBundleId(matched.id);
                          else setSelectedBundleId('');
                        }}
                        className="w-7 h-7 flex items-center justify-center text-[#3D472B] hover:text-black font-black text-xl transition-all active:scale-90 cursor-pointer select-none"
                      >
                        +
                      </button>
                    </div>

                    {/* Total Price Right Beside */}
                    <div className="text-sm sm:text-base text-[#1F241E] flex items-center gap-1.5">
                      <span className="font-bold text-gray-700">মোট দাম:</span>
                      <span className="font-black text-[#1F241E] text-base sm:text-lg">
                        ৳{displayPrice.toLocaleString('bn-BD')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Order Button */}
                <button
                  onClick={handleOrderNow}
                  className="relative overflow-hidden w-full bg-[#485539] hover:bg-[#3C472E] active:scale-[0.98] text-white text-base sm:text-lg font-black py-3.5 sm:py-4 px-6 rounded-full flex items-center justify-center gap-2.5 shadow-xl shadow-[#485539]/30 border border-[#586847] transition-all cursor-pointer mt-2 animate-order-btn"
                >
                  {/* Shimmer Light Bar */}
                  <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none animate-order-shimmer" />

                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-[#FACC15] text-[#FACC15] animate-zap-pop shrink-0" />
                  <span className="relative z-10 tracking-wide font-extrabold text-white">এখনই অর্ডার করুন</span>
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
      {hasAnyDetails && (
        <div className="bg-white border border-[#E8E3D9] rounded-3xl p-4 sm:p-8 shadow-xs space-y-6">
          {/* Section Header */}
          <div className="border-b border-[#E8E3D9] pb-3">
            <h2 className="text-base sm:text-xl font-black text-[#1F241E] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#5E6A45]" />
              <span>প্রোডাক্টের বিস্তারিত তথ্য ও বিবরণ</span>
            </h2>
          </div>

          {/* Details Content */}
          <div className="space-y-8">
            {/* Main Description Text */}
            {hasDescription && (
              <div className="text-xs sm:text-sm text-[#3D4738] leading-relaxed whitespace-pre-line font-medium space-y-2">
                {hasShortDesc && <p>{product.shortDescription}</p>}
                {hasLongDesc && <p>{product.longDescription}</p>}
              </div>
            )}

            {/* Specifications Section */}
            {hasSpecs && (
              <div className="space-y-4 border-t border-[#E8E3D9] pt-6">
                <h3 className="font-black text-[#1F241E] text-base sm:text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#5E6A45]" />
                  <span>স্পেসিফিকেশন (Specifications)</span>
                </h3>

                <div className="border border-[#E8E3D9] rounded-2xl overflow-hidden divide-y divide-[#E8E3D9]">
                  {validSpecs.map((spec, i) => (
                    <div key={i} className="flex p-3 sm:p-4 text-xs sm:text-sm bg-white">
                      <span className="w-1/3 font-black text-[#1F241E]">{spec.key}</span>
                      <span className="w-2/3 text-[#4A5343] font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real Product Gallery Posters / Photos */}
            {hasGallery && (
              <div className="space-y-4 border-t border-[#E8E3D9] pt-6">
                <h3 className="font-black text-[#1F241E] text-base sm:text-lg flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#5E6A45]" />
                  <span>প্রোডাক্টের বাস্তব ছবিসমূহ (গ্যালারি)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {validGallery.map((img, idx) => (
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
            )}

            {/* Product Video Review / Demo Frame */}
            {hasVideo && (
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
            )}
          </div>
        </div>
      )}

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
                className="inline-flex items-center justify-center gap-2.5 bg-[#485539] hover:bg-[#3C472E] active:scale-95 text-white font-black text-base sm:text-lg py-3.5 sm:py-4 px-8 sm:px-10 rounded-full shadow-xl shadow-[#485539]/40 border border-[#586847] hover:scale-[1.03] transition-all cursor-pointer group"
              >
                <Zap className="w-5 h-5 fill-[#FACC15] text-[#FACC15] group-hover:scale-125 transition-transform" />
                <span className="text-white font-extrabold">৳{totalPrice.toLocaleString('bn-BD')} — এখনই অর্ডার করুন</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
