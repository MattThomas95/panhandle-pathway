-- Fix RLS policies for bundles to include WITH CHECK clause
-- The USING clause is for SELECT, WITH CHECK is for INSERT/UPDATE

-- Drop the existing policy
DROP POLICY IF EXISTS "Admins can manage bundles" ON bundles;

-- Recreate with both USING and WITH CHECK
CREATE POLICY "Admins can manage bundles"
  ON bundles FOR ALL
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

-- Do the same for bundle_services
DROP POLICY IF EXISTS "Admins can manage bundle services" ON bundle_services;

CREATE POLICY "Admins can manage bundle services"
  ON bundle_services FOR ALL
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
