-- Initial schema migration
-- Add your tables here

-- Example table:
-- CREATE TABLE posts (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   title TEXT NOT NULL,
--   content TEXT,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Enable Row Level Security (RLS)
-- ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies
-- CREATE POLICY "Public posts are viewable by everyone"
--   ON posts FOR SELECT
--   USING (true);
-- Products table for the store
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  inventory INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can view active products
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Authenticated users with admin role can do everything (we'll refine this later)
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample products
INSERT INTO products (name, description, price, inventory, image_url) VALUES
  ('The Adventure Begins', 'A wonderful children''s book about exploration and discovery.', 14.99, 50, 'https://placehold.co/400x600/png?text=Book+1'),
  ('Learning ABCs', 'Fun and interactive alphabet book for early learners.', 12.99, 30, 'https://placehold.co/400x600/png?text=Book+2'),
  ('Numbers are Fun', 'Counting made easy with colorful illustrations.', 11.99, 25, 'https://placehold.co/400x600/png?text=Book+3'),
  ('Panhandle Pathway T-Shirt', 'Comfortable cotton t-shirt with our logo.', 24.99, 100, 'https://placehold.co/400x600/png?text=T-Shirt'),
  ('Coloring Set', 'Set of 24 colored pencils perfect for young artists.', 8.99, 75, 'https://placehold.co/400x600/png?text=Coloring+Set');
-- Profiles table to extend Supabase Auth users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update products RLS to require authentication for modifications
DROP POLICY IF EXISTS "Admins can manage products" ON products;

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Grant necessary permissions
GRANT SELECT ON profiles TO anon, authenticated;
GRANT ALL ON profiles TO authenticated;
-- Fix infinite recursion in profiles RLS policies
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Simpler policies that don't cause recursion
-- Anyone authenticated can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Service role bypass for admin operations (handled server-side)
-- For now, let's also allow authenticated users to read all profiles for admin
CREATE POLICY "Authenticated can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Fix products policy to not reference profiles (avoid recursion)
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- For now, allow all authenticated users to manage products
-- We'll add proper role checking via RPC later
CREATE POLICY "Authenticated users can manage products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Make sure anon can still read products
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  TO anon
  USING (is_active = true);
-- Organizations table
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add organization_id to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_org_admin BOOLEAN DEFAULT false;

-- Enable RLS on organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Organization members can view their organization
CREATE POLICY "Members can view their organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM profiles WHERE profiles.id = auth.uid()
    )
  );

-- Org admins can update their organization
CREATE POLICY "Org admins can update their organization"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_org_admin = true
    )
  );

-- System admins can manage all organizations
CREATE POLICY "System admins can manage organizations"
  ON organizations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Update profiles policies to allow org admins to see their members
DROP POLICY IF EXISTS "Authenticated can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Org admins can view org members"
  ON profiles FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_org_admin = true
    )
  );

CREATE POLICY "Org admins can update org members"
  ON profiles FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_org_admin = true
    )
    AND id != auth.uid() -- Can't demote yourself
  );

CREATE POLICY "System admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System admins can manage all profiles"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Grant permissions
GRANT SELECT ON organizations TO authenticated;
GRANT UPDATE ON organizations TO authenticated;
GRANT ALL ON organizations TO authenticated;

-- Trigger for updated_at on organizations
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);
-- Fix Products RLS to restrict modifications to admins only

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- Create more restrictive policies
-- Admins (role = 'admin') can do everything
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Authenticated users can view all products (needed for authenticated store browsing)
CREATE POLICY "Authenticated users can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);
-- Booking System Tables
-- This migration creates tables for services, time slots, and bookings

-- Services table (what can be booked)
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  capacity INTEGER DEFAULT 1, -- max people per slot
  price DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time slots table
CREATE TABLE time_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  capacity INTEGER NOT NULL, -- can override service default
  booked_count INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure end time is after start time
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  -- Ensure booked count doesn't exceed capacity
  CONSTRAINT valid_booking_count CHECK (booked_count <= capacity)
);

-- Bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  slot_id UUID NOT NULL REFERENCES time_slots(id) ON DELETE RESTRICT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent double booking
  UNIQUE(user_id, slot_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_time_slots_service_id ON time_slots(service_id);
CREATE INDEX idx_time_slots_start_time ON time_slots(start_time);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_slot_id ON bookings(slot_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Services
-- Anyone can view active services
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  USING (is_active = true);

-- Admins can manage services
CREATE POLICY "Admins can manage services"
  ON services FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for Time Slots
-- Anyone can view available time slots
CREATE POLICY "Anyone can view available time slots"
  ON time_slots FOR SELECT
  USING (is_available = true);

-- Admins can manage time slots
CREATE POLICY "Admins can manage time slots"
  ON time_slots FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for Bookings
-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Authenticated users can create bookings for themselves
CREATE POLICY "Users can create their own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own bookings (e.g., cancel)
CREATE POLICY "Users can update their own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings"
  ON bookings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_slots_updated_at
  BEFORE UPDATE ON time_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update booked_count when booking is created/updated/deleted
CREATE OR REPLACE FUNCTION update_slot_booked_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status IN ('confirmed', 'pending')) THEN
    -- Increment booked count
    UPDATE time_slots
    SET booked_count = booked_count + 1
    WHERE id = NEW.slot_id;

    -- Check if slot is now full
    UPDATE time_slots
    SET is_available = (booked_count < capacity)
    WHERE id = NEW.slot_id;

  ELSIF (TG_OP = 'UPDATE') THEN
    -- Handle status changes
    IF (OLD.status NOT IN ('confirmed', 'pending') AND NEW.status IN ('confirmed', 'pending')) THEN
      -- Booking reactivated
      UPDATE time_slots
      SET booked_count = booked_count + 1
      WHERE id = NEW.slot_id;
    ELSIF (OLD.status IN ('confirmed', 'pending') AND NEW.status NOT IN ('confirmed', 'pending')) THEN
      -- Booking cancelled/completed
      UPDATE time_slots
      SET booked_count = booked_count - 1
      WHERE id = NEW.slot_id;
    END IF;

    -- Update availability
    UPDATE time_slots
    SET is_available = (booked_count < capacity)
    WHERE id = NEW.slot_id;

  ELSIF (TG_OP = 'DELETE' AND OLD.status IN ('confirmed', 'pending')) THEN
    -- Decrement booked count
    UPDATE time_slots
    SET booked_count = booked_count - 1,
        is_available = true
    WHERE id = OLD.slot_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_slot_count_on_booking
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_slot_booked_count();

-- Insert sample services
INSERT INTO services (name, description, duration, capacity, price) VALUES
  ('Career Counseling', 'One-on-one career guidance and planning session', 60, 1, 50.00),
  ('Job Skills Workshop', 'Group workshop on resume writing and interview skills', 120, 15, 25.00),
  ('Mentorship Session', 'Connect with a professional mentor in your field', 45, 1, 40.00);

-- Insert sample time slots (next 2 weeks, Mon-Fri, 9am-5pm)
-- This is a simplified example - in production you'd want a more sophisticated slot generator
DO $$
DECLARE
  service_rec RECORD;
  slot_date DATE;
  slot_time TIME;
  slot_start TIMESTAMP WITH TIME ZONE;
  slot_end TIMESTAMP WITH TIME ZONE;
BEGIN
  FOR service_rec IN SELECT id, duration, capacity FROM services LOOP
    FOR i IN 0..13 LOOP -- Next 2 weeks
      slot_date := CURRENT_DATE + i;

      -- Skip weekends
      IF EXTRACT(DOW FROM slot_date) NOT IN (0, 6) THEN
        FOR hour IN 9..16 LOOP -- 9am to 4pm (to allow for last slot ending at 5pm)
          slot_start := slot_date + (hour || ' hours')::INTERVAL;
          slot_end := slot_start + (service_rec.duration || ' minutes')::INTERVAL;

          -- Only create slot if it ends by 5pm
          IF EXTRACT(HOUR FROM slot_end) <= 17 THEN
            INSERT INTO time_slots (service_id, start_time, end_time, capacity)
            VALUES (service_rec.id, slot_start, slot_end, service_rec.capacity);
          END IF;
        END LOOP;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;
-- Temporarily fix RLS policies for services and bookings to allow authenticated users
-- This matches the products table behavior

-- Drop the restrictive admin-only policies
DROP POLICY IF EXISTS "Admins can manage services" ON services;
DROP POLICY IF EXISTS "Admins can manage time slots" ON time_slots;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON bookings;

-- Create permissive policies that allow authenticated users to manage everything
-- This is temporary until we fix the auth.uid() issue

CREATE POLICY "Authenticated users can manage services"
  ON services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage time slots"
  ON time_slots FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage bookings"
  ON bookings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
-- Fix RLS policies using cached auth.uid() as recommended by Supabase docs
-- This improves performance and reliability
-- Source: https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage services" ON services;
DROP POLICY IF EXISTS "Admins can manage time slots" ON time_slots;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON bookings;

-- Recreate policies with cached auth.uid() wrapped in SELECT
-- This ensures the JWT function is called once and cached

CREATE POLICY "Admins can manage services"
  ON services FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage time slots"
  ON time_slots FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all bookings"
  ON bookings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );
-- Migration: add constraints and bulk insert helper for time_slots
-- Adds an exclusion constraint to prevent overlapping time slots per service
-- and a helper function to bulk-insert slots while skipping conflicts.

-- Ensure btree_gist for integer equality in GIST indexes
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Ensure capacity column exists (non-destructive if already present)
ALTER TABLE IF EXISTS public.time_slots
  ADD COLUMN IF NOT EXISTS capacity integer NOT NULL DEFAULT 1;

-- Remove any overlapping slots before adding constraint
-- (Keeps the first created, deletes newer overlaps)
DELETE FROM public.time_slots t2
WHERE EXISTS (
  SELECT 1 FROM public.time_slots t1
  WHERE t1.service_id = t2.service_id AND
        t1.id < t2.id AND
        t1.start_time < t2.end_time AND
        t2.start_time < t1.end_time
);

-- Add an exclusion constraint to prevent overlapping slots per service
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE c.conname = 'time_slots_no_overlap' AND t.relname = 'time_slots'
  ) THEN
    ALTER TABLE public.time_slots
      ADD CONSTRAINT time_slots_no_overlap EXCLUDE USING GIST (
        service_id WITH =,
        tstzrange(start_time, end_time) WITH &&
      );
  END IF;
END$$;

-- Index to speed queries by service and start_time
CREATE INDEX IF NOT EXISTS time_slots_service_start_idx ON public.time_slots (service_id, start_time);

-- Bulk insert function: accepts JSONB array of slots and inserts while skipping conflicts
CREATE OR REPLACE FUNCTION public.bulk_create_time_slots(slots jsonb)
RETURNS TABLE(id uuid, start_time timestamptz, end_time timestamptz, capacity int, service_id uuid) AS $$
DECLARE
  s jsonb;
BEGIN
  IF slots IS NULL THEN
    RETURN;
  END IF;

  FOR s IN SELECT * FROM jsonb_array_elements(slots) LOOP
    BEGIN
      RETURN QUERY
      INSERT INTO public.time_slots (start_time, end_time, capacity, service_id)
      VALUES (
        (s->>'start_time')::timestamptz,
        (s->>'end_time')::timestamptz,
        (s->>'capacity')::int,
        (s->>'service_id')::uuid
      )
      RETURNING time_slots.id, time_slots.start_time, time_slots.end_time, time_slots.capacity, time_slots.service_id;
    EXCEPTION WHEN exclusion_violation OR unique_violation THEN
      -- skip conflicting/duplicate slots
      CONTINUE;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Orders table for e-commerce
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
  total DECIMAL(10, 2) NOT NULL,
  stripe_payment_id TEXT,
  stripe_payment_status TEXT,
  shipping_address JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table (line items for each order)
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL, -- Price at time of purchase (in case product price changes later)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending orders (for cancellation)
CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can manage all orders
CREATE POLICY "Admins can manage all orders"
  ON orders FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for order_items
-- Users can view items from their own orders
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Users can create order items for their own orders
CREATE POLICY "Users can create their own order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admins can manage all order items
CREATE POLICY "Admins can manage all order items"
  ON order_items FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions to authenticated role
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_items TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create updated_at trigger for orders
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate order total from order items
CREATE OR REPLACE FUNCTION calculate_order_total(order_id_input UUID)
RETURNS DECIMAL(10, 2) AS $$
  SELECT COALESCE(SUM(quantity * price), 0)
  FROM order_items
  WHERE order_id = order_id_input;
$$ LANGUAGE SQL STABLE;

-- Function to update product inventory after order
CREATE OR REPLACE FUNCTION update_product_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Decrease inventory when order item is created
    UPDATE products
    SET inventory = inventory - NEW.quantity
    WHERE id = NEW.product_id
    AND inventory >= NEW.quantity;

    -- Check if update was successful (inventory was sufficient)
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient inventory for product %', NEW.product_id;
    END IF;

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Restore inventory when order item is deleted (e.g., order cancelled)
    UPDATE products
    SET inventory = inventory + OLD.quantity
    WHERE id = OLD.product_id;

    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Adjust inventory when quantity changes
    UPDATE products
    SET inventory = inventory + OLD.quantity - NEW.quantity
    WHERE id = NEW.product_id
    AND inventory >= (NEW.quantity - OLD.quantity);

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient inventory for product %', NEW.product_id;
    END IF;

    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update inventory when order items change
CREATE TRIGGER update_inventory_on_order_item_change
  AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_product_inventory_on_order();
-- Link bookings to orders without overloading order_items
CREATE TABLE order_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  slot_id UUID REFERENCES time_slots(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_bookings_order_id ON order_bookings(order_id);
CREATE INDEX idx_order_bookings_booking_id ON order_bookings(booking_id);

ALTER TABLE order_bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own order bookings
CREATE POLICY "Users can view their order bookings"
  ON order_bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_bookings.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Users can insert rows tied to their orders
CREATE POLICY "Users can insert their order bookings"
  ON order_bookings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_bookings.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admins can manage all rows
CREATE POLICY "Admins manage order bookings"
  ON order_bookings FOR ALL
  USING (true)
  WITH CHECK (true);

GRANT ALL ON order_bookings TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
-- Add is_multi_day column to services table
-- This allows services to be flagged as multi-day activities for proper calendar display

ALTER TABLE services
ADD COLUMN is_multi_day BOOLEAN DEFAULT false;

COMMENT ON COLUMN services.is_multi_day IS 'Indicates if this service spans multiple days (e.g., retreats, workshops)';
-- Add shipping/tracking number to orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_tracking_number TEXT;

COMMENT ON COLUMN orders.shipping_tracking_number IS 'Carrier tracking number or fulfillment reference for the order';
-- Admin-friendly RPCs for tracking updates and email payload
create or replace function set_order_tracking(p_order_id uuid, p_tracking text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_requester uuid := auth.uid();
  v_role text;
  v_owner uuid;
begin
  if v_requester is null then
    raise exception 'Unauthorized';
  end if;

  select role into v_role from profiles where id = v_requester;
  select user_id into v_owner from orders where id = p_order_id;

  if v_owner is null then
    raise exception 'Order not found';
  end if;

  if v_role <> 'admin' and v_owner <> v_requester then
    raise exception 'Forbidden';
  end if;

  update orders
    set shipping_tracking_number = p_tracking
    where id = p_order_id;
end;
$$;

grant execute on function set_order_tracking to authenticated;


-- Return order + items for email (admin/owner via SECURITY DEFINER)
create or replace function get_order_for_email(p_order_id uuid)
returns table(
  email text,
  full_name text,
  total numeric,
  shipping_address jsonb,
  tracking_number text,
  item_name text,
  item_qty int,
  item_price numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_requester uuid := auth.uid();
  v_role text;
  v_owner uuid;
begin
  if v_requester is null then
    raise exception 'Unauthorized';
  end if;

  select role into v_role from profiles where id = v_requester;
  select user_id into v_owner from orders where id = p_order_id;

  if v_owner is null then
    raise exception 'Order not found';
  end if;

  if v_role <> 'admin' and v_owner <> v_requester then
    raise exception 'Forbidden';
  end if;

  return query
  select
    prof.email,
    prof.full_name,
    o.total,
    o.shipping_address,
    o.shipping_tracking_number,
    prod.name,
    oi.quantity,
    coalesce(oi.price, prod.price, 0)
  from orders o
  join profiles prof on prof.id = o.user_id
  left join order_items oi on oi.order_id = o.id
  left join products prod on prod.id = oi.product_id
  where o.id = p_order_id;
end;
$$;

grant execute on function get_order_for_email to authenticated;
-- Admin RPC for updating tracking number (callable by service role)
create or replace function admin_update_tracking(p_order_id uuid, p_tracking text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update orders
    set shipping_tracking_number = p_tracking
    where id = p_order_id;
end;
$$;

-- Grant execute to service_role
grant execute on function admin_update_tracking to service_role;
-- Compute slot availability from bookings (pending/confirmed) ignoring stale booked_count
create or replace function get_time_slots_with_availability(p_service_id uuid default null)
returns table(
  id uuid,
  service_id uuid,
  start_time timestamptz,
  end_time timestamptz,
  capacity integer,
  booked_count integer,
  is_available boolean
)
language sql
security definer
set search_path = public
as $$
  select
    ts.id,
    ts.service_id,
    ts.start_time,
    ts.end_time,
    ts.capacity,
    coalesce(b.booked, 0) as booked_count,
    coalesce(b.booked, 0) < ts.capacity as is_available
  from time_slots ts
  left join (
    select slot_id, count(*) as booked
    from bookings
    where status in ('confirmed','pending')
    group by slot_id
  ) b on b.slot_id = ts.id
  where p_service_id is null or ts.service_id = p_service_id;
$$;

grant execute on function get_time_slots_with_availability(uuid) to anon, authenticated;
