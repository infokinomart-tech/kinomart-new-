import { Product, Category, Order, SiteSettings, ContactMessage, ProductReview, Coupon } from '../types';

const productsCacheMap = new Map<string, Product>();
let allProductsCache: Product[] | null = null;
let allProductsCacheTime = 0;

async function safeFetchJson(url: string, options?: RequestInit, defaultErrMsg = 'সার্ভার সমস্যা হয়েছে'): Promise<any> {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (err: any) {
    throw new Error('নেটওয়ার্ক বা কানেকশন ত্রুটি হয়েছে। অনুগ্রহ করে পেজ রিফ্রেশ করে আবার চেষ্টা করুন।');
  }

  const contentType = res.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (e) {
      // JSON parse error
    }
  }

  if (!res.ok) {
    const errorText = data?.error || data?.message || (typeof data === 'string' ? data : null);
    if (errorText) throw new Error(errorText);
    const rawText = await res.text().catch(() => '');
    if (rawText && !rawText.startsWith('<')) {
      throw new Error(rawText.substring(0, 100));
    }
    throw new Error(defaultErrMsg + ` (${res.status})`);
  }

  if (data !== null && data !== undefined) return data;

  try {
    return await res.json();
  } catch (e) {
    throw new Error(defaultErrMsg);
  }
}

export const api = {
  getCachedProduct(identifier: string): Product | undefined {
    return productsCacheMap.get(identifier);
  },

  clearProductCache() {
    allProductsCache = null;
    allProductsCacheTime = 0;
    productsCacheMap.clear();
  },

  setProductCache(products: Product[]) {
    allProductsCache = products;
    allProductsCacheTime = Date.now();
    products.forEach(p => {
      if (p.id) productsCacheMap.set(p.id, p);
      if (p.slug) productsCacheMap.set(p.slug, p);
    });
  },

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    return safeFetchJson('/api/coupons', undefined, 'কুপন লোড করতে ব্যর্থ হয়েছে');
  },

  async createCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
    const data = await safeFetchJson('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coupon)
    }, 'কুপন তৈরি করতে ব্যর্থ হয়েছে');
    return data.coupon || data;
  },

  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
    const data = await safeFetchJson(`/api/coupons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }, 'কুপন আপডেট করতে ব্যর্থ হয়েছে');
    return data.coupon || data;
  },

  async deleteCoupon(id: string): Promise<void> {
    await safeFetchJson(`/api/coupons/${id}`, { method: 'DELETE' }, 'কুপন ডিলিট করতে ব্যর্থ হয়েছে');
  },

  async validateCoupon(code: string, cart_total: number): Promise<{
    valid: boolean;
    coupon_code?: string;
    discount_type?: 'fixed' | 'percentage';
    discount_value?: number;
    discount_amount?: number;
    message: string;
  }> {
    return safeFetchJson('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, cart_total })
    }, 'কুপন যাচাই করতে ব্যর্থ হয়েছে');
  },

  // Settings
  async getSettings(): Promise<SiteSettings> {
    return safeFetchJson('/api/settings', undefined, 'সেটিংস লোড করতে ব্যর্থ হয়েছে');
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const data = await safeFetchJson('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    }, 'সেটিংস সেভ করতে ব্যর্থ হয়েছে');
    return data.settings || data;
  },

  // Admin Auth
  async adminLogin(admin_id: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      return await safeFetchJson('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id, password })
      }, 'এডমিন লগইন করতে ব্যর্থ হয়েছে');
    } catch (e: any) {
      console.error('Admin login error:', e);
      return { success: false, error: e?.message || 'সার্ভারের সাথে যোগাযোগ করতে সমস্যা হয়েছে।' };
    }
  },

  async adminChangePassword(old_password: string, new_password: string, new_admin_id?: string): Promise<{ success: boolean; admin_id?: string; error?: string }> {
    return safeFetchJson('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ old_password, new_password, new_admin_id })
    }, 'পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছে');
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    return safeFetchJson('/api/categories', undefined, 'ক্যাটাগরি লোড করতে ব্যর্থ হয়েছে');
  },

  async resetCategories(): Promise<Category[]> {
    const data = await safeFetchJson('/api/categories/reset', { method: 'POST' }, 'ক্যাটাগরি রিসেট করতে ব্যর্থ হয়েছে');
    return data.categories || data;
  },

  async createCategory(cat: Partial<Category>): Promise<Category> {
    const data = await safeFetchJson('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat)
    }, 'ক্যাটাগরি তৈরি করতে ব্যর্থ হয়েছে');
    return data.category || data;
  },

  async updateCategory(id: string, cat: Partial<Category>): Promise<Category> {
    const data = await safeFetchJson(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat)
    }, 'ক্যাটাগরি আপডেট করতে ব্যর্থ হয়েছে');
    return data.category || data;
  },

  async deleteCategory(id: string): Promise<void> {
    await safeFetchJson(`/api/categories/${id}`, { method: 'DELETE' }, 'ক্যাটাগরি ডিলিট করতে ব্যর্থ হয়েছে');
  },

  // Products
  async resetProducts(): Promise<Product[]> {
    const data = await safeFetchJson('/api/products/reset', { method: 'POST' }, 'প্রোডাক্ট রিসেট করতে ব্যর্থ হয়েছে');
    this.clearProductCache();
    return data.products || data;
  },

  async getProducts(params?: { category?: string; search?: string; sort?: string; status?: string }): Promise<Product[]> {
    const hasParams = params && Object.keys(params).some(k => Boolean((params as any)[k]));
    if (!hasParams && allProductsCache && (Date.now() - allProductsCacheTime < 2000)) {
      return allProductsCache;
    }

    const url = new URL('/api/products', window.location.origin);
    if (params?.category) url.searchParams.set('category', params.category);
    if (params?.search) url.searchParams.set('search', params.search);
    if (params?.sort) url.searchParams.set('sort', params.sort);
    if (params?.status) url.searchParams.set('status', params.status);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch products');
    const products: Product[] = await res.json();
    if (!hasParams) {
      this.setProductCache(products);
    } else {
      products.forEach(p => {
        if (p.id) productsCacheMap.set(p.id, p);
        if (p.slug) productsCacheMap.set(p.slug, p);
      });
    }
    return products;
  },

  async getProduct(identifier: string): Promise<Product> {
    const res = await fetch(`/api/products/${identifier}`);
    if (!res.ok) throw new Error('Product not found');
    const data: Product = await res.json();
    productsCacheMap.set(data.id, data);
    if (data.slug) productsCacheMap.set(data.slug, data);
    return data;
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    const data = await safeFetchJson('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    }, 'প্রোডাক্ট সেভ করতে ব্যর্থ হয়েছে');
    this.clearProductCache();
    return data.product || data;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const data = await safeFetchJson(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    }, 'প্রোডাক্ট আপডেট করতে ব্যর্থ হয়েছে');
    this.clearProductCache();
    return data.product || data;
  },

  async deleteProduct(id: string): Promise<void> {
    await safeFetchJson(`/api/products/${id}`, { method: 'DELETE' }, 'প্রোডাক্ট ডিলিট করতে ব্যর্থ হয়েছে');
    this.clearProductCache();
  },

  // Reviews
  async getProductReviews(identifier: string): Promise<ProductReview[]> {
    try {
      return await safeFetchJson(`/api/products/${identifier}/reviews`);
    } catch (e) {
      return [];
    }
  },

  async addProductReview(identifier: string, review: { customer_name: string; rating: number; comment: string; phone?: string }): Promise<{ success: boolean; review: ProductReview; new_rating: number; reviews_count: number }> {
    return safeFetchJson(`/api/products/${identifier}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    }, 'রিভিউ জমা দেওয়া সম্ভব হয়নি');
  },

  // Orders
  async getOrders(params?: { status?: string; call_status?: string; search?: string; from?: string; to?: string }): Promise<Order[]> {
    const url = new URL('/api/orders', window.location.origin);
    if (params?.status) url.searchParams.set('status', params.status);
    if (params?.call_status) url.searchParams.set('call_status', params.call_status);
    if (params?.search) url.searchParams.set('search', params.search);
    if (params?.from) url.searchParams.set('from', params.from);
    if (params?.to) url.searchParams.set('to', params.to);

    return safeFetchJson(url.toString(), undefined, 'অর্ডার লোড করতে ব্যর্থ হয়েছে');
  },

  async createOrder(orderData: any): Promise<{ success: boolean; order: Order; customer: any; token: string }> {
    return safeFetchJson('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    }, 'অর্ডার করতে সমস্যা হয়েছে');
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const data = await safeFetchJson(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }, 'অর্ডার আপডেট করতে ব্যর্থ হয়েছে');
    return data.order || data;
  },

  async deleteOrder(id: string): Promise<void> {
    await safeFetchJson(`/api/orders/${id}`, { method: 'DELETE' }, 'অর্ডার ডিলিট করতে ব্যর্থ হয়েছে');
  },

  async getCustomerOrders(phone: string): Promise<Order[]> {
    const res = await fetch(`/api/customer/orders?phone=${encodeURIComponent(phone)}`);
    if (!res.ok) return [];
    return res.json();
  },

  // Contact
  async sendContactMessage(msg: { name: string; phone: string; message: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    });
    return res.json();
  },

  async getContactMessages(): Promise<ContactMessage[]> {
    const res = await fetch('/api/contact');
    if (!res.ok) return [];
    return res.json();
  },

  async syncToSupabase(): Promise<{ success: boolean; message: string; counts?: any; error?: string }> {
    return safeFetchJson('/api/sync-to-supabase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, 'Supabase-এ ডাটা সেভ করতে ব্যর্থ হয়েছে');
  }
};
