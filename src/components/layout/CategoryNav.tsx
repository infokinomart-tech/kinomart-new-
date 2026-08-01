import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Sparkles, MoreHorizontal, Grid, X, Check } from 'lucide-react';
import { api } from '../../services/api';
import { Category } from '../../types';

const fallbackCategories = [
  { id: 'cat-1', name: 'স্মার্টওয়াচ' },
  { id: 'cat-2', name: 'এয়ারবাডস ও হেডফোন' },
  { id: 'cat-3', name: 'চার্জার ও পাওয়ার ব্যাংক' },
  { id: 'cat-4', name: 'স্পিকার ও সাউন্ড' },
  { id: 'cat-5', name: 'ফিটনেস ও হেলথ গ্যাজেট' },
  { id: 'cat-6', name: 'মোবাইল এক্সেসরিজ' },
  { id: 'cat-7', name: 'স্মার্ট হোম ও লাইফস্টাইল' }
];

export const CategoryNav: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    api.getCategories()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setCategories(data);
        } else if (isMounted) {
          setCategories(fallbackCategories as Category[]);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCategories(fallbackCategories as Category[]);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Close mobile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayList = categories.length > 0 ? categories : (fallbackCategories as Category[]);
  const queryParams = new URLSearchParams(location.search);
  const selectedCatId = queryParams.get('category');

  const handleCategoryClick = (catId: string) => {
    navigate(`/products?category=${catId}`);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const handleSubCategoryClick = (catId: string, subId: string) => {
    navigate(`/products?category=${catId}&subcategory=${subId}`);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  // Visible items on mobile bar
  const visibleMobileCats = displayList.slice(0, 3);
  const remainingMobileCats = displayList.slice(3);

  return (
    <div className="hidden md:block bg-[#061812] text-white border-t border-[#122E23] shadow-md relative z-30" id="category-nav-bar">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* DESKTOP VIEW (md and up): Full horizontal bar */}
        <div className="flex items-center justify-center py-2.5 space-x-6 md:space-x-8 text-xs sm:text-sm font-medium select-none">
          {displayList.map((cat) => {
            const isSelected = selectedCatId === cat.id;

            return (
              <div
                key={cat.id}
                className="relative group shrink-0"
                onMouseEnter={() => setActiveDropdown(cat.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex items-center space-x-1 py-1 px-2 rounded-lg transition-all duration-200 ${
                    isSelected
                      ? 'text-amber-300 font-bold bg-white/10'
                      : 'text-white/95 hover:text-amber-300 hover:bg-white/5'
                  }`}
                >
                  <span className="whitespace-nowrap">{cat.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/70 group-hover:text-amber-300 transition-transform duration-200 group-hover:rotate-180 ml-0.5" />
                </button>

                {/* Sub-menu / Quick Dropdown on hover */}
                {activeDropdown === cat.id && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 min-w-[200px] w-auto bg-[#0B241C] border border-[#183E31] rounded-xl shadow-2xl p-2 z-50 animate-fadeIn">
                    <button
                      onClick={() => handleCategoryClick(cat.id)}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-amber-300 hover:bg-white/10 rounded-lg flex items-center justify-between transition-colors whitespace-nowrap"
                    >
                      <span>সকল {cat.name}</span>
                      <Sparkles className="w-3 h-3 text-amber-300 ml-2 shrink-0" />
                    </button>
                    <div className="h-px bg-white/10 my-1" />

                    {Array.isArray(cat.subcategories) && cat.subcategories.length > 0 ? (
                      cat.subcategories.map(s => (
                        <button
                          key={s.id}
                          onClick={() => handleSubCategoryClick(cat.id, s.id)}
                          className="w-full text-left px-3 py-1.5 text-xs text-white/90 hover:text-amber-200 hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap"
                        >
                          {s.name}
                        </button>
                      ))
                    ) : (
                      <>
                        <button
                          onClick={() => handleCategoryClick(cat.id)}
                          className="w-full text-left px-3 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap"
                        >
                          পপুলার আইটেম
                        </button>
                        <button
                          onClick={() => handleCategoryClick(cat.id)}
                          className="w-full text-left px-3 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap"
                        >
                          অফার প্রোডাক্ট
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

