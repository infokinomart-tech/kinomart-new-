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

      {/* Product Add / Edit Modal (Matching Image 2) */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#0B1329] border border-[#1E293B] rounded-2xl max-w-3xl w-full p-5 sm:p-6 space-y-4 text-white my-auto max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-[#1E293B] pb-3">
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                {editingProduct.id && editingProduct.name ? 'প্রোডাক্ট এডিট করুন' : 'নতুন প্রোডাক্ট যোগ করুন'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Product Name */}
              <div>
                <label className="block text-[#CBD5E1] font-bold mb-1.5">
                  প্রোডাক্ট নাম (বাংলা) *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="যেমন: African Organic Wild Honey 500g..."
                  className="w-full bg-[#050B18] border border-[#1E293B] rounded-xl p-3 text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Price & Offer Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#CBD5E1] font-bold mb-1.5">মূল্য (Price) ৳ *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-[#050B18] border border-[#1E293B] rounded-xl p-3 text-white focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-[#CBD5E1] font-bold mb-1.5">অফার মূল্য (Discount Price) ৳</label>
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
                    className="w-full bg-[#050B18] border border-[#1E293B] rounded-xl p-3 text-white focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              {/* Category, Subcategory, Stock, Limited Threshold */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[#CBD5E1] font-bold mb-1.5">ক্যাটাগরি *</label>
                  <select
                    value={editingProduct.category || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-[#050B18] border border-[#1E293B] rounded-xl p-3 text-white focus:outline-none focus:border-[#2563EB]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#CBD5E1] font-bold mb-1.5">সাব-ক্যাটাগরি</label>
                  <select
                    value={editingProduct.subCategory || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, subCategory: e.target.value })}
                    className="w-full bg-[#050B18] border border-[#1E293B] rounded-xl p-3 text-white focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">-- বাছাই সাব-ক্যাটাগরি --</option>
                    {(
                      categories.find((c) => c.name === editingProduct.category)?.subCategories || []
                    ).map((sc, i) => (
                      <option key={i} value={sc}>
                        {sc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#CBD5E1] font-bold mb-1.5">বর্তমান স্টক সংখ্যা</label>
                  <input
                    type="number"
                    value={editingProduct.stock || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full bg-[#050B18] border border-[#1E293B] rounded-xl p-3 text-white focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-amber-400 font-bold mb-1.5">লিমিটেড স্টক সীমা</label>
                  <input
                    type="number"
                    value={editingProduct.limitedStockThreshold || 10}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        limitedStockThreshold: Number(e.target.value)
                      })
                    }
                    className="w-full bg-[#050B18] border border-amber-500/40 rounded-xl p-3 text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <p className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1.5">
                <span>💡 স্টক এই সংখ্যার নিচে বা সমান হলে (যেমন ≤ 10) প্রোডাক্ট পেজে অটোমেটিক "লিমিটেড স্টক / Limited Stock" ব্যাজ দেখাবে</span>
              </p>

              {/* Color/Variants */}
              <div>
                <label className="block text-[#CBD5E1] font-bold mb-1.5">
                  কালার/ভেরিয়েন্ট অপশন (কমা দিয়ে লিখুন)
                </label>
                <input
                  type="text"
                  value={editingProduct.colors?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      colors: e.target.value.split(',').map((s) => s.trim())
                    })
                  }
                  placeholder="MINT, PEACE, WATERMELON, GRAPE"
                  className="w-full bg-[#050B18] border border-[#1E293B] rounded-xl p-3 text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Product Images (Square Format) */}
              <div className="space-y-2">
                <label className="block text-[#CBD5E1] font-bold">
                  প্রোডাক্ট ছবিসমূহ (১০৮০ × ১০৮০ স্কয়ার ফরম্যাট)
                </label>

                {/* Custom Upload Area */}
                <div className="border-2 border-dashed border-[#1E293B] hover:border-[#2563EB] rounded-2xl p-4 text-center bg-[#050B18]/50 transition-colors">
                  <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
                    <Upload className="w-6 h-6 text-[#2563EB]" />
                    <span className="font-extrabold text-blue-400 hover:underline text-xs">
                      ডিভাইস থেকে ছবি আপলোড করুন (Custom Image Upload)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const fileList = e.target.files;
                        if (!fileList) return;
                        const files = Array.from(fileList) as File[];
                        files.forEach((file: File) => {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            if (evt.target?.result) {
                              const newImg = evt.target.result as string;
                              setEditingProduct((prev) => {
                                if (!prev) return prev;
                                const existingThumbnail = prev.thumbnail || '';
                                if (!existingThumbnail) {
                                  return { ...prev, thumbnail: newImg };
                                } else {
                                  const gallery = prev.gallery || [];
                                  return { ...prev, gallery: [...gallery, newImg] };
                                }
                              });
                            }
                          };
                          reader.readAsDataURL(file);
                        });
                      }}
                    />
                  </label>
                </div>

                {/* Thumbnail Previews */}
                {editingProduct.thumbnail && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#2563EB] group">
                      <img
                        src={editingProduct.thumbnail}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const gallery = editingProduct.gallery || [];
                          if (gallery.length > 0) {
                            setEditingProduct({
                              ...editingProduct,
                              thumbnail: gallery[0],
                              gallery: gallery.slice(1)
                            });
                          } else {
                            setEditingProduct({ ...editingProduct, thumbnail: '' });
                          }
                        }}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {(editingProduct.gallery || []).map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#1E293B] group">
                        <img
                          src={img}
                          alt={`Gallery ${idx}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newGallery = (editingProduct.gallery || []).filter((_, i) => i !== idx);
                            setEditingProduct({ ...editingProduct, gallery: newGallery });
                          }}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Online Image URLs */}
                <div>
                  <label className="block text-[11px] text-[#94A3B8] font-bold mb-1">
                    অথবা অনলাইন ইমেজ URL লিখুন (প্রতি লাইনে একটি করে):
                  </label>
                  <textarea
                    rows={2}
                    value={
                      [editingProduct.thumbnail, ...(editingProduct.gallery || [])]
                        .filter(Boolean)
                        .join('\n')
                    }
                    onChange={(e) => {
                      const lines = e.target.value.split('\n').map((l) => l.trim()).filter(Boolean);
                      setEditingProduct({
                        ...editingProduct,
                        thumbnail: lines[0] || '',
                        gallery: lines.slice(1)
                      });
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-[#050B18] border border-[#1E293B] rounded-xl p-3 text-white font-mono text-[11px] focus:outline-none focus:border-[#2563EB]"
                  />
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    প্রোডাক্ট পেজে এই ছবিগুলো ১০৮০×১০৮০ স্কয়ার গ্যালারিতে প্রদর্শিত হবে
                  </p>
                </div>
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-[#CBD5E1] font-bold mb-1">
                  ভিডিও লিঙ্ক (16:9 Video URL / YouTube Link)
                </label>
                <input
                  type="text"
                  value={editingProduct.videoUrl || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, videoUrl: e.target.value })}
                  placeholder="যেমন: https://www.youtube.com/watch?v=VIDEO_ID"
                  className="w-full bg-[#050B18] border border-[#1E293B] rounded-xl p-3 text-white focus:outline-none focus:border-[#2563EB]"
                />
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  ইউটিউব বা ভিডিওর লিংক দিলে প্রোডাক্ট পেজে ১০৮০p ভিডিও টিউটোরিয়াল দেখাবে
                </p>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-[#CBD5E1] font-bold mb-1">
                  সংক্ষিপ্ত বিবরণ (Short Description) - <span className="text-[#64748B] font-normal">(হেডিং/টাইটেল এর নিচে এবং কালার/ভেরিয়েন্ট এর উপরে দেখাবে)</span>
                </label>
                <textarea
                  rows={2}
                  value={editingProduct.shortDescription || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                  placeholder="যেমন: প্রিমিয়াম এইচডি সাউন্ড, ফাস্ট চার্জিং, ও ৩০ ঘণ্টা ব্যাটারি ব্যাকআপ"
                  className="w-full bg-[#050B18] border border-[#1E293B] rounded-xl p-3 text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Long Description */}
              <div>
                <label className="block text-[#CBD5E1] font-bold mb-1">
                  বিস্তারিত বিবরণ (Long Description) - <span className="text-[#64748B] font-normal">(প্রোডাক্ট বিবরণ ট্যাবে এই দীর্ঘ বিবরণটি দেখাবে)</span>
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.longDescription || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, longDescription: e.target.value })}
                  placeholder="এখানে প্রোডাক্টের সম্পূর্ণ বিস্তারিত বিবরণ লিখুন..."
                  className="w-full bg-[#050B18] border border-[#1E293B] rounded-xl p-3 text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Specifications Table */}
              <div className="space-y-2 border-t border-[#1E293B] pt-3">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-[#CBD5E1] font-bold block">পণ্যের স্পেসিফিকেশন (Specifications)</label>
                    <span className="text-[11px] text-[#64748B]">প্রোডাক্টের স্পেসিফিকেশন ট্যাবে এই তথ্যটি দেখাবে</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSpecRow}
                    className="bg-[#2563EB] hover:bg-blue-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    + নতুন রো যোগ করুন
                  </button>
                </div>

                <div className="space-y-2">
                  {(editingProduct.specifications || []).map((spec, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="ব্লুটুথ ভার্সন"
                        value={spec.key}
                        onChange={(e) => handleUpdateSpecRow(i, e.target.value, spec.value)}
                        className="flex-1 bg-[#050B18] border border-[#1E293B] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#2563EB]"
                      />
                      <input
                        type="text"
                        placeholder="v5.2"
                        value={spec.value}
                        onChange={(e) => handleUpdateSpecRow(i, spec.key, e.target.value)}
                        className="flex-1 bg-[#050B18] border border-[#1E293B] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#2563EB]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecRow(i)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Offer Timer Toggle Switch */}
              <div className="flex items-center justify-between border-t border-[#1E293B] pt-3 bg-[#050B18]/40 p-3 rounded-xl border">
                <div>
                  <div className="font-bold text-[#CBD5E1]">অফার কাউন্টডাউন টাইমার (Offer Timer)</div>
                  <div className="text-[11px] text-[#64748B]">
                    এই সুইচ অন করলে এই প্রোডাক্টের পেজে কাউন্টডাউন টাইমার শো করবে
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEditingProduct({ ...editingProduct, hasTimer: !editingProduct.hasTimer })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    editingProduct.hasTimer ? 'bg-[#2563EB]' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      editingProduct.hasTimer ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6 border-t border-[#1E293B] pt-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#CBD5E1]">
                  <input
                    type="checkbox"
                    checked={editingProduct.isBestSeller || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })}
                    className="w-4 h-4 accent-[#2563EB] rounded cursor-pointer"
                  />
                  <span>বেস্ট সেলার (Best Seller)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#CBD5E1]">
                  <input
                    type="checkbox"
                    checked={editingProduct.isFeatured || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-[#2563EB] rounded cursor-pointer"
                  />
                  <span>ফিচারড (Featured)</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#1E293B] hover:bg-gray-700 text-white font-bold cursor-pointer transition-colors"
                >
                  ক্যানসেল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
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
