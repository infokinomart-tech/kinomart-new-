import { Category, Coupon, Order, Product, StoreSettings, TeamMember } from '../types';

export const INITIAL_SETTINGS: StoreSettings = {
  websiteTitle: 'KinoMart',
  tagline: 'সেরা গ্যাজেট ও প্রিমিয়াম ইলেকট্রনিক্স',
  logoUrl: '',
  faviconUrl: '',
  topBannerEnabled: true,
  topBannerText: 'আজকের স্পেশাল অফার: যেকোনো ২ টি গ্যাজেট অর্ডারে ফ্রি ডেলিভারি! | হটলাইন: 01700000000',
  facebookPixelId: '123456789012345',
  capiAccessToken: 'EAAC1234567890abcdef...',
  bkashNumber: '01700000000',
  nagadNumber: '01700000000',
  phone: '01700000000',
  whatsapp: '01700000000',
  email: 'support@kinomart.com',
  address: 'ঢাকা, বাংলাদেশ',
  footerAbout: 'কীনোমার্ট বাংলাদেশের একটি বিশ্বস্ত প্রিমিয়াম গ্যাজেট অনলাইন শপ। আমরা সরবরাহ করি ১০০% অরিজিনাল ও মানসম্মত ইলেকট্রনিক্স গ্যাজেট।',
  adminUsername: 'kinomart',
  adminPasswordHash: '@kinomart@'
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'স্মার্টওয়াচ',
    position: 1,
    isVisibleOnHome: true,
    subCategories: ['আল্ট্রা সিরিজ ওয়াচ', 'সিরিজ ৯ / ১০', 'ফিটনেস ও স্পোর্টস ব্যান্ড', 'লেডিজ স্মার্টওয়াচ']
  },
  {
    id: 'cat-2',
    name: 'ইয়ারবাডস ও হেডফোন',
    position: 2,
    isVisibleOnHome: true,
    subCategories: ['TWS এয়ারবাডস', 'নেকব্যান্ড হেডফোন', 'গেমিং হেডসেট', 'ওভার-ইয়ার হেডফোন']
  },
  {
    id: 'cat-3',
    name: 'চার্জার ও পাওয়ার ব্যাংক',
    position: 3,
    isVisibleOnHome: true,
    subCategories: ['ফাস্ট চার্জার ও অ্যাডাপ্টার', 'পাওয়ার ব্যাংক (১০K-২০K mAh)', 'টাইপ-সি ও লাইটনিং ক্যাবল', 'ওয়্যারলেস চার্জার']
  },
  {
    id: 'cat-4',
    name: 'স্পিকার ও সাউন্ড',
    position: 4,
    isVisibleOnHome: true,
    subCategories: ['পোর্টেবল ব্লুটুথ স্পিকার', 'সাউন্ডবার ও হোম থিয়েটার', 'পার্টি স্পিকার']
  },
  {
    id: 'cat-5',
    name: 'ফিটনেস ও হেলথ গ্যাজেট',
    position: 5,
    isVisibleOnHome: true,
    subCategories: ['নেসাল ইনহেলার', 'বডি মাসাজার', 'স্মার্ট থার্মোমিটার']
  },
  {
    id: 'cat-6',
    name: 'মোবাইল এক্সেসরিজ',
    position: 6,
    isVisibleOnHome: true,
    subCategories: ['মোবাইল ব্যাক কভার', 'স্ক্রিন প্রোটেক্টর', 'মোবাইল হোল্ডার', 'গিম্বল ও ট্রাইপড']
  },
  {
    id: 'cat-7',
    name: 'স্মার্ট হোম ও লাইফস্টাইল',
    position: 7,
    isVisibleOnHome: true,
    subCategories: ['স্মার্ট এলইডি লাইট', 'সিকিউরিটি আইপি ক্যামেরা', 'স্মার্ট সকেট ও সুইচ']
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Supabase Verified Product 1785492719365',
    price: 2500,
    discountPrice: 1650,
    category: 'ইয়ারবাডস ও হেডফোন',
    subCategory: 'TWS এয়ারবাডস',
    stock: 13,
    limitedStockThreshold: 15,
    colors: ['MINT', 'PEACH', 'WATERMELON', 'GRAPE'],
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    shortDescription: 'প্রিমিয়াম এইচডি সাউন্ড, অ্যাক্টিভ নয়েজ ক্যানসেলেশন ও ৩০ ঘণ্টা ব্যাটারি ব্যাকআপ।',
    longDescription: 'কেন কীনোমার্ট থেকে অর্ডার করবেন?\n• ১০০% অরিজিনাল অফিশিয়াল বা ইম্পোর্টেড প্রিমিয়াম গ্যাজেট\n• সাইটেই খুচরা রেট তার উপরে ছাড়ের সুযোগ\n• দ্রুততম সময়ে সারা বাংলাদেশে হোম ডেলিভারি',
    specifications: [
      { key: 'ব্লুটুথ ভার্সন', value: 'v5.3 (Ultra Low Latency)' },
      { key: 'প্লেটাইম', value: '৩০ ঘন্টা (কেস সহ)' },
      { key: 'চার্জিং সময়', value: '১.৫ ঘন্টা (Type-C High Speed)' },
      { key: 'ওয়াটারপ্রুফ', value: 'IPX5 Sweat-proof' }
    ],
    bundleStyle: 'radio_cards',
    bundles: [
      {
        id: 'b-1',
        title: '1 Pc',
        quantity: 1,
        price: 989,
        originalPrice: 1300,
        tagText: 'ক্যাশ অন ডেলিভারী',
        isPopular: false
      },
      {
        id: 'b-2',
        title: '2 Pc',
        quantity: 2,
        price: 1799,
        originalPrice: 2600,
        badgeText: '🔥 SAVE 179 TK',
        tagText: 'ক্যাশ অন ডেলিভারী',
        isPopular: true
      },
      {
        id: 'b-3',
        title: '4 Pc',
        quantity: 4,
        price: 3499,
        originalPrice: 5200,
        badgeText: '🔥 SAVE 457 TK',
        tagText: 'ক্যাশ অন ডেলিভারী',
        isPopular: false
      }
    ],
    hasTimer: true,
    isBestSeller: true,
    isFeatured: true,
    rating: 5.0,
    reviewsCount: 3,
    reviews: [
      {
        id: 'rev-1',
        userName: 'তানভীর আহমেদ',
        userRole: 'Verified Buyer (ঢাকা)',
        rating: 5,
        comment: 'অসাধারণ সাউন্ড কোয়ালিটি! ব্যাটারি ব্যাকআপ অনেক ভালো এবং মাত্র ২ দিনে হোম ডেলিভারি পেয়েছি। ধন্যবাদ কীনোমার্ট।',
        date: '০৮ আগস্ট, ২০২৬',
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
        isVerifiedPurchase: true
      },
      {
        id: 'rev-2',
        userName: 'রাহাত ইসলাম',
        userRole: 'Verified Buyer (চট্টগ্রাম)',
        rating: 5,
        comment: 'প্রোডাক্টের ফিনিশিং ও প্যাকেজিং চমৎকার। গান শোনার অভিজ্ঞতাই পাল্টে গেছে। একদম অরিজিনাল গ্যাজেট।',
        date: '০৫ আগস্ট, ২০২৬',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        isVerifiedPurchase: true
      },
      {
        id: 'rev-3',
        userName: 'নাসরিন সুলতানা',
        userRole: 'Verified Buyer (সিলেট)',
        rating: 5,
        comment: 'আমার ভাইয়ের জন্য অর্ডার করেছিলাম, সে উপহার পেয়ে অসম্ভব খুশি! সাউন্ড বেস খুব স্ট্রং।',
        date: '০২ আগস্ট, ২০২৬',
        image: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&auto=format&fit=crop&q=80',
        isVerifiedPurchase: true
      }
    ],
    status: 'ACTIVE'
  },
  {
    id: 'prod-2',
    name: 'Direct Test Product',
    price: 1000,
    category: 'ইয়ারবাডস ও হেডফোন',
    subCategory: 'নেকব্যান্ড হেডফোন',
    stock: 8,
    limitedStockThreshold: 10,
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
    shortDescription: 'হাই বেস ক্লিয়ার কলিং ফিচার ও মেটাল ফিনিশ লাইটওয়েট ইয়ারফোন।',
    longDescription: '১০০% অরিজিনাল প্রিমিয়াম ইয়ারফোন সাশ্রয়ী মূল্যে।',
    specifications: [
      { key: 'ওয়ারেন্টি', value: '৬ মাস রিপ্লেসমেন্ট' }
    ],
    isBestSeller: true,
    rating: 5.0,
    reviewsCount: 45,
    status: 'ACTIVE'
  },
  {
    id: 'prod-3',
    name: 'Kino Stream RGB Gaming Desk Headset',
    price: 2600,
    discountPrice: 2080,
    category: 'ইয়ারবাডস ও হেডফোন',
    subCategory: 'গেমিং হেডসেট',
    stock: 25,
    thumbnail: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'],
    shortDescription: '৭.১ সারাউন্ড সাউন্ড, আরজিবি লাইটিং ও নয়েজ ক্যানসেলিং মাইক্রোফোন।',
    rating: 4.8,
    reviewsCount: 28,
    status: 'ACTIVE'
  },
  {
    id: 'prod-4',
    name: 'KinoBand Sleek Fitness & Sleep Tracker',
    price: 2120,
    category: 'ফিটনেস ও হেলথ গ্যাজেট',
    subCategory: 'ফিটনেস ও স্পোর্টস ব্যান্ড',
    stock: 18,
    thumbnail: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=80'],
    shortDescription: 'হার্ট রেট, এসপিও২, স্লিপ মনিটরিং এবং ১৪ দিনের লং ব্যাটারি লাইফ।',
    rating: 4.6,
    reviewsCount: 61,
    status: 'ACTIVE'
  },
  {
    id: 'prod-5',
    name: 'Kino Charge Fast Magnetic Power Bank 10,000mAh',
    price: 1850,
    category: 'চার্জার ও পাওয়ার ব্যাংক',
    subCategory: 'পাওয়ার ব্যাংক (১০K-২০K mAh)',
    stock: 12,
    limitedStockThreshold: 15,
    thumbnail: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=800&auto=format&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=800&auto=format&fit=crop&q=80'],
    shortDescription: '২০ ওয়াট ফাস্ট চার্জিং, ম্যাগসেফ ওয়্যারলেস সপোর্ট ও ডিজিটাল ডিসপ্লে।',
    isBestSeller: true,
    rating: 4.9,
    reviewsCount: 92,
    status: 'ACTIVE'
  },
  {
    id: 'prod-6',
    name: 'KinoBreathe Nasal Inhaler & Health Aid',
    price: 740,
    category: 'ফিটনেস ও হেলথ গ্যাজেট',
    subCategory: 'নেসাল ইনহেলার',
    stock: 30,
    thumbnail: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80'],
    shortDescription: 'প্রাকৃতিক ভেষজ নির্যাস সমৃদ্ধ ইনহেলার, তাৎক্ষণিক রিফ্রেশমেন্ট ও স্বস্তি।',
    bundleStyle: 'banner_table',
    bundleBannerSubtitle: 'একসাথে বেশি কিনুন – বেশি সাশ্রয় করুন!',
    bundleBannerTitle: 'একাধিক ফ্লেভার কিনলে পাবেন বিশেষ ছাড়',
    bundles: [
      {
        id: 'b-inhaler-1',
        title: '১টি পণ্য',
        quantity: 1,
        price: 390,
        originalPrice: 650,
        iconType: 'green_dot',
        isPopular: false
      },
      {
        id: 'b-inhaler-2',
        title: '২টি পণ্য',
        quantity: 2,
        price: 690,
        originalPrice: 1300,
        badgeText: '১৮% ছাড়',
        tagText: '(বেশি বিক্রিত)',
        iconType: 'gold_dot',
        isPopular: true
      },
      {
        id: 'b-inhaler-3',
        title: '৪টি পণ্য',
        quantity: 4,
        price: 1090,
        originalPrice: 2600,
        badgeText: '৩৫% ছাড়',
        tagText: '(মেগা সেভার)',
        iconType: 'fire',
        isPopular: false
      }
    ],
    rating: 4.7,
    reviewsCount: 62,
    status: 'ACTIVE'
  },
  {
    id: 'prod-7',
    name: 'KinoFit Pro Amoled Smartwatch',
    price: 2990,
    discountPrice: 2500,
    category: 'স্মার্টওয়াচ',
    subCategory: 'আল্ট্রা সিরিজ ওয়াচ',
    stock: 9,
    limitedStockThreshold: 10,
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
    shortDescription: '১.৪৩ ইঞ্চি অ্যামোলেড ডিসপ্লে, ব্লুটুথ কলিং, বাংলা ফন্ট সাপোর্ট ও স্পোর্টস মোড।',
    isBestSeller: true,
    rating: 4.8,
    reviewsCount: 112,
    status: 'ACTIVE'
  },
  {
    id: 'prod-8',
    name: 'Kino Ultra ANC Wireless Earbuds',
    price: 1490,
    category: 'ইয়ারবাডস ও হেডফোন',
    subCategory: 'TWS এয়ারবাডস',
    stock: 5,
    limitedStockThreshold: 8,
    thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80'],
    shortDescription: '৩৫dB অ্যাক্টিভ নয়েজ ক্যানসেলেশন, লো ল্যাটেন্সি গেমিং মোড ও ক্রিস্টাল কল।',
    isBestSeller: true,
    rating: 4.9,
    reviewsCount: 138,
    status: 'ACTIVE'
  },
  {
    id: 'prod-9',
    name: 'Kino SoundBar Pro Cinema Sound System (Out of Stock)',
    price: 4500,
    discountPrice: 3800,
    category: 'স্পিকার ও সাউন্ড',
    subCategory: 'সাউন্ডবার ও হোম থিয়েটার',
    stock: 0,
    limitedStockThreshold: 5,
    thumbnail: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80'],
    shortDescription: '১২০ ওয়াট আরএমএস আউটপুট, থ্রিডি ডলবি সাউন্ড, ওয়্যারলেস সাবউফার ও ব্লুটুথ ৫.২।',
    longDescription: 'হোম সিনেমা এক্সপেরিয়েন্সের জন্য সেরা সাউন্ডবার। প্রোডাক্টটি অত্যন্ত জনপ্রিয় হওয়ায় আপাতত স্টক শেষ। পুনরায় স্টকে আসামাত্রই নোটিফিকেশন পেতে নিচে রেজিস্টার করুন।',
    rating: 5.0,
    reviewsCount: 84,
    status: 'ACTIVE'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'KM-74646',
    customerName: 'rakib',
    customerPhone: '01234567890',
    shippingAddress: 'sfdgvsvdf',
    deliveryArea: 'Inside Dhaka',
    deliveryFee: 60,
    paymentMethod: 'COD',
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1
      }
    ],
    subtotal: 2500,
    discount: 0,
    totalPrice: 2560,
    status: 'Pending',
    callStatus: 'Not Called',
    createdAt: '01/08/2026 19:47'
  },
  {
    id: 'ord-2',
    orderNumber: 'KM-65259',
    customerName: 'rakib',
    customerPhone: '01316297483',
    shippingAddress: 'SgRSFGsrg',
    deliveryArea: 'Outside Dhaka',
    deliveryFee: 120,
    paymentMethod: 'COD',
    items: [
      {
        product: INITIAL_PRODUCTS[6],
        quantity: 1
      }
    ],
    subtotal: 2990,
    discount: 0,
    totalPrice: 3110,
    status: 'Pending',
    callStatus: 'Not Called',
    createdAt: '29/07/2026 14:05'
  },
  {
    id: 'ord-3',
    orderNumber: 'KM-10822',
    customerName: 'সাবরিনা সুলতানা',
    customerPhone: '01899887766',
    shippingAddress: 'জিইসি মোড়, সিডিএ এভিনিউ, চট্টগ্রাম',
    deliveryArea: 'Outside Dhaka',
    deliveryFee: 120,
    paymentMethod: 'COD',
    items: [
      {
        product: INITIAL_PRODUCTS[6],
        quantity: 1
      }
    ],
    subtotal: 2990,
    discount: 0,
    totalPrice: 3110,
    status: 'Pending',
    callStatus: 'Not Called',
    createdAt: '23/07/2026 19:44'
  },
  {
    id: 'ord-4',
    orderNumber: 'KM-10821',
    customerName: 'আরিফুল ইসলাম',
    customerPhone: '01711223344',
    shippingAddress: 'হাউস ১২, রোড ৫, ধানমন্ডি, ঢাকা',
    deliveryArea: 'Inside Dhaka',
    deliveryFee: 60,
    paymentMethod: 'COD',
    items: [
      {
        product: INITIAL_PRODUCTS[7],
        quantity: 1
      }
    ],
    subtotal: 1490,
    discount: 0,
    totalPrice: 1550,
    status: 'Confirmed',
    callStatus: 'Call Success',
    createdAt: '23/07/2026 18:14'
  },
  {
    id: 'ord-5',
    orderNumber: 'KM-10823',
    customerName: 'তানভীর আহমেদ',
    customerPhone: '01522334455',
    shippingAddress: 'মিরপুর ১০, সেনপাড়া পর্বতা, ঢাকা',
    deliveryArea: 'Inside Dhaka',
    deliveryFee: 60,
    paymentMethod: 'COD',
    items: [
      {
        product: INITIAL_PRODUCTS[5],
        quantity: 2
      }
    ],
    subtotal: 1480,
    discount: 0,
    totalPrice: 1540,
    status: 'Cancelled',
    callStatus: 'Fake Order',
    createdAt: '22/07/2026 20:14'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'KINO10',
    type: 'PERCENTAGE',
    value: 10,
    minOrderAmount: 1000,
    isActive: true
  },
  {
    id: 'coup-2',
    code: 'SAVE100',
    type: 'FIXED',
    value: 100,
    minOrderAmount: 1500,
    isActive: true
  }
];

export const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'team-1',
    name: 'তানভীর রহমান',
    role: 'এডমিন ও শপ ম্যানেজার',
    phone: '01700000000',
    email: 'admin@kinomart.com'
  },
  {
    id: 'team-2',
    name: 'রাফি ইসলাম',
    role: 'অর্ডার ও কাস্টমার সাপোর্ট',
    phone: '01800000000',
    email: 'support@kinomart.com'
  }
];

export const HERO_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
    title: 'প্রিমিয়াম হেডফোন ও ইয়ারবাডস',
    subtitle: 'অরিজিনাল গ্যাজেটে ছাড়ের ধামাকা অফার'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&auto=format&fit=crop&q=80',
    title: 'স্মার্টওয়াচ কালেকশন ২০২৬',
    subtitle: 'অ্যামোলেড ডিসপ্লে ও ব্লুটুথ কলিং'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=1600&auto=format&fit=crop&q=80',
    title: 'ফাস্ট চার্জিং পাওয়ার ব্যাংক',
    subtitle: 'সারা দেশে দ্রুত ক্যাশ অন ডেলিভারি'
  }
];
