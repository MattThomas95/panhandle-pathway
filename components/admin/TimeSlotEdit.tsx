import {
  Edit,
  SimpleForm,
  ReferenceInput,
  SelectInput,
  DateTimeInput,
  NumberInput,
  required,
  minValue,
  useRecordContext,
} from "react-admin";

// Custom validator to ensure end_time > start_time
const validateEndTime = (value: string, allValues: any) => {
  if (value && allValues.start_time && new Date(value) <= new Date(allValues.start_time)) {
    return "End time must be after start time";
  }
  return undefined;
};

// Custom validator to ensure capacity >= booked_count
const validateCapacity = (value: number, allValues: any) => {
  if (value < allValues.booked_count) {
    return `Cannot reduce capacity below current bookings (${allValues.booked_count})`;
  }
  return undefined;
};

// Display current bookings info
const BookingInfoField = () => {
  const record = useRecordContext();
  if (!record) return null;

  const percentage = (record.booked_count / record.capacity) * 100;
  const color = percentage >= 100 ? "#f44336" : percentage >= 75 ? "#ff9800" : "#4caf50";

  return (
    <div
      style={{
        padding: "1rem",
        backgroundColor: "#2a2a2a",
        borderRadius: "4px",
        marginTop: "1rem",
        border: "1px solid #444",
        color: "#e0e0e0",
      }}
    >
      <p style={{ margin: "0 0 0.5rem 0", color: "#fff" }}>
        <strong>Current Bookings:</strong>{" "}
        <span style={{ color, fontWeight: "bold" }}>
          {record.booked_count}/{record.capacity}
        </span>
      </p>
      <p style={{ margin: 0, color: "#fff" }}>
        <strong>Status:</strong>{" "}
        <span style={{ color, fontWeight: "bold" }}>
          {record.is_available ? "Available" : "Full"}
        </span>
      </p>
      {record.booked_count > 0 && (
        <p style={{ margin: "0.5rem 0 0 0", color: "#ff6b6b", fontSize: "0.875rem" }}>
          Note: Reducing capacity below {record.booked_count} will be blocked.
        </p>
      )}
    </div>
  );
};

export const TimeSlotEdit = () => (
  <Edit>
    <SimpleForm>
      <ReferenceInput source="service_id" reference="services" label="Service">
        <SelectInput optionText="name" validate={required()} disabled fullWidth />
      </ReferenceInput>

      <DateTimeInput source="start_time" validate={required()} fullWidth />

      <DateTimeInput
        source="end_time"
        validate={[required(), validateEndTime]}
        fullWidth
      />

      <NumberInput
        source="capacity"
        validate={[required(), minValue(1), validateCapacity]}
        fullWidth
        helperText="Maximum number of bookings for this slot"
      />

      <BookingInfoField />
    </SimpleForm>
  </Edit>
);
