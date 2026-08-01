-- ========================================================
-- KinoMart Complete Supabase Database Schema & Fix Script
-- ========================================================
-- Instructions:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/_/sql
-- 2. Click "New Query"
-- 3. Paste this entire script and click "Run"
-- ========================================================

-- --------------------------------------------------------
-- 1. Master Backup JSON Store (Fail-safe storage)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_data (
    id TEXT PRIMARY KEY DEFAULT 'main',
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- 2. Categories Table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    icon_name TEXT DEFAULT 'Grid',
    icon_url TEXT,
    display_order INTEGER DEFAULT 1,
    is_visible BOOLEAN DEFAULT TRUE,
    subcategories JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table existed previously
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon_name TEXT DEFAULT 'Grid';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon_url TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 1;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS subcategories JSONB DEFAULT '[]'::jsonb;

-- --------------------------------------------------------
-- 3. Products Table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    discount_price NUMERIC,
    category_id TEXT,
    category_name TEXT,
    subcategory_id TEXT,
    subcategory_name TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    video_url TEXT,
    variants JSONB DEFAULT '[]'::jsonb,
    specifications JSONB DEFAULT '[]'::jsonb,
    stock INTEGER DEFAULT 50,
    low_stock_threshold INTEGER DEFAULT 10,
    status TEXT DEFAULT 'active',
    is_featured BOOLEAN DEFAULT FALSE,
    is_best_seller BOOLEAN DEFAULT FALSE,
    timer_enabled BOOLEAN DEFAULT FALSE,
    timer_title TEXT,
    timer_end_time TEXT,
    timer_hours NUMERIC,
    rating NUMERIC DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 1,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table existed previously
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory_id TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory_name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS timer_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS timer_title TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS timer_end_time TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS timer_hours NUMERIC;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- --------------------------------------------------------
-- 4. Orders Table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    invoice_id TEXT,
    order_number TEXT,
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Dhaka',
    area TEXT DEFAULT 'inside_dhaka',
    courier TEXT DEFAULT 'Steadfast',
    items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC DEFAULT 0,
    delivery_fee NUMERIC DEFAULT 60,
    shipping_cost NUMERIC DEFAULT 60,
    discount NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    total_revenue NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending',
    order_status TEXT DEFAULT 'pending',
    payment_method TEXT DEFAULT 'cod',
    payment_status TEXT DEFAULT 'unpaid',
    bkash_number TEXT,
    transaction_id TEXT,
    trx_id TEXT,
    coupon_code TEXT,
    call_status TEXT DEFAULT 'not_called',
    note TEXT,
    order_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table existed previously
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS invoice_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Dhaka';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier TEXT DEFAULT 'Steadfast';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 60;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS trx_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_notes TEXT;

-- --------------------------------------------------------
-- 5. Customers Table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    password TEXT DEFAULT 'customer123',
    address TEXT,
    orders_count INTEGER DEFAULT 0,
    total_spent NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'customer123';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS orders_count INTEGER DEFAULT 0;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS total_spent NUMERIC DEFAULT 0;

-- --------------------------------------------------------
-- 6. Coupons Table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    type TEXT DEFAULT 'fixed',
    discount_type TEXT DEFAULT 'fixed',
    amount NUMERIC DEFAULT 0,
    discount_value NUMERIC DEFAULT 0,
    min_order_amount NUMERIC DEFAULT 0,
    max_discount_amount NUMERIC,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    expires_at TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'fixed';
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0;

-- --------------------------------------------------------
-- 7. Reviews Table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT,
    rating NUMERIC DEFAULT 5.0,
    comment TEXT NOT NULL,
    is_verified_buyer BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- 8. Settings Table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'store_settings',
    store_name TEXT DEFAULT 'KinoMart',
    logo_title TEXT DEFAULT 'KinoMart',
    tagline TEXT,
    logo_url TEXT,
    favicon_url TEXT,
    phone TEXT DEFAULT '01700000000',
    whatsapp TEXT DEFAULT '01700000000',
    address TEXT DEFAULT 'ঢাকা, বাংলাদেশ',
    bkash_number TEXT DEFAULT '01700123456',
    nagad_number TEXT DEFAULT '01700123456',
    hero_title TEXT DEFAULT 'প্রিমিয়াম গ্যাজেটের নির্ভরযোগ্য ঠিকানা',
    hero_subtitle TEXT DEFAULT 'সেরা অফারে অরিজিনাল গ্যাজেট কিনুন কীনোমার্ট থেকে',
    hero_image TEXT,
    banner_images JSONB DEFAULT '[]'::jsonb,
    special_offer_text TEXT,
    special_offer_active BOOLEAN DEFAULT TRUE,
    inside_dhaka_charge NUMERIC DEFAULT 70,
    outside_dhaka_charge NUMERIC DEFAULT 130,
    free_shipping_min NUMERIC DEFAULT 3000,
    header_notice TEXT DEFAULT '⚡ কীনোমার্ট এ পাচ্ছেন দেশজুড়ে দ্রুত ক্যাশ অন ডেলিভারি এবং ১০০% অরিজিনাল গ্যাজেটের নিশ্চয়তা!',
    footer_about TEXT DEFAULT 'কীনোমার্ট বাংলাদেশের একটি বিশ্বস্ত প্রিমিয়াম গ্যাজেট অনলাইন শপ। আমরা সরবরাহ করি ১০০% অরিজিনাল ও মানসম্মত ইলেকট্রনিক্স গ্যাজেট।',
    pixel_id TEXT DEFAULT '123456789012345',
    capi_token TEXT DEFAULT 'EAA123456789ABCDEF...',
    admin_id TEXT DEFAULT 'kinomart',
    admin_password TEXT DEFAULT '@kinomart12@',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS favicon_url TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS special_offer_text TEXT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS special_offer_active BOOLEAN DEFAULT TRUE;

-- --------------------------------------------------------
-- 9. Disable Row Level Security (RLS) for seamless API Access
-- --------------------------------------------------------
ALTER TABLE public.store_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- Grant public read/write access just in case
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
