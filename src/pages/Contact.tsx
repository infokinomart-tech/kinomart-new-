import React, { useState } from 'react';
import { Phone, MapPin, Mail, MessageCircle, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Contact: React.FC = () => {
  const { settings } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phoneNum = settings?.phone || '01700-123456';
  const rawPhone = phoneNum.replace(/[^0-9+]/g, '');
  const whatsappNum = settings?.whatsapp || '8801700123456';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;

    setIsSubmitting(true);
    try {
      await api.sendContactMessage({ name, phone, message });
      setIsSent(true);
      setName('');
      setPhone('');
      setMessage('');
      setTimeout(() => setIsSent(false), 4000);
    } catch (err) {
      console.error('Failed to send contact message', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A]">
          যোগাযোগ করুন
        </h1>
        <p className="text-sm text-[#6B6B6B]">
          কীনোমার্ট সংক্রান্ত যেকোনো জিজ্ঞাসা বা সহযোগিতার জন্য সরাসরি মেসেজ দিন অথবা কল করুন
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E3DA] shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-[#1A1A1A]">আমাদের সরাসরি মেসেজ পাঠান</h2>

          {isSent && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>আপনার মেসেজটি সফলভাবে পাঠানো হয়েছে। ধন্যবাদ!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] mb-1">আপনার নাম *</label>
              <input
                type="text"
                placeholder="আপনার নাম লিখুন"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E5E3DA] focus:border-[#6B7A4F] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] mb-1">মোবাইল নম্বর *</label>
              <input
                type="tel"
                placeholder="যেমন: 01700000000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E5E3DA] focus:border-[#6B7A4F] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] mb-1">বার্তা বা জিজ্ঞাসা *</label>
              <textarea
                rows={4}
                placeholder="আপনার মেসেজ বিস্তারিত লিখুন..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E5E3DA] focus:border-[#6B7A4F] outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-[#6B7A4F] text-white font-bold text-sm hover:bg-[#586640] transition-colors flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>বার্তা পাঠান</span>
            </button>
          </form>
        </div>

        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E3DA] space-y-6">
          <h2 className="text-xl font-bold text-[#1A1A1A]">অফিস ও শপ তথ্য</h2>

          <div className="space-y-4 text-xs">
            <a
              href={`tel:${rawPhone}`}
              className="flex items-start space-x-3 p-3.5 rounded-2xl bg-[#F7F5EF] hover:bg-[#6B7A4F]/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#6B7A4F] text-white flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-[#1A1A1A] block">হটলাইন সাপোর্ট:</span>
                <span className="text-[#6B7A4F] text-sm font-extrabold">{phoneNum}</span>
              </div>
            </a>

            <a
              href={`https://wa.me/${whatsappNum}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start space-x-3 p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-emerald-900 block">হোয়াটসঅ্যাপে চ্যাট:</span>
                <span className="text-emerald-700 font-bold">{whatsappNum}</span>
              </div>
            </a>

            <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-[#F7F5EF]">
              <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-[#1A1A1A] block">শো-রুম / ডেলিভারি হাব:</span>
                <span className="text-[#6B6B6B] leading-relaxed">
                  {settings?.address || 'লেভেল ৫, বসুন্ধরা সিটি শপিং মল, পান্থপথ, ঢাকা-১২০৫'}
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-[#F7F5EF]">
              <div className="w-10 h-10 rounded-xl bg-[#C97B4A] text-white flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-[#1A1A1A] block">অফিস ও সাপোর্ট সময়সূচী:</span>
                <span className="text-[#6B6B6B]">প্রতিদিন সকাল ১০:০০ টা থেকে রাত ১০:০০ টা পর্যন্ত</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
