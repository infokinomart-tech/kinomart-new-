import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Truck, X, Plus, Minus, Check, Tag, ShieldCheck } from 'lucide-react';

interface QuickOrderModalProps {
  product: Product;
  onClose: () => void;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({ product, onClose }) => {
  const { createOrder, validateCoupon } = useStore();

  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [deliveryArea, setDeliveryArea] = useState<'Inside Dhaka' | 'Outside Dhaka'>('Inside Dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'bKash' | 'Nagad'>('COD');

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const unitPrice = product.discountPrice || product.price;
  const subtotal = unitPrice * quantity;
  const deliveryFee = deliveryArea === 'Inside Dhaka' ? 60 : 120;
  const totalPrice = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleApplyCoupon = () => {
    if (!couponCodeInput.trim()) return;
    const result = validateCoupon(couponCodeInput, subtotal);
    if (result.valid) {
      setDiscountAmount(result.discount);
      setAppliedCoupon(couponCodeInput.trim().toUpperCase());
      setCouponMessage({ text: result.message, isError: false });
    } else {
      setCouponMessage({ text: result.message, isError: true });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 11) {
      setErrorMsg('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন');
      return;
    }
    if (!shippingAddress.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার ডেলিভারি ঠিকানা লিখুন');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        deliveryArea,
        deliveryFee,
        paymentMethod,
        items: [
          {
            product,
            quantity
          }
        ],
        subtotal,
        discount: discountAmount,
        couponCode: appliedCoupon || undefined,
        totalPrice
      });
    } catch (err) {
      console.error(err);
      setErrorMsg('অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-[#D5CEBF] my-auto animate-scaleUp">
        {/* Modal Header */}
        <div className="bg-[#5E6A45] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base sm:text-lg">
            <Truck className="w-5 h-5 text-amber-200" />
            <span>সহজ অর্ডার ফরম</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[85vh] overflow-y-auto">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 text-xs sm:text-sm p-3 rounded-xl border border-red-200 font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Ordered Item Card */}
          <div className="bg-[#F7F5F0] border border-[#E8E3D9] p-3 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={product.thumbnail}
                alt={product.name}
                className="w-12 h-12 rounded-xl object-cover border border-[#E8E3D9] bg-[#FFDC33]"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-[#1F241E] line-clamp-1 max-w-[200px]">
                  {product.name}
                </h4>
                <p className="text-xs font-bold text-[#5E7A3B]">
                  ৳{unitPrice.toLocaleString('bn-BD')}
                </p>
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2 border border-[#D5CEBF] bg-white rounded-lg p-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 hover:bg-[#EFECE6] rounded text-[#2E3B2B]"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold px-2">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 hover:bg-[#EFECE6] rounded text-[#2E3B2B]"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3.5 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-[#1F241E] mb-1">
                আপনার পূর্ণ নাম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="যেমন: মো: রহিম উল্লাহ"
                className="w-full bg-[#FAF8F5] border border-[#D5CEBF] rounded-xl p-3 text-[#1F241E] focus:outline-none focus:ring-1 focus:ring-[#5E7A3B] focus:border-[#5E7A3B]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1F241E] mb-1">
                মোবাইল নম্বর (অর্ডার কনফার্মেশনের জন্য) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="যেমন: 01700000000"
                className="w-full bg-[#FAF8F5] border border-[#D5CEBF] rounded-xl p-3 text-[#1F241E] focus:outline-none focus:ring-1 focus:ring-[#5E7A3B] focus:border-[#5E7A3B]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1F241E] mb-1">
                সম্পূর্ণ ঠিকানা (বাসা/রোড/এলাকা/জেলা) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="যেমন: বাসা ১২, রোড ৫, সেক্টর ৩, উত্তরা, ঢাকা"
                className="w-full bg-[#FAF8F5] border border-[#D5CEBF] rounded-xl p-3 text-[#1F241E] focus:outline-none focus:ring-1 focus:ring-[#5E7A3B] focus:border-[#5E7A3B]"
              />
            </div>
          </div>

          {/* Delivery Area Selection */}
          <div className="space-y-2">
            <label className="block font-bold text-[#1F241E] text-xs sm:text-sm">
              ডেলিভারি এরিয়া সিলেক্ট করুন
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                onClick={() => setDeliveryArea('Inside Dhaka')}
                className={`p-3 rounded-2xl border flex items-center gap-2 cursor-pointer transition-all ${
                  deliveryArea === 'Inside Dhaka'
                    ? 'bg-[#F2F7EC] border-[#5E7A3B] font-bold text-[#2E3B2B]'
                    : 'bg-[#FAF8F5] border-[#D5CEBF] text-[#555]'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryArea"
                  checked={deliveryArea === 'Inside Dhaka'}
                  onChange={() => setDeliveryArea('Inside Dhaka')}
                  className="accent-[#5E7A3B]"
                />
                <span className="text-xs sm:text-sm">ঢাকা শহর (৳৬০)</span>
              </label>

              <label
                onClick={() => setDeliveryArea('Outside Dhaka')}
                className={`p-3 rounded-2xl border flex items-center gap-2 cursor-pointer transition-all ${
                  deliveryArea === 'Outside Dhaka'
                    ? 'bg-[#F2F7EC] border-[#5E7A3B] font-bold text-[#2E3B2B]'
                    : 'bg-[#FAF8F5] border-[#D5CEBF] text-[#555]'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryArea"
                  checked={deliveryArea === 'Outside Dhaka'}
                  onChange={() => setDeliveryArea('Outside Dhaka')}
                  className="accent-[#5E7A3B]"
                />
                <span className="text-xs sm:text-sm">ঢাকার বাইরে (৳১২০)</span>
              </label>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <label className="block font-bold text-[#1F241E] text-xs sm:text-sm">
              পেমেন্ট পদ্ধতি
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all ${
                  paymentMethod === 'COD'
                    ? 'bg-[#5E6A45] text-white border-[#5E6A45]'
                    : 'bg-[#FAF8F5] border-[#D5CEBF] text-[#2E3B2B]'
                }`}
              >
                ক্যাশ অন ডেলিভারি
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bKash')}
                className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all ${
                  paymentMethod === 'bKash'
                    ? 'bg-[#D12053] text-white border-[#D12053]'
                    : 'bg-[#FAF8F5] border-[#D5CEBF] text-[#2E3B2B]'
                }`}
              >
                বিকাশ (bKash)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Nagad')}
                className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all ${
                  paymentMethod === 'Nagad'
                    ? 'bg-[#EA580C] text-white border-[#EA580C]'
                    : 'bg-[#FAF8F5] border-[#D5CEBF] text-[#2E3B2B]'
                }`}
              >
                নগদ (Nagad)
              </button>
            </div>
          </div>

          {/* Discount Coupon Code Box */}
          <div className="bg-[#F7F5F0] border border-[#E8E3D9] p-3 rounded-2xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2E3B2B]">
              <Tag className="w-3.5 h-3.5 text-[#5E7A3B]" />
              <span>ডিসকাউন্ট কুপন কোড (Promo / Coupon Code)</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value)}
                placeholder="যেমন: KINO10, SAVE100"
                className="flex-1 bg-white border border-[#D5CEBF] rounded-xl px-3 py-2 text-xs text-[#1F241E] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="bg-[#D5D8DC] hover:bg-[#BFC3C9] text-[#2E3B2B] text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                এপ্লাই করুন
              </button>
            </div>
            {couponMessage && (
              <p
                className={`text-[11px] font-semibold ${
                  couponMessage.isError ? 'text-red-500' : 'text-emerald-600'
                }`}
              >
                {couponMessage.text}
              </p>
            )}
          </div>

          {/* Price Summary Calculation */}
          <div className="bg-[#FAF8F5] border border-[#5E7A3B]/30 rounded-2xl p-4 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-[#555]">
              <span>প্রোডাক্ট সাবটোটাল:</span>
              <span className="font-bold text-[#1F241E]">
                ৳{subtotal.toLocaleString('bn-BD')}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>কুপন ডিসকাউন্ট:</span>
                <span>-৳{discountAmount.toLocaleString('bn-BD')}</span>
              </div>
            )}

            <div className="flex justify-between text-[#555]">
              <span>ডেলিভারি চার্জ ({deliveryArea === 'Inside Dhaka' ? 'ঢাকা' : 'ঢাকার বাইরে'}):</span>
              <span className="font-bold text-[#1F241E]">
                ৳{deliveryFee.toLocaleString('bn-BD')}
              </span>
            </div>

            <div className="border-t border-dashed border-[#D5CEBF] pt-2 flex justify-between items-center">
              <span className="font-extrabold text-[#1F241E] text-base">মোট দাম:</span>
              <span className="font-black text-lg text-[#5E7A3B] border border-[#5E7A3B] bg-white px-3 py-1 rounded-xl shadow-2xs">
                ৳{totalPrice.toLocaleString('bn-BD')}
              </span>
            </div>
          </div>

          {/* Submit CTA Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#5E6A45] hover:bg-[#485333] active:scale-[0.98] text-white text-base font-extrabold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            <Check className="w-5 h-5" />
            <span>
              {isSubmitting
                ? 'অর্ডার প্রসেস হচ্ছে...'
                : `অর্ডার কনফার্ম করুন (৳${totalPrice.toLocaleString('bn-BD')})`}
            </span>
          </button>

          <p className="text-[11px] text-[#6B7264] text-center flex items-center justify-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#5E7A3B]" />
            পণ্য হাতে পেয়ে মূল্য পরিশোধের নিরাপদ সুবিধা
          </p>
        </form>
      </div>
    </div>
  );
};
