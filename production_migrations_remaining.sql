-- Remaining production migrations
-- Run this if you get "relation already exists" errors
-- This file contains only the migrations that might be missing

-- Check if tables exist before creating them

-- 1. Add is_multi_day to services if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'is_multi_day'
  ) THEN
    ALTER TABLE services ADD COLUMN is_multi_day BOOLEAN DEFAULT false;
    COMMENT ON COLUMN services.is_multi_day IS 'Indicates if this service spans multiple days (e.g., retreats, workshops)';
  END IF;
END $$;

-- 2. Add shipping_tracking_number to orders if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipping_tracking_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_tracking_number TEXT;
    COMMENT ON COLUMN orders.shipping_tracking_number IS 'Carrier tracking number or fulfillment reference for the order';
  END IF;
END $$;

-- 3. Add shipping_carrier to orders if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipping_carrier'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_carrier TEXT;
  END IF;
END $$;

-- 4. Create order_bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS order_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  slot_id UUID REFERENCES time_slots(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_order_bookings_order_id') THEN
    CREATE INDEX idx_order_bookings_order_id ON order_bookings(order_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_order_bookings_booking_id') THEN
    CREATE INDEX idx_order_bookings_booking_id ON order_bookings(booking_id);
  END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE order_bookings ENABLE ROW LEVEL SECURITY;

-- Drop and recreate RLS policies for order_bookings
DROP POLICY IF EXISTS "Users can view their order bookings" ON order_bookings;
DROP POLICY IF EXISTS "Users can insert their order bookings" ON order_bookings;
DROP POLICY IF EXISTS "Admins manage order bookings" ON order_bookings;

CREATE POLICY "Users can view their order bookings"
  ON order_bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_bookings.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their order bookings"
  ON order_bookings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_bookings.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage order bookings"
  ON order_bookings FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON order_bookings TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 5. Create/replace admin RPC functions for tracking
CREATE OR REPLACE FUNCTION admin_update_tracking(p_order_id uuid, p_tracking text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE orders
    SET shipping_tracking_number = p_tracking
    WHERE id = p_order_id;
END;
$$;

-- Grant execute to service_role and authenticated
GRANT EXECUTE ON FUNCTION admin_update_tracking TO service_role, authenticated;

-- 6. Create/replace availability RPC function
CREATE OR REPLACE FUNCTION get_time_slots_with_availability(p_service_id uuid DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  service_id uuid,
  start_time timestamptz,
  end_time timestamptz,
  capacity integer,
  booked_count integer,
  is_available boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ts.id,
    ts.service_id,
    ts.start_time,
    ts.end_time,
    ts.capacity,
    COALESCE(b.booked, 0) as booked_count,
    COALESCE(b.booked, 0) < ts.capacity as is_available
  FROM time_slots ts
  LEFT JOIN (
    SELECT slot_id, count(*) as booked
    FROM bookings
    WHERE status IN ('confirmed','pending')
    GROUP BY slot_id
  ) b ON b.slot_id = ts.id
  WHERE p_service_id IS NULL OR ts.service_id = p_service_id;
$$;

GRANT EXECUTE ON FUNCTION get_time_slots_with_availability(uuid) TO anon, authenticated;

-- 7. Ensure btree_gist extension exists for time slot constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 8. Add time slot overlap constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE c.conname = 'time_slots_no_overlap' AND t.relname = 'time_slots'
  ) THEN
    -- Remove any overlapping slots first
    DELETE FROM public.time_slots t2
    WHERE EXISTS (
      SELECT 1 FROM public.time_slots t1
      WHERE t1.service_id = t2.service_id AND
            t1.id < t2.id AND
            t1.start_time < t2.end_time AND
            t2.start_time < t1.end_time
    );

    -- Add the constraint
    ALTER TABLE public.time_slots
      ADD CONSTRAINT time_slots_no_overlap EXCLUDE USING GIST (
        service_id WITH =,
        tstzrange(start_time, end_time) WITH &&
      );
  END IF;
END$$;

-- 9. Create bulk time slot insert function
CREATE OR REPLACE FUNCTION public.bulk_create_time_slots(slots jsonb)
RETURNS TABLE(id uuid, start_time timestamptz, end_time timestamptz, capacity int, service_id uuid) AS $$
DECLARE
  s jsonb;
BEGIN
  IF slots IS NULL THEN
    RETURN;
  END IF;

  FOR s IN SELECT * FROM jsonb_array_elements(slots) LOOP
    BEGIN
      RETURN QUERY
      INSERT INTO public.time_slots (start_time, end_time, capacity, service_id)
      VALUES (
        (s->>'start_time')::timestamptz,
        (s->>'end_time')::timestamptz,
        (s->>'capacity')::int,
        (s->>'service_id')::uuid
      )
      RETURNING time_slots.id, time_slots.start_time, time_slots.end_time, time_slots.capacity, time_slots.service_id;
    EXCEPTION WHEN exclusion_violation OR unique_violation THEN
      -- skip conflicting/duplicate slots
      CONTINUE;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION bulk_create_time_slots TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully! All missing columns, tables, and functions have been created.';
END$$;
