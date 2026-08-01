import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  const items = [
    {
      icon: Truck,
      title: 'দ্রুত হোম ডেলিভারি',
      desc: 'ঢাকা ১ দিনে, বাইরে ২-৩ দিনে'
    },
    {
      icon: ShieldCheck,
      title: 'ক্যাশ অন ডেলিভারি',
      desc: 'পণ্য দেখে টাকা পরিশোধের সুবিধা'
    },
    {
      icon: RefreshCw,
      title: '১০০% অরিজিনাল পণ্য',
      desc: '৭ দিনের সহজ রিটার্ন পলিসি'
    },
    {
      icon: Headphones,
      title: '২৪/৭ কাস্টমার সাপোর্ট',
      desc: 'যেকোনো প্রয়োজনে কল করুন'
    }
  ];

  return (
    <div className="bg-[#FFFFFF] border-y border-[#E5E3DA] py-6 my-6 shadow-xs" id="trust-strip-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 p-3 rounded-xl hover:bg-[#F7F5EF] transition-colors">
                <div className="w-12 h-12 rounded-full bg-[#6B7A4F]/10 flex items-center justify-center text-[#6B7A4F] shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm md:text-base text-[#1A1A1A]">{item.title}</h4>
                  <p className="text-xs text-[#6B6B6B]">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
