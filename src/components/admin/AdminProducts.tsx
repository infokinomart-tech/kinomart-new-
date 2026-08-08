import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Specification, ProductBundle } from '../../types';
import { getDefaultBundles } from '../../lib/bundleUtils';
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
  Video,
  Clock,
  PackageCheck,
  Zap
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
      bundles: [],
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

  // Bundle package handlers
  const handleGenerateDefaultBundles = () => {
    if (editingProduct) {
      const price = editingProduct.discountPrice || editingProduct.price || 1000;
      const gen = getDefaultBundles(price);
      setEditingProduct({ ...editingProduct, bundles: gen });
    }
  };

  const handleAddBundleRow = () => {
    if (editingProduct) {
      const bundles = editingProduct.bundles || [];
      const newB: ProductBundle = {
        id: `b-${Date.now()}`,
        title: '1 Pc',
        quantity: 1,
        price: editingProduct.discountPrice || editingProduct.price || 1000,
        originalPrice: Math.round((editingProduct.discountPrice || editingProduct.price || 1000) * 1.3),
        badgeText: '',
        tagText: 'ক্যাশ অন ডেলিভারী',
        isPopular: false
      };
      setEditingProduct({ ...editingProduct, bundles: [...bundles, newB] });
    }
  };

  const handleUpdateBundleRow = (index: number, field: keyof ProductBundle, value: any) => {
    if (editingProduct) {
      const bundles = [...(editingProduct.bundles || [])];
      bundles[index] = { ...bundles[index], [field]: value };
      setEditingProduct({ ...editingProduct, bundles });
    }
  };

  const handleRemoveBundleRow = (index: number) => {
    if (editingProduct) {
      const bundles = (editingProduct.bundles || []).filter((_, i) => i !== index);
      setEditingProduct({ ...editingProduct, bundles });
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
                        p.stock <= 0
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : p.stock <= (p.limitedStockThreshold || 10)
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {p.stock <= 0 ? 'Stock Out (0)' : `${p.stock} pcs`}
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
                    onChange={(e) => {
                      const newCatName = e.target.value;
                      const foundCat = categories.find((c) => c.name.trim().toLowerCase() === newCatName.trim().toLowerCase());
                      const currentSub = editingProduct.subCategory || '';
                      const subs = foundCat?.subCategories || [];
                      setEditingProduct({
                        ...editingProduct,
                        category: newCatName,
                        subCategory: subs.includes(currentSub) ? currentSub : ''
                      });
                    }}
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
                      categories.find((c) => c.name.trim().toLowerCase() === (editingProduct.category || '').trim().toLowerCase())?.subCategories || []
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

              {/* Customer Review Cards Manager for Slideshow */}
              <div className="space-y-4 border-t border-[#1E293B] pt-4">
                <div className="flex items-center justify-between">
                  <label className="block text-[#CBD5E1] font-bold">
                    কাস্টমার রিভিউ স্লাইডশো (Customer Review Cards)
                  </label>
                  <span className="text-xs text-amber-400 font-bold">
                    {(editingProduct.reviews || []).length} টি রিভিউ কার্ড
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8]">
                  প্রোডাক্ট পেজে ভিডিও এবং অর্ডারের মাঝখানে ডার্ক কার্ডের সুন্দর স্লাইডশো আকারে দেখাবে।
                </p>

                {/* Existing Review Cards */}
                {(editingProduct.reviews || []).length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(editingProduct.reviews || []).map((rev, idx) => (
                      <div key={rev.id || idx} className="bg-[#050B18] border border-[#1E293B] rounded-xl p-3 space-y-2 relative group">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (editingProduct.reviews || []).filter((_, i) => i !== idx);
                            setEditingProduct({ ...editingProduct, reviews: updated });
                          }}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-300 bg-red-950/60 p-1 rounded-lg cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400' : 'text-slate-600'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-slate-200 italic line-clamp-2">
                          "{rev.comment}"
                        </p>
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-[11px]">
                          {rev.image ? (
                            <img src={rev.image} alt={rev.userName} className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px]">
                              {rev.userName.charAt(0)}
                            </div>
                          )}
                          <div className="truncate">
                            <span className="font-bold text-white block truncate">{rev.userName}</span>
                            {rev.userRole && <span className="text-[9px] text-slate-400 block truncate">{rev.userRole}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Review Card Form */}
                <div className="bg-[#050B18] border border-[#1E293B] rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    <span>নতুন কাস্টমার রিভিউ যুক্ত করুন</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-[#CBD5E1] font-bold mb-1">কাস্টমারের নাম</label>
                      <input
                        type="text"
                        id="new-rev-name"
                        placeholder="যেমন: Rahat Islam / তানভীর"
                        className="w-full bg-[#0F172A] border border-[#1E293B] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#CBD5E1] font-bold mb-1">পদবী/সাবটাইটেল (Optional)</label>
                      <input
                        type="text"
                        id="new-rev-role"
                        placeholder="যেমন: CEO, AURORA TECH বা VERIFIED BUYER"
                        className="w-full bg-[#0F172A] border border-[#1E293B] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#CBD5E1] font-bold mb-1">রিভিউ কোট / বক্তব্য</label>
                    <textarea
                      id="new-rev-comment"
                      rows={2}
                      placeholder="যেমন: প্রোডাক্টটি পেয়ে আমি খুব সন্তুষ্ট। ফাস্ট ডেলিভারি ও প্যাকেজিং চমৎকার ছিল!"
                      className="w-full bg-[#0F172A] border border-[#1E293B] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] text-[#CBD5E1] font-bold">রেটিং:</label>
                      <select
                        id="new-rev-rating"
                        defaultValue="5"
                        className="bg-[#0F172A] border border-[#1E293B] text-amber-400 text-xs font-bold rounded-lg px-2 py-1"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (5 Star)</option>
                        <option value="4">⭐⭐⭐⭐ (4 Star)</option>
                        <option value="3">⭐⭐⭐ (3 Star)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const nameEl = document.getElementById('new-rev-name') as HTMLInputElement;
                        const roleEl = document.getElementById('new-rev-role') as HTMLInputElement;
                        const commentEl = document.getElementById('new-rev-comment') as HTMLTextAreaElement;
                        const ratingEl = document.getElementById('new-rev-rating') as HTMLSelectElement;

                        if (!nameEl?.value.trim() || !commentEl?.value.trim()) {
                          alert('দয়া করে নাম এবং বক্তব্য লিখুন');
                          return;
                        }

                        const newRev = {
                          id: `rev-${Date.now()}`,
                          userName: nameEl.value.trim(),
                          userRole: roleEl?.value.trim() || 'VERIFIED BUYER',
                          comment: commentEl.value.trim(),
                          rating: Number(ratingEl?.value || 5),
                          date: new Date().toLocaleDateString('bn-BD'),
                          isVerifiedPurchase: true
                        };

                        setEditingProduct({
                          ...editingProduct,
                          reviews: [...(editingProduct.reviews || []), newRev]
                        });

                        nameEl.value = '';
                        if (roleEl) roleEl.value = '';
                        commentEl.value = '';
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>রিভিউ কার্ড যোগ করুন</span>
                    </button>
                  </div>
                </div>

                {/* Also General Review Image Upload */}
                <div className="pt-2">
                  <label className="block text-xs text-[#CBD5E1] font-bold mb-1">
                    অথবা কাস্টমার মেসেজ/রিভিউ এর স্ক্রিনশট ছবি আপলোড করুন:
                  </label>
                  <div className="border border-dashed border-[#1E293B] rounded-xl p-3 text-center bg-[#050B18]/50">
                    <label className="cursor-pointer flex items-center justify-center gap-2 text-xs text-emerald-400 font-bold hover:underline">
                      <Upload className="w-4 h-4" />
                      <span>রিভিউ স্ক্রিনশট আপলোড</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const fileList = e.target.files;
                          if (!fileList) return;
                          Array.from(fileList).forEach((file) => {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              if (evt.target?.result) {
                                const newImg = evt.target.result as string;
                                setEditingProduct((prev) => {
                                  if (!prev) return prev;
                                  return { ...prev, reviewImages: [...(prev.reviewImages || []), newImg] };
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                          });
                        }}
                      />
                    </label>
                  </div>
                  {(editingProduct.reviewImages || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {(editingProduct.reviewImages || []).map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-emerald-500/40 bg-black">
                          <img src={img} alt={`Review ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const newImgs = (editingProduct.reviewImages || []).filter((_, i) => i !== idx);
                              setEditingProduct({ ...editingProduct, reviewImages: newImgs });
                            }}
                            className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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

              {/* Package Offers / Quantity Deals Section */}
              <div className="bg-[#0B1220] border border-[#1E293B] rounded-2xl p-4 text-white space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                      <PackageCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-white">
                        প্যাকেজ অফার / বান্ডেল ডিল (Quantity Deals & Bundles)
                      </h3>
                      <p className="text-xs text-gray-400">
                        অর্ডার করার সময় ১ Pc, ২ Pc, ৪ Pc ইত্যাদি অফার কার্ড প্রদর্শিত হবে
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateDefaultBundles}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>⚡ স্ট্যান্ডার্ড ৩টি জেনারেট করুন</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddBundleRow}
                      className="bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ নতুন প্যাকেজ</span>
                    </button>
                  </div>
                </div>

                {/* Bundle Rows */}
                {(!editingProduct.bundles || editingProduct.bundles.length === 0) ? (
                  <div className="text-center py-5 px-4 bg-[#050B18] rounded-xl border border-dashed border-[#1E293B] text-gray-400 text-xs space-y-2">
                    <div className="inline-flex items-center gap-2 bg-gray-800/80 text-gray-300 text-xs px-3 py-1 rounded-full font-bold">
                      ⚪ প্যাকেজ অফার: বন্ধ (Regular Order Flow)
                    </div>
                    <p className="font-medium text-gray-300">
                      এই প্রোডাক্টে কোনো প্যাকেজ যোগ করা নেই। কাস্টমার সাধারণ প্রোডাক্ট হিসেবে অর্ডার করবে।
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      যদি আপনি ওয়েবসাইট বা মডালে প্যাকেজ অফার (যেমন: ১ পিস, ২ পিস, ৪ পিস) দেখাতে চান, তবে নিচের যেকোনো একটি বাটনে ক্লিক করুন:
                    </p>
                    <div className="pt-1 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleGenerateDefaultBundles}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>১-ক্লিকে ৩টি প্যাকেজ জেনারেট করুন</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAddBundleRow}
                        className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ম্যানুয়ালি প্যাকেজ যোগ করুন</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs bg-emerald-950/40 border border-emerald-800/50 p-2.5 rounded-xl text-emerald-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        🟢 প্যাকেজ অফার: চালু রয়েছে ({editingProduct.bundles.length} টি প্যাকেজ সক্রিয়)
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, bundles: [] })}
                        className="text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>সব মুছে প্যাকেজ অফ করুন</span>
                      </button>
                    </div>
                    {editingProduct.bundles.map((bundle, idx) => (
                      <div
                        key={bundle.id || idx}
                        className="bg-[#050B18] border border-[#1E293B] rounded-xl p-3.5 space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-gray-300 border-b border-[#1E293B] pb-2">
                          <span className="text-blue-400">প্যাকেজ #{idx + 1}</span>
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 cursor-pointer text-amber-300 text-[11px]">
                              <input
                                type="checkbox"
                                checked={bundle.isPopular || false}
                                onChange={(e) => handleUpdateBundleRow(idx, 'isPopular', e.target.checked)}
                                className="accent-amber-500 rounded cursor-pointer"
                              />
                              <span>ডিফল্ট সিলেক্টেড (Popular Deal)</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => handleRemoveBundleRow(idx)}
                              className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                          {/* Title */}
                          <div>
                            <label className="block text-gray-400 mb-1 font-bold">টাইটেল (Title)</label>
                            <input
                              type="text"
                              value={bundle.title}
                              onChange={(e) => handleUpdateBundleRow(idx, 'title', e.target.value)}
                              placeholder="1 Pc / 2 Pc / 4 Pc"
                              className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg p-2 text-white focus:border-[#2563EB]"
                            />
                          </div>

                          {/* Quantity */}
                          <div>
                            <label className="block text-gray-400 mb-1 font-bold">পরিমাণ (Quantity)</label>
                            <input
                              type="number"
                              value={bundle.quantity}
                              onChange={(e) => handleUpdateBundleRow(idx, 'quantity', Number(e.target.value))}
                              placeholder="1"
                              className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg p-2 text-white focus:border-[#2563EB]"
                            />
                          </div>

                          {/* Price */}
                          <div>
                            <label className="block text-emerald-400 mb-1 font-bold">প্যাকেজ মূল্য (Price)</label>
                            <input
                              type="number"
                              value={bundle.price}
                              onChange={(e) => handleUpdateBundleRow(idx, 'price', Number(e.target.value))}
                              placeholder="989"
                              className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg p-2 text-emerald-300 font-bold focus:border-[#2563EB]"
                            />
                          </div>

                          {/* Original Price */}
                          <div>
                            <label className="block text-gray-400 mb-1 font-bold">পূর্বের মূল্য (Original Price)</label>
                            <input
                              type="number"
                              value={bundle.originalPrice || ''}
                              onChange={(e) => handleUpdateBundleRow(idx, 'originalPrice', Number(e.target.value))}
                              placeholder="1300"
                              className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg p-2 text-gray-300 focus:border-[#2563EB]"
                            />
                          </div>

                          {/* Save Badge Text */}
                          <div>
                            <label className="block text-red-400 mb-1 font-bold">ছাড়ের ব্যাজ (Save Badge)</label>
                            <input
                              type="text"
                              value={bundle.badgeText || ''}
                              onChange={(e) => handleUpdateBundleRow(idx, 'badgeText', e.target.value)}
                              placeholder="🔥 SAVE 179 TK"
                              className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg p-2 text-red-300 focus:border-[#2563EB]"
                            />
                          </div>

                          {/* Tag Text */}
                          <div>
                            <label className="block text-gray-400 mb-1 font-bold">ট্যাগ (Tag Text)</label>
                            <input
                              type="text"
                              value={bundle.tagText || ''}
                              onChange={(e) => handleUpdateBundleRow(idx, 'tagText', e.target.value)}
                              placeholder="ক্যাশ অন ডেলিভারী"
                              className="w-full bg-[#0B1220] border border-[#1E293B] rounded-lg p-2 text-white focus:border-[#2563EB]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Offer Timer Section (Matching Demo Image) */}
              <div className="bg-[#0B1220] border border-[#1E293B] rounded-2xl p-4 text-white space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full border border-amber-500/50 bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm sm:text-base text-white">
                        অফার কাউন্টডাউন টাইমার (Offer Timer)
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        এই সুইচ অন করলে এই প্রোডাক্টের পেজে কাউন্টডাউন টাইমার শো করবে
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingProduct({ ...editingProduct, hasTimer: !editingProduct.hasTimer })
                    }
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                      editingProduct.hasTimer ? 'bg-[#658238]' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        editingProduct.hasTimer ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Sub-inputs when Offer Timer is toggled ON */}
                {editingProduct.hasTimer && (
                  <div className="border-t border-[#1E293B] pt-3.5 mt-3 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Timer Title */}
                      <div>
                        <label className="block text-xs font-bold text-[#CBD5E1] mb-1.5">
                          টাইমার টাইটেল (Timer Title)
                        </label>
                        <input
                          type="text"
                          value={editingProduct.timerTitle ?? 'অফারটি শেষ হতে বাকি:'}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, timerTitle: e.target.value })
                          }
                          placeholder="অফারটি শেষ হতে বাকি:"
                          className="w-full bg-[#050B18] border border-[#1E293B] rounded-xl p-3 text-white focus:outline-none focus:border-[#2563EB] text-xs font-medium"
                        />
                      </div>

                      {/* Target End Time */}
                      <div>
                        <label className="block text-xs font-bold text-[#CBD5E1] mb-1.5">
                          অফার শেষ হওয়ার তারিখ ও সময় (Target End Time)
                        </label>
                        <input
                          type="datetime-local"
                          value={editingProduct.timerEndTime || ''}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, timerEndTime: e.target.value })
                          }
                          className="w-full bg-[#050B18] border border-[#1E293B] rounded-xl p-3 text-white focus:outline-none focus:border-[#2563EB] text-xs font-medium [color-scheme:dark]"
                        />
                        <span className="text-[11px] text-[#64748B] mt-1.5 block">
                          ফাঁকা রাখলে ২৪ ঘণ্টার স্ট্যান্ডার্ড কাউন্টডাউন চলবে
                        </span>
                      </div>
                    </div>
                  </div>
                )}
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
