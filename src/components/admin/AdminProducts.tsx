import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Specification } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Image as ImageIcon,
  Star,
  Layers,
  Upload,
  Video
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { products, categories, saveProduct, deleteProduct } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtered products
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingProduct({
      id: `prod-${Date.now()}`,
      name: '',
      price: 1000,
      discountPrice: undefined,
      category: categories[0]?.name || 'গ্যাজেট',
      subCategory: categories[0]?.subCategories[0] || '',
      stock: 10,
      limitedStockThreshold: 10,
      colors: ['BLACK'],
      thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      gallery: [],
      shortDescription: '',
      longDescription: '',
      specifications: [{ key: '', value: '' }],
      hasTimer: false,
      isBestSeller: false,
      isFeatured: false,
      rating: 5.0,
      reviewsCount: 1,
      status: 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct({ ...p });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct && editingProduct.name) {
      saveProduct(editingProduct as Product);
      setIsModalOpen(false);
      setEditingProduct(null);
    }
  };

  // Specification row handlers
  const handleAddSpecRow = () => {
    if (editingProduct) {
      const specs = editingProduct.specifications || [];
      setEditingProduct({
        ...editingProduct,
        specifications: [...specs, { key: '', value: '' }]
      });
    }
  };

  const handleUpdateSpecRow = (index: number, key: string, value: string) => {
    if (editingProduct) {
      const specs = [...(editingProduct.specifications || [])];
      specs[index] = { key, value };
      setEditingProduct({ ...editingProduct, specifications: specs });
    }
  };

  const handleRemoveSpecRow = (index: number) => {
    if (editingProduct) {
      const specs = (editingProduct.specifications || []).filter((_, i) => i !== index);
      setEditingProduct({ ...editingProduct, specifications: specs });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#181B26] border border-[#2B3042] p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#2563EB]" />
            <span>প্রোডাক্ট ম্যানেজমেন্ট</span>
          </h2>
          <p className="text-xs text-[#94A3B8]">নতুন প্রোডাক্ট যোগ করুন বা বিদ্যমান প্রোডাক্ট সম্পাদনা করুন</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ নতুন প্রোডাক্ট যোগ করুন</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-[#181B26] border border-[#2B3042] rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#CBD5E1]">
            <thead className="bg-[#11131A] text-[#94A3B8] font-bold uppercase tracking-wider border-b border-[#2B3042]">
              <tr>
                <th className="p-3">IMAGE</th>
                <th className="p-3">PRODUCT NAME</th>
                <th className="p-3">CATEGORY</th>
                <th className="p-3">PRICE</th>
                <th className="p-3">STOCK</th>
                <th className="p-3">STATUS</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B3042]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#1E2330] transition-colors">
                  <td className="p-3">
                    <img
                      src={p.thumbnail}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover bg-[#FFDC33]"
                      referrerPolicy="no-referrer"
                    />
                  </td>
                  <td className="p-3 font-bold text-white max-w-xs">
                    <p className="line-clamp-1">{p.name}</p>
                    <div className="flex gap-1.5 mt-0.5">
                      {p.isBestSeller && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 rounded">
                          Best Seller
                        </span>
                      )}
                      {p.isFeatured && (
                        <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 rounded">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-[#94A3B8]">
                    {p.category}
                    {p.subCategory && <span className="block text-[10px] opacity-70">{p.subCategory}</span>}
                  </td>
                  <td className="p-3 font-extrabold text-[#A5DD28]">
                    ৳{(p.discountPrice || p.price).toLocaleString('bn-BD')}
                    {p.discountPrice && (
                      <span className="block text-[10px] text-gray-400 line-through">
                        ৳{p.price.toLocaleString('bn-BD')}
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        p.stock <= (p.limitedStockThreshold || 10)
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {p.stock} pcs
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 bg-[#2563EB]/20 text-blue-400 hover:bg-[#2563EB]/40 rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this product?')) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add / Edit Modal (Matching Image 11) */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#181B26] border border-[#2B3042] rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 text-white my-auto max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-[#2B3042] pb-3">
              <h3 className="font-extrabold text-base sm:text-lg">
                {editingProduct.id ? 'প্রোডাক্ট এডিট করুন' : 'নতুন প্রোডাক্ট যোগ করুন'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Product Name */}
              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">
                  প্রোডাক্ট নাম (বাংলা) *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="যেমন: Supabase Verified Product..."
                  className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Price & Offer Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">মূল্য (Price) ৳ *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">অফার মূল্য (Discount Price) ৳</label>
                  <input
                    type="number"
                    value={editingProduct.discountPrice || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        discountPrice: e.target.value ? Number(e.target.value) : undefined
                      })
                    }
                    placeholder="ঐচ্ছিক"
                    className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">ক্যাটাগরি *</label>
                  <select
                    value={editingProduct.category || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">সাব-ক্যাটাগরি</label>
                  <input
                    type="text"
                    value={editingProduct.subCategory || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, subCategory: e.target.value })}
                    placeholder="যেমন: TWS এয়ারবাডস"
                    className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Stock & Limited Stock Threshold */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">বর্তমান স্টক সংখ্যা</label>
                  <input
                    type="number"
                    value={editingProduct.stock || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">লিমিটেড স্টক সীমা</label>
                  <input
                    type="number"
                    value={editingProduct.limitedStockThreshold || 10}
                    onChange={(e) => setEditingProduct({ ...editingProduct, limitedStockThreshold: Number(e.target.value) })}
                    className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white"
                  />
                </div>
              </div>

              {/* Color/Variants */}
              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">কালার/ভেরিয়েন্ট অপশন (কমা দিয়ে লিখুন)</label>
                <input
                  type="text"
                  value={editingProduct.colors?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      colors: e.target.value.split(',').map((s) => s.trim())
                    })
                  }
                  placeholder="যেমন: MINT, PEACH, WATERMELON, GRAPE, BLACK"
                  className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white"
                />
              </div>

              {/* Thumbnail Image with Upload */}
              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">
                  প্রোডাক্ট ছবিসমূহ (১০৮০ × ১০৮০ স্কয়ার ফরম্যাট)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm">
                      <Upload className="w-4 h-4" />
                      <span>কম্পিউটার/মোবাইল থেকে ছবি আপলোড করুন</span>
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
                                setEditingProduct({ ...editingProduct, thumbnail: evt.target.result as string });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <span className="text-[11px] text-[#64748B]">অথবা ইমেজ URL দিন:</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingProduct.thumbnail || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, thumbnail: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white"
                    />
                    {editingProduct.thumbnail && (
                      <img
                        src={editingProduct.thumbnail}
                        alt="Preview"
                        className="w-11 h-11 rounded-xl object-cover border border-[#33384B] shrink-0"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-[#94A3B8] font-bold mb-1 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-red-400" />
                  <span>ভিডিও লিঙ্ক (16:9 Video URL / YouTube Link)</span>
                </label>
                <input
                  type="text"
                  value={editingProduct.videoUrl || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, videoUrl: e.target.value })}
                  placeholder="যেমন: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white"
                />
              </div>

              {/* Short & Long Description */}
              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">সংক্ষিপ্ত বিবরণ (Short Description)</label>
                <textarea
                  rows={2}
                  value={editingProduct.shortDescription || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                  placeholder="যেমন: প্রিমিয়াম এইচডি সাউন্ড, অ্যাক্টিভ নয়েজ ক্যানসেলেশন ও ৩০ ঘণ্টা ব্যাটারি ব্যাকআপ"
                  className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">বিস্তারিত বিবরণ (Long Description)</label>
                <textarea
                  rows={4}
                  value={editingProduct.longDescription || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, longDescription: e.target.value })}
                  placeholder="এখানে প্রোডাক্টের সম্পূর্ণ বিস্তারিত বিবরণ লিখুন..."
                  className="w-full bg-[#11131A] border border-[#33384B] rounded-xl p-3 text-white"
                />
              </div>

              {/* Specifications Dynamic Key-Value Rows */}
              <div className="space-y-2 border-t border-[#2B3042] pt-3">
                <div className="flex justify-between items-center">
                  <label className="text-[#94A3B8] font-bold">পণ্যের স্পেসিফিকেশন (Specifications)</label>
                  <button
                    type="button"
                    onClick={handleAddSpecRow}
                    className="bg-[#2563EB]/20 text-blue-400 text-[11px] font-bold px-3 py-1 rounded-lg hover:bg-[#2563EB]/40"
                  >
                    + নতুন রো যোগ করুন
                  </button>
                </div>

                {(editingProduct.specifications || []).map((spec, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="ফিচার/সাইজ (যেমন: ব্লুটুথ)"
                      value={spec.key}
                      onChange={(e) => handleUpdateSpecRow(i, e.target.value, spec.value)}
                      className="flex-1 bg-[#11131A] border border-[#33384B] rounded-xl p-2.5 text-white"
                    />
                    <input
                      type="text"
                      placeholder="মান/বিবরণ (যেমন: v5.3)"
                      value={spec.value}
                      onChange={(e) => handleUpdateSpecRow(i, spec.key, e.target.value)}
                      className="flex-1 bg-[#11131A] border border-[#33384B] rounded-xl p-2.5 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecRow(i)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Checkboxes */}
              <div className="flex gap-4 border-t border-[#2B3042] pt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isBestSeller || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })}
                    className="accent-[#2563EB]"
                  />
                  <span>বেস্ট সেলার (Best Seller)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isFeatured || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                    className="accent-[#2563EB]"
                  />
                  <span>ফিচারড (Featured)</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#2B3042]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold flex items-center gap-1.5 shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>প্রোডাক্ট সেভ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
