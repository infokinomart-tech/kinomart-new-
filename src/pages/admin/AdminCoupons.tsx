import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, XCircle, Copy, AlertCircle, Percent, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { Coupon } from '../../types';
import { api } from '../../services/api';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const data = await api.getCoupons();
      setCoupons(data);
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCopyCode = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!code.trim() || !discountValue) {
      setErrorMsg('কুপন কোড এবং ডিসকাউন্টের মান প্রদান করুন');
      return;
    }

    try {
      setIsSubmitting(true);
      const newCoup = await api.createCoupon({
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_order_amount: minOrderAmount ? Number(minOrderAmount) : 0,
        max_discount_amount: discountType === 'percentage' && maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
        usage_limit: usageLimit ? Number(usageLimit) : undefined,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : '',
        is_active: isActive
      });

      setCoupons(prev => [newCoup, ...prev]);
      setSuccessMsg('নতুন কুপন কোড সফলভাবে যুক্ত হয়েছে!');
      setIsModalOpen(false);
      resetForm();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'কুপন তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const updated = await api.updateCoupon(coupon.id, { is_active: !coupon.is_active });
      setCoupons(prev => prev.map(c => c.id === coupon.id ? updated : c));
    } catch (err) {
      console.error('Failed to toggle coupon status:', err);
    }
  };

  const handleDeleteCoupon = async (id: string, codeName: string) => {
    if (!window.confirm(`আপনি কি সত্যিই '${codeName}' কুপনটি ডিলিট করতে চান?`)) return;
    try {
      await api.deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete coupon:', err);
    }
  };

  const resetForm = () => {
    setCode('');
    setDiscountType('fixed');
    setDiscountValue('');
    setMinOrderAmount('');
    setMaxDiscountAmount('');
    setUsageLimit('');
    setExpiresAt('');
    setIsActive(true);
    setErrorMsg('');
  };

  const activeCount = coupons.filter(c => c.is_active).length;
  const totalRedeemed = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center space-x-2">
            <Tag className="w-6 h-6 text-blue-400" />
            <span>ডিসকাউন্ট কুপন ম্যানেজমেন্ট</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            গ্রাহকদের জন্য প্রোমো/ডিসকাউন্ট কোড তৈরি ও পরিচালনা করুন
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchCoupons}
            className="p-2.5 rounded-xl bg-[#181F30] border border-[#27324A] text-gray-400 hover:text-white transition-colors"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন কুপন যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-[#181F30] border border-[#27324A] rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium block">মোট কুপন কোড</span>
            <span className="text-2xl font-black text-white mt-1 block">{coupons.length} টি</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-[#181F30] border border-[#27324A] rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium block">সক্রিয় (Active) কুপন</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">{activeCount} টি</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-[#181F30] border border-[#27324A] rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium block">মোট কুপন ব্যবহার</span>
            <span className="text-2xl font-black text-amber-400 mt-1 block">{totalRedeemed} বার</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-[#181F30] border border-[#27324A] rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-[#27324A] flex items-center justify-between">
          <h2 className="font-bold text-white text-sm">সকল কুপন তালিকা</h2>
          <span className="text-xs text-gray-400">মোট: {coupons.length}টি</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>কুপন কোড লোড হচ্ছে...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs space-y-3">
            <Tag className="w-10 h-10 text-gray-600 mx-auto opacity-40" />
            <p className="font-bold text-gray-300 text-sm">কোনো কুপন কোড পাওয়া যায়নি</p>
            <p>আপনার গ্রাহকদের জন্য নতুন কুপন যোগ করতে উপরের বোতামে ক্লিক করুন।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0F1420] text-gray-400 uppercase text-[10px] tracking-wider border-b border-[#27324A]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">কুপন কোড</th>
                  <th className="py-3.5 px-4 font-bold">ডিসকাউন্টের ধরণ ও মান</th>
                  <th className="py-3.5 px-4 font-bold">সর্বনিম্ন অর্ডার</th>
                  <th className="py-3.5 px-4 font-bold">ব্যবহারের তথ্য</th>
                  <th className="py-3.5 px-4 font-bold">মেয়াদ (Expiration)</th>
                  <th className="py-3.5 px-4 font-bold">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 font-bold text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27324A]/60 font-medium">
                {coupons.map((c) => {
                  const isExpired = c.expires_at && new Date() > new Date(c.expires_at);
                  return (
                    <tr key={c.id} className="hover:bg-[#1E273C] transition-colors">
                      {/* Code Pill */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 rounded-lg bg-blue-950/80 text-blue-300 border border-blue-700/60 font-mono font-black text-xs tracking-wider">
                            {c.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(c.code)}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                            title="কোড কপি করুন"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {copiedCode === c.code && (
                            <span className="text-[10px] text-emerald-400 font-bold">কপি হয়েছে!</span>
                          )}
                        </div>
                      </td>

                      {/* Type & Value */}
                      <td className="py-3.5 px-4">
                        {c.discount_type === 'percentage' ? (
                          <div className="space-y-0.5">
                            <span className="text-amber-300 font-bold">{c.discount_value}% ছাড়</span>
                            {c.max_discount_amount && (
                              <span className="block text-[10px] text-gray-400">
                                (সর্বোচ্চ ৳{c.max_discount_amount})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-emerald-400 font-bold">৳{c.discount_value} ফ্ল্যাট ছাড়</span>
                        )}
                      </td>

                      {/* Min Order */}
                      <td className="py-3.5 px-4 font-semibold text-gray-300">
                        {c.min_order_amount ? `৳${c.min_order_amount}` : 'সীমাহীন'}
                      </td>

                      {/* Usage */}
                      <td className="py-3.5 px-4">
                        <span className="text-white font-bold">{c.used_count || 0}</span>
                        <span className="text-gray-400"> / {c.usage_limit ? `${c.usage_limit} বার` : 'সীমাহীন'}</span>
                      </td>

                      {/* Expiration */}
                      <td className="py-3.5 px-4">
                        {c.expires_at ? (
                          <span className={isExpired ? 'text-red-400 font-bold' : 'text-gray-300'}>
                            {new Date(c.expires_at).toLocaleDateString('bn-BD', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                            {isExpired && ' (মেয়াদোত্তীর্ণ)'}
                          </span>
                        ) : (
                          <span className="text-gray-500">মেয়াদহীন (Always active)</span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(c)}
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                            c.is_active
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                              : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                          }`}
                        >
                          {c.is_active ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>সক্রিয় (Active)</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                              <span>নিষ্ক্রিয় (Inactive)</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteCoupon(c.id, c.code)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/60 rounded-lg transition-colors cursor-pointer"
                          title="ডিলিট করুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Creating Coupon */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181F30] border border-[#27324A] rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#27324A] pb-4">
              <h2 className="text-base font-black text-white flex items-center space-x-2">
                <Tag className="w-5 h-5 text-blue-400" />
                <span>নতুন কুপন কোড তৈরি করুন</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#27324A] transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">কুপন কোড (Coupon Code) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: KINO10, SUMMER100, EID2026"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white font-mono font-bold text-sm tracking-wider uppercase outline-none focus:border-blue-500"
                />
              </div>

              {/* Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">ডিসকাউন্টের ধরণ *</label>
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as 'fixed' | 'percentage')}
                    className="w-full px-3 py-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white text-xs font-bold outline-none focus:border-blue-500"
                  >
                    <option value="fixed">৳ ফ্ল্যাট ডিসকাউন্ট (Fixed Amount)</option>
                    <option value="percentage">% শতাংশ ডিসকাউন্ট (Percentage)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    {discountType === 'percentage' ? 'ডিসকাউন্ট (%) *' : 'ডিসকাউন্ট পরিমাণ (৳) *'}
                  </label>
                  <input
                    type="number"
                    required
                    placeholder={discountType === 'percentage' ? 'যেমন: 10 (10%)' : 'যেমন: 100 (৳100)'}
                    value={discountValue}
                    onChange={e => setDiscountValue(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white text-xs font-bold outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Max Cap for Percentage */}
              {discountType === 'percentage' && (
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">সর্বোচ্চ ছাড়ের সীমা (৳ Max Discount Amount - optional)</label>
                  <input
                    type="number"
                    placeholder="যেমন: 200 (৳২০০ এর বেশি ছাড় হবে না)"
                    value={maxDiscountAmount}
                    onChange={e => setMaxDiscountAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* Min Order & Usage Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">সর্বনিম্ন অর্ডার (৳ Min Order)</label>
                  <input
                    type="number"
                    placeholder="যেমন: 500 (৳৫০০ এর নিচে কাজ করবে না)"
                    value={minOrderAmount}
                    onChange={e => setMinOrderAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">মোট ব্যবহারের সীমা (Usage Limit)</label>
                  <input
                    type="number"
                    placeholder="যেমন: 100 (মোট ১০০ বার)"
                    value={usageLimit}
                    onChange={e => setUsageLimit(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">মেয়াদ শেষ হওয়ার তারিখ (Expiration Date - optional)</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white text-xs outline-none focus:border-blue-500"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="coupon-active-toggle"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-700 bg-[#0F1420] text-blue-600 focus:ring-0"
                />
                <label htmlFor="coupon-active-toggle" className="text-xs font-bold text-gray-200 cursor-pointer">
                  তৈরির সাথেই সক্রিয় (Active) রাখুন
                </label>
              </div>

              {/* Submit buttons */}
              <div className="flex justify-end space-x-3 pt-3 border-t border-[#27324A]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#27324A] text-gray-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'সেভ হচ্ছে...' : 'কুপন সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
