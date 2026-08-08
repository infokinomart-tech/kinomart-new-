import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
  updateOrderStatus: (orderId: string, status: Order['status'], callStatus?: Order['callStatus'], customSmsMsg?: string, sendSms?: boolean) => void;
  deleteOrder: (orderId: string) => void;
  
  saveProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;

  saveCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;

  saveCoupon: (coupon: Coupon) => void;
  deleteCoupon: (couponId: string) => void;

  saveSettings: (settings: StoreSettings) => void;
  validateCoupon: (code: string, subtotal: number) => { valid: boolean; discount: number; message: string };
  
  resetToDefaults: () => void;
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

  // Sync Customer Profiles to LocalStorage
  useEffect(() => {
    safeSetStorage('kinomart_customer_profiles', customerProfiles);
  }, [customerProfiles]);

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

    if (isSupabaseConfigured() && supabase) {
      supabase.from('customer_profiles').upsert({
        phone: updated.phone,
        name: updated.name,
        address: updated.address
      }).then();
    }
  };

  // Initial Fetch from Supabase if configured
  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      const loadSupabaseData = async () => {
        try {
          const { data: ords } = await supabase.from('orders').select('*');
          if (ords && ords.length > 0) {
            setOrders(ords.map(r => r.data || r));
          }

          const { data: prods } = await supabase.from('products').select('*');
          if (prods && prods.length > 0) {
            setProducts(prods.map(r => r.data || r));
          }

          const { data: cats } = await supabase.from('categories').select('*');
          if (cats && cats.length > 0) {
            setCategories(cats.map(r => {
              const item = r.data || r;
              const dataSub = r.data?.subCategories;
              const topSub = r.subCategories ?? r.sub_categories ?? r.subcategories ?? item.subCategories;
              let parsedSub: string[] = [];

              const rawSub = (Array.isArray(topSub) && topSub.length > 0) ? topSub :
                             (Array.isArray(dataSub) && dataSub.length > 0) ? dataSub :
                             topSub ?? dataSub;

              if (Array.isArray(rawSub)) {
                parsedSub = rawSub;
              } else if (typeof rawSub === 'string') {
                try {
                  parsedSub = JSON.parse(rawSub);
                } catch {
                  parsedSub = [];
                }
              }

              return {
                id: String(item.id || r.id),
                name: String(item.name || r.name || ''),
                image: item.image || r.image || '',
                position: Number(item.position ?? r.position ?? 1),
                isVisibleOnHome: Boolean(item.isVisibleOnHome ?? r.is_visible_on_home ?? r.isVisibleOnHome ?? true),
                subCategories: Array.isArray(parsedSub) ? parsedSub : []
              };
            }));
          }

          const { data: cpn } = await supabase.from('coupons').select('*');
          if (cpn && cpn.length > 0) {
            setCoupons(cpn.map(r => r.data || r));
          }

          const { data: stg } = await supabase.from('settings').select('*');
          if (stg && stg.length > 0) {
            const fetchedStg = stg[0].data || stg[0];
            if (fetchedStg) {
              setSettings(prev => ({ ...prev, ...fetchedStg }));
            }
          }

          const { data: profs } = await supabase.from('customer_profiles').select('*');
          if (profs && profs.length > 0) {
            const map: Record<string, CustomerProfile> = {};
            profs.forEach(p => {
              map[p.phone] = { name: p.name, phone: p.phone, address: p.address };
            });
            setCustomerProfiles(map);
          }
        } catch (e) {
          console.warn('Supabase fetch notice:', e);
        }
      };
      loadSupabaseData();
    }
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

    // Update stock levels
    orderData.items.forEach((item: OrderItem) => {
      setProducts(prev =>
        prev.map(p => (p.id === item.product.id ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p))
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
    }

    setOrders(prev => [newOrder, ...prev]);
    setCompletedOrder(newOrder);
    setIsQuickOrderOpen(false);
    setQuickOrderProduct(null);
    setSelectedProduct(null);
    setActiveClientPage('order-success');

    if (isSupabaseConfigured() && supabase) {
      supabase.from('orders').upsert({
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        totalPrice: newOrder.totalPrice,
        status: newOrder.status,
        data: newOrder
      }).then(null, err => console.warn('Supabase order save error:', err));
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    return newOrder;
  };


  const updateOrderStatus = (
    orderId: string,
    status: Order['status'],
    callStatus?: Order['callStatus'],
    customSmsMsg?: string,
    sendSms: boolean = true
  ) => {
    let targetOrder: Order | null = null;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const nextOrder = {
            ...o,
            status,
            callStatus: callStatus || o.callStatus
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

    if (isSupabaseConfigured() && supabase && targetOrder) {
      supabase.from('orders').upsert({
        id: (targetOrder as Order).id,
        status: (targetOrder as Order).status,
        callStatus: (targetOrder as Order).callStatus,
        data: targetOrder
      }).then(null, err => console.warn('Supabase order status update error:', err));
    }
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    if (isSupabaseConfigured() && supabase) {
      supabase.from('orders').delete().eq('id', orderId).then(null, err => console.warn('Supabase order delete error:', err));
    }
  };

  // Product CRUD
  const saveProduct = (product: Product) => {
    setProducts(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.map(p => (p.id === product.id ? product : p));
      } else {
        return [product, ...prev];
      }
    });

    if (isSupabaseConfigured() && supabase) {
      supabase.from('products').upsert({
        id: product.id,
        name: product.name,
        category: product.category,
        subCategory: product.subCategory,
        price: product.price,
        data: product
      }).then(null, err => console.warn('Supabase product save error:', err));
    }
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    if (isSupabaseConfigured() && supabase) {
      supabase.from('products').delete().eq('id', productId).then(null, err => console.warn('Supabase product delete error:', err));
    }
  };

  // Category CRUD
  const saveCategory = (category: Category) => {
    const subList = Array.isArray(category.subCategories) ? category.subCategories : [];
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

    if (isSupabaseConfigured() && supabase) {
      supabase.from('categories').upsert({
        id: cleanCategory.id,
        name: cleanCategory.name,
        image: cleanCategory.image || '',
        position: cleanCategory.position,
        isVisibleOnHome: cleanCategory.isVisibleOnHome ?? true,
        data: cleanCategory
      }).then(null, async (err) => {
        console.warn('Category upsert primary notice, trying minimal payload:', err);
        if (supabase) {
          await supabase.from('categories').upsert({
            id: cleanCategory.id,
            data: cleanCategory
          }).then(null, e => console.warn('Category minimal upsert error:', e));
        }
      });
    }
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    if (isSupabaseConfigured() && supabase) {
      supabase.from('categories').delete().eq('id', categoryId).then(null, err => console.warn('Supabase category delete error:', err));
    }
  };

  // Coupon CRUD
  const saveCoupon = (coupon: Coupon) => {
    setCoupons(prev => {
      const exists = prev.some(c => c.id === coupon.id);
      if (exists) {
        return prev.map(c => (c.id === coupon.id ? coupon : c));
      } else {
        return [...prev, coupon];
      }
    });

    if (isSupabaseConfigured() && supabase) {
      supabase.from('coupons').upsert({
        id: coupon.id,
        code: coupon.code,
        data: coupon
      }).then(null, err => console.warn('Supabase coupon save error:', err));
    }
  };

  const deleteCoupon = (couponId: string) => {
    setCoupons(prev => prev.filter(c => c.id !== couponId));
    if (isSupabaseConfigured() && supabase) {
      supabase.from('coupons').delete().eq('id', couponId).then(null, err => console.warn('Supabase coupon delete error:', err));
    }
  };

  // Settings
  const saveSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    if (isSupabaseConfigured() && supabase) {
      supabase.from('settings').upsert({
        id: 'site_settings',
        data: newSettings
      }).then(null, err => console.warn('Supabase settings save error:', err));
    }
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
        saveSettings,
        validateCoupon,
        resetToDefaults
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
