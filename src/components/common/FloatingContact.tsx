import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const FloatingContact: React.FC = () => {
  const { settings } = useAuth();

  const phone = settings?.phone || '01700123456';
  const whatsapp = settings?.whatsapp || '8801700123456';

  // Format phone for tel: link
  const rawPhone = phone.replace(/[^0-9+]/g, '');
  const rawWhatsapp = whatsapp.replace(/[^0-9]/g, '');

  return (
    <>
      {/* Floating Call Button (Bottom-Right) */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center group">
        {/* Hover Tooltip with Phone Number */}
        <div className="mr-3 px-3 py-1.5 bg-[#1A1A1A] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xl opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap flex items-center gap-1.5 border border-white/10">
          <span>📞 {phone}</span>
        </div>

        <a
          href={`tel:${rawPhone}`}
          title={`সরাসরি কল করুন: ${phone}`}
          id="floating-call-btn"
          className="flex items-center justify-center w-14 h-14 bg-[#6B7A4F] text-white rounded-full shadow-2xl hover:bg-[#586640] transition-all transform group-hover:scale-110 active:scale-95 animate-pulse-ring"
        >
          <Phone className="w-6 h-6 animate-bounce" />
          <span className="sr-only">কল করুন: {phone}</span>
        </a>
      </div>

      {/* Floating WhatsApp Button (Bottom-Right, Above Call Button) */}
      <div className="fixed bottom-22 right-5 z-40 flex items-center group">
        {/* Hover Tooltip with WhatsApp Number */}
        <div className="mr-3 px-3 py-1.5 bg-[#1A1A1A] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xl opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap flex items-center gap-1.5 border border-white/10">
          <span>💬 {whatsapp}</span>
        </div>

        <a
          href={`https://wa.me/${rawWhatsapp}?text=${encodeURIComponent('আসসালামু আলাইকুম, কীনোমার্ট গ্যাজেট অর্ডার সম্পর্কে জানতে চাই।')}`}
          target="_blank"
          rel="noopener noreferrer"
          title={`হোয়াটসঅ্যাপে চ্যাট করুন: ${whatsapp}`}
          id="floating-whatsapp-btn"
          className="flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl hover:bg-[#20ba59] transition-all transform group-hover:scale-110 active:scale-95 animate-pulse-whatsapp"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="sr-only">হোয়াটসঅ্যাপ: {whatsapp}</span>
        </a>
      </div>
    </>
  );
};
