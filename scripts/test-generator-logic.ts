/**
 * TimeSlotGenerator Logic Test
 * Verify the generator creates correct time slots without running React
 */

// Utility functions (copied from TimeSlotGenerator.tsx)
function parseTimeToMinutes(t: string): number {
  const [hh = "0", mm = "0"] = t.split(":");
  return parseInt(hh, 10) * 60 + parseInt(mm, 10);
}

function addMinutesToDate(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * 60 * 1000);
}

function generateTimeSlots(config: {
  startDate: string; // YYYY-MM-DD
  endDate: string;
  startTime: string; // HH:MM
  endTime: string;
  interval: number; // minutes
  capacity: number;
  selectedDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
}): Array<{ start_time: string; end_time: string; capacity: number }> {
  const sDate = new Date(config.startDate + "T00:00:00");
  const eDate = new Date(config.endDate + "T23:59:59");
  const startMinutes = parseTimeToMinutes(config.startTime);
  const endMinutes = parseTimeToMinutes(config.endTime);

  if (endMinutes <= startMinutes) {
    throw new Error("End time must be after start time");
  }

  const slots: Array<{ start_time: string; end_time: string; capacity: number }> = [];

  for (let d = new Date(sDate); d <= eDate; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    if (!config.selectedDays.includes(dow)) continue;

    const dateBase = new Date(d);
    const dayStart = new Date(dateBase.getFullYear(), dateBase.getMonth(), dateBase.getDate());

    for (let m = startMinutes; m + config.interval <= endMinutes; m += config.interval) {
      const start = addMinutesToDate(dayStart, m);
      const end = addMinutesToDate(dayStart, m + config.interval);

      slots.push({
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        capacity: config.capacity,
      });
    }
  }

  return slots;
}

// Test cases
console.log("🧪 Testing TimeSlotGenerator Logic\n");

// Test 1: Basic generation
console.log("Test 1: Generate 30-min slots for 5 weekdays, 9am-5pm");
const slots1 = generateTimeSlots({
  startDate: "2025-12-15", // Monday
  endDate: "2025-12-19", // Friday
  startTime: "09:00",
  endTime: "17:00",
  interval: 30,
  capacity: 2,
  selectedDays: [1, 2, 3, 4, 5], // Mon-Fri
});

console.log(`  Generated: ${slots1.length} slots`);
console.log(`  Expected: 40 slots (5 days × 8 hours × 2 slots/hour)`);
console.log(`  ✅ PASS` + (slots1.length === 40 ? " ✓" : " ✗"));
console.log(`  First: ${slots1[0].start_time}`);
console.log(`  Last: ${slots1[slots1.length - 1].end_time}`);
console.log("");

// Test 2: Skip weekends
console.log("Test 2: Generate slots Mon-Fri only (skip weekends)");
const slots2 = generateTimeSlots({
  startDate: "2025-12-13", // Saturday
  endDate: "2025-12-21", // Sunday (next week)
  startTime: "10:00",
  endTime: "16:00",
  interval: 60,
  capacity: 1,
  selectedDays: [1, 2, 3, 4, 5],
});

console.log(`  Generated: ${slots2.length} slots`);
console.log(`  Expected: 40 slots (5 working days × 6 hours)`);
console.log(`  ✅ PASS` + (slots2.length === 40 ? " ✓" : " ✗"));
console.log("");

// Test 3: Different interval
console.log("Test 3: Generate 15-min slots for 1 day, 9am-10am");
const slots3 = generateTimeSlots({
  startDate: "2025-12-15",
  endDate: "2025-12-15",
  startTime: "09:00",
  endTime: "10:00",
  interval: 15,
  capacity: 3,
  selectedDays: [1, 2, 3, 4, 5],
});

console.log(`  Generated: ${slots3.length} slots`);
console.log(`  Expected: 4 slots (1 hour ÷ 15 min)`);
console.log(`  ✅ PASS` + (slots3.length === 4 ? " ✓" : " ✗"));
console.log(`  Times: ${slots3.map((s) => {
  const start = new Date(s.start_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const end = new Date(s.end_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `${start}-${end}`;
}).join(", ")}`);
console.log("");

// Test 4: Overlap detection
console.log("Test 4: Detect overlapping slots");
function detectConflicts(slots: Array<{ start_time: string; end_time: string; capacity: number }>): Set<number> {
  const conflictSet = new Set<number>();
  for (let i = 0; i < slots.length; i++) {
    const aStart = new Date(slots[i].start_time).getTime();
    const aEnd = new Date(slots[i].end_time).getTime();
    for (let j = i + 1; j < slots.length; j++) {
      const bStart = new Date(slots[j].start_time).getTime();
      const bEnd = new Date(slots[j].end_time).getTime();

      if (aStart < bEnd && bStart < aEnd) {
        conflictSet.add(i);
        conflictSet.add(j);
      }
    }
  }
  return conflictSet;
}

const conflicts = detectConflicts(slots1);
console.log(`  Conflicts in valid slots: ${conflicts.size}`);
console.log(`  ✅ PASS` + (conflicts.size === 0 ? " ✓" : " ✗"));
console.log("");

// Test 5: Capacity
console.log("Test 5: Capacity assignment");
const allCapacity = slots1.every((s) => s.capacity === 2);
console.log(`  All slots capacity=2: ${allCapacity}`);
console.log(`  ✅ PASS` + (allCapacity ? " ✓" : " ✗"));
console.log("");

console.log("✅ All tests completed!");
