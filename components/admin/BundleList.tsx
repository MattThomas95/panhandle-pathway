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
  useRecordContext,
  FunctionField,
} from "react-admin";
import { useExportCSV } from "./useExportCSV";

// Custom field to display service count
const ServiceCountField = () => {
  const record = useRecordContext();
  const count = record?.services?.length || 0;
  return <span>{count} {count === 1 ? 'service' : 'services'}</span>;
};

// Export + create actions
const BundleListActions = () => {
  const { exportToCSV } = useExportCSV();

  return (
    <TopToolbar>
      <CreateButton />
      <button
        onClick={() =>
          exportToCSV({
            resourceName: "bundles",
            filename: "bundles",
            fields: ["id", "name", "description", "custom_price", "is_active", "created_at"],
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
const BundleFilter = () => (
  <Filter>
    <TextInput source="name" label="Bundle Name" alwaysOn />
    <BooleanInput source="is_active" label="Active Only" />
  </Filter>
);

export const BundleList = () => (
  <List sort={{ field: "name", order: "ASC" }} filters={<BundleFilter />} actions={<BundleListActions />}>
    <Datagrid>
      <TextField source="name" />
      <TextField source="description" />
      <FunctionField
        label="Services"
        render={(record: any) => {
          const count = record?.services?.length || 0;
          return `${count} ${count === 1 ? 'service' : 'services'}`;
        }}
      />
      <NumberField source="custom_price" label="Price" options={{ style: "currency", currency: "USD" }} />
      <NumberField source="late_fee_amount" label="Late Fee" options={{ style: "currency", currency: "USD" }} />
      <BooleanField source="is_active" label="Active" />
      <DateField source="created_at" label="Created" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);
