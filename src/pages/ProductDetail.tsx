import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  Star,
  Zap,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowRight,
  ChevronRight,
  Play,
  Image as ImageIcon,
  ZoomIn,
  CheckCircle2,
  MessageSquare,
  PlusCircle,
  User,
  ThumbsUp,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const getEmbedVideoUrl = (url?: string) => {
  if (!url) return '';
  const cleanUrl = url.trim();
  const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&autoplay=0`;
  }
  return cleanUrl;
};
import { Product, ProductReview } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { VariantSelector } from '../components/products/VariantSelector';
import { ProductCard } from '../components/products/ProductCard';
import { CountdownTimer } from '../components/CountdownTimer';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [qty, setQty] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping' | 'reviews'>('desc');
  const [reviews, setReviews] = useState<ProductReview[]>([]);

  // Review Form States
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewPhone, setNewReviewPhone] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  // Hover-to-zoom states
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPosition({ x, y });
  };

  const { openCheckout } = useCart();

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) {
      setReviewErrorMsg('অনুগ্রহ করে আপনার নাম এবং কমেন্ট/মতামত লিখুন');
      return;
    }
    if (!slug) return;
    try {
      setIsSubmittingReview(true);
      setReviewErrorMsg('');
      const res = await api.addProductReview(slug, {
        customer_name: newReviewName,
        rating: newReviewRating,
        comment: newReviewComment,
        phone: newReviewPhone
      });

      if (res.success) {
        setReviews(prev => [res.review, ...prev]);
        if (product) {
          setProduct({
            ...product,
            rating: res.new_rating,
            reviews_count: res.reviews_count
          });
        }
        setReviewSuccessMsg('ধন্যবাদ! আপনার রিভিউ সফলভাবে যুক্ত হয়েছে।');
        setNewReviewName('');
        setNewReviewPhone('');
        setNewReviewComment('');
        setIsReviewFormOpen(false);
        setTimeout(() => setReviewSuccessMsg(''), 5000);
      }
    } catch (err: any) {
      setReviewErrorMsg(err.message || 'রিভিউ জমা দিতে ব্যর্থ হয়েছে');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const location = useLocation();

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!slug) return;

      const preloaded = (location.state as any)?.product || api.getCachedProduct(slug);

      if (preloaded) {
        setProduct(preloaded);
        setSelectedImage(preloaded.images?.[0] || '');
        if (preloaded.variants && preloaded.variants.length > 0 && preloaded.variants[0].options?.length > 0) {
          setSelectedVariant(preloaded.variants[0].options[0]);
        }
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }

      try {
        const [data, fetchedReviews, allProds] = await Promise.all([
          api.getProduct(slug),
          api.getProductReviews(slug).catch(() => []),
          api.getProducts().catch(() => [])
        ]);

        setProduct(data);
        if (!preloaded) {
          setSelectedImage(data.images?.[0] || '');
          if (data.variants && data.variants.length > 0 && data.variants[0].options?.length > 0) {
            setSelectedVariant(data.variants[0].options[0]);
          }
        }

        setReviews(fetchedReviews);

        const related = allProds.filter(
          p => p.id !== data.id && (p.category_id === data.category_id || p.category_name === data.category_name)
        );
        setRelatedProducts(related.slice(0, 4));
      } catch (err) {
        console.error('Failed to load product details', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#6B7A4F] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-[#6B6B6B]">প্রোডাক্ট লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">প্রোডাক্ট পাওয়া যায়নি!</h2>
        <Link to="/products" className="inline-block px-6 py-2.5 rounded-xl bg-[#6B7A4F] text-white font-bold text-sm">
          সকল প্রোডাক্ট দেখুন
        </Link>
      </div>
    );
  }

  const price = Number(product.price || 0);
  const discountPrice = (product.discount_price !== null && product.discount_price !== undefined && product.discount_price !== '')
    ? Number(product.discount_price)
    : null;

  const hasDiscount = Boolean(discountPrice && discountPrice > 0 && discountPrice < price);
  const currentPrice = hasDiscount ? discountPrice! : price;

  const handleDirectBuy = () => {
    openCheckout(product, selectedVariant, qty);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-[#6B6B6B]">
        <Link to="/" className="hover:text-[#6B7A4F]">হোম</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-[#6B7A4F]">প্রোডাক্টস</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#1A1A1A] font-semibold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Display Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E3DA] shadow-xs">
        {/* Left: Images Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div
            className="relative aspect-square rounded-2xl overflow-hidden bg-[#F7F5EF] border border-[#E5E3DA] cursor-zoom-in group select-none shadow-xs"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              src={selectedImage || product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center pointer-events-none transition-transform duration-150 ease-out"
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      transform: 'scale(2.4)'
                    }
                  : {
                      transformOrigin: 'center center',
                      transform: 'scale(1)'
                    }
              }
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-[#C97B4A] text-white font-bold text-xs px-3 py-1 rounded-full shadow-md z-10 pointer-events-none">
                বিশেষ ছাড়
              </span>
            )}

            {/* Hover-to-zoom badge indicator */}
            <div
              className={`absolute bottom-3 right-3 bg-black/65 text-white backdrop-blur-xs text-[11px] px-2.5 py-1 rounded-full flex items-center space-x-1.5 transition-opacity duration-200 pointer-events-none z-10 ${
                isZoomed ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <ZoomIn className="w-3.5 h-3.5 text-[#E5E3DA]" />
              <span>ছবিতে মাউস রেখে জুম করুন</span>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all bg-[#F7F5EF] shrink-0 ${
                    selectedImage === img ? 'border-[#6B7A4F] shadow-sm' : 'border-[#E5E3DA] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Specs & Actions */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Category & Stock Pill */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-[#6B7A4F] uppercase tracking-wide">
                {product.category_name || 'গ্যাজেট'}
              </span>

              <div className="flex items-center space-x-2">
                {product.stock > 0 && product.stock <= (product.low_stock_threshold ?? 10) ? (
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center space-x-1 animate-pulse shadow-xs">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>লিমিটেড স্টক (মাত্র {product.stock} টি বাকি!)</span>
                  </span>
                ) : product.stock > 0 ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping mr-1" />
                    <span>ইন স্টক ({product.stock} টি এভেলেবল)</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center space-x-1">
                    <span>আউট অব স্টক</span>
                  </span>
                )}
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars (Clickable to switch to Reviews tab) */}
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className="flex items-center space-x-2 text-left hover:opacity-80 transition-opacity group cursor-pointer"
              title="কাস্টমার রিভিউ দেখতে ক্লিক করুন"
            >
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs text-[#6B6B6B] font-bold group-hover:text-[#6B7A4F] group-hover:underline">
                {product.rating ? product.rating.toFixed(1) : '4.9'} ({reviews.length || product.reviews_count || 0} টি রিভিউ)
              </span>
            </button>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E5E3DA] flex items-baseline space-x-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#6B7A4F]">
                <span className="text-[#6B7A4F] mr-0.5">৳</span>{(currentPrice || 0).toLocaleString('bn-BD')}
              </span>
              {hasDiscount && (
                <span className="text-sm sm:text-base text-[#6B6B6B] line-through font-medium">
                  ৳{(price || 0).toLocaleString('bn-BD')}
                </span>
              )}
            </div>

            {/* Countdown Offer Timer (If enabled in Admin Panel for this product) */}
            {product.timer_enabled && (
              <CountdownTimer
                title={product.timer_title || 'অফারটি শেষ হতে বাকি:'}
                endTime={product.timer_end_time}
                hours={product.timer_hours}
              />
            )}

            {/* Limited Stock Urgency Banner */}
            {product.stock > 0 && product.stock <= (product.low_stock_threshold ?? 10) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center space-x-3 text-amber-900 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-amber-600 animate-pulse" />
                </div>
                <div className="text-xs">
                  <span className="font-extrabold block text-amber-900">
                    🔥 স্টক শেষ হওয়ার আগেই অর্ডার করুন! (Limited Stock)
                  </span>
                  <span className="text-amber-700">
                    গুদামে আর মাত্র <strong>{product.stock} টি</strong> পিস রয়েছে।
                  </span>
                </div>
              </div>
            )}

            {/* Short Description (Below Price Box & Above Variant/Color) */}
            {product.short_description && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#F7F5EF] shadow-sm text-xs sm:text-sm text-[#222222] font-medium leading-relaxed">
                {product.short_description}
              </div>
            )}

            {/* Variant Selector */}
            {product.variants && (
              <VariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onSelectVariant={setSelectedVariant}
              />
            )}

            {/* Quantity Controls */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-[#1A1A1A]">পরিমাণ (Quantity):</label>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-[#6B7A4F]/30 rounded-xl bg-[#F7F5EF] shadow-sm">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-2.5 text-[#1A1A1A] hover:bg-[#6B7A4F]/10 rounded-l-xl transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 font-bold text-sm text-[#1A1A1A]">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="p-2.5 text-[#1A1A1A] hover:bg-[#6B7A4F]/10 rounded-r-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-xs text-[#6B6B6B]">
                  মোট দাম: <strong className="text-[#6B7A4F] font-black"><span className="text-[#6B7A4F] mr-0.5">৳</span>{(currentPrice * qty).toLocaleString('bn-BD')}</strong>
                </span>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-4">
              <button
                onClick={handleDirectBuy}
                className="w-full py-4 px-6 rounded-xl font-bold text-base bg-[#6B7A4F] text-white hover:bg-[#586640] transition-colors flex items-center justify-center space-x-2 shadow-lg active:scale-95"
              >
                <Zap className="w-5 h-5 fill-current" />
                <span>এখনই অর্ডার করুন</span>
              </button>
            </div>
          </div>

          {/* Quick Security & Delivery Guarantees */}
          <div className="border-t border-[#E5E3DA] pt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-[#6B6B6B]">
            <div className="flex flex-col items-center space-y-1 p-2 rounded-xl bg-[#F7F5EF]">
              <Truck className="w-4 h-4 text-[#6B7A4F]" />
              <span>১-৩ দিনে হোম ডেলিভারি</span>
            </div>
            <div className="flex flex-col items-center space-y-1 p-2 rounded-xl bg-[#F7F5EF]">
              <ShieldCheck className="w-4 h-4 text-[#6B7A4F]" />
              <span>ক্যাশ অন ডেলিভারি</span>
            </div>
            <div className="flex flex-col items-center space-y-1 p-2 rounded-xl bg-[#F7F5EF]">
              <RotateCcw className="w-4 h-4 text-[#6B7A4F]" />
              <span>৭ দিনের সহজ রিটার্ন</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Details Tabs */}
      <div className="bg-white rounded-3xl border border-[#E5E3DA] p-6 sm:p-8 space-y-6">
        <div className="flex border-b border-[#E5E3DA] space-x-4 sm:space-x-6 text-xs sm:text-sm font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'desc'
                ? 'border-[#6B7A4F] text-[#6B7A4F]'
                : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
            }`}
          >
            প্রোডাক্ট বিবরণ
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'specs'
                ? 'border-[#6B7A4F] text-[#6B7A4F]'
                : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
            }`}
          >
            <span>স্পেসিফিকেশন</span>
            {product.specifications && product.specifications.length > 0 && (
              <span className="text-[10px] bg-[#6B7A4F]/10 text-[#6B7A4F] px-1.5 py-0.5 rounded-full font-bold">
                {product.specifications.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'shipping'
                ? 'border-[#6B7A4F] text-[#6B7A4F]'
                : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
            }`}
          >
            ডেলিভারি ও রিটার্ন
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'reviews'
                ? 'border-[#6B7A4F] text-[#6B7A4F]'
                : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
            }`}
          >
            <span>কাস্টমার রিভিউ</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                activeTab === 'reviews' ? 'bg-[#6B7A4F] text-white' : 'bg-[#6B7A4F]/10 text-[#6B7A4F]'
              }`}
            >
              {reviews.length}
            </span>
          </button>
        </div>

        <div className="text-sm text-[#1A1A1A] leading-relaxed">
          {activeTab === 'desc' ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="whitespace-pre-line">{product.description}</p>
                <div className="p-4 bg-[#F7F5EF] rounded-2xl border border-[#E5E3DA] space-y-2">
                  <h4 className="font-bold text-[#6B7A4F]">কেন কীনোমার্ট থেকে অর্ডার করবেন?</h4>
                  <ul className="list-disc list-inside text-xs text-[#6B6B6B] space-y-1">
                    <li>১০০% অরিজিনাল অফিশিয়াল বা ইম্পোর্টেড প্রিমিয়াম গ্যাজেট</li>
                    <li>প্যাকেট খুলে চেক করে নেওয়ার সুযোগ</li>
                    <li>দ্রুততম সময়ে সারা বাংলাদেশে হোম ডেলিভারি</li>
                  </ul>
                </div>
              </div>

              {/* Product Gallery / Detail Images (4-5 pictures) */}
              {product.images && product.images.length > 0 && (
                <div className="space-y-3 pt-6 border-t border-[#E5E3DA]">
                  <h4 className="font-bold text-[#1A1A1A] text-base flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5 text-[#6B7A4F]" />
                    <span>প্রোডাক্টের বাস্তব ছবিসমূহ ({product.images.length}টি):</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-[#E5E3DA] bg-[#F7F5EF] shadow-xs hover:shadow-md transition-shadow">
                        <img
                          src={img}
                          alt={`${product.name} detail image ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 16:9 Product Video Player */}
              {product.video_url && (
                <div className="space-y-3 pt-6 border-t border-[#E5E3DA]">
                  <h4 className="font-bold text-[#1A1A1A] text-base flex items-center space-x-2">
                    <Play className="w-5 h-5 text-[#6B7A4F] fill-[#6B7A4F]" />
                    <span>প্রোডাক্ট ভিডিও রিভিউ / ডেমো:</span>
                  </h4>
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-md bg-black border border-[#E5E3DA]">
                    {getEmbedVideoUrl(product.video_url).includes('youtube.com/embed/') ? (
                      <iframe
                        src={getEmbedVideoUrl(product.video_url)}
                        title="Product Video Review"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video src={getEmbedVideoUrl(product.video_url)} controls className="w-full h-full object-cover" />
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'specs' ? (
            <div className="space-y-4">
              {product.specifications && product.specifications.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-[#E5E3DA] shadow-xs">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <tbody className="divide-y divide-[#E5E3DA]">
                      {product.specifications.map((spec, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-[#F7F5EF]/70' : 'bg-white'}>
                          <td className="px-3.5 sm:px-5 py-3 font-bold text-[#1A1A1A] w-2/5 sm:w-1/3 border-r border-[#E5E3DA] bg-[#F0EDE3]/50">
                            {spec.key}
                          </td>
                          <td className="px-3.5 sm:px-5 py-3 text-[#333333] font-medium">
                            {spec.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 bg-[#F7F5EF] rounded-2xl border border-[#E5E3DA] text-center text-[#6B6B6B] text-xs">
                  এই প্রোডাক্টের জন্য কোনো আলাদা স্পেসিফিকেশন যোগ করা হয়নি।
                </div>
              )}
            </div>
          ) : activeTab === 'shipping' ? (
            <div className="space-y-3 text-xs text-[#6B6B6B]">
              <p><strong>ঢাকা শহরে:</strong> ১ থেকে ২ দিনের মধ্যে হোম ডেলিভারি (চার্জ ৳৬০)।</p>
              <p><strong>ঢাকার বাইরে:</strong> ২ থেকে ৩ দিনের মধ্যে সুন্দোরবন/এসএ পরিবহন/স্টেডফাস্ট কুরিয়ারে ডেলিভারি (চার্জ ৳১২০)।</p>
              <p><strong>রিটার্ন পলিসি:</strong> পণ্য গ্রহণ করার পর কোনো টেকনিক্যাল সমস্যা পাওয়া গেলে ৭ দিনের মধ্যে ফ্রি রিপ্লেসমেন্ট সুবিধা দেওয়া হয়।</p>
            </div>
          ) : (
            /* Customer Review Tab View */
            <div className="space-y-8">
              {/* Success Alert */}
              {reviewSuccessMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{reviewSuccessMsg}</span>
                </div>
              )}

              {/* Rating Summary Header Card */}
              <div className="p-6 bg-[#F7F5EF] border border-[#E5E3DA] rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left: Overall Rating Display */}
                <div className="md:col-span-5 text-center md:border-r border-[#E5E3DA] md:pr-6 space-y-2">
                  <span className="text-5xl font-black text-[#1A1A1A]">
                    {product.rating ? product.rating.toFixed(1) : '5.0'}
                  </span>
                  <div className="flex justify-center text-amber-400 my-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-[#6B6B6B] font-medium">
                    মোট <strong className="text-[#1A1A1A]">{reviews.length}টি</strong> কাস্টমার রিভিউ
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-[#6B7A4F] hover:bg-[#586541] text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>{isReviewFormOpen ? 'ফর্ম বন্ধ করুন' : 'আপনার রিভিউ লিখুন'}</span>
                    </button>
                  </div>
                </div>

                {/* Right: Rating Bars Breakdown */}
                <div className="md:col-span-7 space-y-2 text-xs">
                  {[5, 4, 3, 2, 1].map((starCount) => {
                    const matchCount = reviews.filter(r => r.rating === starCount).length;
                    const percentage = reviews.length > 0 ? Math.round((matchCount / reviews.length) * 100) : (starCount === 5 ? 100 : 0);
                    return (
                      <div key={starCount} className="flex items-center space-x-3">
                        <span className="w-12 font-bold text-[#1A1A1A] flex items-center justify-end space-x-1">
                          <span>{starCount}</span>
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                        </span>
                        <div className="flex-1 h-2.5 bg-[#E5E3DA] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-gray-500 font-medium text-[11px]">
                          {matchCount}টি ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Review Form Box */}
              {isReviewFormOpen && (
                <form onSubmit={handleReviewSubmit} className="p-6 bg-white border-2 border-[#6B7A4F]/30 rounded-3xl space-y-4 shadow-sm transition-all">
                  <div className="flex items-center justify-between border-b border-[#E5E3DA] pb-3">
                    <h3 className="font-extrabold text-[#1A1A1A] text-base flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5 text-[#6B7A4F]" />
                      <span>আপনার প্রোডাক্ট রিভিউ লিখুন</span>
                    </h3>
                    <span className="text-xs text-[#6B6B6B]">সকল তথ্য প্রদান করুন</span>
                  </div>

                  {reviewErrorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{reviewErrorMsg}</span>
                    </div>
                  )}

                  {/* Star Rating Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#1A1A1A]">আপনার রেটিং নির্বাচন করুন *</label>
                    <div className="flex items-center space-x-2">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewReviewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-7 h-7 ${
                                (hoverRating || newReviewRating) >= star
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300 fill-gray-200'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-[#6B7A4F] ml-2">
                        {(hoverRating || newReviewRating) === 5 && 'অসাধারণ! 🌟'}
                        {(hoverRating || newReviewRating) === 4 && 'খুব ভালো! 👍'}
                        {(hoverRating || newReviewRating) === 3 && 'মোটামুটি 👌'}
                        {(hoverRating || newReviewRating) === 2 && 'খুব ভালো নয় 👎'}
                        {(hoverRating || newReviewRating) === 1 && 'খুবই খারাপ 😡'}
                      </span>
                    </div>
                  </div>

                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#1A1A1A]">আপনার নাম *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: তানভীর আহমেদ"
                        value={newReviewName}
                        onChange={e => setNewReviewName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#F7F5EF] border border-[#E5E3DA] rounded-xl text-xs font-medium text-[#1A1A1A] outline-none focus:border-[#6B7A4F]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#1A1A1A]">মোবাইল নম্বর (ঐচ্ছিক - ভেরিফিকেশনের জন্য)</label>
                      <input
                        type="tel"
                        placeholder="যেমন: 01700000000"
                        value={newReviewPhone}
                        onChange={e => setNewReviewPhone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#F7F5EF] border border-[#E5E3DA] rounded-xl text-xs font-medium text-[#1A1A1A] outline-none focus:border-[#6B7A4F]"
                      />
                    </div>
                  </div>

                  {/* Comment Textarea */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#1A1A1A]">আপনার বিস্তারিত মতামত / অভিজ্ঞতা *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="প্রোডাক্টটির সাউন্ড/বিল্ড কোয়ালিটি ও কীনোমার্টের সার্ভিস কেমন ছিল লিখুন..."
                      value={newReviewComment}
                      onChange={e => setNewReviewComment(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F7F5EF] border border-[#E5E3DA] rounded-xl text-xs font-medium text-[#1A1A1A] outline-none focus:border-[#6B7A4F]"
                    />
                  </div>

                  {/* Submit Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsReviewFormOpen(false)}
                      className="px-5 py-2.5 rounded-xl border border-[#E5E3DA] text-[#6B6B6B] hover:bg-[#F7F5EF] text-xs font-bold transition-colors cursor-pointer"
                    >
                      বাতিল করুন
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#6B7A4F] hover:bg-[#586541] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingReview ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <MessageSquare className="w-4 h-4" />
                      )}
                      <span>রিভিউ জমা দিন</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews Feed List */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-[#1A1A1A] text-base flex items-center justify-between border-b border-[#E5E3DA] pb-3">
                  <span>সকল রিভিউ ({reviews.length}টি)</span>
                  <span className="text-xs text-[#6B7A4F] font-bold">সর্বশেষ প্রাপ্ত রিভিউ</span>
                </h3>

                {reviews.length === 0 ? (
                  <div className="p-8 bg-[#F7F5EF] rounded-3xl border border-[#E5E3DA] text-center space-y-3">
                    <MessageSquare className="w-10 h-10 text-[#6B7A4F] mx-auto opacity-50" />
                    <p className="text-sm font-bold text-[#1A1A1A]">এখনো কোনো কাস্টমার রিভিউ দেওয়া হয়নি!</p>
                    <p className="text-xs text-[#6B6B6B]">আপনি এই প্রোডাক্টের প্রথম রিভিউটি দিয়ে সাহায্য করতে পারেন।</p>
                    <button
                      type="button"
                      onClick={() => setIsReviewFormOpen(true)}
                      className="mt-2 inline-flex items-center space-x-1.5 px-5 py-2 bg-[#6B7A4F] text-white font-bold rounded-xl text-xs cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>প্রথম রিভিউ লিখুন</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-5 bg-[#F7F5EF]/60 hover:bg-[#F7F5EF] border border-[#E5E3DA] rounded-2xl space-y-3 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-[#6B7A4F]/15 border border-[#6B7A4F]/30 flex items-center justify-center font-bold text-[#6B7A4F] text-sm shrink-0">
                              {rev.customer_name ? rev.customer_name.charAt(0) : 'U'}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-extrabold text-[#1A1A1A] text-sm">{rev.customer_name}</span>
                                {rev.is_verified_buyer && (
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>যাচাইকৃত ক্রেতা</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-[#6B6B6B] block mt-0.5">
                                {new Date(rev.created_at).toLocaleDateString('bn-BD', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Star Rating */}
                          <div className="flex text-amber-400 shrink-0">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 fill-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-[#333333] leading-relaxed font-medium pl-12">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-[#1A1A1A]">
            সম্পর্কিত অন্যান্য গ্যাজেট
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
