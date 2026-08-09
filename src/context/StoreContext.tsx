import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabaseClient, isSupabaseConfigured, setSupabaseCredentials } from '../lib/supabase';
import {
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_TEAM
} from '../data/mockData';
import {
  Category,
  Coupon,
  CustomerProfile,
  MockSMSLog,
  Order,
  OrderItem,
  Product,
  StoreSettings,
  TeamMember
} from '../types';
import { trackPurchase } from '../lib/dataLayer';

interface StoreContextType {
  // Navigation & View
  viewMode: 'client' | 'admin';
  setViewMode: (mode: 'client' | 'admin') => void;
  activeClientPage: 'home' | 'products' | 'product-detail' | 'order-success' | 'order-track' | 'customer-profile' | 'about' | 'contact';
  setActiveClientPage: (page: 'home' | 'products' | 'product-detail' | 'order-success' | 'order-track' | 'customer-profile' | 'about' | 'contact') => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Selected Product & Modals
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  quickOrderProduct: Product | null;
  setQuickOrderProduct: (product: Product | null) => void;
  isQuickOrderOpen: boolean;
  setIsQuickOrderOpen: (open: boolean) => void;

  // Customer Account
  customerUser: CustomerProfile | null;
  isCustomerLoginModalOpen: boolean;
  setIsCustomerLoginModalOpen: (open: boolean) => void;
  loginCustomer: (phone: string, name?: string) => boolean;
  logoutCustomer: () => void;
  updateCustomerProfile: (name: string, address: string) => void;

  // Active Order Success
  completedOrder: Order | null;
  setCompletedOrder: (order: Order | null) => void;

  // Data Collections
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  team: TeamMember[];
  settings: StoreSettings;

  // Mock SMS Notifications
  mockSmsLogs: MockSMSLog[];
  latestSmsToast: MockSMSLog | null;
  dismissSmsToast: () => void;
  triggerMockSMS: (order: Order, customMessage?: string) => MockSMSLog;
  clearSmsLogs: () => void;

  // Admin Controls
  isAdminLoggedIn: boolean;
  isAdminAuthenticated: boolean;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  loginAdmin: (username: string, pass: string) => boolean;
  logoutAdmin: () => void;
  activeAdminTab: 'orders' | 'products' | 'categories' | 'coupons' | 'team' | 'settings';
  setActiveAdminTab: (tab: 'orders' | 'products' | 'categories' | 'coupons' | 'team' | 'settings') => void;

  // Actions
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status' | 'callStatus'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status'], callStatus?: Order['callStatus'], customSmsMsg?: string, sendSms?: boolean, notes?: string) => void;
  deleteOrder: (orderId: string) => void;
  
  saveProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;

  saveCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;

  saveCoupon: (coupon: Coupon) => void;
  deleteCoupon: (couponId: string) => void;

  saveTeamMember: (member: TeamMember) => void;
  deleteTeamMember: (memberId: string) => void;

  saveSettings: (settings: StoreSettings) => void;
  validateCoupon: (code: string, subtotal: number) => { valid: boolean; discount: number; message: string };
  
  refreshSupabaseData: () => Promise<void>;
  resetToDefaults: () => void;
  rlsWarning: string | null;
  dismissRlsWarning: () => void;
}

const safeGetStorage = <T,>(key: string, fallback: T): T => {
  try {
    if (typeof window === 'undefined') return fallback;
    const saved = localStorage.getItem(key);
    if (!saved || saved === 'undefined' || saved === 'null') return fallback;
    return JSON.parse(saved);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
};

const safeSetStorage = (key: string, value: any): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to write ${key} to localStorage:`, err);
  }
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [viewMode, setViewMode] = useState<'client' | 'admin'>('client');
  const [activeClientPage, setActiveClientPage] = useState<'home' | 'products' | 'product-detail' | 'order-success' | 'order-track' | 'customer-profile' | 'about' | 'contact'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Customer Account state
  const [customerProfiles, setCustomerProfiles] = useState<Record<string, CustomerProfile>>(() => {
    return safeGetStorage('kinomart_customer_profiles', {});
  });

  const [customerUser, setCustomerUser] = useState<CustomerProfile | null>(() => {
    return safeGetStorage('kinomart_current_customer', null);
  });

  const [isCustomerLoginModalOpen, setIsCustomerLoginModalOpen] = useState<boolean>(false);

  // Selected Product & Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickOrderProduct, setQuickOrderProduct] = useState<Product | null>(null);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Admin state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      return sessionStorage.getItem('kinomart_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const isAdminAuthenticated = isAdminLoggedIn;
  const [activeAdminTab, setActiveAdminTab] = useState<'orders' | 'products' | 'categories' | 'coupons' | 'team' | 'settings'>('orders');

  // Persistent States
  const [products, setProducts] = useState<Product[]>(() => {
    return safeGetStorage('kinomart_products', INITIAL_PRODUCTS);
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    return safeGetStorage('kinomart_categories', INITIAL_CATEGORIES);
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    return safeGetStorage('kinomart_orders', INITIAL_ORDERS);
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    return safeGetStorage('kinomart_coupons', INITIAL_COUPONS);
  });

  const [team, setTeam] = useState<TeamMember[]>(() => {
    return safeGetStorage('kinomart_team', INITIAL_TEAM);
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    return safeGetStorage('kinomart_settings', INITIAL_SETTINGS);
  });

  // Supabase RLS Warning State
  const [rlsWarning, setRlsWarning] = useState<string | null>(null);
  const dismissRlsWarning = () => setRlsWarning(null);

  // Mock SMS Notification State
  const [mockSmsLogs, setMockSmsLogs] = useState<MockSMSLog[]>(() => {
    return safeGetStorage('kinomart_mock_sms_logs', []);
  });
  const [latestSmsToast, setLatestSmsToast] = useState<MockSMSLog | null>(null);

  useEffect(() => {
    safeSetStorage('kinomart_mock_sms_logs', mockSmsLogs);
  }, [mockSmsLogs]);

  const dismissSmsToast = () => setLatestSmsToast(null);

  const clearSmsLogs = () => setMockSmsLogs([]);

  const triggerMockSMS = (order: Order, customMessage?: string): MockSMSLog => {
    const statusText = order.status;
    let defaultMsg = `প্রিয় ${order.customerName}, আপনার ${order.orderNumber} নম্বর অর্ডারটির স্ট্যাটাস পরিবর্তিত হয়ে '${statusText}' হয়েছে। মোট মূল্য: ৳${order.totalPrice}। ধন্যবাদ - ${settings.websiteTitle}`;

    if (order.status === 'Confirmed') {
      defaultMsg = `প্রিয় ${order.customerName}, আপনার ${order.orderNumber} নম্বর অর্ডারটি নিশ্চিত (Confirmed) করা হয়েছে। মোট মূল্য: ৳${order.totalPrice}। দ্রুত ডেলিভারি দেওয়া হবে। - ${settings.websiteTitle}`;
    } else if (order.status === 'Shipped') {
      defaultMsg = `প্রিয় ${order.customerName}, আপনার ${order.orderNumber} অর্ডারটি ডেলিভারির জন্য কুরিয়ারে পাঠানো হয়েছে। ডেলিভারিতে পরিশোধ করুন: ৳${order.totalPrice}। - ${settings.websiteTitle}`;
    } else if (order.status === 'Delivered') {
      defaultMsg = `প্রিয় ${order.customerName}, আপনার ${order.orderNumber} অর্ডারটি সফলভাবে ডেলিভারি হয়েছে। কেনাকাটার জন্য ধন্যবাদ! - ${settings.websiteTitle}`;
    } else if (order.status === 'Cancelled') {
      defaultMsg = `প্রিয় ${order.customerName}, আপনার ${order.orderNumber} অর্ডারটি বাতিল (Cancelled) করা হয়েছে। যেকোনো প্রয়োজনে কল করুন: ${settings.phone}। - ${settings.websiteTitle}`;
    }

    const finalMsg = customMessage || defaultMsg;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newLog: MockSMSLog = {
      id: `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      message: finalMsg,
      status: 'DELIVERED',
      sentAt: timeStr,
      gateway: 'GreenWeb BD SMS API (Simulated)',
      messageId: `SMS-${Math.floor(100000 + Math.random() * 900000)}`
    };

    setMockSmsLogs((prev) => [newLog, ...prev]);
    setLatestSmsToast(newLog);

    return newLog;
  };

  // Sync LocalStorage for all core state collections
  useEffect(() => { safeSetStorage('kinomart_products', products); }, [products]);
  useEffect(() => { safeSetStorage('kinomart_categories', categories); }, [categories]);
  useEffect(() => { safeSetStorage('kinomart_orders', orders); }, [orders]);
  useEffect(() => { safeSetStorage('kinomart_coupons', coupons); }, [coupons]);
  useEffect(() => { safeSetStorage('kinomart_team', team); }, [team]);
  useEffect(() => { safeSetStorage('kinomart_settings', settings); }, [settings]);
  useEffect(() => { safeSetStorage('kinomart_customer_profiles', customerProfiles); }, [customerProfiles]);

  useEffect(() => {
    if (customerUser) {
      safeSetStorage('kinomart_current_customer', customerUser);
    } else {
      try {
        localStorage.removeItem('kinomart_current_customer');
      } catch (e) {
        console.warn(e);
      }
    }
  }, [customerUser]);

  // Resilient Smart Upsert Helper for Supabase
  const smartUpsert = async (
    tableName: string,
    primaryPayload: Record<string, any>,
    fallbackPayloads: Record<string, any>[] = []
  ): Promise<boolean> => {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      const { error: primaryErr } = await supabase.from(tableName).upsert(primaryPayload);
      if (!primaryErr) {
        setRlsWarning(null);
        return true;
      }

      const errMsg = String(primaryErr.message || JSON.stringify(primaryErr));
      console.warn(`Primary upsert failed on ${tableName}:`, errMsg);

      if (primaryErr.code === '42501' || errMsg.toLowerCase().includes('row-level security') || errMsg.toLowerCase().includes('policy')) {
        setRlsWarning(`Supabase RLS Error: Row Level Security is active on table "${tableName}". Writes are blocked. Please run the SQL setup script in Admin Settings.`);
      }

      for (const fallback of fallbackPayloads) {
        const { error: fbErr } = await supabase.from(tableName).upsert(fallback);
        if (!fbErr) {
          console.log(`Fallback upsert succeeded on ${tableName}`);
          setRlsWarning(null);
          return true;
        }
      }
    } catch (err) {
      console.warn(`Exception during smartUpsert on ${tableName}:`, err);
    }
    return false;
  };

  // Customer Actions
  const loginCustomer = (phone: string, name?: string): boolean => {
    const cleaned = phone.trim();
    if (!cleaned) return false;

    let profile = customerProfiles[cleaned];

    // Search in orders if not found in profiles dictionary
    if (!profile) {
      const existingOrder = orders.find((o) => o.customerPhone.trim() === cleaned);
      if (existingOrder) {
        profile = {
          name: existingOrder.customerName,
          phone: cleaned,
          address: existingOrder.shippingAddress
        };
      } else if (name) {
        profile = {
          name: name,
          phone: cleaned,
          address: ''
        };
      } else {
        // Fallback default name using phone
        profile = {
          name: `Customer-${cleaned.slice(-4)}`,
          phone: cleaned,
          address: ''
        };
      }
    }

    setCustomerUser(profile);
    setCustomerProfiles((prev) => ({ ...prev, [cleaned]: profile }));
    return true;
  };

  const logoutCustomer = () => {
    setCustomerUser(null);
    if (activeClientPage === 'customer-profile') {
      setActiveClientPage('home');
    }
  };

  const updateCustomerProfile = (name: string, address: string) => {
    if (!customerUser) return;
    const updated: CustomerProfile = {
      ...customerUser,
      name,
      address
    };
    setCustomerUser(updated);
    setCustomerProfiles((prev) => ({ ...prev, [updated.phone]: updated }));

    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('customer_profiles').upsert({
        phone: updated.phone,
        name: updated.name,
        address: updated.address,
        data: updated
      }).then(({ error }) => {
        if (error && supabase) {
          supabase.from('customer_profiles').upsert({ phone: updated.phone, data: updated }).then();
        }
      });
    }
  };

  // Supabase Data Refresh Function
  const refreshSupabaseData = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      // 1. Orders
      const { data: ords } = await supabase.from('orders').select('*');
      if (ords && ords.length > 0) {
        setOrders(prev => {
          const fetchedOrders = ords.map(r => {
            const dataObj = typeof r.data === 'string' ? JSON.parse(r.data) : (r.data || {});
            const localMatch = prev.find(o => o.id === String(r.id || dataObj.id));
            const base: Partial<Order> = localMatch || {};

            return {
              ...base,
              ...dataObj,
              id: String(r.id || dataObj.id || base.id),
              orderNumber: String(dataObj.orderNumber || r.order_number || r.orderNumber || base.orderNumber || r.id),
              customerName: String(dataObj.customerName || r.customer_name || r.customerName || base.customerName || ''),
              customerPhone: String(dataObj.customerPhone || r.customer_phone || r.customerPhone || base.customerPhone || ''),
              shippingAddress: String(dataObj.shippingAddress || r.shipping_address || base.shippingAddress || ''),
              deliveryArea: dataObj.deliveryArea || base.deliveryArea || 'Inside Dhaka',
              deliveryFee: Number(dataObj.deliveryFee ?? base.deliveryFee ?? 0),
              paymentMethod: dataObj.paymentMethod || base.paymentMethod || 'COD',
              items: Array.isArray(dataObj.items) ? dataObj.items : (Array.isArray(base.items) ? base.items : []),
              subtotal: Number(dataObj.subtotal ?? base.subtotal ?? 0),
              discount: Number(dataObj.discount ?? base.discount ?? 0),
              totalPrice: Number(dataObj.totalPrice ?? r.total_price ?? base.totalPrice ?? 0),
              status: dataObj.status || r.status || base.status || 'Pending',
              callStatus: dataObj.callStatus || r.call_status || base.callStatus || 'Not Called',
              createdAt: dataObj.createdAt || r.created_at || base.createdAt || new Date().toISOString()
            } as Order;
          });

          const map = new Map<string, Order>();
          fetchedOrders.forEach(o => map.set(o.id, o));
          return Array.from(map.values());
        });
      }

      // 2. Products
      const { data: prods } = await supabase.from('products').select('*');
      if (prods && prods.length > 0) {
        setProducts(prev => {
          const fetchedProducts = prods.map(r => {
            const dataObj = typeof r.data === 'string' ? JSON.parse(r.data) : (r.data || {});
            const localMatch = prev.find(p => p.id === String(r.id || dataObj.id));
            const base: Partial<Product> = localMatch || {};
            const rawStatus = dataObj.status || r.status || base.status;

            return {
              ...base,
              ...dataObj,
              id: String(r.id || dataObj.id || base.id),
              name: String(dataObj.name || r.name || base.name || ''),
              price: Number(dataObj.price ?? r.price ?? base.price ?? 0),
              discountPrice: dataObj.discountPrice !== undefined ? Number(dataObj.discountPrice) : (base.discountPrice !== undefined ? base.discountPrice : undefined),
              category: String(dataObj.category || r.category || base.category || 'গ্যাজেট'),
              subCategory: String(dataObj.subCategory || r.sub_category || r.subCategory || base.subCategory || ''),
              stock: Number(dataObj.stock ?? r.stock ?? base.stock ?? 10),
              limitedStockThreshold: Number(dataObj.limitedStockThreshold ?? base.limitedStockThreshold ?? 10),
              colors: Array.isArray(dataObj.colors) ? dataObj.colors : (Array.isArray(base.colors) ? base.colors : ['BLACK']),
              thumbnail: dataObj.thumbnail || base.thumbnail || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
              gallery: Array.isArray(dataObj.gallery) ? dataObj.gallery : (Array.isArray(base.gallery) ? base.gallery : []),
              videoUrl: dataObj.videoUrl || base.videoUrl || '',
              shortDescription: dataObj.shortDescription || base.shortDescription || '',
              longDescription: dataObj.longDescription || base.longDescription || '',
              specifications: Array.isArray(dataObj.specifications) ? dataObj.specifications : (Array.isArray(base.specifications) ? base.specifications : []),
              bundles: Array.isArray(dataObj.bundles) ? dataObj.bundles : (Array.isArray(base.bundles) ? base.bundles : []),
              hasTimer: Boolean(dataObj.hasTimer ?? base.hasTimer ?? false),
              isBestSeller: Boolean(dataObj.isBestSeller ?? base.isBestSeller ?? false),
              isFeatured: Boolean(dataObj.isFeatured ?? base.isFeatured ?? false),
              rating: Number(dataObj.rating ?? base.rating ?? 5.0),
              reviewsCount: Number(dataObj.reviewsCount ?? base.reviewsCount ?? 1),
              status: (rawStatus === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE') as 'ACTIVE' | 'INACTIVE'
            } as Product;
          });

          const map = new Map<string, Product>();
          fetchedProducts.forEach(p => map.set(p.id, p));
          return Array.from(map.values());
        });
      }

      // 3. Categories
      const { data: cats } = await supabase.from('categories').select('*');
      if (cats && cats.length > 0) {
        setCategories(prev => {
          const fetchedCats = cats.map(r => {
            const dataObj = typeof r.data === 'string' ? JSON.parse(r.data) : (r.data || {});
            const localMatch = prev.find(c => c.id === String(r.id || dataObj.id));
            const base: Partial<Category> = localMatch || {};

            const dataSub = dataObj.subCategories;
            const topSub = r.subCategories ?? r.sub_categories ?? r.subcategories ?? dataSub ?? base.subCategories;
            let parsedSub: string[] = [];

            const rawSub = (Array.isArray(topSub) && topSub.length > 0) ? topSub :
                           (Array.isArray(dataSub) && dataSub.length > 0) ? dataSub :
                           topSub ?? dataSub;

            if (Array.isArray(rawSub)) {
              parsedSub = rawSub;
            } else if (typeof rawSub === 'string') {
              try { parsedSub = JSON.parse(rawSub); } catch { parsedSub = []; }
            }

            return {
              ...base,
              ...dataObj,
              id: String(r.id || dataObj.id || base.id),
              name: String(dataObj.name || r.name || base.name || ''),
              image: dataObj.image || r.image || base.image || '',
              position: Number(dataObj.position ?? r.position ?? base.position ?? 1),
              isVisibleOnHome: Boolean(dataObj.isVisibleOnHome ?? r.is_visible_on_home ?? base.isVisibleOnHome ?? true),
              subCategories: Array.isArray(parsedSub) ? parsedSub.map(s => String(s).trim()).filter(Boolean) : []
            } as Category;
          });

          const map = new Map<string, Category>();
          fetchedCats.forEach(c => map.set(c.id, c));
          return Array.from(map.values());
        });
      }

      // 4. Coupons
      const { data: cpn } = await supabase.from('coupons').select('*');
      if (cpn && cpn.length > 0) {
        setCoupons(prev => {
          const fetchedCoupons = cpn.map(r => {
            const dataObj = typeof r.data === 'string' ? JSON.parse(r.data) : (r.data || {});
            const localMatch = prev.find(c => c.id === String(r.id || dataObj.id));
            const base: Partial<Coupon> = localMatch || {};

            return {
              ...base,
              ...dataObj,
              id: String(r.id || dataObj.id || base.id),
              code: String(dataObj.code || r.code || base.code || ''),
              type: (dataObj.type || r.discount_type || base.type || 'FIXED') as 'PERCENTAGE' | 'FIXED',
              value: Number(dataObj.value ?? r.discount_amount ?? base.value ?? 0),
              minOrderAmount: dataObj.minOrderAmount ?? base.minOrderAmount,
              isActive: Boolean(dataObj.isActive ?? base.isActive ?? true)
            } as Coupon;
          });

          const map = new Map<string, Coupon>();
          fetchedCoupons.forEach(c => map.set(c.id, c));
          return Array.from(map.values());
        });
      }

      // 5. Settings
      const { data: stg } = await supabase.from('settings').select('*');
      if (stg && stg.length > 0) {
        const fetchedStg = typeof stg[0].data === 'string' ? JSON.parse(stg[0].data) : (stg[0].data || stg[0]);
        if (fetchedStg && typeof fetchedStg === 'object') {
          setSettings(prev => ({ ...prev, ...fetchedStg }));
        }
      }

      // 6. Customer Profiles
      const { data: profs } = await supabase.from('customer_profiles').select('*');
      if (profs && profs.length > 0) {
        setCustomerProfiles(prev => {
          const map: Record<string, CustomerProfile> = { ...prev };
          profs.forEach(p => {
            const dataObj = typeof p.data === 'string' ? JSON.parse(p.data) : (p.data || {});
            const phone = String(p.phone || dataObj.phone || '');
            if (phone) {
              map[phone] = {
                name: dataObj.name || p.name || prev[phone]?.name || '',
                phone: phone,
                address: dataObj.address || p.address || prev[phone]?.address || ''
              };
            }
          });
          return map;
        });
      }

      // 7. Team
      const { data: tm } = await supabase.from('team').select('*');
      if (tm && tm.length > 0) {
        setTeam(prev => {
          const fetchedTeam = tm.map(r => {
            const dataObj = typeof r.data === 'string' ? JSON.parse(r.data) : (r.data || {});
            const localMatch = prev.find(t => t.id === String(r.id || dataObj.id));
            const base: Partial<TeamMember> = localMatch || {};

            return {
              ...base,
              ...dataObj,
              id: String(r.id || dataObj.id || base.id),
              name: String(dataObj.name || r.name || base.name || ''),
              role: String(dataObj.role || r.role || base.role || ''),
              image: dataObj.image || base.image || '',
              phone: dataObj.phone || base.phone || '',
              email: dataObj.email || base.email || ''
            } as TeamMember;
          });

          const map = new Map<string, TeamMember>();
          fetchedTeam.forEach(t => map.set(t.id, t));
          return Array.from(map.values());
        });
      }
    } catch (e) {
      console.warn('Supabase fetch notice:', e);
    }
  };

  // Auto sync credentials from settings if provided
  useEffect(() => {
    if (settings.supabaseUrl || settings.supabaseKey) {
      setSupabaseCredentials(settings.supabaseUrl || '', settings.supabaseKey || '');
      refreshSupabaseData();
    }
  }, [settings.supabaseUrl, settings.supabaseKey]);

  // Initial Fetch & Real-time Auto-Sync across devices
  useEffect(() => {
    refreshSupabaseData();

    // Periodic polling every 5 seconds for multi-device synchronization
    const interval = setInterval(() => {
      refreshSupabaseData();
    }, 5000);

    // Refetch when browser window regains focus
    const handleFocus = () => {
      refreshSupabaseData();
    };
    window.addEventListener('focus', handleFocus);

    // Subscribe to Postgres Changes via Supabase Realtime
    let channel: any;
    const client = getSupabaseClient();
    if (client) {
      try {
        channel = client.channel('store-all-changes')
          .on('postgres_changes', { event: '*', schema: 'public' }, () => {
            refreshSupabaseData();
          })
          .subscribe();
      } catch (err) {
        console.warn('Realtime channel notice:', err);
      }
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      const activeClient = getSupabaseClient();
      if (channel && activeClient) {
        activeClient.removeChannel(channel);
      }
    };
  }, []);

  // Sync state to LocalStorage safely
  useEffect(() => {
    safeSetStorage('kinomart_products', products);
  }, [products]);

  useEffect(() => {
    safeSetStorage('kinomart_categories', categories);
  }, [categories]);

  useEffect(() => {
    safeSetStorage('kinomart_orders', orders);
  }, [orders]);

  useEffect(() => {
    safeSetStorage('kinomart_coupons', coupons);
  }, [coupons]);

  useEffect(() => {
    safeSetStorage('kinomart_team', team);
  }, [team]);

  useEffect(() => {
    safeSetStorage('kinomart_settings', settings);
  }, [settings]);

  // Admin Auth
  const loginAdmin = (username: string, pass: string): boolean => {
    if (username === settings.adminUsername && pass === settings.adminPasswordHash) {
      setIsAdminLoggedIn(true);
      try {
        sessionStorage.setItem('kinomart_admin_auth', 'true');
      } catch (e) {
        console.error(e);
      }
      setViewMode('admin');
      setIsAdminModalOpen(false);
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin')) {
        window.history.pushState({}, '', '/admin');
      }
      // Immediately fetch latest DB records upon admin login
      refreshSupabaseData();
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    try {
      sessionStorage.removeItem('kinomart_admin_auth');
    } catch (e) {
      console.error(e);
    }
    setViewMode('client');
    setIsAdminModalOpen(false);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
  };

  // Order Operations
  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status' | 'callStatus'>): Order => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderNum = `KM-${randomNum}`;
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      status: 'Pending',
      callStatus: 'Not Called',
      createdAt: dateStr
    };

    // Update stock levels locally & in Supabase
    orderData.items.forEach((item: OrderItem) => {
      setProducts(prev =>
        prev.map(p => {
          if (p.id === item.product.id) {
            const updatedP = { ...p, stock: Math.max(0, p.stock - item.quantity) };
            smartUpsert('products', {
              id: updatedP.id,
              name: updatedP.name,
              category: updatedP.category,
              sub_category: updatedP.subCategory,
              price: updatedP.price,
              stock: updatedP.stock,
              data: updatedP
            }, [
              { id: updatedP.id, name: updatedP.name, category: updatedP.category, price: updatedP.price, stock: updatedP.stock, data: updatedP },
              { id: updatedP.id, data: updatedP },
              { id: updatedP.id, name: updatedP.name, price: updatedP.price, stock: updatedP.stock }
            ]);
            return updatedP;
          }
          return p;
        })
      );
    });

    // Auto create & login customer profile
    const phoneKey = orderData.customerPhone.trim();
    if (phoneKey) {
      const autoProfile: CustomerProfile = {
        name: orderData.customerName,
        phone: phoneKey,
        address: orderData.shippingAddress
      };
      setCustomerUser(autoProfile);
      setCustomerProfiles((prev) => ({ ...prev, [phoneKey]: autoProfile }));
      smartUpsert('customer_profiles', {
        phone: autoProfile.phone,
        name: autoProfile.name,
        address: autoProfile.address,
        data: autoProfile
      }, [
        { phone: autoProfile.phone, data: autoProfile },
        { phone: autoProfile.phone, name: autoProfile.name, address: autoProfile.address }
      ]);
    }

    setOrders(prev => [newOrder, ...prev]);
    setCompletedOrder(newOrder);
    setIsQuickOrderOpen(false);
    setQuickOrderProduct(null);
    setSelectedProduct(null);
    
    if (viewMode === 'client') {
      setActiveClientPage('order-success');
    }

    // Fire dataLayer purchase event
    trackPurchase(newOrder);

    // Save order to Supabase asynchronously
    (async () => {
      const cleanOrder: Order = JSON.parse(JSON.stringify(newOrder));
      const primary = {
        id: cleanOrder.id,
        order_number: cleanOrder.orderNumber || '',
        customer_name: cleanOrder.customerName || '',
        customer_phone: cleanOrder.customerPhone || '',
        total_price: Number(cleanOrder.totalPrice || 0),
        status: cleanOrder.status || 'Pending',
        call_status: cleanOrder.callStatus || 'Not Called',
        data: cleanOrder
      };
      const fallbacks = [
        {
          id: cleanOrder.id,
          customer_name: cleanOrder.customerName || '',
          customer_phone: cleanOrder.customerPhone || '',
          total_price: Number(cleanOrder.totalPrice || 0),
          status: cleanOrder.status || 'Pending',
          data: cleanOrder
        },
        { id: cleanOrder.id, data: cleanOrder },
        {
          id: cleanOrder.id,
          order_number: cleanOrder.orderNumber || '',
          customer_name: cleanOrder.customerName || '',
          customer_phone: cleanOrder.customerPhone || '',
          total_price: Number(cleanOrder.totalPrice || 0)
        }
      ];

      await smartUpsert('orders', primary, fallbacks);
      await refreshSupabaseData();
    })();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    status: Order['status'],
    callStatus?: Order['callStatus'],
    customSmsMsg?: string,
    sendSms: boolean = true,
    notes?: string
  ) => {
    let targetOrder: Order | null = null;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const nextOrder: Order = {
            ...o,
            status,
            callStatus: callStatus || o.callStatus,
            notes: notes !== undefined ? notes : o.notes
          };
          targetOrder = nextOrder;
          return nextOrder;
        }
        return o;
      })
    );

    if (sendSms && targetOrder) {
      triggerMockSMS(targetOrder, customSmsMsg);
    }

    if (targetOrder) {
      const ordToSave = targetOrder as Order;
      (async () => {
        const cleanOrd: Order = JSON.parse(JSON.stringify(ordToSave));
        const primary = {
          id: cleanOrd.id,
          order_number: cleanOrd.orderNumber || '',
          customer_name: cleanOrd.customerName || '',
          customer_phone: cleanOrd.customerPhone || '',
          total_price: Number(cleanOrd.totalPrice || 0),
          status: cleanOrd.status || 'Pending',
          call_status: cleanOrd.callStatus || 'Not Called',
          data: cleanOrd
        };
        const fallbacks = [
          {
            id: cleanOrd.id,
            customer_name: cleanOrd.customerName || '',
            customer_phone: cleanOrd.customerPhone || '',
            total_price: Number(cleanOrd.totalPrice || 0),
            status: cleanOrd.status || 'Pending',
            data: cleanOrd
          },
          { id: cleanOrd.id, data: cleanOrd }
        ];

        await smartUpsert('orders', primary, fallbacks);
        await refreshSupabaseData();
      })();
    }
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('orders').delete().eq('id', orderId).then(() => refreshSupabaseData(), err => console.warn('Supabase order delete error:', err));
    }
  };

  // Product CRUD
  const saveProduct = (product: Product) => {
    const cleanProduct: Product = JSON.parse(JSON.stringify(product));

    setProducts(prev => {
      const exists = prev.some(p => p.id === cleanProduct.id);
      if (exists) {
        return prev.map(p => (p.id === cleanProduct.id ? cleanProduct : p));
      } else {
        return [cleanProduct, ...prev];
      }
    });

    (async () => {
      const primary = {
        id: cleanProduct.id,
        name: cleanProduct.name || '',
        category: cleanProduct.category || '',
        sub_category: cleanProduct.subCategory || '',
        price: Number(cleanProduct.price || 0),
        stock: Number(cleanProduct.stock || 0),
        data: cleanProduct
      };

      const fallbacks = [
        {
          id: cleanProduct.id,
          name: cleanProduct.name || '',
          category: cleanProduct.category || '',
          price: Number(cleanProduct.price || 0),
          stock: Number(cleanProduct.stock || 0),
          data: cleanProduct
        },
        { id: cleanProduct.id, data: cleanProduct },
        {
          id: cleanProduct.id,
          name: cleanProduct.name || '',
          category: cleanProduct.category || '',
          price: Number(cleanProduct.price || 0),
          stock: Number(cleanProduct.stock || 0)
        }
      ];

      await smartUpsert('products', primary, fallbacks);
      await refreshSupabaseData();
    })();
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('products').delete().eq('id', productId).then(() => refreshSupabaseData(), err => console.warn('Supabase product delete error:', err));
    }
  };

  // Category CRUD
  const saveCategory = async (category: Category) => {
    const rawSubs = Array.isArray(category.subCategories) ? category.subCategories : [];
    const subList = Array.from(new Set(rawSubs.map(s => String(s).trim()).filter(Boolean)));
    
    const cleanCategory: Category = {
      ...category,
      subCategories: subList
    };

    setCategories(prev => {
      const exists = prev.some(c => c.id === cleanCategory.id);
      if (exists) {
        return prev.map(c => (c.id === cleanCategory.id ? cleanCategory : c));
      } else {
        return [...prev, cleanCategory];
      }
    });

    const primary = {
      id: cleanCategory.id,
      name: cleanCategory.name,
      image: cleanCategory.image || '',
      position: cleanCategory.position ?? 1,
      is_visible_on_home: cleanCategory.isVisibleOnHome ?? true,
      sub_categories: subList,
      data: cleanCategory
    };

    const fallbacks = [
      { id: cleanCategory.id, name: cleanCategory.name, image: cleanCategory.image || '', data: cleanCategory },
      { id: cleanCategory.id, data: cleanCategory },
      { id: cleanCategory.id, name: cleanCategory.name }
    ];

    await smartUpsert('categories', primary, fallbacks);
    await refreshSupabaseData();
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('categories').delete().eq('id', categoryId).then(() => refreshSupabaseData(), err => console.warn('Supabase category delete error:', err));
    }
  };

  // Coupon CRUD
  const saveCoupon = (coupon: Coupon) => {
    const cleanCoupon: Coupon = JSON.parse(JSON.stringify(coupon));

    setCoupons(prev => {
      const exists = prev.some(c => c.id === cleanCoupon.id);
      if (exists) {
        return prev.map(c => (c.id === cleanCoupon.id ? cleanCoupon : c));
      } else {
        return [...prev, cleanCoupon];
      }
    });

    (async () => {
      const primary = {
        id: cleanCoupon.id,
        code: cleanCoupon.code || '',
        discount_amount: Number(cleanCoupon.value || 0),
        discount_type: cleanCoupon.type || 'FIXED',
        data: cleanCoupon
      };
      const fallbacks = [
        { id: cleanCoupon.id, code: cleanCoupon.code || '', data: cleanCoupon },
        { id: cleanCoupon.id, data: cleanCoupon },
        { id: cleanCoupon.id, code: cleanCoupon.code || '', discount_amount: Number(cleanCoupon.value || 0) }
      ];

      await smartUpsert('coupons', primary, fallbacks);
      await refreshSupabaseData();
    })();
  };

  const deleteCoupon = (couponId: string) => {
    setCoupons(prev => prev.filter(c => c.id !== couponId));
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('coupons').delete().eq('id', couponId).then(() => refreshSupabaseData(), err => console.warn('Supabase coupon delete error:', err));
    }
  };

  // Team Member CRUD
  const saveTeamMember = (member: TeamMember) => {
    const cleanMember: TeamMember = JSON.parse(JSON.stringify(member));

    setTeam(prev => {
      const exists = prev.some(t => t.id === cleanMember.id);
      if (exists) {
        return prev.map(t => (t.id === cleanMember.id ? cleanMember : t));
      } else {
        return [...prev, cleanMember];
      }
    });

    (async () => {
      const primary = {
        id: cleanMember.id,
        name: cleanMember.name || '',
        role: cleanMember.role || '',
        data: cleanMember
      };
      const fallbacks = [
        { id: cleanMember.id, data: cleanMember },
        { id: cleanMember.id, name: cleanMember.name || '', role: cleanMember.role || '' }
      ];

      await smartUpsert('team', primary, fallbacks);
      await refreshSupabaseData();
    })();
  };

  const deleteTeamMember = (memberId: string) => {
    setTeam(prev => prev.filter(t => t.id !== memberId));
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('team').delete().eq('id', memberId).then(() => refreshSupabaseData(), err => console.warn('Supabase team delete error:', err));
    }
  };

  // Settings
  const saveSettings = (newSettings: StoreSettings) => {
    const cleanSettings: StoreSettings = JSON.parse(JSON.stringify(newSettings));
    setSettings(cleanSettings);

    if (cleanSettings.supabaseUrl || cleanSettings.supabaseKey) {
      setSupabaseCredentials(cleanSettings.supabaseUrl || '', cleanSettings.supabaseKey || '');
    }

    (async () => {
      const primary = {
        id: 'site_settings',
        data: cleanSettings
      };
      const fallbacks = [
        { id: 'site_settings', data: JSON.stringify(cleanSettings) }
      ];

      await smartUpsert('settings', primary, fallbacks);
      await refreshSupabaseData();
    })();
  };

  // Validate Coupon
  const validateCoupon = (code: string, subtotal: number) => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === cleanCode && c.isActive);

    if (!found) {
      return { valid: false, discount: 0, message: 'অবৈধ বা মেয়ারোত্তীর্ণ কুপন কোড' };
    }

    if (found.minOrderAmount && subtotal < found.minOrderAmount) {
      return { valid: false, discount: 0, message: `ন্যূনতম ৳${found.minOrderAmount} অর্ডারে কুপনটি প্রযোজ্য` };
    }

    let discount = 0;
    if (found.type === 'PERCENTAGE') {
      discount = Math.round((subtotal * found.value) / 100);
    } else {
      discount = found.value;
    }

    return { valid: true, discount, message: `কুপন সফলভাবে যুক্ত হয়েছে (৳${discount} ছাড়)!` };
  };

  const resetToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setOrders(INITIAL_ORDERS);
    setCoupons(INITIAL_COUPONS);
    setTeam(INITIAL_TEAM);
    setSettings(INITIAL_SETTINGS);
    localStorage.clear();
  };

  return (
    <StoreContext.Provider
      value={{
        viewMode,
        setViewMode,
        activeClientPage,
        setActiveClientPage,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        selectedProduct,
        setSelectedProduct,
        quickOrderProduct,
        setQuickOrderProduct,
        isQuickOrderOpen,
        setIsQuickOrderOpen,
        completedOrder,
        setCompletedOrder,
        customerUser,
        isCustomerLoginModalOpen,
        setIsCustomerLoginModalOpen,
        loginCustomer,
        logoutCustomer,
        updateCustomerProfile,
        products,
        categories,
        orders,
        coupons,
        team,
        settings,
        mockSmsLogs,
        latestSmsToast,
        dismissSmsToast,
        triggerMockSMS,
        clearSmsLogs,
        isAdminLoggedIn,
        isAdminAuthenticated,
        isAdminModalOpen,
        setIsAdminModalOpen,
        loginAdmin,
        logoutAdmin,
        activeAdminTab,
        setActiveAdminTab,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        saveProduct,
        deleteProduct,
        saveCategory,
        deleteCategory,
        saveCoupon,
        deleteCoupon,
        saveTeamMember,
        deleteTeamMember,
        saveSettings,
        validateCoupon,
        refreshSupabaseData,
        resetToDefaults,
        rlsWarning,
        dismissRlsWarning
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
