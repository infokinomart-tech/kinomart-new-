import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingBag,
  Package,
  Tags,
  Ticket,
  Users,
  Settings,
  ExternalLink,
  LogOut,
  Save,
  MessageSquare,
  Smartphone,
  CheckCheck,
  X,
  Trash2,
  Send,
  Zap
} from 'lucide-react';
import { AdminOrders } from './AdminOrders';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminCoupons } from './AdminCoupons';
import { AdminTeam } from './AdminTeam';
import { AdminSettings } from './AdminSettings';

export const AdminLayout: React.FC = () => {
  const {
    activeAdminTab,
    setActiveAdminTab,
    setViewMode,
    logoutAdmin,
    settings,
    mockSmsLogs,
    latestSmsToast,
    dismissSmsToast,
    clearSmsLogs
  } = useStore();

  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);

  const handleManualSave = () => {
    setSavedSuccessMsg(true);
    setTimeout(() => setSavedSuccessMsg(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0F1117] text-[#E2E8F0] font-sans relative">
      {/* Floating Mock SMS Toast Notification */}
      {latestSmsToast && (
        <div className="fixed top-16 right-4 z-50 max-w-sm w-full bg-[#091E15] border border-emerald-500/50 rounded-2xl p-4 shadow-2xl text-white animate-slideInDown">
          <div className="flex items-start justify-between gap-2 border-b border-emerald-500/20 pb-2 mb-2">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-xs">
              <Smartphone className="w-4 h-4 animate-bounce" />
              <span>📱 Mock SMS Confirmation Sent!</span>
            </div>
            <button
              onClick={dismissSmsToast}
              className="text-gray-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-[11px] text-emerald-200">
              <span className="font-bold">{latestSmsToast.customerName} ({latestSmsToast.customerPhone})</span>
              <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-mono">
                {latestSmsToast.messageId}
              </span>
            </div>
            <p className="bg-[#040E0A] p-2 rounded-xl text-emerald-100 text-[11px] font-mono border border-emerald-500/20 leading-relaxed">
              "{latestSmsToast.message}"
            </p>
            <div className="flex justify-between items-center text-[10px] text-emerald-400/80 pt-1">
              <span>Status: <strong className="text-emerald-300">200 OK (Delivered)</strong></span>
              <span>{latestSmsToast.sentAt}</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Admin Header */}
      <header className="bg-[#161922] border-b border-[#2A2E3D] px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center border border-[#333]">
              <span className="font-black text-[#A5DD28] text-lg">Km</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                <span>{settings.websiteTitle}</span>
                <span className="text-[10px] bg-[#222736] text-[#A3C676] px-2 py-0.5 rounded font-mono border border-[#3B4358]">
                  Admin Panel
                </span>
              </h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto text-xs font-semibold py-1">
            <button
              onClick={() => setActiveAdminTab('orders')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                activeAdminTab === 'orders'
                  ? 'bg-[#2563EB] text-white font-bold shadow-sm'
                  : 'text-[#94A3B8] hover:bg-[#222736] hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>অর্ডারস (Orders)</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('products')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                activeAdminTab === 'products'
                  ? 'bg-[#2563EB] text-white font-bold shadow-sm'
                  : 'text-[#94A3B8] hover:bg-[#222736] hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>প্রোডাক্টস (Products)</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('categories')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                activeAdminTab === 'categories'
                  ? 'bg-[#2563EB] text-white font-bold shadow-sm'
                  : 'text-[#94A3B8] hover:bg-[#222736] hover:text-white'
              }`}
            >
              <Tags className="w-4 h-4" />
              <span>ক্যাটাগরি (Categories)</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('coupons')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                activeAdminTab === 'coupons'
                  ? 'bg-[#2563EB] text-white font-bold shadow-sm'
                  : 'text-[#94A3B8] hover:bg-[#222736] hover:text-white'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>কুপনস (Coupons)</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('team')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                activeAdminTab === 'team'
                  ? 'bg-[#2563EB] text-white font-bold shadow-sm'
                  : 'text-[#94A3B8] hover:bg-[#222736] hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>টিম (Team)</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                activeAdminTab === 'settings'
                  ? 'bg-[#2563EB] text-white font-bold shadow-sm'
                  : 'text-[#94A3B8] hover:bg-[#222736] hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>সেটিংস (Settings)</span>
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Mock SMS Trigger / Logs Button */}
            <button
              onClick={() => setIsSmsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F291E] border border-emerald-500/40 text-emerald-400 hover:bg-[#163829] text-xs font-bold transition-all cursor-pointer relative"
              title="SMS নোটিফিকেশন লগ ও ট্রিগার সিমুলেটর"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">SMS ট্রিগার</span>
              {mockSmsLogs.length > 0 && (
                <span className="bg-emerald-500 text-black font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                  {mockSmsLogs.length}
                </span>
              )}
            </button>

            <button
              onClick={handleManualSave}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savedSuccessMsg ? 'সেভ হয়েছে!' : 'ডাটা সেভ'}</span>
            </button>

            <button
              onClick={() => setViewMode('client')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>সাইট দেখুন ↗</span>
            </button>

            <button
              onClick={logoutAdmin}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-bold transition-all cursor-pointer"
              title="লগআউট"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeAdminTab === 'orders' && <AdminOrders />}
        {activeAdminTab === 'products' && <AdminProducts />}
        {activeAdminTab === 'categories' && <AdminCategories />}
        {activeAdminTab === 'coupons' && <AdminCoupons />}
        {activeAdminTab === 'team' && <AdminTeam />}
        {activeAdminTab === 'settings' && <AdminSettings />}
      </main>

      {/* SMS Logs & Gateway Simulator Modal */}
      {isSmsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0B132B] border border-[#1E293B] rounded-3xl max-w-2xl w-full p-6 space-y-4 text-white shadow-2xl relative animate-scaleUp">
            <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">Mock SMS Gateway Simulator</h3>
                  <p className="text-xs text-emerald-400 font-medium">
                    GreenWeb BD SMS Gateway • API Key: <code className="bg-emerald-950 px-1 py-0.5 rounded text-[10px]">gw_live_sim_982</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSmsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gateway Status Summary */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-[#050C1E] border border-[#1E293B] p-3 rounded-2xl">
                <span className="text-[#94A3B8] text-[10px] font-bold block">Gateway Status</span>
                <span className="text-emerald-400 font-black flex items-center gap-1 mt-0.5">
                  <Zap className="w-3.5 h-3.5" /> 100% Operational
                </span>
              </div>

              <div className="bg-[#050C1E] border border-[#1E293B] p-3 rounded-2xl">
                <span className="text-[#94A3B8] text-[10px] font-bold block">Total Triggered SMS</span>
                <span className="text-white font-black text-sm mt-0.5">{mockSmsLogs.length} Messages</span>
              </div>

              <div className="bg-[#050C1E] border border-[#1E293B] p-3 rounded-2xl">
                <span className="text-[#94A3B8] text-[10px] font-bold block">Delivery Rate</span>
                <span className="text-emerald-400 font-black text-sm mt-0.5">100% Success</span>
              </div>
            </div>

            {/* SMS Log List */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-[#CBD5E1]">সাম্প্রতিক SMS নিশ্চিতকরণ লগ:</span>
                {mockSmsLogs.length > 0 && (
                  <button
                    onClick={clearSmsLogs}
                    className="text-[11px] text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>লগ ক্লিয়ার করুন</span>
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                {mockSmsLogs.length === 0 ? (
                  <div className="text-center py-8 bg-[#050C1E] rounded-2xl border border-[#1E293B] text-gray-400 text-xs">
                    <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p>এখনো কোনো SMS পাঠানো হয়নি।</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      অর্ডারস ট্যাব থেকে স্ট্যাটাস পরিবর্তন করলে স্বয়ংক্রিয়ভাবে কাস্টমারকে টেক্সট মেসেজ পাঠানো হবে।
                    </p>
                  </div>
                ) : (
                  mockSmsLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-[#050C1E] border border-[#1E293B] p-3 rounded-2xl space-y-1.5 text-xs hover:border-emerald-500/40 transition-colors"
                    >
                      <div className="flex justify-between items-center text-[11px]">
                        <div className="flex items-center gap-2 font-bold text-white">
                          <span className="text-blue-400 font-mono">[{log.orderNumber}]</span>
                          <span>{log.customerName}</span>
                          <span className="text-gray-400 text-[10px]">({log.customerPhone})</span>
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1">
                          <CheckCheck className="w-3 h-3 text-emerald-400" /> DELIVERED
                        </span>
                      </div>

                      <p className="bg-[#0B132B] p-2 rounded-xl text-gray-200 text-xs font-mono leading-relaxed border border-[#1E293B]">
                        "{log.message}"
                      </p>

                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono pt-0.5">
                        <span>Gateway: {log.gateway}</span>
                        <span>{log.sentAt} • Ref: {log.messageId}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-2 border-t border-[#1E293B]">
              <span className="text-[11px] text-gray-400">
                💡 স্ট্যাটাস আপডেট করার সাথে সাথে সিমুলেটেড SMS কাস্টমারকে পাঠানো হয়।
              </span>
              <button
                onClick={() => setIsSmsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-xs font-bold text-white cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
