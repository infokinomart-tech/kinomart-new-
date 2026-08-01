import React from 'react';
import { ShieldCheck, Truck, Award, Heart, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const About: React.FC = () => {
  const { settings } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Brand Story Hero */}
      <div className="bg-white rounded-3xl border border-[#E5E3DA] p-8 sm:p-12 shadow-xs text-center space-y-4 max-w-3xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-[#6B7A4F] text-white flex items-center justify-center font-bold text-3xl mx-auto shadow-md">
          K
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A]">
          কীনোমার্ট (KinoMart) সম্পর্কে
        </h1>

        <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed">
          {settings?.footer_about ||
            'কীনোমার্ট বাংলাদেশের অন্যতম বিশ্বস্ত অনলাইন গ্যাজেট শপ। আমরা গ্রাহকদের হাতে পৌঁছে দেই আধুনিক, প্রিমিয়াম ও ১০০% অরিজিনাল ইলেকট্রনিক্স গ্যাজেট।'}
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E5E3DA] space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#6B7A4F]/10 text-[#6B7A4F] flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-[#1A1A1A]">আমাদের লক্ষ্য (Mission)</h3>
          <p className="text-xs text-[#6B6B6B] leading-relaxed">
            বাংলাদেশের প্রতিটি মানুষের কাছে সঠিক মূল্যে আন্তর্জাতিক মানের গ্যাজেট পৌঁছে দেওয়া এবং সেরা কেনাকাটার অভিজ্ঞতা প্রদান করা।
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E5E3DA] space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#C97B4A]/10 text-[#C97B4A] flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-[#1A1A1A]">গুণমানের নিশ্চয়তা</h3>
          <p className="text-xs text-[#6B6B6B] leading-relaxed">
            আমরা কোনো কপি বা নিম্নমানের গ্যাজেট বিক্রি করি না। প্রতিটি প্রোডাক্ট ডেলিভারির আগে মান যাচাই করা হয়।
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E5E3DA] space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-[#1A1A1A]">দ্রুততম সার্ভিস</h3>
          <p className="text-xs text-[#6B6B6B] leading-relaxed">
            ঢাকা ও ঢাকার বাইরে দ্রুততম হোম ডেলিভারি সিস্টেম এবং আন্তরিক ২৪/৭ কাস্টমার কেয়ার সার্ভিস।
          </p>
        </div>
      </div>

      {/* Why Choose KinoMart */}
      <div className="bg-[#F7F5EF] rounded-3xl border border-[#E5E3DA] p-8 space-y-6">
        <h2 className="text-2xl font-extrabold text-[#1A1A1A] text-center">
          কেন বেছে নেবেন কীনোমার্ট?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="flex items-start space-x-3 bg-white p-4 rounded-2xl border border-[#E5E3DA]">
            <CheckCircle2 className="w-5 h-5 text-[#6B7A4F] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-[#1A1A1A]">ক্যাশ অন ডেলিভারি (COD)</h4>
              <p className="text-[#6B6B6B] mt-1">পণ্য আপনার দরজায় পৌঁছানোর পর চেক করে দেখে তারপর মূল্য পরিশোধ করুন।</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-white p-4 rounded-2xl border border-[#E5E3DA]">
            <CheckCircle2 className="w-5 h-5 text-[#6B7A4F] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-[#1A1A1A]">৭ দিনের রিপ্লেসমেন্ট ওয়ারেন্টি</h4>
              <p className="text-[#6B6B6B] mt-1">যেকোনো টেকনিক্যাল সমস্যা হলে সহজে ৭ দিনের মধ্যে রিপ্লেসমেন্ট পান।</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-white p-4 rounded-2xl border border-[#E5E3DA]">
            <CheckCircle2 className="w-5 h-5 text-[#6B7A4F] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-[#1A1A1A]">স্বয়ংক্রিয় অর্ডার ট্র্যাকিং</h4>
              <p className="text-[#6B6B6B] mt-1">আপনার ফোন নম্বর দিয়েই ওয়েবসাইটে লগইন করে অর্ডারের লাইভ আপডেট দেখতে পারবেন।</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-white p-4 rounded-2xl border border-[#E5E3DA]">
            <CheckCircle2 className="w-5 h-5 text-[#6B7A4F] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-[#1A1A1A]">২৪/৭ হোয়াটসঅ্যাপ হেল্পলাইন</h4>
              <p className="text-[#6B6B6B] mt-1">পণ্য সংক্রান্ত যেকোনো তথ্যের জন্য সার্বক্ষণিক কল অথবা চ্যাট সাপোর্ট।</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
