import {
  List,
  Datagrid,
  TextField,
  DateField,
  EmailField,
  EditButton,
  DeleteButton,
  Filter,
  TextInput,
  TopToolbar,
  CreateButton,
} from "react-admin";
import { useExportCSV } from "./useExportCSV";

// Export + create actions
const OrganizationListActions = () => {
  const { exportToCSV } = useExportCSV();

  return (
    <TopToolbar>
      <CreateButton />
      <button
        onClick={() =>
          exportToCSV({
            resourceName: "organizations",
            filename: "organizations",
            fields: ["id", "name", "slug", "email", "phone", "created_at"],
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
const OrganizationFilter = () => (
  <Filter>
    <TextInput source="name" label="Organization Name" alwaysOn />
    <TextInput source="email" label="Email" />
  </Filter>
);

export const OrganizationList = () => (
  <List sort={{ field: "name", order: "ASC" }} filters={<OrganizationFilter />} actions={<OrganizationListActions />}>
    <Datagrid>
      <TextField source="name" />
      <TextField source="slug" />
      <EmailField source="email" />
      <TextField source="phone" />
      <DateField source="created_at" label="Created" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);


