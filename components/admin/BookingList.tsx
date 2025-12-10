import {
  List,
  Datagrid,
  TextField,
  DateField,
  ReferenceField,
  SelectField,
  EditButton,
  DeleteButton,
} from "react-admin";

const statusChoices = [
  { id: "pending", name: "Pending" },
  { id: "confirmed", name: "Confirmed" },
  { id: "cancelled", name: "Cancelled" },
  { id: "completed", name: "Completed" },
];

export const BookingList = () => (
  <List sort={{ field: "created_at", order: "DESC" }}>
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
