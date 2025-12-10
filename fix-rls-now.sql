-- Quick fix for RLS policies - run this in Supabase SQL Editor NOW
-- This allows authenticated users to access services and bookings tables

-- Drop restrictive policies
DROP POLICY IF EXISTS "Admins can manage services" ON services;
DROP POLICY IF EXISTS "Authenticated users can manage services" ON services;
DROP POLICY IF EXISTS "Admins can manage time slots" ON time_slots;
DROP POLICY IF EXISTS "Authenticated users can manage time slots" ON time_slots;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can manage bookings" ON bookings;

-- Create permissive policies for testing
CREATE POLICY "Allow all for authenticated users on services"
  ON services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users on time_slots"
  ON time_slots FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users on bookings"
  ON bookings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
