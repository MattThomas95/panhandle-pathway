# 🧪 Time Slot System - Test Workflow

## Status: ✅ Database Migration Applied Successfully

The Supabase migration has been applied with:
- ✅ btree_gist extension enabled
- ✅ Exclusion constraint `time_slots_no_overlap` created (prevents overlaps)
- ✅ Index `time_slots_service_start_idx` created
- ✅ Function `bulk_create_time_slots` created
- ✅ Overlapping slots cleaned up (older ones deleted)

---

## 🔬 Testing Steps

### Setup
1. Go to `http://localhost:3001/admin` (or `http://localhost:3000/admin` if port 3000 is available)
2. Login with your admin account

### Test 1: Navigate to Time Slots (should exist)
1. In Admin panel, click **Services** in left sidebar
2. Click **Edit** on any service (or create a new one)
3. You should see two tabs: **Details** and **Time Slots**
4. Click the **Time Slots** tab
5. ✅ Should see the TimeSlotGenerator component with form fields

**Expected UI**:
- Date inputs (Start Date, End Date)
- Time inputs (Start Time, End Time)
- Number inputs (Interval, Capacity)
- Day of week checkboxes (Sun-Sat)
- "Generate Preview" button
- Preview table area (initially empty)

### Test 2: Generate Slots
1. Fill in generator form:
   ```
   Start Date: 2025-12-15 (Monday)
   End Date: 2025-12-19 (Friday)
   Start Time: 09:00
   End Time: 17:00
   Interval: 30 (minutes)
   Capacity: 2
   Days: Uncheck Sat/Sun, keep Mon-Fri
   ```
2. Click **"Generate Preview"** button
3. ✅ Should show approximately 40 slots in preview table
   - Calculation: 5 days × 8 hours × 2 slots/hour = 40

**Preview Table Should Show**:
- Start (timestamp)
- End (timestamp)
- Capacity (2)
- Status (all should be "OK" in green)

### Test 3: Conflict Detection
1. In the same generator, modify to create internal conflict:
   ```
   Start Date: 2025-12-15
   End Date: 2025-12-15 (same day)
   Start Time: 09:00
   End Time: 10:30
   Interval: 45 (creates 9:00-9:45, 9:45-10:30 = no internal conflict)
   ```
   Actually this won't conflict. Let me give a better example:
   ```
   Start Time: 09:00
   End Time: 10:00
   Interval: 15 (creates 9:00-9:15, 9:15-9:30, 9:30-9:45, 9:45-10:00)
   ```
2. This should generate 4 slots with all "OK" status
3. Click **Generate Preview** again
4. ✅ All should still be "OK" (no internal conflicts)

### Test 4: Create Slots
1. Back to the 40-slot configuration:
   ```
   Start Date: 2025-12-15
   End Date: 2025-12-19
   Start Time: 09:00
   End Time: 17:00
   Interval: 30
   Capacity: 2
   Days: Mon-Fri
   ```
2. Click **"Generate Preview"**
3. Wait for preview to load (should show ~40 slots)
4. Click **"Create Slots"** button
5. ✅ Should see progress bar:
   - Text: "Creating 1/40", "Creating 2/40", etc.
   - Visual progress bar filling up (green)
6. ✅ Should see notification after completion:
   - "Created 40 slots. 0 duplicates skipped."

### Test 5: View Created Slots
1. In Admin panel, click **Time Slots** in left sidebar
2. ✅ Should see a list of the 40 slots just created
3. Each row should show:
   - Service name
   - Start Time
   - End Time
   - Capacity: "0/2 booked" (green since 0% capacity used)
   - Status: "Available" (green)
4. Expand a row (click the expand arrow/button):
   - ✅ Should show "No bookings for this slot"

### Test 6: Verify Database Constraint Works
1. Try to manually create an overlapping slot:
   - Go to **Time Slots** → **Create**
   - Select the same service
   - Set time that overlaps existing slot (e.g., 9:15 AM - 9:45 AM for existing 9:00-9:30)
   - Click Save
2. ✅ Should get an error: "Exclusion Violation" or "Constraint Violation"
   - This proves the database constraint is working!

---

## 📊 Expected Results Summary

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| 1. UI Exists | TimeSlotGenerator visible | | ☐ |
| 2. Generate 40 Slots | 40 slots in preview | | ☐ |
| 3. No Internal Conflicts | All "OK" status | | ☐ |
| 4. Create Slots | Progress bar, success notification | | ☐ |
| 5. View List | 40 slots visible, capacity=0/2 | | ☐ |
| 6. DB Constraint | Overlap rejected with error | | ☐ |

---

## Troubleshooting

### Issue: "Generate Preview" button doesn't work
- Check browser console (F12 → Console tab) for errors
- Verify service_id is being passed to generator
- Check that you're on the Time Slots tab

### Issue: Preview shows 0 slots
- Verify date range is valid (end date ≥ start date)
- Verify start time < end time
- Verify at least one day of week is selected (Mon-Fri)
- Check that interval divides evenly into time range

### Issue: Progress bar doesn't show
- Check browser network tab (F12 → Network) for failures
- Look for 403/401 errors (permission issues)
- Verify admin role is set correctly

### Issue: "Conflict" status shows up
- This is expected if you're creating slots for a service that already has overlapping slots
- Click "Remove Conflicts" to filter them out

### Issue: Slots don't appear in Time Slots list
- Try refreshing the page (F5)
- Check that data provider successfully created rows (check network tab)
- Verify RLS policies allow admin to read time_slots

---

## Next Steps After Testing

✅ If all tests pass:
1. You have a working time slot system!
2. Can now create bookings against these slots
3. Can integrate with calendar view if desired
4. Ready for production deployment

❌ If tests fail:
1. Check browser console for errors
2. Check Supabase logs for database errors
3. Verify migration was fully applied
4. Review the troubleshooting guide

---

## Performance Notes

- Generating 40 slots should take <1 second
- Creating 40 slots should take <10 seconds (progress bar will show each one)
- Listing 40+ slots should load instantly
- Querying by service_id uses the new index for speed

---

Good luck! Let me know which tests pass/fail and we'll debug from there. 🚀
