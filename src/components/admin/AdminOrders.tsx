import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus, CallStatus } from '../../types';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Edit2,
  Trash2,
  X,
  Phone,
  Copy,
  Check,
  Save,
  FileText
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCallStatus, setSelectedCallStatus] = useState<string>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Order status edit modal
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Pending');
  const [newCallStatus, setNewCallStatus] = useState<CallStatus>('Not Called');
  const [adminNote, setAdminNote] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Calculate metrics
  const todayOrders = orders.length;
  const todayPending = orders.filter((o) => o.status === 'Pending').length;
  const todayConfirmed = orders.filter((o) => o.status === 'Confirmed').length;
  const todayCancelled = orders.filter((o) => o.status === 'Cancelled').length;

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm) ||
      order.shippingAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'All' || order.status === selectedStatus;

    const matchesCallStatus =
      selectedCallStatus === 'All' || order.callStatus === selectedCallStatus;

    return matchesSearch && matchesStatus && matchesCallStatus;
  });

  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order);
    setNewStatus(order.status);
    setNewCallStatus(order.callStatus || 'Not Called');
    setAdminNote(order.notes || '');
  };

  const handleSaveEdit = () => {
    if (editingOrder) {
      updateOrderStatus(editingOrder.id, newStatus, newCallStatus);
      // Update notes in order
      editingOrder.notes = adminNote;
      setEditingOrder(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyFullOrderDetails = (order: Order) => {
    const text = `Order #: ${order.orderNumber}\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\nAddress: ${order.shippingAddress} (${order.deliveryArea})\nItems: ${order.items.map(i => `${i.product.name} x${i.quantity}`).join(', ')}\nTotal: ৳${order.totalPrice}\nPayment: ${order.paymentMethod}\nStatus: ${newStatus}\nCall Status: ${newCallStatus}`;
    navigator.clipboard.writeText(text);
    setCopiedField('FullOrder');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const callStatusList: CallStatus[] = [
    'Not Called',
    'Call Success',
    'Customer Busy',
    'Fake Order',
    'Pending Confirmation'
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards Top Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Today's Orders */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-4 flex justify-between items-center shadow-lg">
          <div>
            <p className="text-xs text-[#94A3B8] font-semibold">Today's Orders</p>
            <h3 className="text-3xl font-black text-white mt-1">{todayOrders}</h3>
            <span className="text-[11px] text-[#64748B] font-medium">All-time: {orders.length}</span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Today's Pending */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-4 flex justify-between items-center shadow-lg">
          <div>
            <p className="text-xs text-[#94A3B8] font-semibold">Today's Pending</p>
            <h3 className="text-3xl font-black text-amber-500 mt-1">{todayPending}</h3>
            <span className="text-[11px] text-[#64748B] font-medium">Awaiting call/confirm</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Today's Confirmed */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-4 flex justify-between items-center shadow-lg">
          <div>
            <p className="text-xs text-[#94A3B8] font-semibold">Today's Confirmed</p>
            <h3 className="text-3xl font-black text-emerald-400 mt-1">{todayConfirmed}</h3>
            <span className="text-[11px] text-[#64748B] font-medium">Ready for shipping</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Today's Cancelled */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-4 flex justify-between items-center shadow-lg">
          <div>
            <p className="text-xs text-[#94A3B8] font-semibold">Today's Cancelled</p>
            <h3 className="text-3xl font-black text-red-400 mt-1">{todayCancelled}</h3>
            <span className="text-[11px] text-[#64748B] font-medium">Rejected / Fake</span>
          </div>
          <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0F172A] border border-[#1E293B] p-4 rounded-2xl flex flex-wrap gap-3 items-center justify-between shadow-md">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order#, customer, phone..."
            className="w-full bg-[#0B1329] border border-[#1E293B] rounded-xl py-2.5 px-3 pl-9 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#2563EB]"
          />
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#94A3B8] font-semibold">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#0B1329] border border-[#1E293B] text-xs text-white rounded-xl py-2 px-3 focus:outline-none"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Call Status Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#94A3B8] font-semibold">Call Status:</span>
          <select
            value={selectedCallStatus}
            onChange={(e) => setSelectedCallStatus(e.target.value)}
            className="bg-[#0B1329] border border-[#1E293B] text-xs text-white rounded-xl py-2 px-3 focus:outline-none"
          >
            <option value="All">All</option>
            <option value="Not Called">Not Called</option>
            <option value="Call Success">Call Success</option>
            <option value="Customer Busy">Customer Busy</option>
            <option value="Fake Order">Fake Order</option>
            <option value="Pending Confirmation">Pending Confirmation</option>
          </select>
        </div>

        {/* Date Filter Inputs */}
        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-[#0B1329] border border-[#1E293B] text-xs text-white rounded-xl py-2 px-2.5"
          />
          <span>-</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-[#0B1329] border border-[#1E293B] text-xs text-white rounded-xl py-2 px-2.5"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B1329] text-[#94A3B8] font-bold uppercase tracking-wider border-b border-[#1E293B]">
              <tr>
                <th className="p-3">ACTION</th>
                <th className="p-3">ORDER #</th>
                <th className="p-3">STATUS</th>
                <th className="p-3">CALL STATUS</th>
                <th className="p-3">CUSTOMER</th>
                <th className="p-3">SHIPPING ADDRESS</th>
                <th className="p-3">PRODUCTS</th>
                <th className="p-3">REVENUE</th>
                <th className="p-3">TIME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-[#CBD5E1]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-8 text-[#64748B]">
                    No orders found matching filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#162032] transition-colors">
                    {/* Action */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(ord)}
                          className="p-2 bg-[#2563EB]/20 text-[#60A5FA] hover:bg-[#2563EB]/40 rounded-xl transition-colors cursor-pointer"
                          title="Edit Order"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this order?')) {
                              deleteOrder(ord.id);
                            }
                          }}
                          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Order # */}
                    <td className="p-3 font-extrabold text-white whitespace-nowrap">
                      {ord.orderNumber}
                    </td>

                    {/* Status */}
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                          ord.status === 'Confirmed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : ord.status === 'Pending'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : ord.status === 'Shipped'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : ord.status === 'Delivered'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>

                    {/* Call Status */}
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold ${
                          ord.callStatus === 'Call Success'
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            : ord.callStatus === 'Fake Order'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {ord.callStatus}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="p-3">
                      <div className="font-bold text-white">{ord.customerName}</div>
                      <div className="text-[11px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-[#A3C676]" />
                        {ord.customerPhone}
                      </div>
                    </td>

                    {/* Shipping Address */}
                    <td className="p-3 max-w-[200px]">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mb-1 ${
                          ord.deliveryArea === 'Inside Dhaka'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-indigo-500/20 text-indigo-300'
                        }`}
                      >
                        {ord.deliveryArea}
                      </span>
                      <p className="line-clamp-2 text-[11px] text-[#94A3B8]">
                        {ord.shippingAddress}
                      </p>
                    </td>

                    {/* Products */}
                    <td className="p-3 max-w-[220px]">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="line-clamp-1 text-[11px] text-[#E2E8F0]">
                          • {item.product.name} ×{item.quantity}
                        </div>
                      ))}
                    </td>

                    {/* Revenue & Payment */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-black text-[#10B981] text-sm">
                        ৳{ord.totalPrice.toLocaleString('bn-BD')}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            ord.paymentMethod === 'bKash'
                              ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                              : ord.paymentMethod === 'Nagad'
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {ord.paymentMethod}
                        </span>
                        <span className="text-[10px] text-[#64748B]">
                          ({ord.items.reduce((sum, i) => sum + i.quantity, 0)} pcs)
                        </span>
                      </div>
                      {ord.trxId && (
                        <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                          Trx: {ord.trxId}
                        </div>
                      )}
                    </td>

                    {/* Time */}
                    <td className="p-3 text-[11px] text-[#94A3B8] whitespace-nowrap">
                      {ord.createdAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Order Modal (Matching Image 2 Demo) */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl max-w-xl w-full p-6 space-y-5 text-white shadow-2xl relative animate-scaleUp">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-[#1E293B] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-xl text-white">Order: {editingOrder.orderNumber}</h3>
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                      newStatus === 'Confirmed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : newStatus === 'Pending'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {newStatus}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-1 font-medium">
                  Total Items:{' '}
                  {editingOrder.items.map((i) => `${i.product.name} (${i.quantity})`).join(', ')}
                </p>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid with Copy Buttons (Image 2 format) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#0B1329] border border-[#1E293B] p-3 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-[#94A3B8] text-[10px] block font-semibold">Customer Name:</span>
                  <span className="font-bold text-white text-sm">{editingOrder.customerName}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(editingOrder.customerName, 'Name')}
                  className="bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-white px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedField === 'Name' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'Name' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="bg-[#0B1329] border border-[#1E293B] p-3 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-[#94A3B8] text-[10px] block font-semibold">Phone Number:</span>
                  <span className="font-bold text-[#60A5FA] text-sm">{editingOrder.customerPhone}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(editingOrder.customerPhone, 'Phone')}
                  className="bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-white px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedField === 'Phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'Phone' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="bg-[#0B1329] border border-[#1E293B] p-3 rounded-2xl flex justify-between items-center sm:col-span-2">
                <div>
                  <span className="text-[#94A3B8] text-[10px] block font-semibold">Shipping Address:</span>
                  <span className="font-bold text-white text-xs">{editingOrder.shippingAddress} ({editingOrder.deliveryArea})</span>
                </div>
                <button
                  onClick={() => copyToClipboard(editingOrder.shippingAddress, 'Address')}
                  className="bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-white px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0 ml-2"
                >
                  {copiedField === 'Address' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'Address' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="bg-[#0B1329] border border-[#1E293B] p-3 rounded-2xl flex justify-between items-center sm:col-span-2">
                <div>
                  <span className="text-[#94A3B8] text-[10px] block font-semibold">Total Revenue & Payment:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-black text-[#10B981] text-base">৳{editingOrder.totalPrice}</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        editingOrder.paymentMethod === 'bKash'
                          ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                          : editingOrder.paymentMethod === 'Nagad'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {editingOrder.paymentMethod}
                    </span>
                  </div>
                  {editingOrder.senderPhone && (
                    <div className="text-xs text-[#CBD5E1] mt-1 font-mono">
                      Sender Phone: <span className="font-bold text-amber-400">{editingOrder.senderPhone}</span>
                    </div>
                  )}
                  {editingOrder.trxId && (
                    <div className="text-xs text-[#CBD5E1] font-mono">
                      TrxID: <span className="font-bold text-amber-400">{editingOrder.trxId}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `৳${editingOrder.totalPrice} (${editingOrder.paymentMethod}${
                        editingOrder.senderPhone ? `, Sender: ${editingOrder.senderPhone}` : ''
                      }${editingOrder.trxId ? `, TrxID: ${editingOrder.trxId}` : ''})`,
                      'Revenue'
                    )
                  }
                  className="bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-white px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedField === 'Revenue' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'Revenue' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Order Status Selectors */}
            <div>
              <label className="block text-[#CBD5E1] font-bold mb-2 text-xs">Order Status:</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['Pending', 'Confirmed', 'Cancelled'] as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setNewStatus(st)}
                    className={`py-2.5 rounded-xl font-extrabold transition-all cursor-pointer ${
                      newStatus === st
                        ? st === 'Pending'
                          ? 'bg-amber-500 text-white shadow-md'
                          : st === 'Confirmed'
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'bg-red-500 text-white shadow-md'
                        : 'bg-[#0B1329] border border-[#1E293B] text-[#94A3B8] hover:bg-[#1E293B]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Call Status Response Selectors */}
            <div>
              <label className="block text-[#CBD5E1] font-bold mb-2 text-xs">Call Status Response:</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {callStatusList.map((cs) => (
                  <button
                    key={cs}
                    type="button"
                    onClick={() => setNewCallStatus(cs)}
                    className={`py-2 rounded-xl font-semibold transition-all cursor-pointer text-center text-[11px] ${
                      newCallStatus === cs
                        ? cs === 'Call Success'
                          ? 'bg-teal-600 text-white shadow-md'
                          : cs === 'Fake Order'
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-blue-600 text-white shadow-md'
                        : 'bg-[#0B1329] border border-[#1E293B] text-[#94A3B8] hover:bg-[#1E293B]'
                    }`}
                  >
                    {cs}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block text-[#CBD5E1] font-bold mb-1.5 text-xs">Order Note (Admin Notes):</label>
              <textarea
                rows={2}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="কাস্টমার নোট বা ডেলিভারি রিমার্কস..."
                className="w-full bg-[#0B1329] border border-[#1E293B] rounded-2xl p-3 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            {/* Bottom Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1E293B]">
              <button
                type="button"
                onClick={() => copyFullOrderDetails(editingOrder)}
                className="bg-[#1E293B] hover:bg-[#334155] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {copiedField === 'FullOrder' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedField === 'FullOrder' ? 'Full Order Copied!' : 'Copy Full Order'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#0B1329] hover:bg-[#1E293B] text-xs font-bold text-[#CBD5E1] cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-xs font-black text-white flex items-center gap-1.5 shadow-lg cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Updates</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
