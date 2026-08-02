import React from 'react';
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
  RotateCcw,
  Save,
  CheckCircle2
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
    resetToDefaults
  } = useStore();

  const [savedSuccessMsg, setSavedSuccessMsg] = React.useState(false);

  const handleManualSave = () => {
    setSavedSuccessMsg(true);
    setTimeout(() => setSavedSuccessMsg(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0F1117] text-[#E2E8F0] font-sans">
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
            <button
              onClick={handleManualSave}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savedSuccessMsg ? 'সেভ হয়েছে!' : 'ডাটা সেভ'}</span>
            </button>

            <button
              onClick={() => setViewMode('client')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>সাইট দেখুন ↗</span>
            </button>

            <button
              onClick={logoutAdmin}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-bold transition-all"
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
    </div>
  );
};
