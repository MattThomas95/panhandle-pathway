import {
  List,
  Datagrid,
  TextField,
  NumberField,
  BooleanField,
  DateField,
  EditButton,
  DeleteButton,
} from "react-admin";

export const ServiceList = () => (
  <List>
    <Datagrid>
      <TextField source="name" />
      <TextField source="description" />
      <NumberField source="duration" label="Duration (min)" />
      <NumberField source="capacity" label="Max Capacity" />
      <NumberField source="price" options={{ style: "currency", currency: "USD" }} />
      <BooleanField source="is_active" label="Active" />
      <DateField source="created_at" label="Created" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);
