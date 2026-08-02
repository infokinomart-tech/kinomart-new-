export interface Specification {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  category: string;
  subCategory?: string;
  stock: number;
  limitedStockThreshold?: number;
  colors?: string[];
  thumbnail: string;
  gallery: string[];
  videoUrl?: string;
  shortDescription?: string;
  longDescription?: string;
  specifications?: Specification[];
  hasTimer?: boolean;
  timerEndTime?: string;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  rating: number;
  reviewsCount: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Category {
  id: string;
  name: string;
  image?: string;
  position: number;
  isVisibleOnHome: boolean;
  subCategories: string[];
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderAmount?: number;
  isActive: boolean;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
export type CallStatus = 'Not Called' | 'Call Success' | 'Customer Busy' | 'Fake Order' | 'Pending Confirmation';

export interface OrderItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. KM-74646
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  deliveryArea: 'Inside Dhaka' | 'Outside Dhaka';
  deliveryFee: number;
  paymentMethod: 'COD' | 'bKash' | 'Nagad';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  totalPrice: number;
  status: OrderStatus;
  callStatus: CallStatus;
  createdAt: string; // ISO or formatted
  notes?: string;
}

export interface StoreSettings {
  websiteTitle: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  topBannerEnabled: boolean;
  topBannerText: string;
  facebookPixelId: string;
  capiAccessToken: string;
  bkashNumber: string;
  nagadNumber: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  footerAbout: string;
  adminUsername: string;
  adminPasswordHash: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
}

export interface CustomerProfile {
  name: string;
  phone: string;
  address: string;
}

