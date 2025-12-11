import React, { useState, useEffect } from "react";
import { useDataProvider, useNotify, useRefresh, useRecordContext } from "react-admin";

type DayTimeRange = {
  startTime: string;
  endTime: string;
  capacity: number;
};

type GeneratedSlot = {
  start_time: string;
  end_time: string;
  capacity: number;
  service_id?: string;
};

type Props = {
  serviceId?: string;
  defaultCapacity?: number;
  onGenerate?: (slots: GeneratedSlot[]) => void;
};

const DEFAULT_DAY_RANGES: Record<number, DayTimeRange> = {
  0: { startTime: "09:00", endTime: "15:00", capacity: 1 }, // Sun
  1: { startTime: "09:00", endTime: "15:00", capacity: 1 }, // Mon
  2: { startTime: "09:00", endTime: "15:00", capacity: 1 }, // Tue
  3: { startTime: "09:00", endTime: "15:00", capacity: 1 }, // Wed
  4: { startTime: "09:00", endTime: "15:00", capacity: 1 }, // Thu
  5: { startTime: "09:00", endTime: "15:00", capacity: 1 }, // Fri
  6: { startTime: "09:00", endTime: "15:00", capacity: 1 }, // Sat
};

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseTimeToMinutes(t: string) {
  const [hh = "0", mm = "0"] = t.split(":");
  return parseInt(hh, 10) * 60 + parseInt(mm, 10);
}

function addMinutesToDate(d: Date, minutes: number) {
  return new Date(d.getTime() + minutes * 60 * 1000);
}

export default function TimeSlotGenerator({ serviceId, defaultCapacity = 1, onGenerate }: Props) {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const record = useRecordContext();

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [dayRanges, setDayRanges] = useState<Record<number, DayTimeRange>>(() => {
    const ranges: Record<number, DayTimeRange> = {};
    for (let i = 0; i < 7; i++) {
      ranges[i] = { ...DEFAULT_DAY_RANGES[i], capacity: defaultCapacity };
    }
    return ranges;
  });
  const [preview, setPreview] = useState<GeneratedSlot[]>([]);
  const [conflicts, setConflicts] = useState<Set<number>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);
  const [totalToCreate, setTotalToCreate] = useState(0);

  // Update dayRanges when defaultCapacity changes
  useEffect(() => {
    setDayRanges((prev) => {
      const updated: Record<number, DayTimeRange> = {};
      for (let i = 0; i < 7; i++) {
        updated[i] = { ...prev[i], capacity: defaultCapacity };
      }
      return updated;
    });
  }, [defaultCapacity]);

  function toggleDay(index: number) {
    setSelectedDays((prev) =>
      prev.includes(index) ? prev.filter((d) => d !== index) : [...prev, index].sort()
    );
  }

  async function generate() {
    if (!startDate || !endDate) {
      notify("Start and end dates required", { type: "warning" });
      return;
    }
    if (selectedDays.length === 0) {
      notify("Select at least one day", { type: "warning" });
      return;
    }

    const sDate = new Date(startDate + "T00:00:00");
    const eDate = new Date(endDate + "T23:59:59");

    const slots: GeneratedSlot[] = [];
    for (let d = new Date(sDate); d <= eDate; d.setDate(d.getDate() + 1)) {
      const dow = d.getDay();
      if (!selectedDays.includes(dow)) continue;

      const dayRange = dayRanges[dow];
      const startMinutes = parseTimeToMinutes(dayRange.startTime);
      const endMinutes = parseTimeToMinutes(dayRange.endTime);

      if (endMinutes <= startMinutes) continue;

      const dateBase = new Date(d);
      const dayStart = new Date(dateBase.getFullYear(), dateBase.getMonth(), dateBase.getDate());

      const start = addMinutesToDate(dayStart, startMinutes);
      const end = addMinutesToDate(dayStart, endMinutes);

      slots.push({
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        capacity: dayRange.capacity,
        service_id: serviceId || record?.id,
      });
    }

    setPreview(slots);

    // detect conflicts within the generated preview
    const conflictIndices = detectConflicts(slots);

    // detect conflicts against existing slots in backend
    let existingConflictSet = new Set<number>();
    if ((serviceId || record?.id) && slots.length > 0) {
      try {
        const { data: existing = [] } = await dataProvider.getList("time_slots", {
          filter: { service_id: serviceId || record?.id },
          pagination: { page: 1, perPage: 10000 },
          sort: { field: "start_time", order: "ASC" },
        });

        const existingIntervals = (existing as Record<string, unknown>[]).map((e) => ({
          start: new Date(e.start_time as string).getTime(),
          end: new Date(e.end_time as string).getTime(),
        }));

        for (let i = 0; i < slots.length; i++) {
          const aStart = new Date(slots[i].start_time).getTime();
          const aEnd = new Date(slots[i].end_time).getTime();
          for (let k = 0; k < existingIntervals.length; k++) {
            const ex = existingIntervals[k];
            if (aStart < ex.end && ex.start < aEnd) {
              existingConflictSet.add(i);
              break;
            }
          }
        }
      } catch (err) {
        console.error("Error fetching existing slots:", err);
        notify("Could not check existing slots for conflicts", { type: "warning" });
      }
    }

    const combined = new Set<number>([...Array.from(conflictIndices), ...Array.from(existingConflictSet)]);
    setConflicts(combined);

    if (onGenerate) onGenerate(slots);
    notify(`Generated ${slots.length} slots (${combined.size} conflicts)`, { type: "info" });
  }

  function detectConflicts(slots: GeneratedSlot[]) {
    const conflictSet = new Set<number>();
    for (let i = 0; i < slots.length; i++) {
      const aStart = new Date(slots[i].start_time).getTime();
      const aEnd = new Date(slots[i].end_time).getTime();
      for (let j = i + 1; j < slots.length; j++) {
        const bStart = new Date(slots[j].start_time).getTime();
        const bEnd = new Date(slots[j].end_time).getTime();

        // consider overlap if intervals intersect
        if (aStart < bEnd && bStart < aEnd) {
          conflictSet.add(i);
          conflictSet.add(j);
        }
      }
    }
    return conflictSet;
  }

  function removeConflicts() {
    if (conflicts.size === 0) return;
    const filtered = preview.filter((_, i) => !conflicts.has(i));
    setPreview(filtered);
    setConflicts(new Set());
    if (onGenerate) onGenerate(filtered);
  }

  const createSlots = async () => {
    if (!preview || preview.length === 0) {
      notify("No slots to create", { type: "info" });
      return;
    }

    setIsCreating(true);
    setCreatedCount(0);

    try {
      // Filter out conflicting slots
      const slotsToCreate = preview.filter((_, i) => !conflicts.has(i));
      setTotalToCreate(slotsToCreate.length);

      let created = 0;
      for (const s of slotsToCreate) {
        try {
          await dataProvider.create("time_slots", { data: s });
          created++;
          setCreatedCount((c) => c + 1);
        } catch (err) {
          console.error("Error creating slot:", err);
        }
      }

      notify(`Created ${created} time slots`, { type: "info" });
      setPreview([]);
      setConflicts(new Set());
      refresh();
    } catch (err) {
      console.error(err);
      notify("Error creating slots", { type: "warning" });
    } finally {
      setIsCreating(false);
      setTotalToCreate(0);
      setCreatedCount(0);
    }
  };

  return (
    <div style={{ padding: "1rem", border: "1px solid #444", borderRadius: 6, backgroundColor: "#1e1e1e", color: "#e0e0e0" }}>
      <h3 style={{ marginTop: 0, color: "#fff" }}>Time Slot Generator</h3>

      {/* Step 1: Date Range */}
      <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #444" }}>
        <h4 style={{ color: "#fff" }}>Step 1: Date Range</h4>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label style={{ color: "#e0e0e0" }}>
            Start Date
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ display: "block", marginTop: 4, padding: "4px 8px", background: "#1e1e1e", color: "#e0e0e0", border: "1px solid #444", borderRadius: 4 }}
            />
          </label>

          <label style={{ color: "#e0e0e0" }}>
            End Date
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ display: "block", marginTop: 4, padding: "4px 8px", background: "#1e1e1e", color: "#e0e0e0", border: "1px solid #444", borderRadius: 4 }}
            />
          </label>
        </div>
      </div>

      {/* Step 2: Days */}
      <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #444" }}>
        <h4 style={{ color: "#fff" }}>Step 2: Days</h4>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {days.map((d, i) => (
            <label key={d} style={{ userSelect: "none", color: "#e0e0e0" }}>
              <input
                type="checkbox"
                checked={selectedDays.includes(i)}
                onChange={() => toggleDay(i)}
              />
              <span style={{ marginLeft: 6 }}>{d}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Step 3: Day-specific time ranges */}
      <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #444" }}>
        <h4 style={{ color: "#fff" }}>Step 3: Time Range per Day</h4>
        <details>
          <summary style={{ cursor: "pointer", fontWeight: "bold", marginBottom: 8, color: "#fff" }}>
            ⏰ Configure Time Ranges
          </summary>
          <div style={{ padding: 8, background: "#2a2a2a", borderRadius: 4, marginTop: 8, border: "1px solid #444" }}>
            {days.map((dayName, dayIndex) => selectedDays.includes(dayIndex) && (
              <div key={dayIndex} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: selectedDays.indexOf(dayIndex) < selectedDays.length - 1 ? "1px solid #333" : "none" }}>
                <label style={{ display: "block", marginBottom: 8, color: "#fff", fontWeight: "bold" }}>
                  {dayName}
                </label>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
                  <label style={{ color: "#e0e0e0" }}>
                    Start Time
                    <input
                      type="time"
                      value={dayRanges[dayIndex]?.startTime || DEFAULT_DAY_RANGES[dayIndex].startTime}
                      onChange={(e) => setDayRanges({ ...dayRanges, [dayIndex]: { ...dayRanges[dayIndex], startTime: e.target.value } })}
                      style={{ display: "block", marginTop: 4, padding: "4px 8px", background: "#1e1e1e", color: "#e0e0e0", border: "1px solid #444", borderRadius: 4 }}
                    />
                  </label>
                  <label style={{ color: "#e0e0e0" }}>
                    End Time
                    <input
                      type="time"
                      value={dayRanges[dayIndex]?.endTime || DEFAULT_DAY_RANGES[dayIndex].endTime}
                      onChange={(e) => setDayRanges({ ...dayRanges, [dayIndex]: { ...dayRanges[dayIndex], endTime: e.target.value } })}
                      style={{ display: "block", marginTop: 4, padding: "4px 8px", background: "#1e1e1e", color: "#e0e0e0", border: "1px solid #444", borderRadius: 4 }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* Step 4: Generate & Create */}
      <div>
        <h4 style={{ color: "#fff" }}>Step 4: Generate & Create</h4>
        <button
          type="button"
          onClick={generate}
          style={{ padding: "8px 16px", marginRight: 8, cursor: "pointer", background: "#0d47a1", color: "#fff", border: "none", borderRadius: 4 }}
          disabled={isCreating}
        >
          Generate Preview
        </button>

        {preview.length > 0 && (
          <div style={{ marginTop: 12, padding: 12, background: "#2a2a2a", borderRadius: 4, color: "#e0e0e0", border: "1px solid #444" }}>
            <div style={{ marginBottom: 8, display: "flex", gap: 12, alignItems: "center" }}>
              <div>
                <strong style={{ color: "#fff" }}>{preview.length}</strong> slots ready ({conflicts.size} conflicts)
              </div>
              {conflicts.size > 0 && (
                <button
                  type="button"
                  onClick={removeConflicts}
                  style={{ padding: "4px 8px", background: "#d32f2f", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
                >
                  Remove Conflicts
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
              <button
                type="button"
                onClick={createSlots}
                style={{
                  padding: "8px 16px",
                  cursor: isCreating ? "not-allowed" : "pointer",
                  background: "#1b5e20",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  opacity: isCreating ? 0.6 : 1,
                }}
                disabled={isCreating}
              >
                {isCreating ? `Creating ${createdCount}/${totalToCreate}...` : "✓ Create All Slots"}
              </button>
              <button
                type="button"
                onClick={() => { setPreview([]); setConflicts(new Set()); }}
                style={{ padding: "8px 16px", cursor: "pointer", background: "#444", color: "#e0e0e0", border: "1px solid #666", borderRadius: 4 }}
                disabled={isCreating}
              >
                Clear
              </button>
            </div>

            {/* Preview Table */}
            <div style={{ maxHeight: 300, overflow: "auto", borderTop: "1px solid #444", paddingTop: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9em" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #444" }}>
                    <th style={{ textAlign: "left", padding: 6, color: "#fff" }}>Date</th>
                    <th style={{ textAlign: "left", padding: 6, color: "#fff" }}>Time</th>
                    <th style={{ textAlign: "left", padding: 6, color: "#fff" }}>Cap</th>
                    <th style={{ textAlign: "left", padding: 6, color: "#fff" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((s, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #333", backgroundColor: conflicts.has(i) ? "#3d1e1e" : "transparent" }}>
                      <td style={{ padding: 6, color: "#e0e0e0" }}>
                        {new Date(s.start_time).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </td>
                      <td style={{ padding: 6, color: "#e0e0e0" }}>
                        {new Date(s.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })} -{" "}
                        {new Date(s.end_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                      </td>
                      <td style={{ padding: 6, color: "#e0e0e0" }}>{s.capacity}</td>
                      <td style={{ padding: 6 }}>
                        {conflicts.has(i) ? (
                          <span style={{ color: "#ff6b6b", fontWeight: "bold" }}>Conflict</span>
                        ) : (
                          <span style={{ color: "#4caf50", fontWeight: "bold" }}>✓ OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
