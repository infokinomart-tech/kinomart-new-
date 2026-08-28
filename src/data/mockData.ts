import { Category, Coupon, Order, Product, StoreSettings, TeamMember, HeroSlide, PromoBannerConfig } from '../types';

export const INITIAL_SETTINGS: StoreSettings = {
  websiteTitle: 'KinoMart',
  tagline: 'সেরা গ্যাজেট ও প্রিমিয়াম ইলেকট্রনিক্স',
  logoUrl: '',
  faviconUrl: '',
  topBannerEnabled: false,
  topBannerText: '',
  facebookPixelId: '',
  capiAccessToken: '',
  bkashNumber: '',
  nagadNumber: '',
  phone: '',
  whatsapp: '',
  email: 'support@kinomart.com',
  address: 'ঢাকা, বাংলাদেশ',
  footerAbout: 'কীনোমার্ট বাংলাদেশের একটি বিশ্বস্ত প্রিমিয়াম অনলাইন শপ। আমরা সরবরাহ করি ১০০% অরিজিনাল ও মানসম্মত প্রোডাক্ট।',
  adminUsername: 'kinomart',
  adminPasswordHash: '@kinomart@'
};

export const INITIAL_CATEGORIES: Category[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_COUPONS: Coupon[] = [];

export const INITIAL_TEAM: TeamMember[] = [];

export const INITIAL_HERO_SLIDES: HeroSlide[] = [];

export const HERO_SLIDES: HeroSlide[] = [];

export const INITIAL_PROMO_BANNER: PromoBannerConfig = {
  isEnabled: false,
  badgeText: '',
  title: '',
  subtitle: '',
  buttonText: 'অফারটি দেখুন',
  linkType: 'all_products',
  bgColor: '#434F33'
};
