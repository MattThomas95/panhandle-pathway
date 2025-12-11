# Supabase Migration Guide

## Applying the Time Slots Constraints Migration

The migration file `supabase/migrations/20251210000000_time_slots_constraints.sql` has been created and is ready to apply.

### Option 1: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `supabase/migrations/20251210000000_time_slots_constraints.sql`
5. Paste into the SQL editor
6. Click **Run**

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```powershell
# From project root
supabase db push
```

### Option 3: Manual psql Connection

If you have direct database access:

```powershell
# Replace with your actual connection details from Supabase
psql "postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres" \
  -f supabase/migrations/20251210000000_time_slots_constraints.sql
```

## What This Migration Does

✅ **Enables btree_gist extension** — Allows GIST indexes for constraint checking

✅ **Adds `capacity` column** — Non-destructive; skips if already present

✅ **Creates exclusion constraint** — Prevents overlapping time slots for the same service at the database level

✅ **Creates performance index** — `time_slots_service_start_idx` speeds up queries by service and start_time

✅ **Creates bulk insert function** — `bulk_create_time_slots(slots jsonb)` for efficient batch insertion

## Verification

After applying the migration, verify it worked:

```sql
-- Check if constraint exists
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name='time_slots' AND constraint_name='time_slots_no_overlap';

-- Check if index exists
SELECT indexname FROM pg_indexes 
WHERE tablename='time_slots' AND indexname='time_slots_service_start_idx';

-- Check if function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_name='bulk_create_time_slots' AND routine_schema='public';
```

All three should return results if successful.

## Testing Time Slot Creation

1. Navigate to `/admin` in your browser
2. Go to **Services** resource
3. Edit a service
4. Click the **Time Slots** tab
5. Use the generator to create time slots:
   - Set date range (e.g., next 5 days)
   - Set time range (e.g., 9:00 AM - 5:00 PM)
   - Select working days (Mon-Fri)
   - Set interval (e.g., 30 minutes)
   - Click **Generate Preview**
6. Review conflicts (should show "OK" status for non-overlapping slots)
7. Click **Create Slots** to batch insert

## Notes

- The exclusion constraint uses `tstzrange(start_time, end_time)` with `&&` operator to detect overlaps
- Overlapping slots will be rejected by the database with an `exclusion_violation` error
- The `TimeSlotGenerator` component handles duplicate detection and removes them from preview before creation
- The `bulk_create_time_slots` function gracefully skips conflicting slots and returns only successfully inserted rows
