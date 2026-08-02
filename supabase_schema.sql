-- ====================================================================
-- SUPABASE DATABASE SCHEMA FOR E-COMMERCE (KINOMART)
-- Execute this SQL in Supabase SQL Editor (https://app.supabase.com)
-- ====================================================================

-- 1. Create 'orders' table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT,
  delivery_area TEXT,
  total_price NUMERIC,
  status TEXT DEFAULT 'Pending',
  call_status TEXT DEFAULT 'Not Called',
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security & Allow Public Read/Write Access
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public full access on orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- 2. Create 'products' table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public full access on products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- 3. Create 'categories' table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public full access on categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- 4. Create 'coupons' table
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public full access on coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

-- 5. Create 'customer_profiles' table
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  phone TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public full access on customer_profiles" ON public.customer_profiles FOR ALL USING (true) WITH CHECK (true);

-- 6. Create 'settings' table
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'main_settings',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public full access on settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
