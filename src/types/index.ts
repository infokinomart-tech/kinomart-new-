export interface ProductVariant {
  name: string; // e.g. "কালার" or "Color"
  options: string[]; // e.g. ["MINT", "PEACE", "WATERMELON", "GRAPE"]
}

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  customer_name: string;
  phone?: string;
  rating: number; // 1 to 5
  comment: string;
  is_verified_buyer?: boolean;
  created_at: string;
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  is_visible?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  discount_price?: number;
  category_id: string;
  category_name?: string;
  subcategory_id?: string;
  subcategory_name?: string;
  images: string[];
  video_url?: string;
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
  stock: number;
  low_stock_threshold?: number;
  status: 'active' | 'draft';
  is_featured?: boolean;
  is_best_seller?: boolean;
  timer_enabled?: boolean;
  timer_title?: string;
  timer_end_time?: string;
  timer_hours?: number;
  rating?: number;
  reviews_count?: number;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url?: string;
  icon_name?: string;
  display_order: number;
  is_visible: boolean;
  subcategories?: SubCategory[];
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  image: string;
  price: number;
  qty: number;
  selected_variant?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled';

export type CallStatus = 
  | 'not_called' 
  | 'call_success' 
  | 'number_off' 
  | 'did_not_pick' 
  | 'call_later' 
  | 'fake_order';

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  customer_name: string;
  phone: string;
  address: string;
  area: 'inside_dhaka' | 'outside_dhaka';
  shipping_cost: number;
  items: OrderItem[];
  total_revenue: number;
  payment_method: 'cod' | 'bkash' | 'nagad';
  bkash_number?: string;
  transaction_id?: string;
  coupon_code?: string;
  discount_amount?: number;
  order_status: OrderStatus;
  call_status: CallStatus;
  note?: string;
  created_at: string;
}

export interface Customer {
  id: string;
  phone: string;
  name: string;
  address?: string;
  created_at: string;
}

export interface SiteSettings {
  logo_title: string;
  tagline: string;
  logo_url?: string;
  favicon_url?: string;
  phone: string;
  whatsapp: string;
  address: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  banner_images?: string[];
  special_offer_text: string;
  special_offer_active: boolean;
  footer_about: string;
  pixel_id: string;
  capi_token: string;
  bkash_number?: string;
  nagad_number?: string;
  admin_id: string;
  admin_password: string; // Default: Kinomart1
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  message: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  qty: number;
  selected_variant?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  used_count: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}
