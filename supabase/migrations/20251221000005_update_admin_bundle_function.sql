-- Update the admin_create_bundle function to also handle bundle_services
DROP FUNCTION IF EXISTS admin_create_bundle(TEXT, TEXT, DECIMAL, INTEGER, DECIMAL, BOOLEAN);

CREATE OR REPLACE FUNCTION admin_create_bundle(
  p_name TEXT,
  p_description TEXT,
  p_custom_price DECIMAL,
  p_late_fee_days INTEGER,
  p_late_fee_amount DECIMAL,
  p_is_active BOOLEAN,
  p_service_ids UUID[]
)
RETURNS bundles AS $$
DECLARE
  v_user_role TEXT;
  v_new_bundle bundles;
  v_service_id UUID;
BEGIN
  -- Check if user is admin
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = auth.uid();

  IF v_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can create bundles';
  END IF;

  -- Validate at least 2 services
  IF array_length(p_service_ids, 1) < 2 THEN
    RAISE EXCEPTION 'Bundle must have at least 2 services';
  END IF;

  -- Insert the bundle
  INSERT INTO bundles (name, description, custom_price, late_fee_days, late_fee_amount, is_active)
  VALUES (p_name, p_description, p_custom_price, p_late_fee_days, p_late_fee_amount, p_is_active)
  RETURNING * INTO v_new_bundle;

  -- Insert bundle_services entries
  FOREACH v_service_id IN ARRAY p_service_ids
  LOOP
    INSERT INTO bundle_services (bundle_id, service_id)
    VALUES (v_new_bundle.id, v_service_id);
  END LOOP;

  RETURN v_new_bundle;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
