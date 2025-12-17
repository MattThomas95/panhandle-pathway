import {
  List,
  Datagrid,
  TextField,
  DateField,
  ReferenceField,
  EditButton,
  DeleteButton,
  FunctionField,
  useRecordContext,
  useGetList,
  useDataProvider,
  useNotify,
  useRefresh,
  Filter,
  SelectInput,
  ReferenceInput,
  TopToolbar,
  CreateButton,
} from "react-admin";

import { useState } from "react";
import { useExportCSV } from "./useExportCSV";

// Checkbox field component
const CheckboxField = ({ selectedIds, onToggle }: { selectedIds: Set<number>; onToggle: (id: number) => void }) => {
  const record = useRecordContext();
  if (!record) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggle(record.id);
  };

  return (
    <input
      type="checkbox"
      checked={selectedIds.has(record.id)}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      style={{ cursor: "pointer", width: 18, height: 18 }}
    />
  );
};

// Custom capacity field with color coding
const CapacityField = () => {
  const record = useRecordContext();
  if (!record) return null;

  const percentage = (record.booked_count / record.capacity) * 100;
  let color = "green";
  if (percentage >= 100) {
    color = "red";
  } else if (percentage >= 75) {
    color = "orange";
  }

  return (
    <span style={{ color, fontWeight: "bold" }}>
      {record.booked_count}/{record.capacity} booked
    </span>
  );
};

// Bulk delete with checkboxes component
const BulkDeleteSection = ({ selectedIds, onSelectionChange }: { selectedIds: Set<number>; onSelectionChange: (ids: Set<number>) => void }) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Are you sure you want to DELETE ${selectedIds.size} time slot(s)? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      let deleted = 0;
      for (const id of selectedIds) {
        try {
          await dataProvider.delete("time_slots", { id });
          deleted++;
        } catch (err) {
          console.error("Error deleting slot", id, err);
        }
      }

      notify(`Deleted ${deleted} time slot(s)`, { type: "info" });
      onSelectionChange(new Set());
      refresh();
    } catch (err) {
      console.error(err);
      notify("Error deleting time slots", { type: "warning" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
      {selectedIds.size > 0 && (
        <button
          onClick={handleDeleteSelected}
          disabled={isDeleting}
          style={{
            padding: "8px 16px",
            background: "#d32f2f",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: isDeleting ? "not-allowed" : "pointer",
            opacity: isDeleting ? 0.6 : 1,
          }}
        >
          {isDeleting ? "Deleting..." : `Delete ${selectedIds.size} Selected`}
        </button>
      )}
    </div>
  );
};

// Export and create actions
const TimeSlotListActions = () => {
  const { exportToCSV } = useExportCSV();

  return (
    <TopToolbar>
      <CreateButton />
      <button
        onClick={() =>
          exportToCSV({
            resourceName: "time_slots",
            filename: "time-slots",
            fields: ["service_id", "start_time", "end_time", "capacity", "booked_count", "is_available"],
            referenceFields: {
              service_id: { resource: "services", displayField: "name" },
            },
          })
        }
        style={{
          padding: "8px 16px",
          background: "#1976d2",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          marginLeft: "0.5rem",
        }}
      >
        Export CSV
      </button>
    </TopToolbar>
  );
};

// Filter component
const TimeSlotFilter = () => (
  <Filter>
    <ReferenceInput source="service_id" reference="services" label="Service" alwaysOn>
      <SelectInput optionText="name" />
    </ReferenceInput>
    <SelectInput
      source="is_available"
      label="Availability"
      choices={[
        { id: true, name: "Available" },
        { id: false, name: "Full" },
      ]}
    />
  </Filter>
);

// Expandable row showing booking details
const TimeSlotExpand = () => {
  const record = useRecordContext();
  const { data: bookings, isLoading } = useGetList("bookings", {
    filter: {
      slot_id: record?.id,
    },
    pagination: { page: 1, perPage: 100 },
    sort: { field: "created_at", order: "DESC" },
  });

  if (isLoading) return <div style={{ padding: "1rem" }}>Loading bookings...</div>;

  const confirmedBookings = bookings?.filter(
    (b) => b.status === "confirmed" || b.status === "pending"
  );

  if (!confirmedBookings || confirmedBookings.length === 0) {
    return <div style={{ padding: "1rem" }}>No bookings for this slot</div>;
  }

  return (
    <div style={{ padding: "1rem", backgroundColor: "#1e1e1e", borderRadius: 4, color: "#e0e0e0" }}>
      <h4 style={{ color: "#fff", marginTop: 0 }}>Bookings ({confirmedBookings.length}/{record?.capacity})</h4>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #444" }}>
            <th style={{ textAlign: "left", padding: "0.5rem", color: "#fff" }}>User</th>
            <th style={{ textAlign: "left", padding: "0.5rem", color: "#fff" }}>Organization</th>
            <th style={{ textAlign: "left", padding: "0.5rem", color: "#fff" }}>Status</th>
            <th style={{ textAlign: "left", padding: "0.5rem", color: "#fff" }}>Booked At</th>
          </tr>
        </thead>
        <tbody>
          {confirmedBookings.map((booking) => (
            <tr key={booking.id} style={{ borderTop: "1px solid #333" }}>
              <td style={{ padding: "0.5rem", color: "#e0e0e0" }}>
                <ReferenceField
                  record={booking}
                  source="user_id"
                  reference="profiles"
                  link="show"
                >
                  <TextField source="email" />
                </ReferenceField>
              </td>
              <td style={{ padding: "0.5rem", color: "#e0e0e0" }}>
                <ReferenceField
                  record={booking}
                  source="user_id"
                  reference="profiles"
                  link={false}
                >
                  <ReferenceField
                    source="organization_id"
                    reference="organizations"
                    link="show"
                  >
                    <TextField source="name" />
                  </ReferenceField>
                </ReferenceField>
              </td>
              <td style={{ padding: "0.5rem" }}>
                <span
                  style={{
                    color:
                      booking.status === "confirmed"
                        ? "#4caf50"
                        : booking.status === "pending"
                        ? "#ff9800"
                        : "#999",
                    fontWeight: "bold",
                  }}
                >
                  {booking.status}
                </span>
              </td>
              <td style={{ padding: "0.5rem", color: "#e0e0e0" }}>
                <DateField record={booking} source="created_at" showTime />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const TimeSlotList = () => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  // Fetch all time slots to populate the select all
  const { data: allTimeSlots = [] } = useGetList("time_slots", {
    pagination: { page: 1, perPage: 10000 },
    sort: { field: "start_time", order: "ASC" },
  });

  const allSlotIds = new Set(allTimeSlots.map((slot: any) => slot.id));

  const handleToggleSelection = (id: number) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (selectedIds.size === allSlotIds.size && allSlotIds.size > 0) {
      // Deselect all
      setSelectedIds(new Set());
    } else {
      // Select all
      setSelectedIds(new Set(allSlotIds));
    }
  };

  const isAllSelected = allSlotIds.size > 0 && selectedIds.size === allSlotIds.size;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < allSlotIds.size;

  return (
    <List sort={{ field: "start_time", order: "ASC" }} filters={<TimeSlotFilter />} actions={<TimeSlotListActions />}>
      <BulkDeleteSection selectedIds={selectedIds} onSelectionChange={setSelectedIds} />
      <div style={{ marginBottom: "0.5rem" }}>
        <input
          type="checkbox"
          ref={(el) => {
            if (el) {
              el.indeterminate = isSomeSelected;
            }
          }}
          checked={isAllSelected}
          onChange={handleSelectAll}
          onClick={(e) => e.stopPropagation()}
          style={{ cursor: "pointer", width: 18, height: 18 }}
          title="Select all"
        />
      </div>
      <Datagrid expand={<TimeSlotExpand />} bulkActionButtons={false}>
        <FunctionField
          label=""
          render={() => (
            <CheckboxField selectedIds={selectedIds} onToggle={handleToggleSelection} />
          )}
        />
        <ReferenceField source="service_id" reference="services" label="Service" link="show">
          <TextField source="name" />
        </ReferenceField>
        <DateField source="start_time" label="Start Time" showTime />
        <DateField source="end_time" label="End Time" showTime />
        <CapacityField />
        <FunctionField
          label="Status"
          render={(record: any) => (
            <span
              style={{
                color: record.is_available ? "green" : "red",
                fontWeight: "bold",
              }}
            >
              {record.is_available ? "Available" : "Full"}
            </span>
          )}
        />
        <EditButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};





