-- Step 1: Find overlapping slots
-- Run this query to see which slots conflict
SELECT 
  t1.id as slot1_id,
  t1.service_id,
  t1.start_time as slot1_start,
  t1.end_time as slot1_end,
  t2.id as slot2_id,
  t2.start_time as slot2_start,
  t2.end_time as slot2_end
FROM public.time_slots t1
JOIN public.time_slots t2 ON 
  t1.service_id = t2.service_id AND
  t1.id < t2.id AND
  t1.start_time < t2.end_time AND
  t2.start_time < t1.end_time
ORDER BY t1.service_id, t1.start_time;

-- Step 2: Option A - Delete ALL existing slots (cleanest approach)
-- Only do this if you don't have important booking data tied to specific slots
-- DELETE FROM public.time_slots;

-- Step 3: Option B - Delete only the newer overlapping slot (keeps first created)
-- First, identify which overlaps to delete:
WITH overlaps AS (
  SELECT DISTINCT
    t2.id as slot_to_delete
  FROM public.time_slots t1
  JOIN public.time_slots t2 ON 
    t1.service_id = t2.service_id AND
    t1.id < t2.id AND
    t1.start_time < t2.end_time AND
    t2.start_time < t1.end_time
)
-- Then delete them:
-- DELETE FROM public.time_slots WHERE id IN (SELECT slot_to_delete FROM overlaps);

-- Step 4: Verify no more overlaps
SELECT COUNT(*) as overlap_count
FROM public.time_slots t1
JOIN public.time_slots t2 ON 
  t1.service_id = t2.service_id AND
  t1.id < t2.id AND
  t1.start_time < t2.end_time AND
  t2.start_time < t1.end_time;

-- Should return 0

-- Step 5: Then run the migration again
-- CREATE EXTENSION IF NOT EXISTS btree_gist;
-- ALTER TABLE public.time_slots
--   ADD CONSTRAINT time_slots_no_overlap EXCLUDE USING GIST (
--     service_id WITH =,
--     tstzrange(start_time, end_time) WITH &&
--   );
