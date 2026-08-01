import React, { useState } from 'react';
import { Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { ShoppingCart, Package, FolderTree, Tag, Users, Settings, LogOut, RefreshCw, ExternalLink, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { KinoMartLogo } from '../../components/common/KinoMartLogo';
import { api } from '../../services/api';

export const AdminLayout: React.FC = () => {
  const { isAdminLoggedIn, logoutAdmin, settings } = useAuth();
  const location = useLocation();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  if (!isAdminLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncNotice(null);
    try {
      const res = await api.syncToSupabase();
      if (res.success) {
        setSyncNotice({
          type: 'success',
          msg: res.message || 'সকল ডাটা সফলভাবে Supabase ডাটাবেজে সেভ ও পুশ হয়েছে!'
        });
      } else {
        setSyncNotice({
          type: 'error',
          msg: res.error || 'Supabase এ ডাটা সেভ করতে সমস্যা হয়েছে।'
        });
      }
    } catch (err: any) {
      setSyncNotice({
        type: 'error',
        msg: err?.message || 'Supabase কানেকশন বা সার্ভার ত্রুটি।'
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncNotice(null), 6000);
    }
  };

  const tabs = [
    { name: 'অর্ডারস (Orders)', path: '/admin/orders', icon: ShoppingCart },
    { name: 'প্রোডাক্টস (Products)', path: '/admin/products', icon: Package },
    { name: 'ক্যাটাগরি (Categories)', path: '/admin/categories', icon: FolderTree },
    { name: 'কুপনস (Coupons)', path: '/admin/coupons', icon: Tag },
    { name: 'টিম (Team)', path: '/admin/team', icon: Users },
    { name: 'সেটিংস (Settings)', path: '/admin/settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#0F1420] text-gray-100 font-sans antialiased">
      {/* Dark Navy Admin Header */}
      <header className="bg-[#181F30] border-b border-[#27324A] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt="Admin Logo"
                  className="h-9 w-auto max-w-[120px] object-contain rounded-lg bg-white/10 p-1"
                />
              ) : (
                <KinoMartLogo className="w-9 h-9" logoUrl={settings?.logo_url} />
              )}
              <div className="flex flex-col">
                <span className="font-bold text-lg text-white tracking-wide">{settings?.logo_title || 'KinoMart'}</span>
                <span className="text-[10px] text-blue-400 font-semibold -mt-1">Admin Panel</span>
              </div>
            </div>

            {/* Navigation Tabs (Center) */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = location.pathname === tab.path;
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#2563EB] text-white shadow-md'
                        : 'text-gray-300 hover:text-white hover:bg-[#27324A]/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Supabase Save Button */}
              <button
                type="button"
                onClick={handleSyncToSupabase}
                disabled={isSyncing}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                title="Supabase ডাটাবেজে সকল ডাটা সেভ করুন"
              >
                <Database className={`w-3.5 h-3.5 text-cyan-200 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'সেভ হচ্ছে...' : 'Supabase সেভ'}</span>
              </button>

              <button
                onClick={() => window.location.reload()}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#27324A] transition-colors"
                title="রিফ্রেশ করুন"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <Link
                to="/"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                title="ওয়েবসাইট লাইভ ভিউ"
              >
                <span>সাইট দেখুন</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/80" />
              </Link>

              <button
                onClick={logoutAdmin}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 text-red-400 hover:bg-red-900/60 border border-red-800/60 text-xs font-bold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">লগআউট</span>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Bar */}
          <div className="md:hidden flex overflow-x-auto py-2 space-x-2 border-t border-[#27324A] scrollbar-none">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    isActive ? 'bg-[#2563EB] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.name.split(' ')[0]}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Supabase Notification Banner */}
      {syncNotice && (
        <div className={`border-b text-xs font-medium py-2.5 px-4 transition-all flex items-center justify-center space-x-2 ${
          syncNotice.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-800 text-emerald-200' 
            : 'bg-rose-950/90 border-rose-800 text-rose-200'
        }`}>
          {syncNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{syncNotice.msg}</span>
        </div>
      )}

      {/* Main Outlet Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
};
