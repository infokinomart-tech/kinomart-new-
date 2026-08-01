import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, FolderTree, Eye, EyeOff, Upload, X, Tag, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { Category, SubCategory } from '../../types';
import { api } from '../../services/api';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Category Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  // Category form states
  const [name, setName] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [isVisible, setIsVisible] = useState(true);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [newSubName, setNewSubName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Quick inline add subcategory on card
  const [cardSubInput, setCardSubInput] = useState<{ [catId: string]: string }>({});

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load categories', err);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetCategories = async () => {
    if (!window.confirm('আপনি কি নিশ্চিত যে ক্যাটাগরি এবং সাব-ক্যাটাগরি রিসেট করে ডিফল্ট সেটিংসে ফিরিয়ে আনতে চান?')) return;
    setIsLoading(true);
    try {
      const data = await api.resetCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to reset categories', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setName('');
    setIconUrl('');
    setDisplayOrder(String(categories.length + 1));
    setIsVisible(true);
    setSubcategories([]);
    setNewSubName('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setIconUrl(cat.icon_url || '');
    setDisplayOrder(String(cat.display_order));
    setIsVisible(cat.is_visible);
    setSubcategories(Array.isArray(cat.subcategories) ? [...cat.subcategories] : []);
    setNewSubName('');
    setIsModalOpen(true);
  };

  // Modal Subcategory Management
  const handleAddSubcategoryInModal = () => {
    const trimmed = newSubName.trim();
    if (!trimmed) return;
    const newSub: SubCategory = {
      id: 'sub-' + Date.now(),
      name: trimmed,
      slug: trimmed.toLowerCase().replace(/\s+/g, '-').replace(/[^\p{L}\p{M}\p{N}\-_]+/gu, '') || ('sub-' + Date.now()),
      is_visible: true
    };
    setSubcategories(prev => [...prev, newSub]);
    setNewSubName('');
  };

  const handleRemoveSubcategoryInModal = (subId: string) => {
    setSubcategories(prev => prev.filter(s => s.id !== subId));
  };

  const handleEditSubcategoryNameInModal = (subId: string, newName: string) => {
    setSubcategories(prev => prev.map(s => s.id === subId ? { ...s, name: newName } : s));
  };

  // Card Quick Subcategory Operations
  const handleAddSubcategoryToCard = async (cat: Category) => {
    const subName = (cardSubInput[cat.id] || '').trim();
    if (!subName) return;

    const existingSubs = Array.isArray(cat.subcategories) ? [...cat.subcategories] : [];
    const newSub: SubCategory = {
      id: 'sub-' + Date.now(),
      name: subName,
      slug: subName.toLowerCase().replace(/\s+/g, '-').replace(/[^\p{L}\p{M}\p{N}\-_]+/gu, '') || ('sub-' + Date.now()),
      is_visible: true
    };

    const updatedSubs = [...existingSubs, newSub];
    try {
      await api.updateCategory(cat.id, { subcategories: updatedSubs });
      setCardSubInput(prev => ({ ...prev, [cat.id]: '' }));
      loadCategories();
    } catch (err: any) {
      alert('সাব-ক্যাটাগরি যুক্ত করতে সমস্যা হয়েছে: ' + (err?.message || ''));
    }
  };

  const handleDeleteSubcategoryFromCard = async (cat: Category, subId: string) => {
    if (!window.confirm('আপনি কি এই সাব-ক্যাটাগরিটি ডিলিট করতে চান?')) return;
    const existingSubs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
    const updatedSubs = existingSubs.filter(s => s.id !== subId);
    try {
      await api.updateCategory(cat.id, { subcategories: updatedSubs });
      loadCategories();
    } catch (err: any) {
      alert('সাব-ক্যাটাগরি ডিলিট করতে সমস্যা হয়েছে: ' + (err?.message || ''));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        icon_url: iconUrl.trim(),
        display_order: Number(displayOrder) || 1,
        is_visible: isVisible,
        subcategories: subcategories
      };

      if (editingCat) {
        await api.updateCategory(editingCat.id, payload);
      } else {
        await api.createCategory(payload);
      }

      setIsModalOpen(false);
      await loadCategories();
    } catch (err: any) {
      console.error('Failed to save category', err);
      alert('ক্যাটাগরি সেভ করতে সমস্যা হয়েছে: ' + (err?.message || 'অনুগ্রহ করে আবার চেষ্টা করুন'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিতভাবে এই ক্যাটাগরিটি এবং এর সকল সাব-ক্যাটাগরি ডিলিট করতে চান?')) {
      await api.deleteCategory(id);
      loadCategories();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#181F30] border border-[#27324A] p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#3B82F6]" />
            <h2 className="text-xl font-bold text-white">ক্যাটাগরি ও সাব-ক্যাটাগরি ম্যানেজমেন্ট</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            মেইন ক্যাটাগরি তৈরি ও এডিট করুন এবং প্রতিটির নিচে সাব-ক্যাটাগরি যুক্ত বা পরিবর্তন করুন
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetCategories}
            className="px-3.5 py-2.5 bg-[#27324A] hover:bg-[#32405D] text-gray-300 hover:text-white font-semibold text-xs rounded-xl transition-colors"
            title="ডিফল্ট ডাটা রিসেট করুন"
          >
            ডিফল্ট ক্যাটাগরি লোড করুন
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ক্যাটাগরি</span>
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="text-gray-400 text-xs py-12 col-span-full text-center">ক্যাটাগরি লোড হচ্ছে...</div>
        ) : categories.length === 0 ? (
          <div className="col-span-full bg-[#181F30] border border-[#27324A] rounded-2xl p-8 text-center space-y-4">
            <FolderTree className="w-12 h-12 text-gray-500 mx-auto" />
            <p className="text-gray-300 text-sm font-semibold">কোনো ক্যাটাগরি পাওয়া যায়নি</p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl transition-colors"
              >
                + নতুন ক্যাটাগরি তৈরি করুন
              </button>
              <button
                onClick={handleResetCategories}
                className="px-4 py-2 bg-[#27324A] hover:bg-[#32405D] text-gray-200 font-bold text-xs rounded-xl transition-colors"
              >
                ডিফল্ট ক্যাটাগরি লোড করুন
              </button>
            </div>
          </div>
        ) : (
          categories.map(cat => {
            const subs = Array.isArray(cat.subcategories) ? cat.subcategories : [];

            return (
              <div
                key={cat.id}
                className="bg-[#181F30] border border-[#27324A] rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-[#3B82F6]/50 transition-all shadow-md group"
              >
                {/* Category Header Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0F1420] border border-[#27324A] overflow-hidden flex items-center justify-center p-1 shrink-0">
                      {cat.icon_url ? (
                        <img src={cat.icon_url} alt={cat.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <FolderTree className="w-6 h-6 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{cat.name}</h4>
                      <div className="flex items-center space-x-2 text-[11px] text-gray-400 mt-0.5">
                        <span>পজিশন: <strong className="text-gray-200">{cat.display_order}</strong></span>
                        <span>•</span>
                        <span className={cat.is_visible ? 'text-emerald-400' : 'text-gray-500'}>
                          {cat.is_visible ? 'দৃশ্যমান (Visible)' : 'লুকানো (Hidden)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 bg-[#27324A] hover:bg-[#3B82F6] text-white rounded-lg transition-colors"
                      title="ক্যাটাগরি ও সাব-ক্যাটাগরি এডিট করুন"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 bg-red-950/80 hover:bg-red-800 text-red-300 rounded-lg transition-colors"
                      title="ডিলিট করুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subcategories Container */}
                <div className="pt-3 border-t border-[#27324A]/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-300 flex items-center space-x-1">
                      <Tag className="w-3.5 h-3.5 text-blue-400" />
                      <span>সাব-ক্যাটাগরি সমূহ ({subs.length}টি)</span>
                    </span>
                  </div>

                  {/* Subcategory List Badges */}
                  <div className="flex flex-wrap gap-1.5 min-h-[32px] bg-[#0F1420] p-2 rounded-xl border border-[#27324A]">
                    {subs.length === 0 ? (
                      <span className="text-[11px] text-gray-500 italic">কোনো সাব-ক্যাটাগরি নেই</span>
                    ) : (
                      subs.map(sub => (
                        <div
                          key={sub.id}
                          className="inline-flex items-center space-x-1 bg-[#1E293B] border border-[#334155] text-blue-200 text-[11px] font-medium px-2 py-0.5 rounded-lg group/sub"
                        >
                          <span>{sub.name}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubcategoryFromCard(cat, sub.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors ml-0.5"
                            title="সাব-ক্যাটাগরি রিমুভ করুন"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Quick Inline Add Input */}
                  <div className="flex items-center space-x-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="+ সাব-ক্যাটাগরির নাম লিখুন"
                      value={cardSubInput[cat.id] || ''}
                      onChange={e => setCardSubInput(prev => ({ ...prev, [cat.id]: e.target.value }))}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubcategoryToCard(cat);
                        }
                      }}
                      className="flex-1 px-2.5 py-1.5 bg-[#0F1420] border border-[#27324A] rounded-lg text-xs text-white outline-none focus:border-blue-500 placeholder-gray-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSubcategoryToCard(cat)}
                      className="px-2.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg transition-colors shrink-0"
                    >
                      যোগ করুন
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Category Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#181F30] border border-[#27324A] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-gray-100 my-8">
            <div className="flex items-center justify-between border-b border-[#27324A] pb-3">
              <h3 className="font-bold text-base text-white flex items-center space-x-2">
                <Layers className="w-5 h-5 text-blue-400" />
                <span>{editingCat ? 'ক্যাটাগরি ও সাব-ক্যাটাগরি এডিট' : 'নতুন ক্যাটাগরি তৈরি'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 mb-1">ক্যাটাগরি নাম (বাংলা) *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="যেমন: স্মার্টওয়াচ, এয়ারবাডস..."
                  className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1.5">ক্যাটাগরি ছবি / আইকন (Custom Image Upload)</label>
                
                {/* Image Preview Box */}
                {iconUrl ? (
                  <div className="relative w-20 h-20 mb-3 rounded-xl bg-[#0F1420] border border-[#27324A] overflow-hidden group shadow-md flex items-center justify-center p-1">
                    <img src={iconUrl} alt="Category Preview" className="w-full h-full object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setIconUrl('')}
                      className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-full hover:bg-red-700 transition-colors shadow-sm"
                      title="ছবি রিমুভ করুন"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#27324A] hover:bg-[#32405D] active:scale-98 text-white font-semibold rounded-xl cursor-pointer transition-all border border-dashed border-[#3B82F6]/50 text-xs shadow-sm">
                    <Upload className="w-4 h-4 text-blue-400" />
                    <span>কম্পিউটার/মোবাইল থেকে ছবি আপলোড করুন</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="text-center text-[11px] text-gray-400 font-medium">অথবা ছবির লিংক (URL) বসান:</div>

                  <input
                    type="text"
                    placeholder="https://example.com/category-image.png"
                    value={iconUrl}
                    onChange={e => setIconUrl(e.target.value)}
                    className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 mb-1">ডিসপ্লে ক্রম পজিশন</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={e => setDisplayOrder(e.target.value)}
                    className="w-full p-2.5 bg-[#0F1420] border border-[#27324A] rounded-xl text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="cat-visible"
                    checked={isVisible}
                    onChange={e => setIsVisible(e.target.checked)}
                    className="w-4 h-4 accent-[#3B82F6] cursor-pointer"
                  />
                  <label htmlFor="cat-visible" className="cursor-pointer font-semibold text-gray-300">
                    হোম পেজে দেখাবে (Visible)
                  </label>
                </div>
              </div>

              {/* Subcategories Management Section */}
              <div className="bg-[#0F1420] border border-[#27324A] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-200 flex items-center space-x-1.5">
                    <Tag className="w-4 h-4 text-blue-400" />
                    <span>সাব-ক্যাটাগরি সমূহ ({subcategories.length}টি)</span>
                  </label>
                  <span className="text-[10px] text-gray-400">যেমন: আল্ট্রা সিরিজ, TWS, ইত্যাদি</span>
                </div>

                {/* Subcategories list */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {subcategories.length === 0 ? (
                    <p className="text-gray-500 text-[11px] text-center py-2">কোনো সাব-ক্যাটাগরি যুক্ত করা হয়নি</p>
                  ) : (
                    subcategories.map((sub, idx) => (
                      <div key={sub.id} className="flex items-center space-x-2 bg-[#181F30] border border-[#27324A] p-2 rounded-xl">
                        <span className="text-gray-400 font-mono text-[10px] w-5 text-center">{idx + 1}.</span>
                        <input
                          type="text"
                          value={sub.name}
                          onChange={e => handleEditSubcategoryNameInModal(sub.id, e.target.value)}
                          className="flex-1 bg-[#0F1420] border border-[#27324A] rounded-lg px-2.5 py-1 text-white text-xs outline-none focus:border-blue-500"
                          placeholder="সাব-ক্যাটাগরি নাম"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSubcategoryInModal(sub.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add new subcategory input inside modal */}
                <div className="flex items-center space-x-2 pt-1 border-t border-[#27324A]">
                  <input
                    type="text"
                    placeholder="নতুন সাব-ক্যাটাগরির নাম লিখুন..."
                    value={newSubName}
                    onChange={e => setNewSubName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubcategoryInModal();
                      }
                    }}
                    className="flex-1 p-2 bg-[#181F30] border border-[#27324A] rounded-xl text-white outline-none focus:border-blue-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubcategoryInModal}
                    className="px-3 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl text-xs flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>যোগ করুন</span>
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-[#27324A]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-[#0F1420] text-gray-300 hover:text-white font-bold rounded-xl transition-colors"
                >
                  ক্যান্সেল
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl transition-colors shadow-md"
                >
                  {isSaving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
