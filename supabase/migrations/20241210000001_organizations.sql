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
