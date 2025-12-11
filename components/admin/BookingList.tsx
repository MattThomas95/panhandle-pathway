import {
  List,
  Datagrid,
  TextField,
  DateField,
  ReferenceField,
  SelectField,
  EditButton,
  DeleteButton,
  Filter,
  SelectInput,
  ReferenceInput,
  TopToolbar,
} from "react-admin";
import { useExportCSV } from "./useExportCSV";

const statusChoices = [
  { id: "pending", name: "Pending" },
  { id: "confirmed", name: "Confirmed" },
  { id: "cancelled", name: "Cancelled" },
  { id: "completed", name: "Completed" },
];

// Export button component
const BookingListActions = () => {
  const { exportToCSV } = useExportCSV();

  return (
    <TopToolbar>
      <button
        onClick={() =>
          exportToCSV({
            resourceName: "bookings",
            filename: "bookings",
            fields: ["id", "user_id", "service_id", "slot_id", "status", "created_at"],
            referenceFields: {
              user_id: { resource: "profiles", displayField: "email" },
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
          marginRight: "0.5rem",
        }}
      >
        📥 Export CSV
      </button>
    </TopToolbar>
  );
};

// Filter component
const BookingFilter = () => (
  <Filter>
    <SelectInput
      source="status"
      label="Status"
      choices={statusChoices}
    />
    <ReferenceInput source="service_id" reference="services" label="Service">
      <SelectInput optionText="name" />
    </ReferenceInput>
    <ReferenceInput source="user_id" reference="profiles" label="User">
      <SelectInput optionText="email" />
    </ReferenceInput>
  </Filter>
);

export const BookingList = () => (
  <List sort={{ field: "created_at", order: "DESC" }} filters={<BookingFilter />} actions={<BookingListActions />}>
    <Datagrid>
      <ReferenceField source="user_id" reference="profiles" label="User" link="show">
        <TextField source="email" />
      </ReferenceField>
      <ReferenceField source="service_id" reference="services" label="Service" link="show">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="slot_id" reference="time_slots" label="Time Slot">
        <DateField source="start_time" showTime />
      </ReferenceField>
      <SelectField source="status" choices={statusChoices} />
      <DateField source="created_at" label="Booked On" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);
