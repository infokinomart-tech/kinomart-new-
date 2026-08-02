import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Settings,
  Save,
  Check,
  ShieldAlert,
  Globe,
  Bell,
  CreditCard,
  Building,
  KeyRound,
  RotateCcw
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, saveSettings, resetToDefaults } = useStore();

  const [formData, setFormData] = useState({ ...settings });
  const [currentPass, setCurrentPass] = useState('');
  const [newAdminId, setNewAdminId] = useState(settings.adminUsername);
  const [newPass, setNewPass] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [passMsg, setPassMsg] = useState('');

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(formData);
    setSuccessMsg('সকল সেটিংস সফলভাবে সেভ হয়েছে!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPass !== settings.adminPasswordHash) {
      setPassMsg('⚠️ বর্তমান পাসওয়ার্ডটি ভুল!');
      return;
    }

    if (!newAdminId.trim()) {
      setPassMsg('⚠️ সঠিক ইউজারনেম দিন!');
      return;
    }

    const updated = {
      ...formData,
      adminUsername: newAdminId.trim(),
      adminPasswordHash: newPass.trim() || settings.adminPasswordHash
    };

    setFormData(updated);
    saveSettings(updated);
    setPassMsg('✓ এডমিন আইডি ও পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!');
    setCurrentPass('');
    setNewPass('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="bg-[#181B26] border border-[#2B3042] p-4 rounded-2xl flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#2563EB]" />
            <span>ওয়েবসাইট ও এডমিন সেটিংস</span>
          </h2>
          <p className="text-xs text-[#94A3B8]">সাইটের হেডার, পেমেন্ট নাম্বার, নোটিফিকেশন ও সিকিউরিটি পরিবর্তন করুন</p>
        </div>

        <button
          onClick={() => {
            if (confirm('রিসেট করলে সব ডাটা ডিফল্ট অবস্থায় ফিরে যাবে। আপনি কি নিশ্চিত?')) {
              resetToDefaults();
              window.location.reload();
            }
          }}
          className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1 font-bold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>রিসেট ডাটা</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Section 1: Logo & Favicon */}
        <div className="bg-[#181B26] border border-[#2B3042] p-5 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#2563EB]" />
            ওয়েবসাইট লোগো ও ফেভিকন (Website Logo & Favicon)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#94A3B8] font-bold mb-1">ওয়েবসাইট লোগো (Brand Logo)</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs cursor-pointer transition-colors">
                    <span>⚓ ফাইল আপলোড</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            if (evt.target?.result) {
                              setFormData({ ...formData, logoUrl: evt.target.result as string });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {formData.logoUrl && (
                    <img src={formData.logoUrl} alt="Logo" className="h-8 max-w-[120px] object-contain bg-[#11131A] p-1 rounded border border-[#33384B]" />
                  )}
                </div>
                <input
                  type="text"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#94A3B8] font-bold mb-1">ব্রাউজার আইকন (Favicon)</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs cursor-pointer transition-colors">
                    <span>⚓ ফাইল আপলোড</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            if (evt.target?.result) {
                              setFormData({ ...formData, faviconUrl: evt.target.result as string });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {formData.faviconUrl && (
                    <img src={formData.faviconUrl} alt="Favicon" className="w-8 h-8 object-contain bg-[#11131A] p-1 rounded border border-[#33384B]" />
                  )}
                </div>
                <input
                  type="text"
                  value={formData.faviconUrl}
                  onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
                  placeholder="https://example.com/favicon.ico"
                  className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Top Banner Ticker */}
        <div className="bg-[#181B26] border border-[#2B3042] p-5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#A5DD28]" />
              টপ ব্যানার নোটিফিকেশন ও মেসেজ বার (Top Banner Ticker)
            </h3>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={formData.topBannerEnabled}
                onChange={(e) => setFormData({ ...formData, topBannerEnabled: e.target.checked })}
                className="accent-[#2563EB]"
              />
              <span>টপ বার চালু রাখুন</span>
            </label>
          </div>

          <div className="text-xs">
            <label className="block text-[#94A3B8] font-bold mb-1">ব্যানার বার বার্তা</label>
            <input
              type="text"
              value={formData.topBannerText}
              onChange={(e) => setFormData({ ...formData, topBannerText: e.target.value })}
              className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white font-medium"
            />
          </div>
        </div>

        {/* Section 3: Facebook Pixel & CAPI */}
        <div className="bg-[#181B26] border border-[#2B3042] p-5 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            Facebook Pixel & Conversions API (CAPI)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#94A3B8] font-bold mb-1">Facebook Pixel ID</label>
              <input
                type="text"
                value={formData.facebookPixelId}
                onChange={(e) => setFormData({ ...formData, facebookPixelId: e.target.value })}
                className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white"
              />
            </div>
            <div>
              <label className="block text-[#94A3B8] font-bold mb-1">CAPI Access Token</label>
              <input
                type="text"
                value={formData.capiAccessToken}
                onChange={(e) => setFormData({ ...formData, capiAccessToken: e.target.value })}
                className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Mobile Banking Numbers */}
        <div className="bg-[#181B26] border border-[#2B3042] p-5 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-pink-400" />
            মোবাইল ব্যাংকিং নম্বর (bKash & Nagad)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#94A3B8] font-bold mb-1">বিকাশ পার্সোনাল নম্বর (bKash Number)</label>
              <input
                type="text"
                value={formData.bkashNumber}
                onChange={(e) => setFormData({ ...formData, bkashNumber: e.target.value })}
                className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[#94A3B8] font-bold mb-1">নগদ পার্সোনাল নম্বর (Nagad Number)</label>
              <input
                type="text"
                value={formData.nagadNumber}
                onChange={(e) => setFormData({ ...formData, nagadNumber: e.target.value })}
                className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Company Info */}
        <div className="bg-[#181B26] border border-[#2B3042] p-5 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <Building className="w-4 h-4 text-[#A5DD28]" />
            ফুটার ও কন্টাক্ট তথ্য
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#94A3B8] font-bold mb-1">ওয়েবসাইট টাইটেল (Title)</label>
              <input
                type="text"
                value={formData.websiteTitle}
                onChange={(e) => setFormData({ ...formData, websiteTitle: e.target.value })}
                className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white"
              />
            </div>

            <div>
              <label className="block text-[#94A3B8] font-bold mb-1">ট্যাগলাইন (Tagline)</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white"
              />
            </div>

            <div>
              <label className="block text-[#94A3B8] font-bold mb-1">হটলাইন নম্বর</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white"
              />
            </div>

            <div>
              <label className="block text-[#94A3B8] font-bold mb-1">হোয়াটসঅ্যাপ নম্বর</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white"
              />
            </div>

            <div>
              <label className="block text-[#94A3B8] font-bold mb-1">ইমেইল</label>
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white"
              />
            </div>

            <div>
              <label className="block text-[#94A3B8] font-bold mb-1">শপ ঠিকানা</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-[#94A3B8] font-bold mb-1">ফুটার ডেসক্রিপশন / আমাদের সম্পর্কে</label>
            <textarea
              rows={2}
              value={formData.footerAbout}
              onChange={(e) => setFormData({ ...formData, footerAbout: e.target.value })}
              className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white"
            />
          </div>
        </div>

        {/* Primary Save Button */}
        <button
          type="submit"
          className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <Save className="w-5 h-5" />
          <span>💾 সকল সেটিংস সেভ করুন</span>
        </button>
      </form>

      {/* Section 6: Security & Password Update (Matching Image 13) */}
      <div className="bg-[#181B26] border border-[#2B3042] p-5 rounded-2xl space-y-4">
        <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-400" />
          এডমিন আইডি ও পাসওয়ার্ড পরিবর্তন (Admin Credentials)
        </h3>

        {passMsg && (
          <p className="text-xs font-bold p-2.5 rounded-xl bg-[#11131A] border border-[#33384B] text-amber-300">
            {passMsg}
          </p>
        )}

        <form onSubmit={handleSaveSecurity} className="space-y-3 text-xs">
          <div>
            <label className="block text-[#94A3B8] font-bold mb-1">বর্তমান পাসওয়ার্ড (Current Password)</label>
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="বর্তমান পাসওয়ার্ড দিন..."
              className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white"
            />
          </div>

          <div>
            <label className="block text-[#94A3B8] font-bold mb-1">নতুন এডমিন আইডি (New Admin ID)</label>
            <input
              type="text"
              value={newAdminId}
              onChange={(e) => setNewAdminId(e.target.value)}
              className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-[#94A3B8] font-bold mb-1">নতুন পাসওয়ার্ড (New Password)</label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="নতুন পাসওয়ার্ড দিন..."
              className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white"
            />
          </div>

          <button
            type="submit"
            className="bg-[#EA580C] hover:bg-orange-600 text-white font-extrabold py-2.5 px-5 rounded-xl text-xs transition-all shadow-md"
          >
            আইডি ও পাসওয়ার্ড আপডেট করুন
          </button>
        </form>
      </div>
    </div>
  );
};
