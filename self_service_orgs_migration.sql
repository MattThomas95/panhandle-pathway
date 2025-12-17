-- Migration: Enable self-service organization creation
-- This allows any authenticated user to create their own organization

-- 1. Add policy for authenticated users to create organizations
CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Add policy for users to insert their own profile as org admin
-- (When creating an org, they need to update their profile to link to it)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Create a helper function to create organization and auto-assign creator as admin
CREATE OR REPLACE FUNCTION create_organization_and_assign_admin(
  p_name TEXT,
  p_slug TEXT,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  slug TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_user_id UUID;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to create an organization';
  END IF;

  -- Create the organization
  INSERT INTO organizations (name, slug, email, phone, address)
  VALUES (p_name, p_slug, p_email, p_phone, p_address)
  RETURNING organizations.id INTO v_org_id;

  -- Update the user's profile to be linked to this org and make them org admin
  UPDATE profiles
  SET
    organization_id = v_org_id,
    is_org_admin = true
  WHERE profiles.id = v_user_id;

  -- Return the created organization
  RETURN QUERY
  SELECT
    o.id,
    o.name,
    o.slug,
    o.email,
    o.phone,
    o.address,
    o.is_active,
    o.created_at
  FROM organizations o
  WHERE o.id = v_org_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_organization_and_assign_admin TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Self-service organization creation enabled! Users can now create their own organizations.';
END$$;
