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
