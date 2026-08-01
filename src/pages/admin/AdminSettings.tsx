import React, { useEffect, useState } from 'react';
import { Settings, Save, Lock, Code2, Phone, MapPin, CheckCircle2, Image, Plus, Trash2, Upload, CreditCard, Database, Copy, Check } from 'lucide-react';
import { SiteSettings } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { compressImage } from '../../lib/imageCompressor';

export const AdminSettings: React.FC = () => {
  const { refreshSettings } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  // Supabase Status
  const [supaStatus, setSupaStatus] = useState<any>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const sqlScript = `-- KinoMart Complete Supabase Schema (Run in Supabase SQL Editor)
CREATE TABLE IF NOT EXISTS public.store_data (id TEXT PRIMARY KEY DEFAULT 'main', data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.categories (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL, icon_name TEXT DEFAULT 'Grid', icon_url TEXT, display_order INTEGER DEFAULT 1, is_visible BOOLEAN DEFAULT TRUE, subcategories JSONB DEFAULT '[]'::jsonb, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.products (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL, description TEXT, short_description TEXT, price NUMERIC NOT NULL DEFAULT 0, discount_price NUMERIC, category_id TEXT, category_name TEXT, subcategory_id TEXT, subcategory_name TEXT, images JSONB DEFAULT '[]'::jsonb, video_url TEXT, variants JSONB DEFAULT '[]'::jsonb, specifications JSONB DEFAULT '[]'::jsonb, stock INTEGER DEFAULT 50, low_stock_threshold INTEGER DEFAULT 10, status TEXT DEFAULT 'active', is_featured BOOLEAN DEFAULT FALSE, is_best_seller BOOLEAN DEFAULT FALSE, timer_enabled BOOLEAN DEFAULT FALSE, timer_title TEXT, timer_end_time TEXT, timer_hours NUMERIC, rating NUMERIC DEFAULT 5.0, reviews_count INTEGER DEFAULT 1, seo_title TEXT, seo_description TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.orders (id TEXT PRIMARY KEY, invoice_id TEXT, order_number TEXT, customer_id TEXT, customer_name TEXT NOT NULL, phone TEXT NOT NULL, address TEXT NOT NULL, city TEXT DEFAULT 'Dhaka', area TEXT DEFAULT 'inside_dhaka', courier TEXT DEFAULT 'Steadfast', items JSONB DEFAULT '[]'::jsonb, subtotal NUMERIC DEFAULT 0, delivery_fee NUMERIC DEFAULT 60, shipping_cost NUMERIC DEFAULT 60, discount NUMERIC DEFAULT 0, discount_amount NUMERIC DEFAULT 0, total NUMERIC DEFAULT 0, total_revenue NUMERIC DEFAULT 0, status TEXT DEFAULT 'pending', order_status TEXT DEFAULT 'pending', payment_method TEXT DEFAULT 'cod', payment_status TEXT DEFAULT 'unpaid', bkash_number TEXT, transaction_id TEXT, trx_id TEXT, coupon_code TEXT, call_status TEXT DEFAULT 'not_called', note TEXT, order_notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.customers (id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL, password TEXT DEFAULT 'customer123', address TEXT, orders_count INTEGER DEFAULT 0, total_spent NUMERIC DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.coupons (id TEXT PRIMARY KEY, code TEXT NOT NULL, type TEXT DEFAULT 'fixed', discount_type TEXT DEFAULT 'fixed', amount NUMERIC DEFAULT 0, discount_value NUMERIC DEFAULT 0, min_order_amount NUMERIC DEFAULT 0, max_discount_amount NUMERIC, usage_limit INTEGER, used_count INTEGER DEFAULT 0, expires_at TEXT, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.reviews (id TEXT PRIMARY KEY, product_id TEXT NOT NULL, customer_name TEXT NOT NULL, phone TEXT, rating NUMERIC DEFAULT 5.0, comment TEXT NOT NULL, is_verified_buyer BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.settings (id TEXT PRIMARY KEY DEFAULT 'store_settings', store_name TEXT DEFAULT 'KinoMart', logo_title TEXT DEFAULT 'KinoMart', tagline TEXT, logo_url TEXT, favicon_url TEXT, phone TEXT DEFAULT '01700000000', whatsapp TEXT DEFAULT '01700000000', address TEXT DEFAULT 'ঢাকা, বাংলাদেশ', bkash_number TEXT DEFAULT '01700123456', nagad_number TEXT DEFAULT '01700123456', hero_title TEXT DEFAULT 'প্রিমিয়াম গ্যাজেটের নির্ভরযোগ্য ঠিকানা', hero_subtitle TEXT DEFAULT 'সেরা অফারে অরিজিনাল গ্যাজেট কিনুন কীনোমার্ট থেকে', hero_image TEXT, banner_images JSONB DEFAULT '[]'::jsonb, special_offer_text TEXT, special_offer_active BOOLEAN DEFAULT TRUE, inside_dhaka_charge NUMERIC DEFAULT 70, outside_dhaka_charge NUMERIC DEFAULT 130, free_shipping_min NUMERIC DEFAULT 3000, header_notice TEXT DEFAULT '⚡ কীনোমার্ট এ পাচ্ছেন দেশজুড়ে দ্রুত ক্যাশ অন ডেলিভারি এবং ১০০% অরিজিনাল গ্যাজেটের নিশ্চয়তা!', footer_about TEXT DEFAULT 'কীনোমার্ট বাংলাদেশের একটি বিশ্বস্ত প্রিমিয়াম গ্যাজেট অনলাইন শপ। আমরা সরবরাহ করি ১০০% অরিজিনাল ও মানসম্মত ইলেকট্রনিক্স গ্যাজেট।', pixel_id TEXT DEFAULT '123456789012345', capi_token TEXT DEFAULT 'EAA123456789ABCDEF...', admin_id TEXT DEFAULT 'kinomart', admin_password TEXT DEFAULT '@kinomart12@', updated_at TIMESTAMPTZ DEFAULT NOW());

-- Add Missing Columns
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon_name TEXT DEFAULT 'Grid';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon_url TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 1;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS subcategories JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory_id TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory_name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS timer_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS timer_title TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS timer_end_time TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS timer_hours NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS invoice_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Dhaka';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier TEXT DEFAULT 'Steadfast';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 60;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS trx_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_notes TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'customer123';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS orders_count INTEGER DEFAULT 0;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS total_spent NUMERIC DEFAULT 0;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'fixed';
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS favicon_url TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS special_offer_text TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS special_offer_active BOOLEAN DEFAULT TRUE;

-- Disable Row Level Security (RLS)
ALTER TABLE public.store_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;`;

  const checkSupabaseStatus = async () => {
    try {
      const res = await fetch('/api/supabase-status');
      const data = await res.json();
      setSupaStatus(data);
    } catch (e) {
      setSupaStatus({ connected: false, error: 'Cannot connect to server status endpoint' });
    }
  };

  // Form states
  const [logoTitle, setLogoTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [bkashNumber, setBkashNumber] = useState('');
  const [nagadNumber, setNagadNumber] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [specialOfferText, setSpecialOfferText] = useState('');
  const [specialOfferActive, setSpecialOfferActive] = useState(true);
  const [footerAbout, setFooterAbout] = useState('');

  // Pixel / CAPI
  const [pixelId, setPixelId] = useState('');
  const [capiToken, setCapiToken] = useState('');

  // Password change
  const [oldPassword, setOldPassword] = useState('');
  const [newAdminId, setNewAdminId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const data = await api.getSettings();
        setSettings(data);

        setLogoTitle(data.logo_title || 'KinoMart');
        setTagline(data.tagline || '');
        setLogoUrl(data.logo_url || '');
        setFaviconUrl(data.favicon_url || '');
        setPhone(data.phone || '');
        setWhatsapp(data.whatsapp || '');
        setAddress(data.address || '');
        setBkashNumber(data.bkash_number || '01700123456');
        setNagadNumber(data.nagad_number || '01700123456');
        setHeroTitle(data.hero_title || '');
        setHeroSubtitle(data.hero_subtitle || '');
        setHeroImage(data.hero_image || '');
        setBannerImages(data.banner_images && data.banner_images.length > 0 ? data.banner_images : [data.hero_image].filter(Boolean));
        setSpecialOfferText(data.special_offer_text || '');
        setSpecialOfferActive(data.special_offer_active ?? true);
        setFooterAbout(data.footer_about || '');
        setPixelId(data.pixel_id || '');
        setCapiToken(data.capi_token || '');
        setNewAdminId(data.admin_id || 'kinomart');
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
    checkSupabaseStatus();
  }, []);

  const sampleBanners = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1587049352847-81a56d773cae?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1508061253366-f7da158b6d96?auto=format&fit=crop&w=1400&q=80',
  ];

  const handleAddBanner = () => {
    setBannerImages([...bannerImages, '']);
  };

  const handleAdd4SampleBanners = () => {
    setBannerImages(sampleBanners);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...bannerImages];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setBannerImages(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === bannerImages.length - 1) return;
    const updated = [...bannerImages];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setBannerImages(updated);
  };

  const handleRemoveBanner = (index: number) => {
    setBannerImages(bannerImages.filter((_, i) => i !== index));
  };

  const handleBannerChange = (index: number, value: string) => {
    const updated = [...bannerImages];
    updated[index] = value;
    setBannerImages(updated);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file, 1200, 800, 0.82);
      const updated = [...bannerImages];
      updated[index] = compressed;
      setBannerImages(updated);
    }
  };

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file, 400, 400, 0.85);
      setLogoUrl(compressed);
    }
  };

  const handleFaviconFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file, 128, 128, 0.85);
      setFaviconUrl(compressed);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveErrorMsg('');
    setSaveSuccessMsg('');
    try {
      const validBanners = bannerImages.filter(img => img.trim() !== '');
      const updated = await api.updateSettings({
        logo_title: logoTitle,
        tagline,
        logo_url: logoUrl,
        favicon_url: faviconUrl,
        phone,
        whatsapp,
        address,
        bkash_number: bkashNumber,
        nagad_number: nagadNumber,
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        hero_image: validBanners[0] || heroImage,
        banner_images: validBanners,
        special_offer_text: specialOfferText,
        special_offer_active: specialOfferActive,
        footer_about: footerAbout,
        pixel_id: pixelId,
        capi_token: capiToken
      });
      setSettings(updated);
      await refreshSettings();
      setIsSaved(true);
      setSaveSuccessMsg('ওয়েবসাইট সেটিংস সফলভাবে সেভ ও আপডেট হয়েছে!');
      setTimeout(() => {
        setIsSaved(false);
        setSaveSuccessMsg('');
      }, 4000);
    } catch (err: any) {
      console.error('Error saving settings', err);
      setSaveErrorMsg('সেটিংস সেভ করতে সমস্যা হয়েছে: ' + (err?.message || 'সার্ভার ত্রুটি'));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!oldPassword) {
      setPwdError('বর্তমান পাসওয়ার্ড প্রদান করুন');
      return;
    }

    try {
      const res = await api.adminChangePassword(oldPassword, newPassword, newAdminId);
      if (res.success) {
        setPwdSuccess('এডমিন আইডি ও পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
        setOldPassword('');
        setNewPassword('');
        if (res.admin_id) setNewAdminId(res.admin_id);
        setTimeout(() => setPwdSuccess(''), 4000);
      } else {
        setPwdError(res.error || 'পরিবর্তন ব্যর্থ হয়েছে');
      }
    } catch (err) {
      setPwdError('সার্ভারে তথ্য পাঠাতে সমস্যা হয়েছে');
    }
  };

  if (isLoading) {
    return <div className="text-gray-400 text-xs py-8 text-center">সেটিংস লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between bg-[#181F30] border border-[#27324A] p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white">ওয়েবসাইট ও এডমিন সেটিংস</h2>
          <p className="text-xs text-gray-400">মার্কেটিং পিক্সেল, কন্টাক্ট ইনফো এবং পাসওয়ার্ড পরিবর্তন</p>
        </div>
      </div>

      {/* Banners */}
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-600 text-emerald-200 rounded-2xl flex items-center space-x-3 text-sm font-bold shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}
      {saveErrorMsg && (
        <div className="p-4 bg-rose-950/90 border border-rose-600 text-rose-200 rounded-2xl flex items-center space-x-3 text-sm font-bold shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{saveErrorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Logo & Favicon Customization */}
        <div className="bg-[#181F30] border border-[#27324A] p-6 rounded-2xl space-y-5">
          <div className="border-b border-[#27324A] pb-3">
            <h3 className="font-bold text-base text-white flex items-center space-x-2">
              <Image className="w-5 h-5 text-emerald-400" />
              <span>ওয়েবসাইট লোগো ও ফেভিকন (Website Logo & Favicon)</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              আপনার ব্র্যান্ডের লোগো এবং ব্রাউজার ট্যাবের আইকন (Favicon) পরিবর্তন করুন। সরাসরি কম্পিউটার বা মেমোরি থেকে আপলোড করতে পারেন বা লিঙ্ক দিতে পারেন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Logo Settings */}
            <div className="bg-[#0F1420] p-4 rounded-xl border border-[#27324A] space-y-3">
              <label className="block font-bold text-white text-xs">
                🖼️ ওয়েবসাইট লোগো (Brand Logo)
              </label>

              <div className="flex items-center space-x-3">
                <div className="w-20 h-20 rounded-xl bg-[#181F30] border border-[#27324A] flex items-center justify-center overflow-hidden p-1 shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-gray-500 font-bold text-center">লোগো দেওয়া নেই</span>
                  )}
                </div>
                <div className="space-y-2 flex-grow">
                  <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg cursor-pointer text-xs font-bold transition-colors shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>লোগো আপলোড করুন</span>
                    <input type="file" accept="image/*" onChange={handleLogoFileUpload} className="hidden" />
                  </label>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="block text-[11px] text-rose-400 hover:underline font-semibold"
                    >
                      লোগো সরান (ডিফল্ট টেক্সট থাকবে)
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-400 text-[11px] mb-1">অথবা লোগোর লিংক (Image URL):</label>
                <input
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  className="w-full p-2 bg-[#181F30] border border-[#27324A] rounded-lg text-white outline-none font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Favicon Settings */}
            <div className="bg-[#0F1420] p-4 rounded-xl border border-[#27324A] space-y-3">
              <label className="block font-bold text-white text-xs">
                🌐 ব্রাউজার ফেভিকন (Tab Favicon Icon)
              </label>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-[#181F30] border border-[#27324A] flex items-center justify-center overflow-hidden p-1 shrink-0">
                  {faviconUrl ? (
                    <img src={faviconUrl} alt="Favicon Preview" className="w-8 h-8 object-contain" />
                  ) : (
                    <span className="text-[10px] text-gray-500 font-bold text-center">নাই</span>
                  )}
                </div>
                <div className="space-y-2 flex-grow">
                  <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg cursor-pointer text-xs font-bold transition-colors shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>ফেভিকন আপলোড করুন</span>
                    <input type="file" accept="image/*" onChange={handleFaviconFileUpload} className="hidden" />
                  </label>
                  {faviconUrl && (
                    <button
                      type="button"
                      onClick={() => setFaviconUrl('')}
                      className="block text-[11px] text-rose-400 hover:underline font-semibold"
                    >
                      ফেভিকন মুছুন
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-400 text-[11px] mb-1">অথবা ফেভিকন লিংক (Image/Icon URL):</label>
                <input
                  type="text"
                  placeholder="https://example.com/favicon.ico"
                  value={faviconUrl}
                  onChange={e => setFaviconUrl(e.target.value)}
                  className="w-full p-2 bg-[#181F30] border border-[#27324A] rounded-lg text-white outline-none font-mono text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Announcement Bar / Offer Ticker */}
        <div className="bg-[#181F30] border border-[#27324A] p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#27324A] pb-3">
            <div>
              <h3 className="font-bold text-base text-white">
                📢 টপ অ্যানাউন্সমেন্ট ও স্পেশাল অফার বার (Top Banner Ticker)
              </h3>
              <p className="text-xs text-gray-400">ওয়েবসাইটের সবচেয়ে উপরে চলা নোটিশ বা অফার বার্তা</p>
            </div>
            <label className="inline-flex items-center cursor-pointer space-x-2">
              <input
                type="checkbox"
                checked={specialOfferActive}
                onChange={e => setSpecialOfferActive(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded bg-[#0F1420] border-[#27324A]"
              />
              <span className="text-xs font-bold text-emerald-400">বার চালু রাখুন</span>
            </label>
          </div>

          <div className="text-xs space-y-2">
            <label className="block font-bold text-gray-300">অফার বার টেক্সট:</label>
            <input
              type="text"
              value={specialOfferText}
              onChange={e => setSpecialOfferText(e.target.value)}
              placeholder="🔥 বিশেষ অফার: যেকোনো দুটি পণ্য অর্ডারে ফ্রি ডেলিভারি!"
              className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none"
            />
          </div>
        </div>
        {/* Facebook Pixel & CAPI Settings */}
        <div className="bg-[#181F30] border border-[#27324A] p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-base text-white flex items-center space-x-2 border-b border-[#27324A] pb-3">
            <Code2 className="w-5 h-5 text-blue-400" />
            <span>Facebook Pixel & Conversions API (CAPI)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-300 mb-1">Facebook Pixel ID</label>
              <input
                type="text"
                placeholder="যেমন: 123456789012345"
                value={pixelId}
                onChange={e => setPixelId(e.target.value)}
                className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1">CAPI Access Token</label>
              <input
                type="password"
                placeholder="EAAG..."
                value={capiToken}
                onChange={e => setCapiToken(e.target.value)}
                className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Mobile Banking Payment Settings (bKash & Nagad) */}
        <div className="bg-[#181F30] border border-[#27324A] p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="border-b border-[#27324A] pb-3 flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-pink-400" />
              <span>মোবাইল ব্যাংকিং নম্বর (bKash & Nagad)</span>
            </h3>
            <span className="text-[11px] px-2.5 py-1 bg-pink-950/60 text-pink-300 border border-pink-800/60 rounded-lg font-bold">
              পেমেন্ট সেটিংস
            </span>
          </div>

          <p className="text-xs text-gray-400">
            গ্রাহক যখন চেকআউটে বিকাশ বা নগদ দিয়ে পেমেন্ট সিলেক্ট করবেন, তখন নিচে সেট করা নম্বর প্রদর্শিত হবে।
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#0F1420] p-4 rounded-xl border border-[#27324A] space-y-2">
              <label className="block font-bold text-[#E2136E] text-xs flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E2136E] shrink-0"></span>
                <span>বিকাশ পার্সোনাল নম্বর (bKash Number)</span>
              </label>
              <input
                type="text"
                placeholder="যেমন: 01700123456"
                value={bkashNumber}
                onChange={e => setBkashNumber(e.target.value)}
                className="w-full p-2.5 bg-[#181F30] border border-[#27324A] rounded-xl text-white outline-none focus:border-[#E2136E] font-mono text-xs font-bold"
              />
            </div>

            <div className="bg-[#0F1420] p-4 rounded-xl border border-[#27324A] space-y-2">
              <label className="block font-bold text-[#F7921E] text-xs flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F7921E] shrink-0"></span>
                <span>নগদ পার্সোনাল নম্বর (Nagad Number)</span>
              </label>
              <input
                type="text"
                placeholder="যেমন: 01700123456"
                value={nagadNumber}
                onChange={e => setNagadNumber(e.target.value)}
                className="w-full p-2.5 bg-[#181F30] border border-[#27324A] rounded-xl text-white outline-none focus:border-[#F7921E] font-mono text-xs font-bold"
              />
            </div>
          </div>
        </div>

        {/* Brand & Store Contact Info */}
        <div className="bg-[#181F30] border border-[#27324A] p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-base text-white border-b border-[#27324A] pb-3">
            ব্র্যান্ড ও যোগাযোগের তথ্য
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-300 mb-1">ওয়েবসাইট টাইটেল (Title)</label>
              <input
                type="text"
                value={logoTitle}
                onChange={e => setLogoTitle(e.target.value)}
                className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1">ট্যাগলাইন (Tagline)</label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1">হটলাইন ফোন নম্বর</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-300 mb-1">হোয়াটসঅ্যাপ নম্বর</label>
              <input
                type="text"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-gray-300 mb-1">শো-রুম ও অফিস ঠিকানা</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-gray-300 mb-1">ফুটার ডেসক্রিপশন / আমাদের সম্পর্কে সংক্ষেপে</label>
              <textarea
                rows={3}
                value={footerAbout}
                onChange={e => setFooterAbout(e.target.value)}
                placeholder="ওয়েবসাইটের নিচে ফুটারে দেখানোর জন্য ছোট বিবরণ..."
                className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Homepage Hero Banner Configuration (Pure Image Banners) */}
        <div className="bg-[#181F30] border border-[#27324A] p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#27324A] pb-3 gap-3">
            <div>
              <h3 className="font-bold text-base text-white flex items-center space-x-2">
                <Image className="w-5 h-5 text-amber-400" />
                <span>হোমপেজ ব্যানার স্লাইডার পিকচারসমূহ</span>
                <span className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[11px] rounded-full font-mono">
                  {bannerImages.length} টি ব্যানার
                </span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                হোমপেজে স্লাইড করে চলা ৪টি বা তার বেশি ব্যানার পিকচার যোগ করুন। ছবি আপলোড অথবা লিঙ্ক বসাতে পারেন।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAdd4SampleBanners}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors shadow-sm"
                title="৪টি হাই-কোয়ালিটি নমুনা ব্যানার লোড করুন"
              >
                <span>⚡ ৪টি নমুনা ব্যানার বসান</span>
              </button>
              <button
                type="button"
                onClick={handleAddBanner}
                className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl flex items-center space-x-1 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন ব্যানার যোগ করুন</span>
              </button>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {bannerImages.length === 0 ? (
              <div className="p-6 bg-[#0F1420] border border-dashed border-[#27324A] rounded-2xl text-center space-y-3">
                <p className="text-gray-400">কোনো ব্যানার ছবি যোগ করা হয়নি।</p>
                <button
                  type="button"
                  onClick={handleAdd4SampleBanners}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center space-x-2"
                >
                  <span>⚡ ৪টি প্রিসেট ব্যানার লোড করুন</span>
                </button>
              </div>
            ) : (
              bannerImages.map((imgUrl, index) => (
                <div key={index} className="p-4 bg-[#0F1420] border border-[#27324A] rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#27324A]/60 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                        {index + 1}
                      </span>
                      <span className="font-bold text-white text-xs">
                        ব্যানার #{index + 1} {index === 0 && <span className="text-amber-400 font-normal text-[11px]">(প্রধান ব্যানার)</span>}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          className="px-2 py-1 bg-[#181F30] text-gray-300 hover:text-white rounded-lg text-[11px] border border-[#27324A]"
                          title="উপরে সরান"
                        >
                          ▲
                        </button>
                      )}
                      {index < bannerImages.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          className="px-2 py-1 bg-[#181F30] text-gray-300 hover:text-white rounded-lg text-[11px] border border-[#27324A]"
                          title="নিচে সরান"
                        >
                          ▼
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveBanner(index)}
                        className="px-2.5 py-1 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors flex items-center space-x-1 border border-red-900/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">মুছুন</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-8 space-y-2">
                      <label className="block text-gray-300 font-semibold text-[11px]">ব্যানার ছবির লিংক (Image URL)</label>
                      <input
                        type="text"
                        placeholder="https://... (ছবি লিংক)"
                        value={imgUrl}
                        onChange={e => handleBannerChange(index, e.target.value)}
                        className="w-full p-2.5 bg-[#181F30] border border-[#27324A] rounded-xl text-white outline-none font-mono text-[11px]"
                      />
                      <div className="flex items-center space-x-2 pt-1">
                        <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#27324A] hover:bg-[#32405E] text-white rounded-lg cursor-pointer text-[11px] font-semibold transition-colors">
                          <Upload className="w-3.5 h-3.5 text-amber-300" />
                          <span>গ্যালারি বা ডিভাইস থেকে ছবি আপলোড</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => handleFileUpload(e, index)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="sm:col-span-4 flex justify-center">
                      {imgUrl ? (
                        <div className="relative w-full h-24 rounded-xl overflow-hidden border border-[#27324A] bg-black shadow-inner">
                          <img src={imgUrl} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-full h-24 rounded-xl border border-dashed border-[#27324A] bg-[#181F30] flex flex-col items-center justify-center text-gray-500 text-[11px] p-2 text-center">
                          <Image className="w-6 h-6 mb-1 text-gray-600" />
                          <span>কোনো ছবি দেওয়া হয় নাই</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-lg"
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? 'সেটিংস সেভ হয়েছে✓' : 'সকল সেটিংস সেভ করুন'}</span>
        </button>
      </form>

      {/* Supabase Database Persistence Status & Setup */}
      <div className="bg-[#181F30] border border-[#27324A] p-6 rounded-2xl space-y-4">
        <div className="border-b border-[#27324A] pb-3 flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-base text-white flex items-center space-x-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>Supabase ডাটাবেজ কানেকশন ও পারসিস্টেন্স স্ট্যাটাস</span>
          </h3>
          <button
            type="button"
            onClick={checkSupabaseStatus}
            className="text-xs px-3 py-1.5 bg-[#27324A] hover:bg-[#323F5D] text-white rounded-lg transition-colors font-semibold"
          >
            🔄 রিফ্রেশ স্ট্যাটাস
          </button>
        </div>

        {supaStatus ? (
          <div className="space-y-3 text-xs">
            {supaStatus.connected ? (
              <div className="p-3 bg-emerald-950/70 border border-emerald-800 text-emerald-300 rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold">Supabase কানেক্টেড আছে! </span>
                  <span>{supaStatus.message || 'আপনার স্টোরের প্রোডাক্ট, ক্যাটাগরি ও অর্ডার ডাটাবেজে সেভ হচ্ছে।'}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-950/80 border border-amber-800 text-amber-200 rounded-xl space-y-1">
                <div className="font-bold flex items-center space-x-2 text-amber-300">
                  <span>⚡ Supabase Environment Variables Not Set on Hosting</span>
                </div>
                <p className="text-[11px] text-amber-300/90">
                  {supaStatus.message || supaStatus.error || 'Vercel / Hosting এর Environment Variables এ SUPABASE_URL এবং SUPABASE_ANON_KEY সেট করলে আপনার ডাটা ক্লাউডে সুরক্ষিত থাকবে।'}
                </p>
              </div>
            )}

            <div className="bg-[#0F1420] border border-[#27324A] p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">📋 Supabase 1-Click SQL Setup Script</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(sqlScript);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center space-x-1 transition-colors text-[11px]"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'কপি হয়েছে!' : 'SQL কপি করুন'}</span>
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
                Supabase Dashboard &gt; SQL Editor এ গিয়ে এই কোডটি Run করলে ডাটাবেজে কোনো টেবিল মিসিং থাকলেও সমস্ত প্রোডাক্ট, ক্যাটাগরি, অর্ডার ও সেটিংস পারফেক্টলি সেভ হবে:
              </p>
              <pre className="p-3 bg-black/60 border border-gray-800 rounded-lg text-[11px] text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap">
                {sqlScript}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-400 py-2">স্ট্যাটাস চেক করা হচ্ছে...</div>
        )}
      </div>

      {/* Change Admin Credentials Panel */}
      <div className="bg-[#181F30] border border-[#27324A] p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-base text-white flex items-center space-x-2 border-b border-[#27324A] pb-3">
          <Lock className="w-5 h-5 text-amber-400" />
          <span>এডমিন আইডি ও পাসওয়ার্ড পরিবর্তন</span>
        </h3>

        {pwdSuccess && (
          <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{pwdSuccess}</span>
          </div>
        )}

        {pwdError && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
            <span className="font-bold">⚠️</span>
            <span>{pwdError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs max-w-md">
          <div>
            <label className="block font-bold text-gray-300 mb-1">বর্তমান পাসওয়ার্ড (Current Password)</label>
            <input
              type="password"
              placeholder="বর্তমান পাসওয়ার্ড দিন..."
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-gray-300 mb-1">নতুন এডমিন আইডি (New Admin ID)</label>
            <input
              type="text"
              placeholder="যেমন: kinomart"
              value={newAdminId}
              onChange={e => setNewAdminId(e.target.value)}
              className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-gray-300 mb-1">নতুন পাসওয়ার্ড (New Password)</label>
            <input
              type="password"
              placeholder="নতুন পাসওয়ার্ড দিন..."
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm active:scale-95"
          >
            আইডি ও পাসওয়ার্ড আপডেট করুন
          </button>
        </form>
      </div>
    </div>
  );
};
