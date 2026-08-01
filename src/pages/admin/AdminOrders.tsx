import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Copy,
  Phone,
  Edit2,
  X,
  Calendar,
  Save,
  Check
} from 'lucide-react';
import { Order, OrderStatus, CallStatus } from '../../types';
import { api } from '../../services/api';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [callStatusFilter, setCallStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Selected Order Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState<OrderStatus>('pending');
  const [editCallStatus, setEditCallStatus] = useState<CallStatus>('not_called');
  const [editNote, setEditNote] = useState('');

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await api.getOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        call_status: callStatusFilter !== 'all' ? callStatusFilter : undefined,
        search: searchQuery || undefined,
        from: fromDate || undefined,
        to: toDate || undefined
      });
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, callStatusFilter, searchQuery, fromDate, toDate]);

  // Stat calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.created_at.startsWith(todayStr));

  const stats = {
    todayTotal: todayOrders.length,
    allTimeTotal: orders.length,
    todayPending: todayOrders.filter(o => o.order_status === 'pending').length,
    todayConfirmed: todayOrders.filter(o => o.order_status === 'confirmed').length,
    todayCancelled: todayOrders.filter(o => o.order_status === 'cancelled').length
  };

  const handleOpenOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.order_status);
    setEditCallStatus(order.call_status);
    setEditNote(order.note || '');
  };

  const handleSaveOrderDetails = async () => {
    if (!selectedOrder) return;
    setIsSaving(true);
    try {
      const updated = await api.updateOrder(selectedOrder.id, {
        order_status: editStatus,
        call_status: editCallStatus,
        note: editNote
      });
      setSelectedOrder(updated);
      setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
    } catch (err) {
      console.error('Error saving order updates', err);
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const copyFullOrderSummary = () => {
    if (!selectedOrder) return;
    const summary = `অর্ডার নম্বর: ${selectedOrder.order_number}\nনাম: ${selectedOrder.customer_name}\nফোন: ${selectedOrder.phone}\nঠিকানা: ${selectedOrder.address}\nপণ্য: ${selectedOrder.items.map(i => `${i.product_name} x ${i.qty}`).join(', ')}\nসর্বমোট: ৳${selectedOrder.total_revenue}`;
    copyToClipboard(summary, 'full');
  };

  const getStatusPill = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold text-[11px]">Confirmed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full bg-red-950 border border-red-800 text-red-400 font-bold text-[11px]">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-amber-950 border border-amber-700 text-amber-400 font-bold text-[11px]">Pending</span>;
    }
  };

  const getCallStatusPill = (callStatus: CallStatus) => {
    switch (callStatus) {
      case 'call_success':
        return <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 text-[11px]">Call Success</span>;
      case 'fake_order':
        return <span className="px-2 py-0.5 rounded bg-red-900/60 text-red-300 text-[11px]">Fake Order</span>;
      case 'number_off':
        return <span className="px-2 py-0.5 rounded bg-orange-900/60 text-orange-300 text-[11px]">Number Off</span>;
      case 'did_not_pick':
        return <span className="px-2 py-0.5 rounded bg-yellow-900/60 text-yellow-300 text-[11px]">Did Not Pick</span>;
      case 'call_later':
        return <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 text-[11px]">Call Later</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 text-[11px]">Not Called</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Today's Orders */}
        <div className="bg-[#181F30] border border-[#27324A] p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Today's Orders</span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{stats.todayTotal}</span>
            <span className="text-[11px] text-gray-400">All-time: {stats.allTimeTotal}</span>
          </div>
        </div>

        {/* Today's Pending */}
        <div className="bg-[#181F30] border border-[#27324A] p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-amber-400 text-xs font-semibold">
            <span>Today's Pending</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-amber-300">{stats.todayPending}</div>
        </div>

        {/* Today's Confirmed */}
        <div className="bg-[#181F30] border border-[#27324A] p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
            <span>Today's Confirmed</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-300">{stats.todayConfirmed}</div>
        </div>

        {/* Today's Cancelled */}
        <div className="bg-[#181F30] border border-[#27324A] p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-red-400 text-xs font-semibold">
            <span>Today's Cancelled</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-red-400">{stats.todayCancelled}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#181F30] border border-[#27324A] p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <input
              type="text"
              placeholder="Search by order#, customer, phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none focus:border-[#3B82F6]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          {/* Order Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none"
            >
              <option value="all">Status: All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Call Status Filter */}
          <div className="md:col-span-3">
            <select
              value={callStatusFilter}
              onChange={e => setCallStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none"
            >
              <option value="all">Call Status: All</option>
              <option value="not_called">Not Called</option>
              <option value="call_success">Call Success</option>
              <option value="number_off">Number Off</option>
              <option value="did_not_pick">Did Not Pick</option>
              <option value="call_later">Call Later</option>
              <option value="fake_order">Fake Order</option>
            </select>
          </div>

          {/* Date Pickers */}
          <div className="md:col-span-3 flex items-center space-x-2">
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="w-full px-2 py-1.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white text-[11px] outline-none"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="w-full px-2 py-1.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white text-[11px] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#181F30] border border-[#27324A] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300 border-collapse">
            <thead className="bg-[#111827] text-gray-400 uppercase font-semibold text-[11px] border-b border-[#27324A]">
              <tr>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Order #</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Call Status</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Shipping Address</th>
                <th className="py-3 px-3">Products</th>
                <th className="py-3 px-3">Revenue</th>
                <th className="py-3 px-3">Time</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#27324A]/60">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">No orders found matching filters</td>
                </tr>
              ) : (
                orders.map(order => {
                  // Left border color strip based on status
                  const borderClass =
                    order.order_status === 'confirmed'
                      ? 'border-l-4 border-l-emerald-500'
                      : order.order_status === 'cancelled'
                      ? 'border-l-4 border-l-red-500'
                      : 'border-l-4 border-l-amber-500';

                  const totalPcs = order.items.reduce((s, i) => s + i.qty, 0);

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-[#1E293B]/70 transition-colors cursor-pointer ${borderClass}`}
                      onClick={() => handleOpenOrderModal(order)}
                    >
                      {/* Action */}
                      <td className="py-3 px-3" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenOrderModal(order)}
                          className="p-1.5 bg-[#27324A] hover:bg-[#3B82F6] text-white rounded-lg transition-colors"
                          title="View / Edit Order"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>

                      {/* Order Number */}
                      <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                        {order.order_number}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getStatusPill(order.order_status)}
                      </td>

                      {/* Call Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getCallStatusPill(order.call_status)}
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{order.customer_name}</div>
                        <a
                          href={`tel:${order.phone}`}
                          onClick={e => e.stopPropagation()}
                          className="text-blue-400 hover:underline flex items-center space-x-1 font-mono text-[11px]"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{order.phone}</span>
                        </a>
                      </td>

                      {/* Shipping Address */}
                      <td className="py-3 px-3 max-w-xs">
                        <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded font-bold mb-1 ${
                          order.area === 'inside_dhaka' ? 'bg-blue-900/60 text-blue-300' : 'bg-purple-900/60 text-purple-300'
                        }`}>
                          {order.area === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}
                        </span>
                        <div className="text-gray-300 line-clamp-2 text-[11px]">{order.address}</div>
                      </td>

                      {/* Products */}
                      <td className="py-3 px-3 max-w-xs">
                        {order.items.map((item, i) => (
                          <div key={i} className="text-[11px] text-gray-200 truncate">
                            • {item.product_name} <span className="text-gray-400">×{item.qty}</span>
                          </div>
                        ))}
                      </td>

                      {/* Revenue */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-extrabold text-emerald-400">৳{order.total_revenue.toLocaleString('bn-BD')}</div>
                        <div className="text-[10px] text-gray-400">{totalPcs} pcs</div>
                      </td>

                      {/* Time */}
                      <td className="py-3 px-3 whitespace-nowrap text-gray-400 text-[11px]">
                        {new Date(order.created_at).toLocaleDateString('en-GB')}<br />
                        {new Date(order.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS MODAL (Matching second reference screenshot exactly) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#181F30] border border-[#27324A] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-gray-100 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#27324A] pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span>Order: {selectedOrder.order_number}</span>
                  {getStatusPill(selectedOrder.order_status)}
                </h3>
                <p className="text-xs text-gray-400">
                  Total Items: {selectedOrder.items.map(i => `${i.product_name} (${i.qty})`).join(', ')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-[#27324A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Copyable Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0F1420] p-4 rounded-xl border border-[#27324A] text-xs">
              <div className="flex items-center justify-between p-2 bg-[#181F30] rounded-lg border border-[#27324A]">
                <div>
                  <span className="text-gray-400 block text-[10px]">Customer Name:</span>
                  <span className="font-semibold text-white">{selectedOrder.customer_name}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedOrder.customer_name, 'name')}
                  className="px-2 py-1 bg-[#27324A] hover:bg-[#3B82F6] rounded text-[10px] font-semibold text-white flex items-center space-x-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedField === 'name' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#181F30] rounded-lg border border-[#27324A]">
                <div>
                  <span className="text-gray-400 block text-[10px]">Phone Number:</span>
                  <span className="font-semibold text-blue-400 font-mono">{selectedOrder.phone}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedOrder.phone, 'phone')}
                  className="px-2 py-1 bg-[#27324A] hover:bg-[#3B82F6] rounded text-[10px] font-semibold text-white flex items-center space-x-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedField === 'phone' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="sm:col-span-2 flex items-center justify-between p-2 bg-[#181F30] rounded-lg border border-[#27324A]">
                <div>
                  <span className="text-gray-400 block text-[10px]">Shipping Address:</span>
                  <span className="font-medium text-gray-200">{selectedOrder.address}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedOrder.address, 'address')}
                  className="px-2 py-1 bg-[#27324A] hover:bg-[#3B82F6] rounded text-[10px] font-semibold text-white flex items-center space-x-1 shrink-0 ml-2"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedField === 'address' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="sm:col-span-2 flex items-center justify-between p-2 bg-[#181F30] rounded-lg border border-[#27324A]">
                <div>
                  <span className="text-gray-400 block text-[10px]">Total Revenue:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-emerald-400">৳{selectedOrder.total_revenue}</span>
                    {selectedOrder.coupon_code && (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono">
                        Coupon: {selectedOrder.coupon_code} (-৳{selectedOrder.discount_amount || 0})
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(String(selectedOrder.total_revenue), 'total')}
                  className="px-2 py-1 bg-[#27324A] hover:bg-[#3B82F6] rounded text-[10px] font-semibold text-white flex items-center space-x-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedField === 'total' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Order Status Radios */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300">Order Status:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['pending', 'confirmed', 'cancelled'] as OrderStatus[]).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setEditStatus(st)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                      editStatus === st
                        ? st === 'confirmed'
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : st === 'cancelled'
                          ? 'bg-red-600 border-red-500 text-white'
                          : 'bg-amber-600 border-amber-500 text-white'
                        : 'bg-[#0F1420] border-[#27324A] text-gray-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Call Status Radios */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300">Call Status Response:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'not_called', label: 'Not Called' },
                  { id: 'call_success', label: 'Call Success' },
                  { id: 'number_off', label: 'Number Off' },
                  { id: 'did_not_pick', label: 'Did Not Pick' },
                  { id: 'call_later', label: 'Call Later' },
                  { id: 'fake_order', label: 'Fake Order' }
                ].map(cs => (
                  <button
                    key={cs.id}
                    type="button"
                    onClick={() => setEditCallStatus(cs.id as CallStatus)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border ${
                      editCallStatus === cs.id
                        ? 'bg-[#2563EB] border-[#3B82F6] text-white shadow-xs'
                        : 'bg-[#0F1420] border-[#27324A] text-gray-400 hover:text-white'
                    }`}
                  >
                    {cs.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Note Area */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300">Order Note (Admin Notes):</label>
              <textarea
                rows={2}
                placeholder="কাস্টমার নোট বা ডেলিভারি রিমার্কস..."
                value={editNote}
                onChange={e => setEditNote(e.target.value)}
                className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-xs text-white outline-none focus:border-[#3B82F6]"
              />
            </div>

            {/* Action CTAs */}
            <div className="flex items-center justify-between pt-2 border-t border-[#27324A]">
              <button
                type="button"
                onClick={copyFullOrderSummary}
                className="px-4 py-2 bg-[#27324A] hover:bg-[#32405D] text-gray-200 text-xs font-bold rounded-xl flex items-center space-x-1.5"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedField === 'full' ? 'কপি হয়েছে✓' : 'Copy Full Order'}</span>
              </button>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-[#0F1420] hover:bg-[#27324A] text-gray-300 text-xs font-bold rounded-xl"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveOrderDetails}
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'সেভ হচ্ছে...' : 'Save Updates'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
