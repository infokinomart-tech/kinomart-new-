import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroSlider } from './components/HeroSlider';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { QuickOrderModal } from './components/QuickOrderModal';
import { OrderSuccessView } from './components/OrderSuccessView';
import { OrderTrackView } from './components/OrderTrackView';
import { ContactView } from './components/ContactView';
import { AboutView } from './components/AboutView';
import { CustomerProfileView } from './components/CustomerProfileView';
import { CustomerLoginModal } from './components/CustomerLoginModal';
import { PromoBanner } from './components/PromoBanner';
import { BenefitsGrid } from './components/BenefitsGrid';
import { FloatingContacts } from './components/FloatingContacts';
import { Footer } from './components/Footer';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { trackPageView } from './lib/dataLayer';
import { Filter, ShoppingBag, Phone, Mail, MapPin, Sparkles, Flame, ArrowRight } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedProduct,
    setSelectedProduct,
    quickOrderProduct,
    setQuickOrderProduct,
    activeClientPage,
    setActiveClientPage,
    viewMode,
    setViewMode,
    isAdminAuthenticated,
    isAdminModalOpen,
    setIsAdminModalOpen,
    isCustomerLoginModalOpen,
    setIsCustomerLoginModalOpen,
    settings
  } = useStore();

  React.useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.includes('/admin') || hash.includes('admin')) {
        setViewMode('admin');
      } else {
        setViewMode('client');
        if (path.startsWith('/product/')) {
          const prodId = decodeURIComponent(path.replace('/product/', '')).trim();
          const found = products.find(p => p.id === prodId || p.name.toLowerCase() === prodId.toLowerCase());
          if (found) {
            setSelectedProduct(found);
            setActiveClientPage('product-detail');
          } else if (products.length > 0) {
            setActiveClientPage('home');
          }
        } else if (path === '/products') {
          setActiveClientPage('products');
        } else if (path === '/about') {
          setActiveClientPage('about');
        } else if (path === '/contact') {
          setActiveClientPage('contact');
        } else if (path === '/order-track') {
          setActiveClientPage('order-track');
        } else if (path === '/order-success') {
          setActiveClientPage('order-success');
        } else if (path === '/customer-profile') {
          setActiveClientPage('customer-profile');
        } else if (path === '/' || path === '') {
          setActiveClientPage('home');
        }
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [products, setViewMode, setSelectedProduct, setActiveClientPage]);

  // Push state to browser address bar when active view changes
  React.useEffect(() => {
    let targetPath = '/';
    if (viewMode === 'admin') {
      targetPath = '/admin';
    } else if (activeClientPage === 'product-detail' && selectedProduct) {
      targetPath = `/product/${selectedProduct.id}`;
    } else if (activeClientPage === 'products') {
      targetPath = '/products';
    } else if (activeClientPage === 'about') {
      targetPath = '/about';
    } else if (activeClientPage === 'contact') {
      targetPath = '/contact';
    } else if (activeClientPage === 'order-track') {
      targetPath = '/order-track';
    } else if (activeClientPage === 'order-success') {
      targetPath = '/order-success';
    } else if (activeClientPage === 'customer-profile') {
      targetPath = '/customer-profile';
    } else {
      targetPath = '/';
    }

    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }

    // Trigger GA4 page_view event
    trackPageView(document.title, window.location.href, targetPath);
  }, [viewMode, activeClientPage, selectedProduct]);

  // Trigger Admin Login when user searches "admin"
  React.useEffect(() => {
    if (searchQuery.trim().toLowerCase() === 'admin') {
      setViewMode('admin');
      if (!window.location.pathname.includes('/admin')) {
        window.history.pushState({}, '', '/admin');
      }
      setSearchQuery('');
    }
  }, [searchQuery, setViewMode, setSearchQuery]);

  // Dynamically update site title & browser favicon when settings change
  React.useEffect(() => {
    if (settings.websiteTitle) {
      document.title = settings.websiteTitle;
    }

    if (settings.faviconUrl) {
      let iconLink: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.type = 'image/x-icon';
        iconLink.rel = 'shortcut icon';
        document.head.appendChild(iconLink);
      }
      iconLink.href = settings.faviconUrl;

      let appleIconLink: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
      if (!appleIconLink) {
        appleIconLink = document.createElement('link');
        appleIconLink.rel = 'apple-touch-icon';
        document.head.appendChild(appleIconLink);
      }
      appleIconLink.href = settings.faviconUrl;
    }
  }, [settings.faviconUrl, settings.websiteTitle]);

  // Find parent category object if selectedCategory is set (either as category name or subcategory name)
  const activeParentCategory = categories.find((c) => {
    const catName = c.name.trim().toLowerCase();
    const selCat = (selectedCategory || '').trim().toLowerCase();
    if (catName === selCat) return true;
    return c.subCategories?.some((s) => s.trim().toLowerCase() === selCat);
  });

  // Filter products by category & search query
  const displayedProducts = products.filter((product) => {
    const selCat = (selectedCategory || '').trim().toLowerCase();
    const pCat = (product.category || '').trim().toLowerCase();
    const pSubCat = (product.subCategory || '').trim().toLowerCase();

    const matchesCategory =
      !selectedCategory ||
      pCat === selCat ||
      pSubCat === selCat;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      product.name.toLowerCase().includes(q) ||
      pCat.includes(q) ||
      pSubCat.includes(q);

    return matchesCategory && matchesSearch;
  });

  // If in Admin Mode
  if (viewMode === 'admin') {
    if (isAdminAuthenticated) {
      return <AdminLayout />;
    }
    return (
      <div className="min-h-screen bg-[#070C18] text-white flex flex-col items-center justify-center p-4">
        <AdminLoginModal
          onClose={() => {
            setIsAdminModalOpen(false);
            setViewMode('client');
            if (window.location.pathname.includes('/admin')) {
              window.history.pushState({}, '', '/');
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1F241E] flex flex-col font-sans selection:bg-[#5E7A3B] selection:text-white">

      {/* Main Header */}
      <Header />

      {/* Main Page Routing Switcher */}
      <main className="flex-1">
        {/* HOME PAGE */}
        {activeClientPage === 'home' && (
          <div className="animate-fadeIn">
            {/* Hero Banner Slider */}
            <HeroSlider />





            {/* Product Section Header */}
            <div className="max-w-7xl mx-auto px-4 my-4">
              <div className="flex flex-wrap items-end justify-between border-b border-[#E8E3D9] pb-2.5 gap-2">
                <div>
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#A85D32] mb-0.5">
                    <Flame className="w-3.5 h-3.5 text-[#E65100] fill-[#FF9800]" />
                    <span>জনপ্রিয় পণ্যসমূহ</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-[#1F241E]">
                    {selectedCategory ? `${selectedCategory} গ্যাজেট` : 'বেস্ট সেলিং গ্যাজেট'}
                  </h2>
                </div>

                {selectedCategory ? (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs sm:text-sm font-bold text-[#5E7A3B] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    ✕ ফিল্টার রিমুভ করুন
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const el = document.getElementById('product-grid');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs sm:text-sm font-bold text-[#3B4D28] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>সব দেখুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Subcategories Pills (When category is selected) */}
              {activeParentCategory && activeParentCategory.subCategories && activeParentCategory.subCategories.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none">
                  <span className="text-xs font-extrabold text-[#5E7A3B] shrink-0">সাব-ক্যাটাগরি:</span>
                  <button
                    onClick={() => setSelectedCategory(activeParentCategory.name)}
                    className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                      selectedCategory === activeParentCategory.name
                        ? 'bg-[#5E7A3B] text-white shadow-2xs'
                        : 'bg-[#FAF8F5] text-[#2E3B2B] border border-[#E8E3D9] hover:bg-[#EFECE6]'
                    }`}
                  >
                    সকল {activeParentCategory.name}
                  </button>

                  {activeParentCategory.subCategories.map((sub, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCategory(sub)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        selectedCategory === sub
                          ? 'bg-[#5E7A3B] text-white font-extrabold shadow-2xs'
                          : 'bg-white text-[#4A5343] border border-[#E8E3D9] hover:bg-[#F2EFE8]'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}

              {/* Product Cards Grid */}
              <div id="product-grid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mt-6">
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {displayedProducts.length === 0 && (
                <div className="text-center py-12 bg-white rounded-3xl border border-[#E8E3D9] my-6">
                  <p className="text-gray-500 text-sm">
                    দুঃখিত! এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।
                  </p>
                </div>
              )}
            </div>

            {/* Promotional Banner */}
            <PromoBanner />

            {/* Benefits & Trust Badges Grid */}
            <BenefitsGrid />
          </div>
        )}

        {/* PRODUCT DETAIL PAGE */}
        {activeClientPage === 'product-detail' && (selectedProduct || displayedProducts[0]) && (
          <ProductDetailsModal
            key={(selectedProduct || displayedProducts[0]).id}
            product={selectedProduct || displayedProducts[0]}
          />
        )}

        {/* PRODUCTS PAGE */}
        {activeClientPage === 'products' && (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
            <div className="border-b border-[#E8E3D9] pb-4 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-black text-[#1F241E]">
                    {selectedCategory ? `${selectedCategory} গ্যাজেট` : 'সব প্রোডাক্টস'}
                  </h1>
                  <p className="text-xs text-[#6B7264]">সকল অরিজিনাল ও গ্যাজেট ক্যাটাগরি</p>
                </div>

                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs sm:text-sm font-bold text-[#5E7A3B] hover:underline cursor-pointer"
                  >
                    ✕ ফিল্টার রিমুভ করুন
                  </button>
                )}
              </div>

              {/* All Categories Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                    !selectedCategory
                      ? 'bg-[#1F241E] text-white shadow-2xs'
                      : 'bg-[#FAF8F5] text-[#2E3B2B] border border-[#E8E3D9] hover:bg-[#EFECE6]'
                  }`}
                >
                  সব গ্যাজেট
                </button>

                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.name || cat.subCategories?.includes(selectedCategory || '');
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-[#5E7A3B] text-white shadow-2xs'
                          : 'bg-white text-[#2E3B2B] border border-[#E8E3D9] hover:bg-[#F2EFE8]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Subcategories Pills */}
              {activeParentCategory && activeParentCategory.subCategories && activeParentCategory.subCategories.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none bg-[#F8F7F2] p-2.5 rounded-2xl border border-[#E8E3D9]">
                  <span className="text-[11px] font-extrabold text-[#5E7A3B] shrink-0">সাব-ক্যাটাগরি:</span>
                  <button
                    onClick={() => setSelectedCategory(activeParentCategory.name)}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                      selectedCategory === activeParentCategory.name
                        ? 'bg-[#5E7A3B] text-white shadow-2xs'
                        : 'bg-white text-[#2E3B2B] border border-[#E8E3D9] hover:bg-[#EFECE6]'
                    }`}
                  >
                    সকল {activeParentCategory.name}
                  </button>

                  {activeParentCategory.subCategories.map((sub, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCategory(sub)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        selectedCategory === sub
                          ? 'bg-[#5E7A3B] text-white font-extrabold shadow-2xs'
                          : 'bg-white text-[#4A5343] border border-[#E8E3D9] hover:bg-[#F2EFE8]'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {displayedProducts.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl border border-[#E8E3D9] my-6">
                <p className="text-gray-500 text-sm">
                  দুঃখিত! এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।
                </p>
              </div>
            )}
          </div>
        )}

        {/* ORDER SUCCESS PAGE */}
        {activeClientPage === 'order-success' && <OrderSuccessView />}

        {/* ORDER TRACK PAGE */}
        {activeClientPage === 'order-track' && <OrderTrackView />}

        {/* CUSTOMER PROFILE PAGE */}
        {activeClientPage === 'customer-profile' && <CustomerProfileView />}

        {/* ABOUT US PAGE */}
        {activeClientPage === 'about' && <AboutView />}

        {/* CONTACT US PAGE */}
        {activeClientPage === 'contact' && <ContactView />}
      </main>

      {/* Main Footer */}
      <Footer />

      {/* Floating WhatsApp & Call Buttons */}
      <FloatingContacts />

      {/* Customer Login Modal */}
      {isCustomerLoginModalOpen && (
        <CustomerLoginModal onClose={() => setIsCustomerLoginModalOpen(false)} />
      )}

      {/* Quick Order Modal */}
      {quickOrderProduct && (
        <QuickOrderModal
          product={quickOrderProduct}
          onClose={() => setQuickOrderProduct(null)}
        />
      )}

      {/* Admin Login Modal */}
      {isAdminModalOpen && (
        <AdminLoginModal
          onClose={() => {
            setIsAdminModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
};

export default App;
