-- Migration: add constraints and bulk insert helper for time_slots
-- Adds an exclusion constraint to prevent overlapping time slots per service
-- and a helper function to bulk-insert slots while skipping conflicts.

-- Ensure btree_gist for integer equality in GIST indexes
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Ensure capacity column exists (non-destructive if already present)
ALTER TABLE IF EXISTS public.time_slots
  ADD COLUMN IF NOT EXISTS capacity integer NOT NULL DEFAULT 1;

-- Remove any overlapping slots before adding constraint
-- (Keeps the first created, deletes newer overlaps)
DELETE FROM public.time_slots t2
WHERE EXISTS (
  SELECT 1 FROM public.time_slots t1
  WHERE t1.service_id = t2.service_id AND
        t1.id < t2.id AND
        t1.start_time < t2.end_time AND
        t2.start_time < t1.end_time
);

-- Add an exclusion constraint to prevent overlapping slots per service
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE c.conname = 'time_slots_no_overlap' AND t.relname = 'time_slots'
  ) THEN
    ALTER TABLE public.time_slots
      ADD CONSTRAINT time_slots_no_overlap EXCLUDE USING GIST (
        service_id WITH =,
        tstzrange(start_time, end_time) WITH &&
      );
  END IF;
END$$;

-- Index to speed queries by service and start_time
CREATE INDEX IF NOT EXISTS time_slots_service_start_idx ON public.time_slots (service_id, start_time);

-- Bulk insert function: accepts JSONB array of slots and inserts while skipping conflicts
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
