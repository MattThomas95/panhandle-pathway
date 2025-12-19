-- ============================================================================
-- Bundle System Migration
-- Creates tables, indexes, RLS policies, triggers, and RPC functions for
-- service bundles/combos that allow multiple services to be booked together
-- ============================================================================

-- ============================================================================
-- TABLES
-- ============================================================================

-- Bundles: Reusable templates for multi-service packages
CREATE TABLE bundles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  custom_price DECIMAL(10,2) NOT NULL CHECK (custom_price >= 0),
  late_fee_days INTEGER NOT NULL DEFAULT 0 CHECK (late_fee_days >= 0),
  late_fee_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (late_fee_amount >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bundle Services: Junction table linking bundles to services
CREATE TABLE bundle_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bundle_id, service_id)
);

-- Bundle Bookings: Tracks bundle purchases
CREATE TABLE bundle_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id UUID NOT NULL REFERENCES bundles(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES time_slots(id) ON DELETE RESTRICT,
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  late_fee DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (late_fee >= 0),
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add bundle_booking_id to existing bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS bundle_booking_id UUID REFERENCES bundle_bookings(id) ON DELETE CASCADE;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_bundle_services_bundle_id ON bundle_services(bundle_id);
CREATE INDEX idx_bundle_services_service_id ON bundle_services(service_id);
CREATE INDEX idx_bundle_bookings_slot_id ON bundle_bookings(slot_id);
CREATE INDEX idx_bundle_bookings_user_id ON bundle_bookings(user_id);
CREATE INDEX idx_bundle_bookings_bundle_id ON bundle_bookings(bundle_id);
CREATE INDEX idx_bundles_active ON bundles(is_active) WHERE is_active = true;
CREATE INDEX idx_bookings_bundle_booking_id ON bookings(bundle_booking_id) WHERE bundle_booking_id IS NOT NULL;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Bundles: Public read for active bundles, admin-only write
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active bundles"
  ON bundles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage bundles"
  ON bundles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Bundle Services: Public read, admin-only write
ALTER TABLE bundle_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bundle services"
  ON bundle_services FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage bundle services"
  ON bundle_services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Bundle Bookings: Users see own bookings, admins see all
ALTER TABLE bundle_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bundle bookings"
  ON bundle_bookings FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create bundle bookings"
  ON bundle_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bundle bookings"
  ON bundle_bookings FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete bundle bookings"
  ON bundle_bookings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- CONSTRAINT TRIGGERS
-- ============================================================================

-- Prevent deletion of services that are part of active bundles
CREATE OR REPLACE FUNCTION prevent_service_deletion_if_in_active_bundle()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM bundle_services bs
    JOIN bundles b ON b.id = bs.bundle_id
    WHERE bs.service_id = OLD.id AND b.is_active = true
  ) THEN
    RAISE EXCEPTION 'Cannot delete service that is part of an active bundle. Deactivate the bundle first.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_service_deletion_bundle_constraint
  BEFORE DELETE ON services
  FOR EACH ROW
  EXECUTE FUNCTION prevent_service_deletion_if_in_active_bundle();

-- Ensure bundles have at least 2 services
CREATE OR REPLACE FUNCTION validate_bundle_service_count()
RETURNS TRIGGER AS $$
DECLARE
  service_count INTEGER;
BEGIN
  -- Count remaining services after deletion
  SELECT COUNT(*) INTO service_count
  FROM bundle_services
  WHERE bundle_id = OLD.bundle_id AND id != OLD.id;

  IF service_count < 2 THEN
    RAISE EXCEPTION 'Bundle must have at least 2 services';
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_bundle_service_minimum
  BEFORE DELETE ON bundle_services
  FOR EACH ROW
  EXECUTE FUNCTION validate_bundle_service_count();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp for bundles
CREATE TRIGGER update_bundles_updated_at
  BEFORE UPDATE ON bundles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bundle_bookings_updated_at
  BEFORE UPDATE ON bundle_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

-- Get matching time slots for a bundle
-- Returns slots where ALL bundled services have the same time slot and availability
CREATE OR REPLACE FUNCTION get_bundle_matching_slots(
  p_bundle_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NOW(),
  p_end_date TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
)
RETURNS TABLE (
  slot_id UUID,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  min_available_seats INTEGER,
  all_services_available BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH bundle_service_ids AS (
    -- Get all services in this bundle
    SELECT service_id
    FROM bundle_services
    WHERE bundle_id = p_bundle_id
  ),
  bundle_service_count AS (
    SELECT COUNT(*) AS total_services
    FROM bundle_service_ids
  ),
  slot_groups AS (
    -- Group time slots by start/end time
    SELECT
      ts.start_time,
      ts.end_time,
      COUNT(DISTINCT ts.service_id) AS services_with_slots,
      MIN(ts.capacity - COALESCE(ts.booked_count, 0)) AS min_available,
      BOOL_AND(ts.capacity > COALESCE(ts.booked_count, 0)) AS all_available,
      -- Pick any slot_id from the group (they all have same time)
      MIN(ts.id) AS representative_slot_id
    FROM time_slots ts
    WHERE ts.service_id IN (SELECT service_id FROM bundle_service_ids)
      AND ts.start_time >= p_start_date
      AND ts.start_time <= p_end_date
      AND ts.is_available = true
    GROUP BY ts.start_time, ts.end_time
  )
  SELECT
    sg.representative_slot_id,
    sg.start_time,
    sg.end_time,
    sg.min_available,
    sg.all_available
  FROM slot_groups sg, bundle_service_count bsc
  WHERE sg.services_with_slots = bsc.total_services  -- ALL services have this time slot
    AND sg.all_available = true  -- ALL services have availability
    AND sg.min_available > 0
  ORDER BY sg.start_time;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create bundle booking atomically
-- Creates bundle_bookings record + individual bookings for each service
CREATE OR REPLACE FUNCTION create_bundle_booking(
  p_bundle_id UUID,
  p_user_id UUID,
  p_slot_start_time TIMESTAMPTZ
)
RETURNS UUID AS $$
DECLARE
  v_bundle_booking_id UUID;
  v_bundle_price DECIMAL(10,2);
  v_late_fee DECIMAL(10,2) := 0;
  v_late_fee_days INTEGER;
  v_late_fee_amount DECIMAL(10,2);
  v_days_until_slot INTEGER;
  v_service_record RECORD;
  v_slot_record RECORD;
  v_min_available INTEGER;
BEGIN
  -- Get bundle pricing and late fee configuration
  SELECT custom_price, late_fee_days, late_fee_amount
  INTO v_bundle_price, v_late_fee_days, v_late_fee_amount
  FROM bundles
  WHERE id = p_bundle_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bundle not found or inactive';
  END IF;

  -- Calculate days until slot
  v_days_until_slot := EXTRACT(DAY FROM (p_slot_start_time - NOW()));

  -- Calculate late fee if booking within late fee window
  IF v_days_until_slot < v_late_fee_days THEN
    v_late_fee := v_late_fee_amount;
  END IF;

  -- Check availability for ALL services in bundle at this time slot
  -- Lock all relevant time_slots rows to prevent race conditions
  FOR v_slot_record IN (
    SELECT ts.id, ts.service_id, ts.capacity, ts.booked_count, ts.start_time
    FROM bundle_services bs
    JOIN time_slots ts ON ts.service_id = bs.service_id
    WHERE bs.bundle_id = p_bundle_id
      AND ts.start_time = p_slot_start_time
    FOR UPDATE
  ) LOOP
    -- Check if this slot has availability
    IF v_slot_record.capacity <= COALESCE(v_slot_record.booked_count, 0) THEN
      RAISE EXCEPTION 'Service % has no availability for this time slot', v_slot_record.service_id;
    END IF;
  END LOOP;

  -- Get minimum available seats across all services
  SELECT MIN(ts.capacity - COALESCE(ts.booked_count, 0))
  INTO v_min_available
  FROM bundle_services bs
  JOIN time_slots ts ON ts.service_id = bs.service_id
  WHERE bs.bundle_id = p_bundle_id
    AND ts.start_time = p_slot_start_time;

  IF v_min_available IS NULL OR v_min_available < 1 THEN
    RAISE EXCEPTION 'Bundle not available for this time slot';
  END IF;

  -- Create bundle booking record (using first slot as reference)
  SELECT ts.id INTO v_slot_record
  FROM bundle_services bs
  JOIN time_slots ts ON ts.service_id = bs.service_id
  WHERE bs.bundle_id = p_bundle_id
    AND ts.start_time = p_slot_start_time
  LIMIT 1;

  INSERT INTO bundle_bookings (
    bundle_id, user_id, slot_id, total_price, late_fee, status
  ) VALUES (
    p_bundle_id, p_user_id, v_slot_record.id, v_bundle_price + v_late_fee, v_late_fee, 'pending_payment'
  ) RETURNING id INTO v_bundle_booking_id;

  -- Create individual service bookings for each service in bundle
  FOR v_service_record IN (
    SELECT bs.service_id, ts.id AS slot_id
    FROM bundle_services bs
    JOIN time_slots ts ON ts.service_id = bs.service_id
    WHERE bs.bundle_id = p_bundle_id
      AND ts.start_time = p_slot_start_time
  ) LOOP
    INSERT INTO bookings (
      user_id,
      service_id,
      slot_id,
      status,
      base_price,
      total_price,
      late_fee,
      bundle_booking_id
    ) VALUES (
      p_user_id,
      v_service_record.service_id,
      v_service_record.slot_id,
      'pending_payment',
      0,  -- Price is on bundle_booking, not individual bookings
      0,  -- Price is on bundle_booking
      0,  -- Late fee is on bundle_booking
      v_bundle_booking_id
    );
  END LOOP;

  RETURN v_bundle_booking_id;
END;
$$ LANGUAGE plpgsql;

-- Get services included in a bundle
CREATE OR REPLACE FUNCTION get_bundle_services(p_bundle_id UUID)
RETURNS TABLE (
  service_id UUID,
  service_name TEXT,
  service_price DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.name, s.price
  FROM bundle_services bs
  JOIN services s ON s.id = bs.service_id
  WHERE bs.bundle_id = p_bundle_id
  ORDER BY s.name;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant permissions
GRANT SELECT ON bundles TO authenticated;
GRANT SELECT ON bundle_services TO authenticated;
GRANT ALL ON bundle_bookings TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE bundles IS 'Reusable templates for multi-service packages with custom pricing';
COMMENT ON TABLE bundle_services IS 'Junction table linking bundles to their included services';
COMMENT ON TABLE bundle_bookings IS 'Tracks bundle purchases and pricing at time of booking';
COMMENT ON COLUMN bookings.bundle_booking_id IS 'Links individual service bookings to parent bundle booking';
COMMENT ON FUNCTION get_bundle_matching_slots IS 'Returns time slots where ALL bundled services have availability';
COMMENT ON FUNCTION create_bundle_booking IS 'Atomically creates bundle booking and all constituent service bookings with race condition protection';
COMMENT ON FUNCTION get_bundle_services IS 'Returns all services included in a bundle';
