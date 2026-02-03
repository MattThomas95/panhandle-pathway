-- Drop ALL existing policies on bundles to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view active bundles" ON bundles;
DROP POLICY IF EXISTS "Admins can manage bundles" ON bundles;

-- Create explicit policies for each operation

-- Public can SELECT active bundles
CREATE POLICY "Public can view active bundles"
  ON bundles FOR SELECT
  USING (is_active = true);

-- Admins can SELECT all bundles
CREATE POLICY "Admins can select bundles"
  ON bundles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admins can INSERT bundles
CREATE POLICY "Admins can insert bundles"
  ON bundles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admins can UPDATE bundles
CREATE POLICY "Admins can update bundles"
  ON bundles FOR UPDATE
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

-- Admins can DELETE bundles
CREATE POLICY "Admins can delete bundles"
  ON bundles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Do the same for bundle_services
DROP POLICY IF EXISTS "Admins can manage bundle services" ON bundle_services;

CREATE POLICY "Admins can insert bundle services"
  ON bundle_services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can select bundle services"
  ON bundle_services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update bundle services"
  ON bundle_services FOR UPDATE
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

CREATE POLICY "Admins can delete bundle services"
  ON bundle_services FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
