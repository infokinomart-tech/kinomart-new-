import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, User, Phone, Grid, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CategoryNav } from './CategoryNav';
import { KinoMartLogo } from '../common/KinoMartLogo';
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

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const { customerPhone, isAdminLoggedIn, settings } = useAuth();
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

  // Handle scroll effect for sticky navbar shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const navLinks = [
    { name: 'হোম', path: '/' },
    { name: 'সকল প্রোডাক্ট', path: '/products' },
    { name: 'যোগাযোগ', path: '/contact' },
    { name: 'আমাদের সম্পর্কে', path: '/about' }
  ];

  return (
    <>
      <header
      id="main-navbar"
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#F7F5EF]/95 backdrop-blur-md shadow-lg shadow-black/15 border-b border-[#D8D5C8]'
          : 'bg-transparent backdrop-blur-md border-b border-[#E5E3DA]/40'
      }`}
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group" id="nav-brand-logo">
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.logo_title || 'Logo'}
                className="h-10 md:h-12 w-auto max-w-[160px] object-contain group-hover:scale-105 transition-transform"
              />
            ) : (
              <KinoMartLogo className="w-10 h-10 md:w-12 md:h-12 group-hover:scale-105 transition-transform" logoUrl={settings?.logo_url} />
            )}
            <div className="flex flex-col">
              <span className="font-bold text-xl md:text-2xl text-[#1A1A1A] tracking-tight group-hover:text-[#6B7A4F] transition-colors">
                {settings?.logo_title || 'KinoMart'}
              </span>
              {settings?.tagline && (
                <span className="text-[10px] text-gray-500 font-medium -mt-1 hidden sm:block">
                  {settings.tagline}
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-base font-medium transition-colors hover:text-[#6B7A4F] ${
                    isActive ? 'text-[#6B7A4F] font-semibold' : 'text-[#1A1A1A]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions & Buttons */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Search Input on Desktop */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative">
              <input
                type="text"
                placeholder="প্রোডাক্ট খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 xl:w-60 pl-9 pr-4 py-1.5 text-sm rounded-full border border-[#E5E3DA] bg-white text-[#1A1A1A] placeholder-[#6B6B6B] focus:outline-none focus:border-[#6B7A4F] focus:ring-1 focus:ring-[#6B7A4F] transition-all"
              />
              <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-2.5 pointer-events-none" />
            </form>

            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden p-2 rounded-full text-[#1A1A1A] hover:bg-[#E5E3DA]/50 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account / Login */}
            <Link
              to={customerPhone ? '/account' : '/account'}
              id="nav-account-btn"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-[#E5E3DA] bg-white text-[#1A1A1A] hover:bg-[#F7F5EF] hover:border-[#6B7A4F] transition-all shadow-2xs"
            >
              <User className="w-4 h-4 text-[#6B7A4F]" />
              <span className="hidden sm:inline">
                {customerPhone ? 'আমার অ্যাকাউন্ট' : 'অ্যাকাউন্ট'}
              </span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#1A1A1A] hover:bg-[#E5E3DA]/50 transition-colors"
              aria-label="Toggle Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Expandable Search Input on Mobile */}
        {isSearchOpen && (
          <div className="lg:hidden pb-3 pt-1 border-t border-[#E5E3DA]/50 animate-fadeIn">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="আপনার পছন্দের গ্যাজেট খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[#6B7A4F] bg-white text-[#1A1A1A] focus:outline-none"
                autoFocus
              />
              <Search className="w-5 h-5 text-[#6B7A4F] absolute left-3 top-2.5" />
            </form>
          </div>
        )}
      </div>

      {/* Dark Horizontal Category Navigation Bar */}
      <CategoryNav />
    </header>

    {/* Off-Canvas Mobile Side Drawer matching user's design screenshot */}
    {isMobileMenuOpen && (
      <div className="fixed inset-0 z-[9999] md:hidden flex">
        {/* Dark Backdrop Overlay */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sliding Drawer Container */}
        <div className="relative w-[85%] max-w-[320px] bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto overflow-x-hidden no-scrollbar p-4 space-y-4 animate-slideRight">
          {/* Header Close Button */}
          <div className="flex items-center justify-between pb-1">
            <div className="font-extrabold text-lg text-[#1A1A1A] tracking-tight truncate pr-2">
              {settings?.logo_title || 'KinoMart'}
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Top Signin / Profile Banner Card (Orange) */}
          <div
            onClick={() => {
              navigate('/account');
              setIsMobileMenuOpen(false);
            }}
            className="bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white rounded-2xl p-3.5 flex items-center space-x-3.5 shadow-md cursor-pointer hover:opacity-95 transition-opacity"
          >
            <div className="w-11 h-11 rounded-full bg-white/25 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-sm leading-tight truncate">
                {customerPhone ? 'হ্যালো!' : 'Hello there!'}
              </div>
              <div className="text-xs text-white/90 font-medium truncate">
                {customerPhone ? customerPhone : 'Signin / সাইন ইন'}
              </div>
            </div>
          </div>

          {/* Category List Card Container */}
          <div className="bg-[#F6F6F6] rounded-2xl border border-gray-200/70 overflow-hidden shadow-2xs">
            {(categories.length > 0 ? categories : (fallbackCategories as Category[])).map((cat, idx, arr) => {
              const queryParams = new URLSearchParams(location.search);
              const isSelected = queryParams.get('category') === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    navigate(`/products?category=${cat.id}`);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between text-left px-4 py-3 text-xs font-semibold text-[#333333] hover:bg-white transition-colors ${
                    isSelected ? 'bg-amber-100/60 text-[#1A1A1A] font-bold' : ''
                  } ${idx !== arr.length - 1 ? 'border-b border-gray-200/70' : ''}`}
                >
                  <span className="truncate min-w-0 pr-2">{cat.name}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 ml-auto" />
                </button>
              );
            })}
          </div>

          {/* Quick Links Section */}
          <div className="pt-1">
            <div className="relative mb-2.5">
              <h3 className="font-bold text-sm text-[#1A1A1A]">Quick Links</h3>
              <div className="w-8 h-0.5 bg-[#F97316] rounded-full mt-1" />
            </div>

            <div className="bg-[#F6F6F6] rounded-2xl border border-gray-200/70 overflow-hidden shadow-2xs">
              {navLinks.map((link, idx, arr) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between text-left px-4 py-3 text-xs font-semibold text-[#444444] hover:bg-white transition-colors ${
                    idx !== arr.length - 1 ? 'border-b border-gray-200/70' : ''
                  }`}
                >
                  <span className="truncate min-w-0 pr-2">{link.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-auto" />
                </Link>
              ))}

              <a
                href={`tel:${settings?.phone || '01700123456'}`}
                className="flex items-center justify-between text-left px-4 py-3 text-xs font-semibold text-[#6B7A4F] hover:bg-white transition-colors border-t border-gray-200/70"
              >
                <div className="flex items-center space-x-2 truncate min-w-0 pr-2">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">হটলাইন: {settings?.phone || '01700-123456'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-auto" />
              </a>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  );
};
