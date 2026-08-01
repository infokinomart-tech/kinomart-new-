import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Image as ImageIcon, Check, X, Shield, Eye, Upload, Clock, Database } from 'lucide-react';
import { Product, Category } from '../../types';
import { api } from '../../services/api';
import { compressImage } from '../../lib/imageCompressor';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('');

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [stock, setStock] = useState('50');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [status, setStatus] = useState<'active' | 'draft'>('active');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerTitle, setTimerTitle] = useState('অফারটি শেষ হতে বাকি:');
  const [timerEndTime, setTimerEndTime] = useState('');
  const [imageUrls, setImageUrls] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [variantOptions, setVariantOptions] = useState<string>('MINT, PEACE, WATERMELON, GRAPE');
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingSupa, setIsSyncingSupa] = useState(false);

  const handleManualSyncToSupabase = async () => {
    setIsSyncingSupa(true);
    try {
      const res = await api.syncToSupabase();
      if (res.success) {
        alert(res.message || 'সকল প্রোডাক্ট ও ডাটা সফলভাবে Supabase-এ সেভ হয়েছে!');
      } else {
        alert('Supabase সেভ ব্যর্থ: ' + (res.error || 'অজানা সমস্যা'));
      }
    } catch (err: any) {
      alert('Supabase সেভ করতে সমস্যা হয়েছে: ' + (err?.message || 'নেটওয়ার্ক সমস্যা'));
    } finally {
      setIsSyncingSupa(false);
    }
  };

  const handleAddSpecRow = () => {
    setSpecifications(prev => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveSpecRow = (index: number) => {
    setSpecifications(prev => prev.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', val: string) => {
    setSpecifications(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const compressed = await compressImage(file, 1000, 1000, 0.82);
      if (compressed) {
        setImageUrls(prev => (prev ? `${prev.trim()}\n${compressed}` : compressed));
      }
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        api.getProducts({ status: 'all' }),
        api.getCategories()
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load products/categories', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setShortDescription('');
    setPrice('');
    setDiscountPrice('');
    setCategoryId(categories[0]?.id || '');
    setSubcategoryId('');
    setStock('50');
    setLowStockThreshold('10');
    setStatus('active');
    setIsFeatured(false);
    setIsBestSeller(false);
    setTimerEnabled(false);
    setTimerTitle('অফারটি শেষ হতে বাকি:');
    setTimerEndTime('');
    setImageUrls('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80');
    setVideoUrl('');
    setVariantOptions('MINT, PEACE, WATERMELON, GRAPE');
    setSpecifications([
      { key: 'ব্লুটুথ ভার্সন', value: 'v5.3' },
      { key: 'প্লেব্যাক টাইম', value: '৩০ ঘণ্টা' },
      { key: 'ওয়ারেন্টি', value: '৬ মাসের রিপ্লেসমেন্ট ওয়ারেন্টি' }
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setShortDescription(p.short_description || '');
    setPrice(String(p.price));
    setDiscountPrice(p.discount_price ? String(p.discount_price) : '');
    setCategoryId(p.category_id);
    setSubcategoryId(p.subcategory_id || '');
    setStock(String(p.stock));
    setLowStockThreshold(p.low_stock_threshold !== undefined ? String(p.low_stock_threshold) : '10');
    setStatus(p.status);
    setIsFeatured(!!p.is_featured);
    setIsBestSeller(!!p.is_best_seller);
    setTimerEnabled(!!p.timer_enabled);
    setTimerTitle(p.timer_title || 'অফারটি শেষ হতে বাকি:');
    setTimerEndTime(p.timer_end_time || '');
    setImageUrls(p.images ? p.images.join('\n') : '');
    setVideoUrl(p.video_url || '');
    setSpecifications(
      p.specifications && p.specifications.length > 0
        ? p.specifications
        : [{ key: '', value: '' }]
    );

    const colorVar = p.variants?.find(v => v.name === 'কালার' || v.name === 'Color');
    if (colorVar) {
      setVariantOptions(colorVar.options.join(', '));
    } else {
      setVariantOptions('');
    }

    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) return;

    setIsSaving(true);
    try {
      const parsedImages = imageUrls
        .split('\n')
        .map(u => u.trim())
        .filter(u => u.length > 0);

      const parsedVariants = variantOptions.trim()
        ? [
            {
              name: 'কালার',
              options: variantOptions.split(',').map(o => o.trim()).filter(o => o.length > 0)
            }
          ]
        : [];

      const parsedSpecifications = specifications
        .map(s => ({ key: s.key.trim(), value: s.value.trim() }))
        .filter(s => s.key.length > 0 || s.value.length > 0);

      const selectedCat = categories.find(c => c.id === categoryId);
      const selectedSubCat = selectedCat?.subcategories?.find(s => s.id === subcategoryId);

      const payload = {
        name,
        description,
        short_description: shortDescription,
        price: Number(price),
        discount_price: discountPrice ? Number(discountPrice) : undefined,
        category_id: categoryId,
        category_name: selectedCat?.name || '',
        subcategory_id: subcategoryId || undefined,
        subcategory_name: selectedSubCat?.name || undefined,
        images: parsedImages.length > 0 ? parsedImages : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
        video_url: videoUrl,
        variants: parsedVariants,
        specifications: parsedSpecifications,
        stock: Number(stock) || 50,
        low_stock_threshold: Number(lowStockThreshold) >= 0 ? Number(lowStockThreshold) : 10,
        status,
        is_featured: isFeatured,
        is_best_seller: isBestSeller,
        timer_enabled: timerEnabled,
        timer_title: timerTitle,
        timer_end_time: timerEndTime
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error('Failed to save product', err);
      alert('প্রোডাক্ট সেভ করতে সমস্যা হয়েছে: ' + (err?.message || 'অনুগ্রহ করে আবার চেষ্টা করুন'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিতভাবে এই প্রোডাক্টটি ডিলিট করতে চান?')) {
      await api.deleteProduct(id);
      loadData();
    }
  };

  const handleResetProducts = async () => {
    if (!window.confirm('আপনি কি নিশ্চিত যে ডেমো/ডিফল্ট প্রোডাক্ট ডাটা রিলোড করতে চান?')) return;
    setIsLoading(true);
    try {
      await api.resetProducts();
      await loadData();
    } catch (err) {
      console.error('Failed to reset products', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = !selectedCatFilter || p.category_id === selectedCatFilter || p.category_name === selectedCatFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#181F30] border border-[#27324A] p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white">প্রোডাক্ট ম্যানেজমেন্ট</h2>
          <p className="text-xs text-gray-400">নতুন গ্যাজেট যোগ করুন বা বিদ্যমান প্রোডাক্ট সম্পাদনা করুন</p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            type="button"
            onClick={handleManualSyncToSupabase}
            disabled={isSyncingSupa}
            className="px-3.5 py-2.5 bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
            title="Supabase ডাটাবেজে সকল প্রোডাক্ট ও ডাটা সেভ করুন"
          >
            <Database className={`w-3.5 h-3.5 text-cyan-200 ${isSyncingSupa ? 'animate-spin' : ''}`} />
            <span>{isSyncingSupa ? 'সেভ হচ্ছে...' : 'Supabase এ সেভ করুন'}</span>
          </button>
          <button
            onClick={handleResetProducts}
            className="px-3.5 py-2.5 bg-[#27324A] hover:bg-[#32405D] text-gray-300 hover:text-white font-semibold text-xs rounded-xl transition-colors"
            title="ডিফল্ট প্রোডাক্ট লোড করুন"
          >
            ডিফল্ট প্রোডাক্ট লোড করুন
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন প্রোডাক্ট যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <input
            type="text"
            placeholder="প্রোডাক্ট নাম অনুযায়ী খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#181F30] border border-[#27324A] rounded-xl text-xs text-white outline-none focus:border-[#3B82F6]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={selectedCatFilter}
          onChange={e => setSelectedCatFilter(e.target.value)}
          className="w-full sm:w-auto px-3.5 py-2 bg-[#181F30] border border-[#27324A] rounded-xl text-xs text-gray-200 outline-none focus:border-[#3B82F6]"
        >
          <option value="">সব ক্যাটাগরি ({categories.length} টি)</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-[#181F30] border border-[#27324A] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#111827] text-gray-400 uppercase font-semibold text-[11px] border-b border-[#27324A]">
              <tr>
                <th className="py-3 px-3">প্রোডাক্ট</th>
                <th className="py-3 px-3">ক্যাটাগরি</th>
                <th className="py-3 px-3">মূল্য</th>
                <th className="py-3 px-3">স্টক</th>
                <th className="py-3 px-3">স্ট্যাটাস</th>
                <th className="py-3 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27324A]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">প্রোডাক্ট লোড হচ্ছে...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <div className="space-y-3">
                      <p className="text-gray-300 font-semibold text-sm">কোনো প্রোডাক্ট পাওয়া যায়নি</p>
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={handleResetProducts}
                          className="px-4 py-2 bg-[#27324A] hover:bg-[#32405D] text-gray-200 font-bold text-xs rounded-xl transition-colors"
                        >
                          ডিফল্ট প্রোডাক্ট লোড করুন
                        </button>
                        <button
                          onClick={handleOpenAddModal}
                          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl transition-colors"
                        >
                          + নতুন প্রোডাক্ট যোগ করুন
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-[#1E293B]/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={p.images?.[0]}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-[#0F1420] border border-[#27324A]"
                        />
                        <div>
                          <div className="font-bold text-white line-clamp-1">{p.name}</div>
                          <div className="flex items-center space-x-1 mt-0.5">
                            {p.is_best_seller && (
                              <span className="text-[10px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded border border-amber-800">
                                Best Seller
                              </span>
                            )}
                            {p.timer_enabled && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40">
                                ⏱️ টাইমার অন
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-300">{p.category_name || '-'}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400">
                      ৳{(p.discount_price || p.price).toLocaleString('bn-BD')}
                      {p.discount_price && (
                        <span className="text-[10px] text-gray-500 line-through ml-1">৳{p.price}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      <div>{p.stock} টি</div>
                      {p.stock > 0 && p.stock <= (p.low_stock_threshold ?? 10) && (
                        <span className="inline-block mt-0.5 text-[10px] bg-red-950 text-red-300 font-bold px-1.5 py-0.5 rounded border border-red-800">
                          ⚠️ লিমিটেড স্টক (≤ {p.low_stock_threshold ?? 10})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        (p.status || 'active') === 'active' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {(p.status || 'active').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 bg-[#27324A] hover:bg-[#3B82F6] text-white rounded-lg transition-colors"
                          title="সম্পাদনা করুন"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 bg-red-950 hover:bg-red-800 text-red-300 rounded-lg transition-colors"
                          title="ডিলিট করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-5 overflow-hidden">
          <div className="bg-[#181F30] border border-[#27324A] rounded-2xl max-w-2xl w-full flex flex-col max-h-[90vh] shadow-2xl text-gray-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#27324A] p-4 sm:px-6 shrink-0 bg-[#181F30] rounded-t-2xl">
              <h3 className="font-bold text-base text-white">
                {editingProduct ? 'প্রোডাক্ট এডিট করুন' : 'নতুন প্রোডাক্ট যোগ করুন'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#27324A] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="product-form" onSubmit={handleSaveProduct} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto grow">
              <div>
                <label className="block font-bold text-gray-300 mb-1">প্রোডাক্ট নাম (বাংলা) *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none focus:border-[#3B82F6]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">মূল্য (Price) ৳ *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-300 mb-1">অফার মূল্য (Discount Price) ৳</label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={e => setDiscountPrice(e.target.value)}
                    className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 mb-1 text-xs">ক্যাটাগরি *</label>
                  <select
                    value={categoryId}
                    onChange={e => {
                      setCategoryId(e.target.value);
                      setSubcategoryId('');
                    }}
                    className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none text-xs"
                    required
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-300 mb-1 text-xs">সাব-ক্যাটাগরি</label>
                  <select
                    value={subcategoryId}
                    onChange={e => setSubcategoryId(e.target.value)}
                    className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none text-xs"
                  >
                    <option value="">-- কোনো সাব-ক্যাটাগরি সিলেক্ট নেই --</option>
                    {(categories.find(c => c.id === categoryId)?.subcategories || []).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-300 mb-1 text-xs">বর্তমান স্টক সংখ্যা</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-400 mb-1 text-xs">লিমিটেড স্টক সীমা</label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={e => setLowStockThreshold(e.target.value)}
                    placeholder="যেমন: 10"
                    className="w-full p-2.5 bg-[#0F1420] border border-amber-500/40 rounded-xl text-white outline-none text-xs focus:border-amber-400"
                  />
                </div>
              </div>
              <p className="text-[11px] text-amber-300/80 -mt-2">
                💡 স্টক এই সংখ্যার নিচে বা সমান হলে (যেমন ≤ {lowStockThreshold || '10'}) প্রোডাক্ট পেজে কাস্টমারদের <strong>"সীমিত স্টক / Limited Stock"</strong> ব্যাজ দেখাবে।
              </p>

              <div>
                <label className="block font-bold text-gray-300 mb-1">কালার/ভেরিয়েন্ট অপশন (কমাদি কমা দিয়ে লিখুন)</label>
                <input
                  type="text"
                  placeholder="যেমন: MINT, PEACE, WATERMELON, GRAPE, BLACK"
                  value={variantOptions}
                  onChange={e => setVariantOptions(e.target.value)}
                  className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-gray-300 mb-1">
                  প্রোডাক্ট ছবিসমূহ (১০৮০ × ১০৮০ স্কয়ার ফরম্যাট)
                </label>

                {/* File Upload Button */}
                <label className="flex items-center justify-center space-x-2 py-3 px-4 bg-[#182030] hover:bg-[#1F2B40] border border-dashed border-[#6B7A4F] text-[#9EB076] rounded-xl cursor-pointer transition-colors text-xs font-semibold">
                  <Upload className="w-4 h-4 text-[#8DA062]" />
                  <span>ডিভাইস থেকে ছবি আপলোড করুন (Custom Image Upload)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Previews */}
                {imageUrls.trim().split('\n').filter(Boolean).length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] text-gray-400 font-semibold">সংযুক্ত ছবিসমূহ ({imageUrls.trim().split('\n').filter(Boolean).length}টি):</p>
                    <div className="flex flex-wrap gap-2">
                      {imageUrls.trim().split('\n').filter(Boolean).map((url, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#27324A] bg-black group">
                          <img src={url.trim()} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const urls = imageUrls.trim().split('\n').filter(Boolean);
                              urls.splice(idx, 1);
                              setImageUrls(urls.join('\n'));
                            }}
                            className="absolute top-0.5 right-0.5 bg-red-600/90 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors shadow-sm"
                            title="ছবি সরান"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Textarea for Direct URLs */}
                <div className="pt-1">
                  <span className="block text-[11px] text-gray-400 mb-1 font-medium">অথবা অনলাইন ইমেজ URL লিখুন (প্রতি লাইনে একটি করে):</span>
                  <textarea
                    rows={3}
                    placeholder={`https://images.unsplash.com/photo-1.jpg\nhttps://images.unsplash.com/photo-2.jpg`}
                    value={imageUrls}
                    onChange={e => setImageUrls(e.target.value)}
                    className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none font-mono text-[11px] focus:border-[#6B7A4F]"
                  />
                  <p className="text-[11px] text-gray-400 mt-0.5">প্রোডাক্ট পেজে এই ছবিগুলো ১০৮০×১০৮০ স্কয়ার গ্যালারিতে প্রদর্শিত হবে।</p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1">
                  ভিডিও লিংক (16:9 Video URL / YouTube Link)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: https://www.youtube.com/watch?v=VIDEO_ID"
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none focus:border-[#6B7A4F]"
                />
                <p className="text-[11px] text-gray-400 mt-1">ইউটিউব বা ভিডিও লিংক দিলে প্রোডাক্ট পেজে ১৬:৯ প্লেয়ারে ভিডিওটি দেখাবে।</p>
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1">
                  সংক্ষিপ্ত বিবরণ (Short Description) - <span className="text-[#6B7A4F] font-normal">(প্রাইস/টাকা এর নিচে এবং কালার/ভেরিয়েন্ট এর উপরে দেখাবে)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="যেমন: প্রিমিয়াম এইচডি সাউন্ড, ফাস্ট চার্জিং ও ৩০ ঘন্টা ব্যাটারি ব্যাকআপ"
                  value={shortDescription}
                  onChange={e => setShortDescription(e.target.value)}
                  className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none focus:border-[#6B7A4F]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1">
                  বিস্তারিত বিবরণ (Long Description) - <span className="text-[#6B7A4F] font-normal">(প্রোডাক্ট বিবরণ ট্যাবে এই দীর্ঘ বিবরণটি দেখাবে)</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="এখানে প্রোডাক্টের সম্পূর্ণ বিস্তারিত বিবরণ লিখুন..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none focus:border-[#6B7A4F]"
                />
              </div>

              {/* Product Specifications Section */}
              <div className="p-4 bg-[#0F1420] border border-[#27324A] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-white text-xs block">পণ্যের স্পেসিফিকেশন (Specifications)</label>
                    <span className="text-[11px] text-gray-400 block">কাস্টমার স্পেসিফিকেশন ট্যাবে এই টেবিলটি দেখতে পাবে</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSpecRow}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-[#2563EB]/20 hover:bg-[#2563EB]/30 text-blue-400 font-bold rounded-xl border border-[#2563EB]/40 text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>নতুন রো যোগ করুন</span>
                  </button>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#27324A]">
                  {specifications.length === 0 ? (
                    <p className="text-gray-400 text-xs italic">কোনো স্পেসিফিকেশন রো নেই। 'নতুন রো যোগ করুন' বাটনে ক্লিক করুন।</p>
                  ) : (
                    specifications.map((spec, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="ফিচার / নাম (যেমন: ব্লুটুথ)"
                          value={spec.key}
                          onChange={e => handleSpecChange(idx, 'key', e.target.value)}
                          className="w-1/2 p-2 bg-[#181F30] border border-[#27324A] rounded-xl text-white text-xs outline-none focus:border-[#6B7A4F]"
                        />
                        <input
                          type="text"
                          placeholder="মান / বিবরণ (যেমন: v5.3)"
                          value={spec.value}
                          onChange={e => handleSpecChange(idx, 'value', e.target.value)}
                          className="w-1/2 p-2 bg-[#181F30] border border-[#27324A] rounded-xl text-white text-xs outline-none focus:border-[#6B7A4F]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecRow(idx)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors shrink-0"
                          title="রিমুভ করুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Offer Countdown Timer Settings */}
              <div className="p-4 bg-[#0F1420] border border-[#27324A] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <div>
                      <label className="font-bold text-white text-xs block">অফার কাউন্টডাউন টাইমার (Offer Timer)</label>
                      <span className="text-[11px] text-gray-400 block">এই সুইচ অন করলে এই প্রোডাক্টের পেজে কাউন্টডাউন টাইমার শো করবে</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={timerEnabled}
                      onChange={e => setTimerEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6B7A4F]"></div>
                  </label>
                </div>

                {timerEnabled && (
                  <div className="pt-3 border-t border-[#27324A] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-gray-300 mb-1">টাইমার টাইটেল (Timer Title)</label>
                      <input
                        type="text"
                        value={timerTitle}
                        onChange={e => setTimerTitle(e.target.value)}
                        placeholder="যেমন: অফারটি শেষ হতে বাকি:"
                        className="w-full p-2.5 bg-[#181F30] border border-[#27324A] rounded-xl text-white outline-none focus:border-[#6B7A4F]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-300 mb-1">অফার শেষ হওয়ার তারিখ ও সময় (Target End Time)</label>
                      <input
                        type="datetime-local"
                        value={timerEndTime}
                        onChange={e => setTimerEndTime(e.target.value)}
                        className="w-full p-2.5 bg-[#181F30] border border-[#27324A] rounded-xl text-white outline-none focus:border-[#6B7A4F]"
                      />
                      <span className="text-[10px] text-gray-400 block mt-1">ফাঁকা রাখলে ২৪ ঘণ্টার স্ট্যান্ডার্ড কাউন্টডাউন চলবে</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={e => setIsBestSeller(e.target.checked)}
                    className="accent-[#3B82F6]"
                  />
                  <span>বেস্ট সেলার (Best Seller)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={e => setIsFeatured(e.target.checked)}
                    className="accent-[#3B82F6]"
                  />
                  <span>ফিচারড (Featured)</span>
                </label>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-2 p-4 sm:px-6 border-t border-[#27324A] bg-[#181F30] rounded-b-2xl shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-[#0F1420] hover:bg-[#27324A] text-gray-300 font-bold rounded-xl transition-colors"
              >
                ক্যান্সেল
              </button>
              <button
                type="submit"
                form="product-form"
                disabled={isSaving}
                className="px-6 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl shadow-md transition-colors"
              >
                {isSaving ? 'সেভ হচ্ছে...' : 'প্রোডাক্ট সেভ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
