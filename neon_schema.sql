-- ====================================================================
-- NEON POSTGRES SCHEMA FOR E-COMMERCE (KINOMART)
-- Run this once against your Neon database (psql, Neon SQL editor, etc.)
-- ====================================================================

CREATE TABLE IF NOT EXISTS orders (
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

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT,
  category TEXT,
  sub_category TEXT,
  price NUMERIC,
  stock INTEGER,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT,
  image TEXT,
  position INTEGER DEFAULT 1,
  is_visible_on_home BOOLEAN DEFAULT true,
  sub_categories JSONB,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT,
  discount_amount NUMERIC,
  discount_type TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_profiles (
  phone TEXT PRIMARY KEY,
  name TEXT,
  address TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team (
  id TEXT PRIMARY KEY,
  name TEXT,
  role TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'main_settings',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_categories_position ON categories (position ASC);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons (code);
