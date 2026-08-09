export interface ProductBundle {
  id: string;
  title: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  badgeText?: string;
  tagText?: string;
  isPopular?: boolean;
}

export interface Specification {
  key: string;
  value: string;
}

export interface Review {
  id: string;
  userName: string;
  userRole?: string;
  rating: number;
  comment: string;
  date?: string;
  isVerifiedPurchase?: boolean;
  image?: string;
  avatarColor?: string;
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
  bundles?: ProductBundle[];
  hasTimer?: boolean;
  timerTitle?: string;
  timerEndTime?: string;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  rating: number;
  reviewsCount: number;
  reviews?: Review[];
  reviewImages?: string[];
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
  senderPhone?: string;
  trxId?: string;
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
  deliveryFeeInside?: number;
  deliveryFeeOutside?: number;
  supabaseUrl?: string;
  supabaseKey?: string;
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

export interface MockSMSLog {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  message: string;
  status: 'DELIVERED' | 'FAILED' | 'SENDING';
  sentAt: string;
  gateway: string;
  messageId: string;
}

