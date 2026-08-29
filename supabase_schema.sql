-- ====================================================================
-- SUPABASE DATABASE SCHEMA FOR E-COMMERCE (KINOMART)
-- Execute this SQL in Supabase SQL Editor (https://app.supabase.com)
-- ====================================================================

-- 1. Create 'orders' table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  shipping_address TEXT,
  delivery_area TEXT,
  total_price NUMERIC,
  status TEXT DEFAULT 'Pending',
  call_status TEXT DEFAULT 'Not Called',
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all order columns exist if table was created previously
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS call_status TEXT DEFAULT 'Not Called';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_area TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_price NUMERIC;

-- 2. Create 'products' table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT,
  category TEXT,
  sub_category TEXT,
  price NUMERIC,
  stock INTEGER,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create 'categories' table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT,
  image TEXT,
  position INTEGER DEFAULT 1,
  is_visible_on_home BOOLEAN DEFAULT true,
  sub_categories JSONB,
  data JSONB NOT NULL
);

-- 4. Create 'coupons' table
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY,
  code TEXT,
  discount_amount NUMERIC,
  discount_type TEXT,
  data JSONB NOT NULL
);

-- 5. Create 'customer_profiles' table
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  phone TEXT PRIMARY KEY,
  name TEXT,
  address TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create 'team' table
CREATE TABLE IF NOT EXISTS public.team (
  id TEXT PRIMARY KEY,
  name TEXT,
  role TEXT,
  data JSONB NOT NULL
);

-- 7. Create 'settings' table
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'main_settings',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable Row Level Security (RLS) so Client App & Admin can read/write smoothly
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- High-performance indexes for instant queries across all devices
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_categories_position ON public.categories (position ASC);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons (code);

-- Allow public access policies (In case RLS is forced on by project)
DO $$ BEGIN CREATE POLICY "Public All Orders" ON public.orders FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public All Products" ON public.products FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public All Categories" ON public.categories FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public All Coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public All Settings" ON public.settings FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public All Team" ON public.team FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public All Customers" ON public.customer_profiles FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Grant permissions to public anon role
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres, service_role;
