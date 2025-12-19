-- Enforce pricing consistency on bookings (base price from services, total with late fee)

-- Add pricing fields if missing
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2);

-- Replace enforcement function to include base/total pricing
CREATE OR REPLACE FUNCTION enforce_booking_rules()
RETURNS TRIGGER AS $$
DECLARE
  slot_start TIMESTAMPTZ;
  days_out INTEGER;
  svc RECORD;
  late_fee DECIMAL(10,2) := 0;
BEGIN
  SELECT s.service_kind,
         s.registration_cutoff_days,
         s.late_fee_days,
         s.late_fee_amount,
         s.price AS svc_price,
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
    late_fee := COALESCE(svc.late_fee_amount, 0);
  ELSE
    late_fee := 0;
  END IF;

  NEW.late_fee := late_fee;
  NEW.base_price := svc.svc_price;
  NEW.total_price := COALESCE(svc.svc_price, 0) + COALESCE(late_fee, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_booking_rules ON bookings;
CREATE TRIGGER trg_enforce_booking_rules
BEFORE INSERT OR UPDATE OF slot_id ON bookings
FOR EACH ROW
EXECUTE FUNCTION enforce_booking_rules();
