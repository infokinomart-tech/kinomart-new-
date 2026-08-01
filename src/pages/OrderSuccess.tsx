import React from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, User, Phone, MapPin, Truck, ArrowRight, ShieldCheck } from 'lucide-react';
import { Order } from '../types';

export const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const { orderId } = useParams<{ orderId: string }>();
  const order: Order | undefined = location.state?.order;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-8">
      {/* Success Hero Card */}
      <div className="bg-white rounded-3xl border border-[#E5E3DA] p-6 sm:p-10 shadow-xl text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <span className="inline-block px-3.5 py-1 rounded-full bg-[#6B7A4F]/10 text-[#6B7A4F] text-xs font-bold">
          🎉 আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে!
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
          ধন্যবাদ! আপনার অর্ডার নম্বর: <span className="text-[#6B7A4F]">{order?.order_number || orderId}</span>
        </h1>

        <p className="text-xs sm:text-sm text-[#6B6B6B] max-w-lg mx-auto">
          আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে কল করে অর্ডারটি কনফার্ম করবে এবং পণ্যটি ডেলিভারির জন্য পাঠানো হবে।
        </p>

        {/* Auto Account Creation Notification Pill */}
        <div className="p-4 bg-[#F7F5EF] rounded-2xl border border-[#E5E3DA] text-left space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#1A1A1A]">
            <User className="w-4 h-4 text-[#6B7A4F]" />
            <span>স্বয়ংক্রিয় গ্রাহক অ্যাকাউন্ট তৈরি হয়েছে!</span>
          </div>
          <p className="text-xs text-[#6B6B6B]">
            আপনার মোবাইল নাম্বার (<strong className="text-[#1A1A1A]">{order?.phone || 'আপনার ফোন নম্বর'}</strong>) দিয়ে একটি কাস্টমার একাউন্ট তৈরি হয়ে গেছে। যেকোনো সময় আপনি <strong>'আমার অ্যাকাউন্ট'</strong> পেইজে গিয়ে অর্ডারের স্ট্যাটাস ট্র্যাকিং করতে পারবেন।
          </p>
        </div>
      </div>

      {/* Order Details Breakdown */}
      {order && (
        <div className="bg-white rounded-3xl border border-[#E5E3DA] p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-[#1A1A1A] border-b border-[#E5E3DA] pb-3 flex items-center justify-between">
            <span>অর্ডারের বিস্তারিত</span>
            <span className="text-xs text-[#6B7A4F] font-semibold">{new Date(order.created_at).toLocaleString('bn-BD')}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <div className="font-bold text-[#1A1A1A]">গ্রাহকের তথ্য:</div>
              <p className="flex items-center space-x-1 text-[#6B6B6B]">
                <User className="w-3.5 h-3.5 text-[#6B7A4F]" />
                <span>{order.customer_name}</span>
              </p>
              <p className="flex items-center space-x-1 text-[#6B6B6B]">
                <Phone className="w-3.5 h-3.5 text-[#6B7A4F]" />
                <span>{order.phone}</span>
              </p>
              <p className="flex items-start space-x-1 text-[#6B6B6B]">
                <MapPin className="w-3.5 h-3.5 text-[#6B7A4F] shrink-0 mt-0.5" />
                <span>{order.address}</span>
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-[#1A1A1A]">ডেলিভারি ও পেমেন্ট:</div>
              <p className="flex items-center space-x-1 text-[#6B6B6B]">
                <Truck className="w-3.5 h-3.5 text-[#6B7A4F]" />
                <span>এরিয়া: {order.area === 'inside_dhaka' ? 'ঢাকা শহর (৳৬০)' : 'ঢাকার বাইরে (৳১২০)'}</span>
              </p>
              <p className="flex items-center space-x-1 text-[#6B6B6B]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#6B7A4F]" />
                <span>পেমেন্ট মেথড: {order.payment_method.toUpperCase()}</span>
              </p>
            </div>
          </div>

          {/* Ordered Items Table */}
          <div className="border border-[#E5E3DA] rounded-2xl overflow-hidden divide-y divide-[#E5E3DA]">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  {item.image && (
                    <img src={item.image} alt={item.product_name} className="w-12 h-12 rounded-lg object-cover border border-[#E5E3DA]" />
                  )}
                  <div>
                    <h4 className="font-bold text-[#1A1A1A]">{item.product_name}</h4>
                    {item.selected_variant && (
                      <span className="text-[11px] text-[#6B7A4F]">ভেরিয়েন্ট: {item.selected_variant}</span>
                    )}
                    <p className="text-[#6B6B6B]">পরিমাণ: {item.qty} টি</p>
                  </div>
                </div>
                <div className="font-extrabold text-[#1A1A1A]">
                  ৳{(item.price * item.qty).toLocaleString('bn-BD')}
                </div>
              </div>
            ))}

            {order.coupon_code && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center justify-between">
                <span>প্রযোজ্য কুপন কোড: <strong>{order.coupon_code}</strong></span>
                <span className="text-emerald-700 font-extrabold">-৳{(order.discount_amount || 0).toLocaleString('bn-BD')} ছাড়</span>
              </div>
            )}

            <div className="p-3.5 bg-[#F7F5EF] flex justify-between items-center text-sm font-extrabold text-[#1A1A1A]">
              <span>সর্বমোট দেয়া টাকা (ডেলিভারিসহ):</span>
              <span className="text-[#6B7A4F]">৳{order.total_revenue.toLocaleString('bn-BD')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/account"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#6B7A4F] text-white font-bold text-sm hover:bg-[#586640] transition-colors flex items-center justify-center space-x-2"
        >
          <User className="w-4 h-4" />
          <span>আমার অ্যাকাউন্টে অর্ডারের অবস্থা দেখুন</span>
        </Link>

        <Link
          to="/products"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-[#E5E3DA] text-[#1A1A1A] font-bold text-sm hover:bg-[#F7F5EF] transition-colors flex items-center justify-center space-x-2"
        >
          <ShoppingBag className="w-4 h-4 text-[#6B7A4F]" />
          <span>আরও প্রোডাক্ট দেখুন</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
