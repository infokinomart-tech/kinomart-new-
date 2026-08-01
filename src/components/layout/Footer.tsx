import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { KinoMartLogo } from '../common/KinoMartLogo';

export const Footer: React.FC = () => {
  const { settings } = useAuth();

  return (
    <footer className="bg-[#1A1A1A] text-white pt-12 pb-8 border-t border-[#333333]" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-[#333333]">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.logo_title || 'Logo'}
                  className="h-9 w-auto max-w-[150px] object-contain bg-white/10 p-1 rounded-lg"
                />
              ) : (
                <KinoMartLogo className="w-9 h-9" logoUrl={settings?.logo_url} />
              )}
              <span className="font-bold text-2xl tracking-tight text-white">
                {settings?.logo_title || 'KinoMart'}
              </span>
            </div>
            <p className="text-xs text-[#A0A0A0] leading-relaxed">
              {settings?.footer_about ||
                'কীনোমার্ট গ্যাজেট শপ - আপনার পছন্দের অরিজিনাল স্মার্টফোন এক্সেসরিজ, এয়ারবাডস, স্মার্টওয়াচ ও আধুনিক প্রযুক্তি পণ্য সমাহার।'}
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <div className="flex items-center space-x-1.5 bg-[#262626] px-3 py-1.5 rounded-full border border-[#333333] text-xs text-[#25D366]">
                <MessageCircle className="w-4 h-4" />
                <span>২৪/৭ হোয়াটসঅ্যাপ সাপোর্ট</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-base text-white mb-4 border-b border-[#333333] pb-2 inline-block">
              গুরুত্বপূর্ণ লিঙ্ক
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A0A0A0]">
              <li>
                <Link to="/" className="hover:text-[#6B7A4F] transition-colors">
                  হোম পেইজ
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-[#6B7A4F] transition-colors">
                  সব প্রোডাক্ট
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#6B7A4F] transition-colors">
                  আমাদের সম্পর্কে
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#6B7A4F] transition-colors">
                  যোগাযোগ
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-[#6B7A4F] transition-colors">
                  আমার অর্ডার ট্র্যাক করুন
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-base text-white mb-4 border-b border-[#333333] pb-2 inline-block">
              কাস্টমার কেয়ার
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A0A0A0]">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#6B7A4F] shrink-0 mt-0.5" />
                <span>{settings?.address || 'বসুন্ধরা সিটি শপিং মল, ধানমন্ডি, ঢাকা'}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#6B7A4F] shrink-0" />
                <span>হটলাইন: {settings?.phone || '01700-123456'}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#6B7A4F] shrink-0" />
                <span>ইমেইল: support@kinomart.com</span>
              </li>
              <li className="flex items-center space-x-2 pt-2">
                <ShieldCheck className="w-4 h-4 text-[#C97B4A] shrink-0" />
                <span>১০০% সেফ ক্যাশ অন ডেলিভারি</span>
              </li>
            </ul>
          </div>

          {/* Payment Methods & Newsletter */}
          <div>
            <h4 className="font-semibold text-base text-white mb-4 border-b border-[#333333] pb-2 inline-block">
              পেমেন্ট মাধ্যমসমূহ
            </h4>
            <p className="text-xs text-[#A0A0A0] mb-3">
              ক্যাশ অন ডেলিভারিতে পণ্য দেখে টাকা দিন। এছাড়াও বিকাশ ও নগদে অগ্রিম পেমেন্ট সুবিধা।
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2.5 py-1 rounded bg-[#E2136E] text-white text-[11px] font-bold">
                bKash বিকাশ
              </span>
              <span className="px-2.5 py-1 rounded bg-[#F7921E] text-white text-[11px] font-bold">
                Nagad নগদ
              </span>
              <span className="px-2.5 py-1 rounded bg-[#6B7A4F] text-white text-[11px] font-bold">
                ক্যাশ অন ডেলিভারি
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-[#888888]">
          <p>© {new Date().getFullYear()} {settings?.logo_title || 'KinoMart'}. সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center space-x-1 mt-2 md:mt-0 font-medium">
            <span>Developed by </span>
            <a
              href="https://b2bfiy-com-two.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C97B4A] hover:underline font-bold transition-colors"
            >
              B2Bfiy
            </a>
            <span>.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
