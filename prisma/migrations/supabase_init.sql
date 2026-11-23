-- ============================================================================
-- OtakuBazaar Supabase PostgreSQL Production DDL Migration
--
-- This script creates the persistent schema for users/sellers, listings,
-- listing_images, orders, disputes, negotiations, and metadata caches.
--
-- You can run this directly in the Supabase SQL Editor if provisioning
-- a new Supabase database instance.
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users / Sellers Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT NOT NULL DEFAULT '/avatars/rengoku.png',
    rating DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    total_sales INTEGER NOT NULL DEFAULT 0,
    total_purchases INTEGER NOT NULL DEFAULT 0,
    verified_upi_vpa TEXT,
    role TEXT NOT NULL DEFAULT 'SELLER',
    seller_badges TEXT NOT NULL DEFAULT '[]',
    revoked_badges TEXT NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. Listings Table
CREATE TABLE IF NOT EXISTS public.listings (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    seller_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_urls TEXT NOT NULL DEFAULT '[]',
    asking_price_amount INTEGER NOT NULL, -- in paise (minor currency units)
    asking_price_currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    category TEXT NOT NULL DEFAULT 'Scale Figure',
    condition TEXT NOT NULL DEFAULT 'NEW',
    franchise TEXT,
    scale TEXT,
    manufacturer TEXT,
    reserved_by_buyer_id TEXT,
    mfc_item_id TEXT,
    mfc_url TEXT,
    original_price_jpy INTEGER,
    release_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);

-- 4. Listing Images Table (Individual persistent uploaded photo records)
CREATE TABLE IF NOT EXISTS public.listing_images (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    listing_id TEXT NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON public.listing_images(listing_id);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    listing_id TEXT NOT NULL REFERENCES public.listings(id) ON DELETE RESTRICT,
    buyer_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    seller_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    amount_paise INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    escrow_status TEXT NOT NULL DEFAULT 'HELD',
    payment_reference TEXT,
    shipping_awb TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_listing_id ON public.orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);

-- 6. Disputes Table
CREATE TABLE IF NOT EXISTS public.disputes (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    seller_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    buyer_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'OPEN',
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON public.disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_seller_id ON public.disputes(seller_id);

-- 7. Negotiations Table
CREATE TABLE IF NOT EXISTS public.negotiations (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    listing_id TEXT NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    buyer_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    seller_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    current_price INTEGER NOT NULL,
    current_turn_actor_id TEXT NOT NULL,
    round_count INTEGER NOT NULL DEFAULT 1,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_negotiations_listing_id ON public.negotiations(listing_id);

-- 8. MFC Cache Table
CREATE TABLE IF NOT EXISTS public.mfc_cache (
    mfc_item_id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
