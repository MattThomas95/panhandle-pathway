import React, { useState } from "react";
import { useDataProvider, useNotify, useRefresh, useRecordContext } from "react-admin";

type TimeSlotTemplate = {
  name: string;
  startTime: string;
  endTime: string;
  capacity: number;
};

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

const DEFAULT_TEMPLATES: TimeSlotTemplate[] = [
  { name: "CDA", startTime: "09:00", endTime: "15:00", capacity: 1 },
];

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DEFAULT_DAY_RANGES: Record<number, DayTimeRange> = {
  0: { startTime: "09:00", endTime: "15:00", capacity: 1 }, // Sun
  1: { startTime: "09:00", endTime: "15:00", capacity: 1 }, // Mon
  2: { startTime: "09:00", endTime: "15:00", capacity: 1 }, // Tue
  3: { startTime: "09:00", endTime: "15:00", capacity: 1 }, // Wed
  4: { startTime: "09:00", endTime: "15:00", capacity: 1 }, // Thu
  5: { startTime: "09:00", endTime: "15:00", capacity: 1 }, // Fri
  6: { startTime: "09:00", endTime: "15:00", capacity: 1 }, // Sat
};

export default function TimeSlotTemplateGenerator({ serviceId, onGenerate }: { serviceId?: string; onGenerate?: (slots: GeneratedSlot[]) => void }) {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const record = useRecordContext();

  const [selectedTemplate, setSelectedTemplate] = useState<TimeSlotTemplate | null>(DEFAULT_TEMPLATES[0]);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
  const [date, setDate] = useState<string>("");
  const [templates, setTemplates] = useState<TimeSlotTemplate[]>(DEFAULT_TEMPLATES);
  const [dayRanges, setDayRanges] = useState<Record<number, DayTimeRange>>(DEFAULT_DAY_RANGES);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateStartTime, setNewTemplateStartTime] = useState("09:00");
  const [newTemplateEndTime, setNewTemplateEndTime] = useState("15:00");
  const [newTemplateCapacity, setNewTemplateCapacity] = useState(1);
  const [preview, setPreview] = useState<GeneratedSlot[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);
  const [totalToCreate, setTotalToCreate] = useState(0);

  function toggleDay(index: number) {
    setSelectedDays((prev) =>
      prev.includes(index) ? prev.filter((d) => d !== index) : [...prev, index].sort()
    );
  }

  function addTemplate() {
    if (!newTemplateName.trim()) {
      notify("Template name required", { type: "warning" });
      return;
    }
    const newTemplate: TimeSlotTemplate = {
      name: newTemplateName,
      startTime: newTemplateStartTime,
      endTime: newTemplateEndTime,
      capacity: newTemplateCapacity,
    };
    setTemplates([...templates, newTemplate]);
    setNewTemplateName("");
    notify(`Template "${newTemplateName}" created`, { type: "info" });
  }

  function generate() {
    if (!date) {
      notify("Date required", { type: "warning" });
      return;
    }
    if (!selectedTemplate) {
      notify("Select a template", { type: "warning" });
      return;
    }
    if (selectedDays.length === 0) {
      notify("Select at least one day", { type: "warning" });
      return;
    }

    const baseDate = new Date(date + "T00:00:00");
    const slots: GeneratedSlot[] = [];

    // Generate one slot per selected day, all with same template times
    for (let dayOffset = 0; dayOffset < 365; dayOffset++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(currentDate.getDate() + dayOffset);
      const dow = currentDate.getDay();

      if (!selectedDays.includes(dow)) continue;

      // Get day-specific time range, or use template if not configured
      const dayRange = dayRanges[dow] || selectedTemplate;
      const [startHH, startMM] = dayRange.startTime.split(":").map(Number);
      const [endHH, endMM] = dayRange.endTime.split(":").map(Number);

      const startTime = new Date(currentDate);
      startTime.setHours(startHH, startMM, 0, 0);

      const endTime = new Date(currentDate);
      endTime.setHours(endHH, endMM, 0, 0);

      slots.push({
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        capacity: dayRange.capacity,
        service_id: serviceId,
      });

      // Stop after finding 365 days ahead (limit to prevent infinite loops)
      if (slots.length >= 365) break;
    }

    setPreview(slots);
    if (onGenerate) onGenerate(slots);
    notify(`Generated ${slots.length} slots for selected days`, { type: "info" });
  }

  const createSlots = async () => {
    if (!preview || preview.length === 0) {
      notify("No slots to create", { type: "info" });
      return;
    }

    setIsCreating(true);
    setCreatedCount(0);

    try {
      const { data: existing = [] } = await dataProvider.getList("time_slots", {
        filter: { service_id: record?.id },
        pagination: { page: 1, perPage: 10000 },
        sort: { field: "start_time", order: "ASC" },
      });

      const existingStarts = new Set(
        (existing as Record<string, unknown>[]).map((s) => s.start_time as string)
      );
      const newSlots = preview.filter((s) => !existingStarts.has(s.start_time));
      const skipped = preview.length - newSlots.length;
      setTotalToCreate(newSlots.length);

      if (newSlots.length === 0) {
        notify(`No new slots to create. ${skipped} duplicates skipped.`, { type: "info" });
        setPreview([]);
        setIsCreating(false);
        return;
      }

      for (let i = 0; i < newSlots.length; i++) {
        const s = newSlots[i];
        await dataProvider.create("time_slots", { data: { ...s, service_id: record?.id } });
        setCreatedCount((c) => c + 1);
      }

      notify(`Created ${newSlots.length} slots. ${skipped} duplicates skipped.`, { type: "info" });
      setPreview([]);
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
      <h3 style={{ marginTop: 0, color: "#fff" }}>Time Slot Template Generator</h3>

      {/* Step 1: Select or Create Template */}
      <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #444" }}>
        <h4 style={{ color: "#fff" }}>Step 1: Template</h4>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 12 }}>
          <label style={{ color: "#e0e0e0" }}>
            Select Template
            <select
              value={selectedTemplate?.name || ""}
              onChange={(e) => {
                const tmpl = templates.find((t) => t.name === e.target.value);
                setSelectedTemplate(tmpl || null);
              }}
              style={{ display: "block", marginTop: 4, padding: "4px 8px", background: "#1e1e1e", color: "#e0e0e0", border: "1px solid #444", borderRadius: 4 }}
            >
              {templates.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name} ({t.startTime}-{t.endTime}, cap: {t.capacity})
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedTemplate && (
          <div style={{ padding: 8, background: "#2a2a2a", borderRadius: 4, marginBottom: 12, color: "#e0e0e0", border: "1px solid #444" }}>
            <strong style={{ color: "#fff" }}>Current Template:</strong> {selectedTemplate.name}
            <br />
            Time: {new Date(`2000-01-01T${selectedTemplate.startTime}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })} - {new Date(`2000-01-01T${selectedTemplate.endTime}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
            <br />
            Capacity: {selectedTemplate.capacity}
          </div>
        )}

        {/* Create New Template */}
        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: "pointer", fontWeight: "bold", marginBottom: 8, color: "#fff" }}>
            ➕ Create New Template
          </summary>
          <div style={{ padding: 8, background: "#2a2a2a", borderRadius: 4, marginTop: 8, color: "#e0e0e0", border: "1px solid #444" }}>
            <label style={{ display: "block", marginBottom: 8 }}>
              Name
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="e.g., Lunch Service"
                style={{ display: "block", marginTop: 4, padding: "4px 8px", width: "100%", background: "#1e1e1e", color: "#e0e0e0", border: "1px solid #444", borderRadius: 4 }}
              />
            </label>
            <label style={{ display: "block", marginBottom: 8 }}>
              Start Time
              <input
                type="time"
                value={newTemplateStartTime}
                onChange={(e) => setNewTemplateStartTime(e.target.value)}
                style={{ display: "block", marginTop: 4, padding: "4px 8px", background: "#1e1e1e", color: "#e0e0e0", border: "1px solid #444", borderRadius: 4 }}
              />
            </label>
            <label style={{ display: "block", marginBottom: 8 }}>
              End Time
              <input
                type="time"
                value={newTemplateEndTime}
                onChange={(e) => setNewTemplateEndTime(e.target.value)}
                style={{ display: "block", marginTop: 4, padding: "4px 8px", background: "#1e1e1e", color: "#e0e0e0", border: "1px solid #444", borderRadius: 4 }}
              />
            </label>
            <label style={{ display: "block", marginBottom: 8 }}>
              Capacity
              <input
                type="number"
                min={1}
                value={newTemplateCapacity}
                onChange={(e) => setNewTemplateCapacity(Math.max(1, Number(e.target.value) || 1))}
                style={{ display: "block", marginTop: 4, padding: "4px 8px", width: 60, background: "#1e1e1e", color: "#e0e0e0", border: "1px solid #444", borderRadius: 4 }}
              />
            </label>
            <button type="button" onClick={addTemplate} style={{ padding: "6px 12px", cursor: "pointer", background: "#0d47a1", color: "#fff", border: "none", borderRadius: 4 }}>
              Add Template
            </button>
          </div>
        </details>
      </div>

      {/* Step 2: Select Date and Days */}
      <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #444" }}>
        <h4 style={{ color: "#fff" }}>Step 2: Date & Days</h4>
        <label style={{ display: "block", marginBottom: 12, color: "#e0e0e0" }}>
          Start Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ display: "block", marginTop: 4, padding: "4px 8px", background: "#1e1e1e", color: "#e0e0e0", border: "1px solid #444", borderRadius: 4 }}
          />
        </label>

        <div style={{ marginBottom: 12, color: "#e0e0e0" }}>
          <div style={{ marginBottom: 6 }}>Days to Create Slots For</div>
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

        {/* Day-specific time ranges */}
        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: "pointer", fontWeight: "bold", marginBottom: 8, color: "#fff" }}>
            ⏰ Set Time Range per Day
          </summary>
          <div style={{ padding: 8, background: "#2a2a2a", borderRadius: 4, marginTop: 8, border: "1px solid #444" }}>
            {days.map((dayName, dayIndex) => (
              <div key={dayIndex} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: dayIndex < 6 ? "1px solid #333" : "none" }}>
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
                  <label style={{ color: "#e0e0e0" }}>
                    Capacity
                    <input
                      type="number"
                      min={1}
                      value={dayRanges[dayIndex]?.capacity || DEFAULT_DAY_RANGES[dayIndex].capacity}
                      onChange={(e) => setDayRanges({ ...dayRanges, [dayIndex]: { ...dayRanges[dayIndex], capacity: Math.max(1, Number(e.target.value) || 1) } })}
                      style={{ display: "block", marginTop: 4, padding: "4px 8px", width: 60, background: "#1e1e1e", color: "#e0e0e0", border: "1px solid #444", borderRadius: 4 }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* Step 3: Generate & Create */}
      <div>
        <h4 style={{ color: "#fff" }}>Step 3: Generate & Create</h4>
        <button
          type="button"
          onClick={generate}
          style={{ padding: "8px 16px", marginRight: 8, cursor: "pointer", background: "#0d47a1", color: "#fff", border: "none", borderRadius: 4 }}
          disabled={isCreating}
        >
          Generate Slots
        </button>

        {preview.length > 0 && (
          <div style={{ marginTop: 12, padding: 12, background: "#2a2a2a", borderRadius: 4, color: "#e0e0e0", border: "1px solid #444" }}>
            <div style={{ marginBottom: 8 }}>
              <strong style={{ color: "#fff" }}>{preview.length}</strong> slots ready to create
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                Create Slots
              </button>
              <button
                type="button"
                onClick={() => setPreview([])}
                style={{ padding: "8px 16px", cursor: "pointer", background: "#444", color: "#e0e0e0", border: "1px solid #666", borderRadius: 4 }}
                disabled={isCreating}
              >
                Clear
              </button>

              {isCreating && (
                <div style={{ marginLeft: 12 }}>
                  <div style={{ marginBottom: 6, color: "#e0e0e0" }}>
                    Creating {createdCount}/{totalToCreate}
                  </div>
                  <div style={{ width: 200, height: 8, background: "#444", borderRadius: 4 }}>
                    <div
                      style={{
                        width: totalToCreate > 0 ? `${(createdCount / totalToCreate) * 100}%` : "0%",
                        height: "100%",
                        background: "#4caf50",
                        borderRadius: 4,
                        transition: "width 200ms linear",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Preview Table */}
            <div style={{ marginTop: 12, maxHeight: 300, overflow: "auto", borderTop: "1px solid #444", paddingTop: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9em" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #444" }}>
                    <th style={{ textAlign: "left", padding: 6, color: "#fff" }}>Date</th>
                    <th style={{ textAlign: "left", padding: 6, color: "#fff" }}>Time</th>
                    <th style={{ textAlign: "left", padding: 6, color: "#fff" }}>Cap</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 20).map((s, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #333" }}>
                      <td style={{ padding: 6, color: "#e0e0e0" }}>
                        {new Date(s.start_time).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </td>
                      <td style={{ padding: 6, color: "#e0e0e0" }}>
                        {new Date(s.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })} -{" "}
                        {new Date(s.end_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                      </td>
                      <td style={{ padding: 6, color: "#e0e0e0" }}>{s.capacity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 20 && (
                <div style={{ padding: 8, color: "#888" }}>
                  ... and {preview.length - 20} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


