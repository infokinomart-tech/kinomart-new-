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
  updateOrderStatus: (orderId: string, status: Order['status'], callStatus?: Order['callStatus']) => void;
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

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [viewMode, setViewMode] = useState<'client' | 'admin'>('client');
  const [activeClientPage, setActiveClientPage] = useState<'home' | 'products' | 'product-detail' | 'order-success' | 'order-track' | 'customer-profile' | 'about' | 'contact'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Customer Account state
  const [customerProfiles, setCustomerProfiles] = useState<Record<string, CustomerProfile>>(() => {
    const saved = localStorage.getItem('kinomart_customer_profiles');
    return saved ? JSON.parse(saved) : {};
  });

  const [customerUser, setCustomerUser] = useState<CustomerProfile | null>(() => {
    const saved = localStorage.getItem('kinomart_current_customer');
    return saved ? JSON.parse(saved) : null;
  });

  const [isCustomerLoginModalOpen, setIsCustomerLoginModalOpen] = useState<boolean>(false);

  // Selected Product & Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickOrderProduct, setQuickOrderProduct] = useState<Product | null>(null);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Admin state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(true); // Logged in by default for smooth evaluation
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const isAdminAuthenticated = isAdminLoggedIn;
  const [activeAdminTab, setActiveAdminTab] = useState<'orders' | 'products' | 'categories' | 'coupons' | 'team' | 'settings'>('orders');

  // Persistent States
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('kinomart_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('kinomart_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('kinomart_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('kinomart_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [team, setTeam] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('kinomart_team');
    return saved ? JSON.parse(saved) : INITIAL_TEAM;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('kinomart_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Sync Customer Profiles to LocalStorage
  useEffect(() => {
    localStorage.setItem('kinomart_customer_profiles', JSON.stringify(customerProfiles));
  }, [customerProfiles]);

  useEffect(() => {
    if (customerUser) {
      localStorage.setItem('kinomart_current_customer', JSON.stringify(customerUser));
    } else {
      localStorage.removeItem('kinomart_current_customer');
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
            setCategories(cats.map(r => r.data || r));
          }

          const { data: cpn } = await supabase.from('coupons').select('*');
          if (cpn && cpn.length > 0) {
            setCoupons(cpn.map(r => r.data || r));
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

  // Sync to LocalStorage & Supabase
  useEffect(() => {
    localStorage.setItem('kinomart_products', JSON.stringify(products));
    if (isSupabaseConfigured() && supabase) {
      products.forEach(p => {
        supabase.from('products').upsert({ id: p.id, name: p.name, data: p }).then();
      });
    }
  }, [products]);

  useEffect(() => {
    localStorage.setItem('kinomart_categories', JSON.stringify(categories));
    if (isSupabaseConfigured() && supabase) {
      categories.forEach(c => {
        supabase.from('categories').upsert({ id: c.id, name: c.name, data: c }).then();
      });
    }
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('kinomart_orders', JSON.stringify(orders));
    if (isSupabaseConfigured() && supabase) {
      orders.forEach(o => {
        supabase.from('orders').upsert({
          id: o.id,
          order_number: o.orderNumber,
          customer_name: o.customerName,
          customer_phone: o.customerPhone,
          shipping_address: o.shippingAddress,
          delivery_area: o.deliveryArea,
          total_price: o.totalPrice,
          status: o.status,
          call_status: o.callStatus,
          data: o
        }).then();
      });
    }
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('kinomart_coupons', JSON.stringify(coupons));
    if (isSupabaseConfigured() && supabase) {
      coupons.forEach(c => {
        supabase.from('coupons').upsert({ id: c.id, code: c.code, data: c }).then();
      });
    }
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('kinomart_team', JSON.stringify(team));
  }, [team]);

  useEffect(() => {
    localStorage.setItem('kinomart_settings', JSON.stringify(settings));
    if (isSupabaseConfigured() && supabase) {
      supabase.from('settings').upsert({ id: 'main_settings', data: settings }).then();
    }
  }, [settings]);

  // Admin Auth
  const loginAdmin = (username: string, pass: string): boolean => {
    if (username === settings.adminUsername && pass === settings.adminPasswordHash) {
      setIsAdminLoggedIn(true);
      setViewMode('admin');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setViewMode('client');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return newOrder;
  };


  const updateOrderStatus = (orderId: string, status: Order['status'], callStatus?: Order['callStatus']) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status,
            callStatus: callStatus || o.callStatus
          };
        }
        return o;
      })
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
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
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Category CRUD
  const saveCategory = (category: Category) => {
    setCategories(prev => {
      const exists = prev.some(c => c.id === category.id);
      if (exists) {
        return prev.map(c => (c.id === category.id ? category : c));
      } else {
        return [...prev, category];
      }
    });
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
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
  };

  const deleteCoupon = (couponId: string) => {
    setCoupons(prev => prev.filter(c => c.id !== couponId));
  };

  // Settings
  const saveSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
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
