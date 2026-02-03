-- Create a function to insert bundles that bypasses RLS
-- This will help us confirm if RLS is the issue
CREATE OR REPLACE FUNCTION admin_create_bundle(
  p_name TEXT,
  p_description TEXT,
  p_custom_price DECIMAL,
  p_late_fee_days INTEGER,
  p_late_fee_amount DECIMAL,
  p_is_active BOOLEAN
)
RETURNS bundles AS $$
DECLARE
  v_user_role TEXT;
  v_new_bundle bundles;
BEGIN
  -- Check if user is admin
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = auth.uid();

  IF v_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can create bundles';
  END IF;

  -- Insert the bundle
  INSERT INTO bundles (name, description, custom_price, late_fee_days, late_fee_amount, is_active)
  VALUES (p_name, p_description, p_custom_price, p_late_fee_days, p_late_fee_amount, p_is_active)
  RETURNING * INTO v_new_bundle;

  RETURN v_new_bundle;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
