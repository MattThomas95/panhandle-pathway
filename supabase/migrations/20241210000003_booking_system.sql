-- Booking System Tables
-- This migration creates tables for services, time slots, and bookings

-- Services table (what can be booked)
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  capacity INTEGER DEFAULT 1, -- max people per slot
  price DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time slots table
CREATE TABLE time_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  capacity INTEGER NOT NULL, -- can override service default
  booked_count INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure end time is after start time
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  -- Ensure booked count doesn't exceed capacity
  CONSTRAINT valid_booking_count CHECK (booked_count <= capacity)
);

-- Bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  slot_id UUID NOT NULL REFERENCES time_slots(id) ON DELETE RESTRICT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent double booking
  UNIQUE(user_id, slot_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_time_slots_service_id ON time_slots(service_id);
CREATE INDEX idx_time_slots_start_time ON time_slots(start_time);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_slot_id ON bookings(slot_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Services
-- Anyone can view active services
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  USING (is_active = true);

-- Admins can manage services
CREATE POLICY "Admins can manage services"
  ON services FOR ALL
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

-- RLS Policies for Time Slots
-- Anyone can view available time slots
CREATE POLICY "Anyone can view available time slots"
  ON time_slots FOR SELECT
  USING (is_available = true);

-- Admins can manage time slots
CREATE POLICY "Admins can manage time slots"
  ON time_slots FOR ALL
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

-- RLS Policies for Bookings
-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Authenticated users can create bookings for themselves
CREATE POLICY "Users can create their own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own bookings (e.g., cancel)
CREATE POLICY "Users can update their own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings"
  ON bookings FOR ALL
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

-- Triggers for updated_at
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_slots_updated_at
  BEFORE UPDATE ON time_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update booked_count when booking is created/updated/deleted
CREATE OR REPLACE FUNCTION update_slot_booked_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status IN ('confirmed', 'pending')) THEN
    -- Increment booked count
    UPDATE time_slots
    SET booked_count = booked_count + 1
    WHERE id = NEW.slot_id;

    -- Check if slot is now full
    UPDATE time_slots
    SET is_available = (booked_count < capacity)
    WHERE id = NEW.slot_id;

  ELSIF (TG_OP = 'UPDATE') THEN
    -- Handle status changes
    IF (OLD.status NOT IN ('confirmed', 'pending') AND NEW.status IN ('confirmed', 'pending')) THEN
      -- Booking reactivated
      UPDATE time_slots
      SET booked_count = booked_count + 1
      WHERE id = NEW.slot_id;
    ELSIF (OLD.status IN ('confirmed', 'pending') AND NEW.status NOT IN ('confirmed', 'pending')) THEN
      -- Booking cancelled/completed
      UPDATE time_slots
      SET booked_count = booked_count - 1
      WHERE id = NEW.slot_id;
    END IF;

    -- Update availability
    UPDATE time_slots
    SET is_available = (booked_count < capacity)
    WHERE id = NEW.slot_id;

  ELSIF (TG_OP = 'DELETE' AND OLD.status IN ('confirmed', 'pending')) THEN
    -- Decrement booked count
    UPDATE time_slots
    SET booked_count = booked_count - 1,
        is_available = true
    WHERE id = OLD.slot_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_slot_count_on_booking
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_slot_booked_count();

-- Insert sample services
INSERT INTO services (name, description, duration, capacity, price) VALUES
  ('Career Counseling', 'One-on-one career guidance and planning session', 60, 1, 50.00),
  ('Job Skills Workshop', 'Group workshop on resume writing and interview skills', 120, 15, 25.00),
  ('Mentorship Session', 'Connect with a professional mentor in your field', 45, 1, 40.00);

-- Insert sample time slots (next 2 weeks, Mon-Fri, 9am-5pm)
-- This is a simplified example - in production you'd want a more sophisticated slot generator
DO $$
DECLARE
  service_rec RECORD;
  slot_date DATE;
  slot_time TIME;
  slot_start TIMESTAMP WITH TIME ZONE;
  slot_end TIMESTAMP WITH TIME ZONE;
BEGIN
  FOR service_rec IN SELECT id, duration, capacity FROM services LOOP
    FOR i IN 0..13 LOOP -- Next 2 weeks
      slot_date := CURRENT_DATE + i;

      -- Skip weekends
      IF EXTRACT(DOW FROM slot_date) NOT IN (0, 6) THEN
        FOR hour IN 9..16 LOOP -- 9am to 4pm (to allow for last slot ending at 5pm)
          slot_start := slot_date + (hour || ' hours')::INTERVAL;
          slot_end := slot_start + (service_rec.duration || ' minutes')::INTERVAL;

          -- Only create slot if it ends by 5pm
          IF EXTRACT(HOUR FROM slot_end) <= 17 THEN
            INSERT INTO time_slots (service_id, start_time, end_time, capacity)
            VALUES (service_rec.id, slot_start, slot_end, service_rec.capacity);
          END IF;
        END LOOP;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;
