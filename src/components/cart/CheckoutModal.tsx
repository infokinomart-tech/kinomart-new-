import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle, Truck, CreditCard, ShieldCheck, AlertCircle, Loader2, Plus, Minus, Tag, Check, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    isCheckoutOpen,
    closeCheckout,
    directProduct,
    setDirectProductQty,
    updateQty,
    clearCart,
    subtotal
  } = useCart();

  const { customer, loginCustomer, settings } = useAuth();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [bkashNumber, setBkashNumber] = useState('');
  const [trxId, setTrxId] = useState('');

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    message: string;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill if customer logged in
  useEffect(() => {
    if (customer && isCheckoutOpen) {
      if (customer.name) setCustomerName(customer.name);
      if (customer.phone) setPhone(customer.phone);
      if (customer.address) setAddress(customer.address);
    }
  }, [customer, isCheckoutOpen]);

  // Items to checkout: either direct buy single product OR whole cart
  const checkoutItems = directProduct
    ? [
        {
          product_id: directProduct.product.id,
          product_name: directProduct.product.name,
          image: directProduct.product.images?.[0] || '',
          price: directProduct.product.discount_price || directProduct.product.price,
          qty: directProduct.qty || 1,
          selected_variant: directProduct.variant || directProduct.product.variants?.[0]?.options?.[0]
        }
      ]
    : cart.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        image: item.product.images?.[0] || '',
        price: item.product.discount_price || item.product.price,
        qty: item.qty,
        selected_variant: item.selected_variant
      }));

  const itemsSubtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingCost = area === 'inside_dhaka' ? 60 : 120;
  const grandTotal = Math.max(0, itemsSubtotal - discountAmount) + shippingCost;

  // Re-validate applied coupon if cart items subtotal changes
  useEffect(() => {
    if (appliedCoupon && itemsSubtotal > 0 && isCheckoutOpen) {
      api.validateCoupon(appliedCoupon.code, itemsSubtotal).then(res => {
        if (res.valid) {
          setAppliedCoupon({
            code: res.coupon_code!,
            discountAmount: res.discount_amount!,
            message: res.message
          });
        } else {
          setAppliedCoupon(null);
          setCouponError(`কুপন বাতিল হয়েছে: ${res.message}`);
        }
      }).catch(() => {
        setAppliedCoupon(null);
      });
    }
  }, [itemsSubtotal, isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError('');

    if (!couponCode.trim()) {
      setCouponError('একটি কুপন কোড লিখুন');
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const res = await api.validateCoupon(couponCode.trim(), itemsSubtotal);
      if (res.valid) {
        setAppliedCoupon({
          code: res.coupon_code!,
          discountAmount: res.discount_amount!,
          message: res.message
        });
        setCouponCode('');
        setCouponError('');
      } else {
        setAppliedCoupon(null);
        setCouponError(res.message);
      }
    } catch (err: any) {
      setCouponError(err.message || 'কুপন যাচাই করতে ব্যর্থ হয়েছে');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('আপনার নাম টাইপ করুন');
      return;
    }

    // Convert Bengali numerals (০-৯) to ASCII numerals (0-9)
    const convertBnToEnDigits = (str: string) => {
      const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      return str.replace(/[০-৯]/g, (w) => bnDigits.indexOf(w).toString());
    };

    const cleanPhone = convertBnToEnDigits(phone.trim()).replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      setErrorMessage('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01700000000)');
      return;
    }

    if (!address.trim()) {
      setErrorMessage('সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন');
      return;
    }

    if (checkoutItems.length === 0) {
      setErrorMessage('আপনার অর্ডারে কোনো প্রোডাক্ট নেই');
      return;
    }

    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const orderPayload = {
        customer_name: customerName.trim(),
        phone: cleanPhone,
        address: address.trim(),
        area,
        shipping_cost: shippingCost,
        items: checkoutItems,
        payment_method: paymentMethod,
        bkash_number: bkashNumber.trim(),
        transaction_id: trxId.trim(),
        coupon_code: appliedCoupon?.code,
        discount_amount: discountAmount
      };

      const res = await api.createOrder(orderPayload);

      // Auto-login customer
      loginCustomer(res.customer.phone, res.customer.name, res.customer.address);

      // Clear cart if checked out whole cart
      if (!directProduct) {
        clearCart();
      }

      // Show success state on button
      setIsSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Close modal
      closeCheckout();

      // Navigate to order success page
      navigate(`/order-success/${res.order.id}`, { state: { order: res.order } });
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMessage(err.message || 'অর্ডার প্রক্রিয়া করতে সমস্যা হয়েছে, আবার চেষ্টা করুন');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto" id="checkout-modal">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={closeCheckout}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
        <div
          className="relative z-10 w-full max-w-xl bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all my-auto animate-scaleUp border border-[#E5E3DA]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#6B7A4F] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-amber-200" />
              <h3 className="font-bold text-lg">সহজ অর্ডার ফরম</h3>
            </div>
            <button
              onClick={closeCheckout}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitOrder} className="p-6 space-y-5">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Order Items Preview Summary */}
            <div className="bg-[#F7F5EF] p-3.5 rounded-xl border border-[#E5E3DA] space-y-2.5">
              <div className="text-xs font-semibold text-[#6B6B6B]">অর্ডারকৃত আইটেম:</div>
              {checkoutItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2.5">
                    {item.image && (
                      <img src={item.image} alt={item.product_name} className="w-10 h-10 rounded-lg object-cover border border-[#E5E3DA]" />
                    )}
                    <div>
                      <div className="font-semibold text-[#1A1A1A] line-clamp-1 max-w-[180px] sm:max-w-[240px]">
                        {item.product_name}
                      </div>
                      {item.selected_variant && (
                        <div className="text-[11px] text-[#6B7A4F]">ভেরিয়েন্ট: {item.selected_variant}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-[#E5E3DA] rounded-lg bg-white">
                      <button
                        type="button"
                        onClick={() => {
                          if (directProduct) {
                            setDirectProductQty(directProduct.qty - 1);
                          } else {
                            updateQty(item.product_id, item.qty - 1, item.selected_variant);
                          }
                        }}
                        className="px-2 py-1 text-[#1A1A1A] hover:bg-[#F7F5EF] rounded-l-lg transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-bold text-xs text-[#1A1A1A]">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (directProduct) {
                            setDirectProductQty(directProduct.qty + 1);
                          } else {
                            updateQty(item.product_id, item.qty + 1, item.selected_variant);
                          }
                        }}
                        className="px-2 py-1 text-[#1A1A1A] hover:bg-[#F7F5EF] rounded-r-lg transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-extrabold text-[#6B7A4F] min-w-[60px] text-right">
                      <span className="text-[#6B7A4F]">৳</span>{(item.price * item.qty).toLocaleString('bn-BD')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Information Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                  আপনার পূর্ণ নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="যেমন: মোঃ রহিম উল্লাহ"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#6B7A4F]/40 focus:border-[#6B7A4F] focus:ring-2 focus:ring-[#6B7A4F]/20 outline-none bg-white placeholder:text-gray-400 text-black font-medium transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                  মোবাইল নম্বর (অর্ডার কনফার্মেশনের জন্য) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="যেমন: 01700000000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#6B7A4F]/40 focus:border-[#6B7A4F] focus:ring-2 focus:ring-[#6B7A4F]/20 outline-none font-sans bg-white placeholder:text-gray-400 text-black font-medium transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                  সম্পূর্ণ ঠিকানা (বাসা/রোড/এলাকা/জেলা) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="যেমন: বাসা ১২, রোড ৫, সেক্টর ৩, উত্তরা, ঢাকা"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#6B7A4F]/40 focus:border-[#6B7A4F] focus:ring-2 focus:ring-[#6B7A4F]/20 outline-none bg-white placeholder:text-gray-400 text-black font-medium transition-all"
                  required
                />
              </div>

              {/* Delivery Area Selection */}
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5">
                  ডেলিভারি এরিয়া সিলেক্ট করুন
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      area === 'inside_dhaka'
                        ? 'border-[#6B7A4F] bg-[#6B7A4F]/10 text-[#6B7A4F] font-bold'
                        : 'border-[#E5E3DA] bg-white text-[#1A1A1A]'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="area"
                        checked={area === 'inside_dhaka'}
                        onChange={() => setArea('inside_dhaka')}
                        className="accent-[#6B7A4F]"
                      />
                      <span className="text-xs">ঢাকা শহর (৳৬০)</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      area === 'outside_dhaka'
                        ? 'border-[#6B7A4F] bg-[#6B7A4F]/10 text-[#6B7A4F] font-bold'
                        : 'border-[#E5E3DA] bg-white text-[#1A1A1A]'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="area"
                        checked={area === 'outside_dhaka'}
                        onChange={() => setArea('outside_dhaka')}
                        className="accent-[#6B7A4F]"
                      />
                      <span className="text-xs">ঢাকার বাইরে (৳১২০)</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] mb-1.5">
                  পেমেন্ট পদ্ধতি
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                      paymentMethod === 'cod'
                        ? 'border-[#6B7A4F] bg-[#6B7A4F] text-white shadow-xs'
                        : 'border-[#E5E3DA] bg-white text-[#1A1A1A] hover:bg-[#F7F5EF]'
                    }`}
                  >
                    ক্যাশ অন ডেলিভারি
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                      paymentMethod === 'bkash'
                        ? 'border-[#E2136E] bg-[#E2136E] text-white shadow-xs'
                        : 'border-[#E5E3DA] bg-white text-[#1A1A1A] hover:bg-[#F7F5EF]'
                    }`}
                  >
                    বিকাশ (bKash)
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('nagad')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                      paymentMethod === 'nagad'
                        ? 'border-[#F7921E] bg-[#F7921E] text-white shadow-xs'
                        : 'border-[#E5E3DA] bg-white text-[#1A1A1A] hover:bg-[#F7F5EF]'
                    }`}
                  >
                    নগদ (Nagad)
                  </button>
                </div>

                {paymentMethod !== 'cod' && (
                  <div className="mt-3 p-3 bg-pink-50 border border-pink-200 rounded-xl space-y-2 text-xs shadow-xs">
                    <p className="font-semibold text-pink-900 flex items-center justify-between">
                      <span>{paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} পার্সোনাল নম্বর:</span>
                      <span className="font-bold underline text-pink-950 font-mono text-sm bg-pink-100/80 px-2 py-0.5 rounded-md border border-pink-200">
                        {paymentMethod === 'bkash'
                          ? (settings?.bkash_number || '01700123456')
                          : (settings?.nagad_number || '01700123456')}
                      </span>
                    </p>
                    <p className="text-pink-800">
                      মোট ৳{grandTotal.toLocaleString('bn-BD')} টাকা সেন্ড মানি করে আপনার নম্বর ও ট্রানজেকশন আইডি প্রদান করুন:
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="প্রেরক নম্বর"
                        value={bkashNumber}
                        onChange={e => setBkashNumber(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-pink-300 rounded-lg text-xs font-mono outline-none focus:ring-1 focus:ring-pink-500"
                      />
                      <input
                        type="text"
                        placeholder="TrxID (ট্রানজেকশন আইডি)"
                        value={trxId}
                        onChange={e => setTrxId(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-pink-300 rounded-lg text-xs font-mono outline-none focus:ring-1 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Coupon Code Section */}
            <div className="bg-[#F7F5EF] p-3.5 rounded-2xl border border-[#E5E3DA] space-y-2.5">
              <label className="block text-xs font-bold text-[#1A1A1A] flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-[#6B7A4F]" />
                <span>ডিসকাউন্ট কুপন কোড (Promo / Coupon Code)</span>
              </label>

              {appliedCoupon ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs animate-fadeIn">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                      ✓
                    </span>
                    <div>
                      <div className="font-extrabold text-emerald-950 flex items-center space-x-1">
                        <span>কুপন '{appliedCoupon.code}' যুক্ত হয়েছে</span>
                        <span className="text-emerald-700 font-bold">(-৳{appliedCoupon.discountAmount})</span>
                      </div>
                      <div className="text-[11px] text-emerald-800">{appliedCoupon.message}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded-lg transition-colors font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                    title="কুপন মুছুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>সরান</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="যেমন: KINO10, SAVE100"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-grow px-3 py-2 text-xs font-mono font-bold rounded-xl border border-[#6B7A4F]/40 outline-none uppercase bg-white placeholder:normal-case placeholder:font-sans focus:border-[#6B7A4F] focus:ring-1 focus:ring-[#6B7A4F]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponCode.trim()}
                    className="px-4 py-2 bg-[#6B7A4F] hover:bg-[#586640] disabled:bg-gray-300 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center space-x-1 shrink-0"
                  >
                    {isValidatingCoupon ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>এপ্লাই করুন</span>
                    )}
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] font-bold text-rose-600 flex items-center space-x-1 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{couponError}</span>
                </p>
              )}
            </div>

            {/* Price Summary Breakdown */}
            <div className="bg-[#F7F5EF] p-4 rounded-2xl border-2 border-[#6B7A4F] space-y-2.5 shadow-sm">
              <div className="flex justify-between items-center text-xs sm:text-sm text-[#4A4A4A]">
                <span>প্রোডাক্ট সাবটোটাল:</span>
                <span className="font-bold text-[#6B7A4F]">৳{itemsSubtotal.toLocaleString('bn-BD')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center text-xs sm:text-sm text-emerald-800 font-bold bg-emerald-100/70 p-1.5 rounded-lg border border-emerald-200">
                  <span className="flex items-center space-x-1">
                    <Tag className="w-3.5 h-3.5 text-emerald-700" />
                    <span>কুপন ডিসকাউন্ট ({appliedCoupon.code}):</span>
                  </span>
                  <span className="text-emerald-700 font-extrabold">-৳{discountAmount.toLocaleString('bn-BD')}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs sm:text-sm text-[#4A4A4A]">
                <span>ডেলিভারি চার্জ ({area === 'inside_dhaka' ? 'ঢাকা' : 'ঢাকার বাইরে'}):</span>
                <span className="font-bold text-[#6B7A4F]">৳{shippingCost.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between items-center text-base sm:text-lg font-black text-[#1A1A1A] pt-2 border-t-2 border-dashed border-[#6B7A4F]/30">
                <span>মোট দাম:</span>
                <span className="text-[#6B7A4F] text-lg sm:text-xl font-black bg-white px-3 py-1 rounded-xl border border-[#6B7A4F]/40 shadow-xs">
                  <span className="text-[#6B7A4F]">৳</span>{grandTotal.toLocaleString('bn-BD')}
                </span>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className={`w-full py-4 rounded-xl text-white font-bold text-base sm:text-lg transition-all duration-300 shadow-xl flex items-center justify-center space-x-2 active:scale-95 ${
                isSuccess
                  ? 'bg-[#15803d] shadow-emerald-500/40 scale-[1.02]'
                  : isSubmitting
                  ? 'bg-[#25D366] text-slate-900 font-extrabold shadow-green-500/40 animate-pulse'
                  : 'bg-[#6B7A4F] hover:bg-[#586640] shadow-lg'
              }`}
            >
              {isSuccess ? (
                <>
                  <CheckCircle className="w-6 h-6 animate-bounce text-white" />
                  <span>অর্ডার সফল হয়েছে! 🎉</span>
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
                  <span>অর্ডার প্রসেস হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>অর্ডার কনফার্ম করুন (৳{grandTotal.toLocaleString('bn-BD')})</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center space-x-1 text-[11px] text-[#6B6B6B]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6B7A4F]" />
              <span>পণ্য হাতে পেয়ে মূল্য পরিশোধের নিরাপদ সুবিধা</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
