import React, { useEffect, useState } from 'react';
import { User, Phone, MapPin, Package, LogOut, Search, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { api } from '../services/api';

export const Account: React.FC = () => {
  const { customer, customerPhone, loginCustomer, logoutCustomer } = useAuth();

  const [inputPhone, setInputPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [editName, setEditName] = useState(customer?.name || '');
  const [editAddress, setEditAddress] = useState(customer?.address || '');
  const [isSaved, setIsSaved] = useState(false);

  const fetchOrders = async (phoneToLookup: string) => {
    setIsLoading(true);
    try {
      const data = await api.getCustomerOrders(phoneToLookup);
      setOrders(data);
    } catch (err) {
      console.error('Failed to load customer orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (customerPhone) {
      fetchOrders(customerPhone);
      setEditName(customer?.name || '');
      setEditAddress(customer?.address || '');
    }
  }, [customerPhone]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputPhone.trim().replace(/[^0-9]/g, '');
    if (clean) {
      loginCustomer(clean, 'গ্রাহক');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerPhone) {
      loginCustomer(customerPhone, editName, editAddress);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  if (!customerPhone) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-6">
        <div className="bg-white rounded-3xl border border-[#E5E3DA] p-8 shadow-lg text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#6B7A4F]/10 text-[#6B7A4F] flex items-center justify-center mx-auto">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">আপনার অ্যাকাউন্ট</h2>
          <p className="text-xs text-[#6B6B6B]">
            আপনার অর্ডারকৃত মোবাইল নম্বরটি দিয়ে অতীতে করা সকল অর্ডারের তালিকা ও স্ট্যাটাস ট্র্যাক করুন।
          </p>

          <form onSubmit={handleLookup} className="space-y-3 pt-2">
            <div>
              <input
                type="tel"
                placeholder="আপনার মোবাইল নম্বর লিখুন (যেমন: 01700000000)"
                value={inputPhone}
                onChange={e => setInputPhone(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-[#E5E3DA] focus:border-[#6B7A4F] outline-none text-center"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#6B7A4F] text-white font-bold text-sm hover:bg-[#586640] transition-colors flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>অর্ডারসমূহ দেখুন</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const getStatusPill = (status: Order['order_status']) => {
    if (status === 'confirmed') {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>অনুমোদিত (Confirmed)</span>
        </span>
      );
    } else if (status === 'cancelled') {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">
          <XCircle className="w-3.5 h-3.5" />
          <span>বাতিল (Cancelled)</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
          <Clock className="w-3.5 h-3.5" />
          <span>অপেক্ষমাণ (Pending)</span>
        </span>
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Account Header */}
      <div className="bg-white rounded-3xl border border-[#E5E3DA] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-[#6B7A4F] text-white font-bold text-2xl flex items-center justify-center shadow-md">
            {customer?.name ? customer.name.charAt(0) : 'G'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
              {customer?.name || 'গ্রাহক'}
            </h1>
            <p className="text-xs text-[#6B6B6B] flex items-center space-x-1 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-[#6B7A4F]" />
              <span>মোবাইল: {customerPhone}</span>
            </p>
          </div>
        </div>

        <button
          onClick={logoutCustomer}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>সাইন আউট</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Profile Information Edit */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#E5E3DA] space-y-4 h-fit">
          <h3 className="font-bold text-base text-[#1A1A1A] border-b border-[#E5E3DA] pb-3">
            প্রোফাইল তথ্য সংশোধন
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] mb-1">আপনার নাম:</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E3DA] focus:border-[#6B7A4F] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] mb-1">পছন্দের ঠিকানা:</label>
              <textarea
                rows={3}
                value={editAddress}
                onChange={e => setEditAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E3DA] focus:border-[#6B7A4F] outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#6B7A4F] text-white font-bold text-xs hover:bg-[#586640] transition-colors"
            >
              {isSaved ? 'সংরক্ষিত হয়েছে✓' : 'তথ্য আপডেট করুন'}
            </button>
          </form>
        </div>

        {/* Right: Order History */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#E5E3DA] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E3DA] pb-3">
            <h3 className="font-bold text-base text-[#1A1A1A] flex items-center space-x-2">
              <Package className="w-5 h-5 text-[#6B7A4F]" />
              <span>পূর্ববর্তী অর্ডার হিস্ট্রি ({orders.length})</span>
            </h3>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-xs text-[#6B6B6B]">অর্ডার লোড হচ্ছে...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#6B6B6B] space-y-2">
              <p>এই মোবাইল নম্বরে কোনো অর্ডার হিস্ট্রি পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl border border-[#E5E3DA] bg-[#F7F5EF]/60 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E3DA] pb-2 text-xs">
                    <div>
                      <span className="font-bold text-[#1A1A1A]">নম্বর: {order.order_number}</span>
                      <span className="text-[#6B6B6B] ml-2">
                        ({new Date(order.created_at).toLocaleDateString('bn-BD')})
                      </span>
                    </div>
                    {getStatusPill(order.order_status)}
                  </div>

                  {/* Items summary */}
                  <div className="space-y-1.5 text-xs">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-[#1A1A1A]">
                          • {item.product_name} {item.selected_variant ? `(${item.selected_variant})` : ''} x {item.qty}
                        </span>
                        <span className="font-bold">৳{(item.price * item.qty).toLocaleString('bn-BD')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-dashed border-[#E5E3DA] flex justify-between items-center text-xs font-bold">
                    <span>সর্বমোট (ডেলিভারিসহ):</span>
                    <span className="text-[#6B7A4F] text-sm">
                      ৳{order.total_revenue.toLocaleString('bn-BD')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
