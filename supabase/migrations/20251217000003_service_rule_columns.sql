-- Add per-service booking rule columns and enforce via trigger

ALTER TABLE services
ADD COLUMN IF NOT EXISTS service_kind TEXT DEFAULT 'training' CHECK (service_kind IN ('training', 'consultation')),
ADD COLUMN IF NOT EXISTS registration_cutoff_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS late_fee_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS late_fee_amount DECIMAL(10,2) DEFAULT 25,
ADD COLUMN IF NOT EXISTS time_limit_minutes INTEGER;

-- Ensure late_fee column exists on bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS late_fee DECIMAL(10,2) DEFAULT 0;

-- Normalize existing rows
UPDATE services
SET service_kind = COALESCE(service_kind, 'training'),
    registration_cutoff_days = COALESCE(registration_cutoff_days, 0),
    late_fee_days = COALESCE(late_fee_days, 7),
    late_fee_amount = COALESCE(late_fee_amount, 25)
WHERE true;

-- Replace enforcement function to use per-service rules
CREATE OR REPLACE FUNCTION enforce_booking_rules()
RETURNS TRIGGER AS $$
DECLARE
  slot_start TIMESTAMPTZ;
  days_out INTEGER;
  svc RECORD;
BEGIN
  SELECT s.service_kind,
         s.registration_cutoff_days,
         s.late_fee_days,
         s.late_fee_amount,
         ts.start_time
    INTO svc
    FROM services s
    JOIN time_slots ts ON ts.id = NEW.slot_id
   WHERE s.id = ts.service_id;

  IF svc.start_time IS NULL THEN
    RAISE EXCEPTION 'Slot not found for booking';
  END IF;

  slot_start := svc.start_time;
  days_out := FLOOR(EXTRACT(EPOCH FROM (slot_start - NOW())) / 86400);

  -- Enforce registration cutoff only for consultation-type services
  IF svc.service_kind = 'consultation' AND svc.registration_cutoff_days IS NOT NULL THEN
    IF days_out < svc.registration_cutoff_days THEN
      RAISE EXCEPTION 'Registration must be completed at least % days in advance', svc.registration_cutoff_days;
    END IF;
  END IF;

  -- Apply late fee if within late_fee_days
  IF svc.late_fee_days IS NOT NULL AND days_out < svc.late_fee_days THEN
    NEW.late_fee := COALESCE(svc.late_fee_amount, 0);
  ELSE
    NEW.late_fee := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_booking_rules ON bookings;
CREATE TRIGGER trg_enforce_booking_rules
BEFORE INSERT OR UPDATE OF slot_id ON bookings
FOR EACH ROW
EXECUTE FUNCTION enforce_booking_rules();
