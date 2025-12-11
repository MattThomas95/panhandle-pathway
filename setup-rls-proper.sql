-- Proper RLS Setup for Supabase
-- This creates working policies for authenticated users

-- ============================================
-- STEP 1: Clean up existing policies
-- ============================================

-- Drop all existing policies on services
DROP POLICY IF EXISTS "Allow all for authenticated users on services" ON services;
DROP POLICY IF EXISTS "Admins can manage services" ON services;
DROP POLICY IF EXISTS "Authenticated users can manage services" ON services;
DROP POLICY IF EXISTS "Users can view services" ON services;
DROP POLICY IF EXISTS "Enable read access for all users" ON services;

-- Drop all existing policies on bookings
DROP POLICY IF EXISTS "Allow all for authenticated users on bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can manage bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;

-- Drop all existing policies on time_slots
DROP POLICY IF EXISTS "Allow all for authenticated users on time_slots" ON time_slots;
DROP POLICY IF EXISTS "Admins can manage time slots" ON time_slots;
DROP POLICY IF EXISTS "Authenticated users can manage time slots" ON time_slots;
DROP POLICY IF EXISTS "Users can view time slots" ON time_slots;

-- ============================================
-- STEP 2: Enable RLS on all tables
-- ============================================

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: Create working policies
-- ============================================

-- SERVICES TABLE POLICIES
-- Allow authenticated users to read all services
CREATE POLICY "services_select_authenticated"
  ON services
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert services
CREATE POLICY "services_insert_authenticated"
  ON services
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update services
CREATE POLICY "services_update_authenticated"
  ON services
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete services
CREATE POLICY "services_delete_authenticated"
  ON services
  FOR DELETE
  TO authenticated
  USING (true);

-- BOOKINGS TABLE POLICIES
-- Allow authenticated users to read all bookings
CREATE POLICY "bookings_select_authenticated"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert bookings
CREATE POLICY "bookings_insert_authenticated"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update bookings
CREATE POLICY "bookings_update_authenticated"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete bookings
CREATE POLICY "bookings_delete_authenticated"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (true);

-- TIME_SLOTS TABLE POLICIES
-- Allow authenticated users to read all time_slots
CREATE POLICY "time_slots_select_authenticated"
  ON time_slots
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert time_slots
CREATE POLICY "time_slots_insert_authenticated"
  ON time_slots
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update time_slots
CREATE POLICY "time_slots_update_authenticated"
  ON time_slots
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete time_slots
CREATE POLICY "time_slots_delete_authenticated"
  ON time_slots
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- STEP 4: Verify the setup
-- ============================================

-- Check that RLS is enabled
SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('services', 'bookings', 'time_slots')
ORDER BY tablename;

-- Check all policies are created
SELECT
    tablename,
    policyname,
    cmd as operation,
    roles,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE tablename IN ('services', 'bookings', 'time_slots')
ORDER BY tablename, cmd, policyname;
