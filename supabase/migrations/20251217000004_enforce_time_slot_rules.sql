-- Enforce time slot rules using service settings

-- For consultation services, enforce time limit; for all, cap slot capacity to service capacity when provided.
CREATE OR REPLACE FUNCTION enforce_time_slot_rules()
RETURNS TRIGGER AS $$
DECLARE
  svc RECORD;
  slot_duration_minutes INTEGER;
BEGIN
  SELECT service_kind, time_limit_minutes, capacity
    INTO svc
    FROM services
   WHERE id = NEW.service_id;

  IF svc.service_kind IS NULL THEN
    RETURN NEW;
  END IF;

  slot_duration_minutes := CEIL(EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60);

  -- Enforce consultation time limit when set
  IF svc.service_kind = 'consultation' AND svc.time_limit_minutes IS NOT NULL AND svc.time_limit_minutes > 0 THEN
    IF slot_duration_minutes > svc.time_limit_minutes THEN
      RAISE EXCEPTION 'Time slot exceeds allowed duration (% min) for consultation service', svc.time_limit_minutes;
    END IF;
  END IF;

  -- Enforce slot capacity not exceeding service capacity when set
  IF svc.capacity IS NOT NULL AND NEW.capacity > svc.capacity THEN
    RAISE EXCEPTION 'Time slot capacity (% slots) exceeds service capacity (%)', NEW.capacity, svc.capacity;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_time_slot_rules ON time_slots;
CREATE TRIGGER trg_enforce_time_slot_rules
BEFORE INSERT OR UPDATE ON time_slots
FOR EACH ROW
EXECUTE FUNCTION enforce_time_slot_rules();
