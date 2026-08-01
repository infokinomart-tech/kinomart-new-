import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { Product, Category } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/products/ProductCard';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategoryParam = searchParams.get('category') || 'all';
  const selectedSubCategoryParam = searchParams.get('subcategory') || 'all';
  const searchQueryParam = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(selectedCategoryParam);
  const [selectedSubCategory, setSelectedSubCategory] = useState(selectedSubCategoryParam);
  const [searchQuery, setSearchQuery] = useState(searchQueryParam);
  const [sortBy, setSortBy] = useState('newest');
  const [priceFilter, setPriceFilter] = useState<number>(5000);

  useEffect(() => {
    setSelectedCategory(selectedCategoryParam);
    setSelectedSubCategory(selectedSubCategoryParam);
    setSearchQuery(searchQueryParam);
  }, [selectedCategoryParam, selectedSubCategoryParam, searchQueryParam]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [cats, prods] = await Promise.all([
          api.getCategories(),
          api.getProducts({
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            search: searchQuery || undefined,
            sort: sortBy
          })
        ]);
        setCategories(cats);

        // Apply subcategory & price filter on client
        let filtered = prods.filter(p => {
          const effectivePrice = Number(p.discount_price || p.price || 0);
          return effectivePrice <= priceFilter;
        });
        if (selectedSubCategory !== 'all') {
          filtered = filtered.filter(p => p.subcategory_id === selectedSubCategory);
        }
        setProducts(filtered);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedCategory, selectedSubCategory, searchQuery, sortBy, priceFilter]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubCategory('all');
    if (catId === 'all') {
      searchParams.delete('category');
      searchParams.delete('subcategory');
    } else {
      searchParams.set('category', catId);
      searchParams.delete('subcategory');
    }
    setSearchParams(searchParams);
  };

  const handleSubCategoryChange = (subId: string) => {
    setSelectedSubCategory(subId);
    if (subId === 'all') {
      searchParams.delete('subcategory');
    } else {
      searchParams.set('subcategory', subId);
    }
    setSearchParams(searchParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      searchParams.set('search', searchQuery);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('newest');
    setPriceFilter(5000);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E3DA] shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
            সকল গ্যাজেট প্রোডাক্ট
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6B6B] mt-1">
            মোট {products.length} টি মানসম্মত গ্যাজেট পাওয়া গেছে
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="প্রোডাক্ট নাম দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#E5E3DA] focus:border-[#6B7A4F] focus:ring-1 focus:ring-[#6B7A4F] outline-none"
          />
          <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-3.5" />
        </form>
      </div>

      {/* Filter Bar & Categories Pills */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 border ${
              selectedCategory === 'all'
                ? 'bg-[#6B7A4F] text-white border-[#6B7A4F]'
                : 'bg-white text-[#1A1A1A] border-[#E5E3DA] hover:border-[#6B7A4F]'
            }`}
          >
            সব গ্যাজেট ({products.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 border ${
                selectedCategory === cat.id
                  ? 'bg-[#6B7A4F] text-white border-[#6B7A4F]'
                  : 'bg-white text-[#1A1A1A] border-[#E5E3DA] hover:border-[#6B7A4F]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Subcategory Pills Row (if category is selected & has subcategories) */}
        {selectedCategory !== 'all' && (categories.find(c => c.id === selectedCategory)?.subcategories?.length || 0) > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 pl-1 scrollbar-none text-xs bg-[#F7F5EF] p-2.5 rounded-xl border border-[#E5E3DA]">
            <span className="font-bold text-[#6B7A4F] text-[11px] shrink-0 mr-1">সাব-ক্যাটাগরি:</span>
            <button
              onClick={() => handleSubCategoryChange('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap shrink-0 border text-[11px] ${
                selectedSubCategory === 'all'
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-white text-[#4A4A4A] border-[#E5E3DA] hover:border-[#6B7A4F]'
              }`}
            >
              সকল সাব-আইটেম
            </button>
            {categories.find(c => c.id === selectedCategory)?.subcategories?.map(sub => (
              <button
                key={sub.id}
                onClick={() => handleSubCategoryChange(sub.id)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap shrink-0 border text-[11px] ${
                  selectedSubCategory === sub.id
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-white text-[#4A4A4A] border-[#E5E3DA] hover:border-[#6B7A4F]'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* Sorting & Price Range Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E5E3DA] text-xs">
          {/* Price Range Slider */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-[#6B7A4F]" />
            <span className="font-semibold text-[#1A1A1A]">সর্বোচ্চ দাম:</span>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={priceFilter}
              onChange={(e) => setPriceFilter(Number(e.target.value))}
              className="accent-[#6B7A4F] cursor-pointer"
            />
            <span className="font-bold text-[#6B7A4F]">৳{priceFilter.toLocaleString('bn-BD')}</span>
          </div>

          {/* Sort Dropdown & Clear */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-4 h-4 text-[#6B6B6B]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#F7F5EF] border border-[#E5E3DA] rounded-lg px-3 py-1.5 font-medium text-[#1A1A1A] focus:outline-none"
              >
                <option value="newest">নতুন আপলোড অনুযায়ী</option>
                <option value="price-low">কম দাম থেকে বেশি</option>
                <option value="price-high">বেশি দাম থেকে কম</option>
                <option value="rating">সেরা রেটিং</option>
              </select>
            </div>

            {(selectedCategory !== 'all' || searchQuery || priceFilter < 5000) && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-1 text-red-600 font-bold hover:underline"
              >
                <X className="w-3.5 h-3.5" />
                <span>রিসেট ফিল্টার</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E3DA] p-12 text-center space-y-3">
          <h3 className="font-bold text-lg text-[#1A1A1A]">কোনো গ্যাজেট পাওয়া যায়নি</h3>
          <p className="text-xs text-[#6B6B6B]">আপনার ফিল্টার পরিবর্তন করে বা সার্চ টার্ম পরিবর্তন করে চেষ্টা করুন</p>
          <button
            onClick={clearFilters}
            className="px-6 py-2.5 rounded-xl bg-[#6B7A4F] text-white font-bold text-xs"
          >
            সব গ্যাজেট দেখুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
