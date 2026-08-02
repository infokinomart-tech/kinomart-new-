import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, User, Menu, X, ChevronDown, ChevronRight, Phone } from 'lucide-react';
import { KinoMartLogo } from './KinoMartLogo';

export const Header: React.FC = () => {
  const {
    settings,
    categories,
    activeClientPage,
    setActiveClientPage,
    setSelectedCategory,
    selectedProduct,
    setSelectedProduct,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setIsAdminModalOpen,
    customerUser,
    setIsCustomerLoginModalOpen
  } = useStore();


  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(null);
  const [expandedMobileCatId, setExpandedMobileCatId] = useState<string | null>(null);

  const handleCategoryClick = (catName: string) => {
    if (selectedCategory === catName) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(catName);
    }
    setSelectedProduct(null);
    setActiveClientPage('products');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileCat = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMobileCatId(prev => prev === catId ? null : catId);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5] border-b border-[#E8E3D9] shadow-xs">
      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <div
          onClick={() => {
            setSelectedProduct(null);
            setActiveClientPage('home');
            setSelectedCategory(null);
            setSearchQuery('');
          }}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0"
        >
          <KinoMartLogo className="w-9 h-9 sm:w-10 sm:h-10 transition-transform group-hover:scale-105" />
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-[#1F241E] tracking-tight leading-none">
              {settings.websiteTitle || 'KinoMart'}
            </h1>
            <p className="text-[10px] sm:text-xs text-[#6B7264] font-semibold mt-0.5 leading-none hidden sm:block">
              সেরা গ্যাজেট ও প্রিমিয়াম ইলেকট্রনিক্স
            </p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-bold text-[#1F241E]">
          <button
            onClick={() => {
              setSelectedProduct(null);
              setActiveClientPage('home');
              setSelectedCategory(null);
            }}
            className={`transition-colors py-1 cursor-pointer ${
              activeClientPage === 'home' && !selectedCategory && !selectedProduct
                ? 'text-[#5E6A45] font-extrabold border-b-2 border-[#5E6A45]'
                : 'hover:text-[#5E6A45]'
            }`}
          >
            হোম
          </button>
          <button
            onClick={() => {
              setSelectedProduct(null);
              setActiveClientPage('products');
              setSelectedCategory(null);
            }}
            className={`transition-colors py-1 cursor-pointer ${
              activeClientPage === 'products'
                ? 'text-[#5E6A45] font-extrabold border-b-2 border-[#5E6A45]'
                : 'hover:text-[#5E6A45]'
            }`}
          >
            সকল প্রোডাক্ট
          </button>
          <button
            onClick={() => {
              setSelectedProduct(null);
              setActiveClientPage('contact');
            }}
            className={`transition-colors py-1 cursor-pointer ${
              activeClientPage === 'contact'
                ? 'text-[#5E6A45] font-extrabold border-b-2 border-[#5E6A45]'
                : 'hover:text-[#5E6A45]'
            }`}
          >
            যোগাযোগ
          </button>
          <button
            onClick={() => {
              setSelectedProduct(null);
              setActiveClientPage('about');
            }}
            className={`transition-colors py-1 cursor-pointer ${
              activeClientPage === 'about'
                ? 'text-[#5E6A45] font-extrabold border-b-2 border-[#5E6A45]'
                : 'hover:text-[#5E6A45]'
            }`}
          >
            আমাদের সম্পর্কে
          </button>
        </nav>

        {/* Search Bar & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Search Pill Bar with Search Icon on Left */}
          <div className="relative hidden md:block w-48 lg:w-60">
            <Search className="w-4 h-4 text-[#6B7264] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim() !== '') setActiveClientPage('products');
              }}
              placeholder="প্রোডাক্ট খুঁজুন..."
              className="w-full bg-white border border-[#D5CEBF] text-[#222] placeholder-[#888] text-xs rounded-full py-2 pl-9 pr-4 focus:outline-none focus:border-[#5E6A45] focus:ring-1 focus:ring-[#5E6A45] shadow-2xs"
            />
          </div>

          {/* Desktop "আমার অ্যাকাউন্ট" Button */}
          <button
            onClick={() => {
              if (customerUser) {
                setActiveClientPage('customer-profile');
              } else {
                setIsCustomerLoginModalOpen(true);
              }
            }}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-[#D5CEBF] bg-white hover:bg-[#F2EFE8] text-xs font-bold text-[#1F241E] transition-all shadow-2xs cursor-pointer"
          >
            <User className="w-4 h-4 text-[#5E6A45]" />
            <span>{customerUser ? customerUser.name : 'আমার অ্যাকাউন্ট'}</span>
          </button>

          {/* Mobile Search Icon */}
          <button
            onClick={() => {
              setActiveClientPage('products');
            }}
            className="md:hidden p-2 text-[#2E3B2B] hover:bg-[#EFECE6] rounded-full cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Mobile User Icon */}
          <button
            onClick={() => {
              if (customerUser) {
                setActiveClientPage('customer-profile');
              } else {
                setIsCustomerLoginModalOpen(true);
              }
            }}
            className="sm:hidden w-8 h-8 rounded-full border border-[#D5CEBF] bg-white flex items-center justify-center text-[#5E6A45] cursor-pointer"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-[#2E3B2B] hover:bg-[#EFECE6] rounded-lg cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Categories Sub-Navbar (Dark Black / Deep Forest Green) - Hidden on Mobile, Visible on Desktop */}
      <div className="hidden lg:block bg-[#09100C] text-white border-t border-[#18231B]">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs sm:text-sm font-bold gap-4 sm:gap-6 whitespace-nowrap">
          {categories.map((cat) => {
            const isCategorySelected = selectedCategory === cat.name;
            const isSubSelected = cat.subCategories?.includes(selectedCategory || '');
            const hasSubs = cat.subCategories && cat.subCategories.length > 0;

            return (
              <div
                key={cat.id}
                className="relative group cursor-pointer py-2.5"
                onMouseEnter={() => setActiveSubDropdown(cat.id)}
                onMouseLeave={() => setActiveSubDropdown(null)}
                onClick={() => handleCategoryClick(cat.name)}
              >
                <div className="flex items-center gap-1.5 hover:text-[#93D142] transition-colors">
                  <span className={isCategorySelected || isSubSelected ? 'text-[#93D142] font-black' : 'text-white'}>
                    {cat.name}
                  </span>
                  {hasSubs && (
                    <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#93D142] group-hover:rotate-180 transition-transform duration-200" />
                  )}
                </div>

                {/* Dropdown Menu on Hover */}
                {hasSubs && (
                  <div
                    className={`absolute top-full left-0 pt-1 w-56 z-50 transition-all duration-150 ${
                      activeSubDropdown === cat.id
                        ? 'block opacity-100 pointer-events-auto'
                        : 'hidden group-hover:block group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
                    }`}
                  >
                    <div className="bg-[#09100C] border border-[#1E2922] rounded-b-2xl shadow-2xl py-1.5 overflow-hidden">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategory(cat.name);
                          setSelectedProduct(null);
                          setActiveClientPage('products');
                          setActiveSubDropdown(null);
                        }}
                        className="px-4 py-2.5 text-xs font-extrabold text-[#93D142] hover:bg-[#15231A] transition-colors border-b border-[#1E2922]/70 flex items-center justify-between cursor-pointer"
                      >
                        <span>সকল {cat.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#93D142]" />
                      </div>

                      {cat.subCategories.map((sub, idx) => (
                        <div
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(sub);
                            setSelectedProduct(null);
                            setActiveClientPage('products');
                            setActiveSubDropdown(null);
                          }}
                          className={`px-4 py-2.5 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                            selectedCategory === sub
                              ? 'bg-[#5E7A3B] text-white font-black'
                              : 'text-[#CBD5E1] hover:bg-[#15231A] hover:text-white font-semibold'
                          }`}
                        >
                          <span>{sub}</span>
                          {selectedCategory === sub && <span className="w-2 h-2 rounded-full bg-[#93D142]" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Side Drawer Menu (Exactly matching requested screenshot) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 left-0 bottom-0 w-[84%] max-w-[320px] bg-white h-full shadow-2xl flex flex-col z-50 animate-slideRight overflow-y-auto p-4 space-y-4">
            {/* Top Bar: Brand + Close Icon */}
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                {settings.websiteTitle || 'KinoMart'}
              </h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Hello User Orange Card */}
            <div className="bg-gradient-to-r from-[#FF8800] to-[#FF6D00] rounded-2xl p-4 text-white shadow-md flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center shrink-0 border border-white/30">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-base leading-tight">হ্যালো!</h3>
                <p className="text-xs text-white/95 font-medium mt-0.5">
                  {settings.phone || '01234567890'}
                </p>
              </div>
            </div>

            {/* Mobile Drawer Search Bar */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#6B7264] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (val.trim().toLowerCase() === 'admin') {
                    setIsAdminModalOpen(true);
                    setSearchQuery('');
                    setIsMobileMenuOpen(false);
                  } else if (val.trim() !== '') {
                    setActiveClientPage('products');
                  }
                }}
                placeholder="প্রোডাক্ট খুঁজুন বা লিঙ্ক লিখুন..."
                className="w-full bg-[#FAF8F5] border border-[#D5CEBF] text-[#1F241E] placeholder-[#888] text-xs rounded-xl py-2.5 pl-9 pr-4 focus:outline-none focus:border-[#5E7A3B]"
              />
            </div>

            {/* Categories List Box with Subcategories Accordion */}
            <div className="space-y-1">
              <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider px-1">
                ক্যাটাগরি সমূহ
              </h3>
              <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl overflow-hidden divide-y divide-gray-200/60 shadow-2xs">
                {categories.map((cat) => {
                  const hasSubs = cat.subCategories && cat.subCategories.length > 0;
                  const isExpanded = expandedMobileCatId === cat.id;
                  const isCatSelected = selectedCategory === cat.name;
                  const isSubSelected = cat.subCategories?.includes(selectedCategory || '');

                  return (
                    <div key={cat.id} className="divide-y divide-gray-100">
                      <div
                        className={`flex items-center justify-between px-4 py-3 text-xs sm:text-sm font-bold transition-colors ${
                          isCatSelected || isSubSelected ? 'bg-[#F0F5EA] text-[#3D5226]' : 'text-gray-800 hover:bg-gray-100/80'
                        }`}
                      >
                        <span
                          onClick={() => handleCategoryClick(cat.name)}
                          className="flex-1 cursor-pointer hover:underline"
                        >
                          {cat.name}
                        </span>

                        {hasSubs ? (
                          <button
                            onClick={(e) => toggleMobileCat(cat.id, e)}
                            className="p-1 text-gray-500 hover:text-black hover:bg-gray-200/60 rounded-md transition-colors cursor-pointer"
                            title="সাব-ক্যাটাগরি দেখুন"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#5E7A3B]' : ''}`} />
                          </button>
                        ) : (
                          <ChevronRight
                            onClick={() => handleCategoryClick(cat.name)}
                            className="w-4 h-4 text-gray-400 cursor-pointer"
                          />
                        )}
                      </div>

                      {/* Expanded Subcategories */}
                      {hasSubs && isExpanded && (
                        <div className="bg-[#FAF8F5] px-3 py-2 space-y-1 border-t border-gray-200/60">
                          <div
                            onClick={() => {
                              setSelectedCategory(cat.name);
                              setSelectedProduct(null);
                              setActiveClientPage('products');
                              setIsMobileMenuOpen(false);
                            }}
                            className={`py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                              selectedCategory === cat.name
                                ? 'bg-[#5E7A3B] text-white shadow-xs'
                                : 'text-[#5E7A3B] hover:bg-gray-200/60'
                            }`}
                          >
                            <span>সকল {cat.name}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>

                          {cat.subCategories.map((sub, idx) => {
                            const isThisSubSelected = selectedCategory === sub;
                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  setSelectedCategory(sub);
                                  setSelectedProduct(null);
                                  setActiveClientPage('products');
                                  setIsMobileMenuOpen(false);
                                }}
                                className={`py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                                  isThisSubSelected
                                    ? 'bg-[#5E7A3B] text-white font-extrabold shadow-xs'
                                    : 'text-gray-700 hover:bg-gray-200/60 hover:text-gray-900'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400/80" />
                                  {sub}
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="pt-1 space-y-2">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">Quick Links</h3>
                <div className="w-8 h-0.5 bg-[#FF6D00] mt-0.5 rounded-full"></div>
              </div>

              <div className="bg-[#F8F9FA] border border-gray-200/80 rounded-2xl overflow-hidden divide-y divide-gray-200/60 shadow-2xs">
                <div
                  onClick={() => {
                    setSelectedProduct(null);
                    if (customerUser) {
                      setActiveClientPage('customer-profile');
                    } else {
                      setIsCustomerLoginModalOpen(true);
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm font-bold text-[#5E7A3B] hover:bg-gray-100/80 cursor-pointer active:bg-gray-200/50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#5E7A3B]" />
                    <span>{customerUser ? customerUser.name : 'আমার অ্যাকাউন্ট / অর্ডার'}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#5E7A3B]" />
                </div>

                <div
                  onClick={() => {
                    setSelectedProduct(null);
                    setActiveClientPage('home');
                    setSelectedCategory(null);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm font-bold text-gray-800 hover:bg-gray-100/80 cursor-pointer active:bg-gray-200/50 transition-colors"
                >
                  <span>হোম</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>

                <div
                  onClick={() => {
                    setSelectedProduct(null);
                    setActiveClientPage('products');
                    setSelectedCategory(null);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm font-bold text-gray-800 hover:bg-gray-100/80 cursor-pointer active:bg-gray-200/50 transition-colors"
                >
                  <span>সকল প্রোডাক্ট</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>

                <div
                  onClick={() => {
                    setSelectedProduct(null);
                    setActiveClientPage('contact');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm font-bold text-gray-800 hover:bg-gray-100/80 cursor-pointer active:bg-gray-200/50 transition-colors"
                >
                  <span>যোগাযোগ</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>

                <div
                  onClick={() => {
                    setSelectedProduct(null);
                    setActiveClientPage('about');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm font-bold text-gray-800 hover:bg-gray-100/80 cursor-pointer active:bg-gray-200/50 transition-colors"
                >
                  <span>আমাদের সম্পর্কে</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>

                <div
                  onClick={() => {
                    window.location.href = `tel:${settings.phone || '01700000000'}`;
                  }}
                  className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm font-bold text-gray-800 hover:bg-gray-100/80 cursor-pointer active:bg-gray-200/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#FF6D00]" />
                    <span>হটলাইন: {settings.phone || '01700000000'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

