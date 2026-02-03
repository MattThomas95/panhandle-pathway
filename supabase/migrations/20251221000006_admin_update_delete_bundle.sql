-- Create admin function to update bundles
CREATE OR REPLACE FUNCTION admin_update_bundle(
  p_bundle_id UUID,
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
  v_updated_bundle bundles;
  v_service_id UUID;
BEGIN
  -- Check if user is admin
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = auth.uid();

  IF v_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can update bundles';
  END IF;

  -- Validate at least 2 services
  IF array_length(p_service_ids, 1) < 2 THEN
    RAISE EXCEPTION 'Bundle must have at least 2 services';
  END IF;

  -- Update the bundle
  UPDATE bundles
  SET
    name = p_name,
    description = p_description,
    custom_price = p_custom_price,
    late_fee_days = p_late_fee_days,
    late_fee_amount = p_late_fee_amount,
    is_active = p_is_active,
    updated_at = NOW()
  WHERE id = p_bundle_id
  RETURNING * INTO v_updated_bundle;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bundle not found';
  END IF;

  -- Delete existing bundle_services
  DELETE FROM bundle_services WHERE bundle_id = p_bundle_id;

  -- Insert new bundle_services entries
  FOREACH v_service_id IN ARRAY p_service_ids
  LOOP
    INSERT INTO bundle_services (bundle_id, service_id)
    VALUES (p_bundle_id, v_service_id);
  END LOOP;

  RETURN v_updated_bundle;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin function to delete bundles
CREATE OR REPLACE FUNCTION admin_delete_bundle(
  p_bundle_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_role TEXT;
BEGIN
  -- Check if user is admin
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = auth.uid();

  IF v_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can delete bundles';
  END IF;

  -- Delete the bundle (CASCADE will handle bundle_services)
  DELETE FROM bundles WHERE id = p_bundle_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bundle not found';
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
