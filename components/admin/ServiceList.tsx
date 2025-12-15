import {
  List,
  Datagrid,
  TextField,
  NumberField,
  BooleanField,
  DateField,
  EditButton,
  DeleteButton,
  Filter,
  TextInput,
  BooleanInput,
  TopToolbar,
  CreateButton,
} from "react-admin";
import { useExportCSV } from "./useExportCSV";

// Export + create actions
const ServiceListActions = () => {
  const { exportToCSV } = useExportCSV();

  return (
    <TopToolbar>
      <CreateButton />
      <button
        onClick={() =>
          exportToCSV({
            resourceName: "services",
            filename: "services",
            fields: ["id", "name", "description", "duration", "capacity", "price", "is_active", "created_at"],
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
const ServiceFilter = () => (
  <Filter>
    <TextInput source="name" label="Service Name" alwaysOn />
    <BooleanInput source="is_active" label="Active Only" />
  </Filter>
);

export const ServiceList = () => (
  <List sort={{ field: "name", order: "ASC" }} filters={<ServiceFilter />} actions={<ServiceListActions />}>
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


