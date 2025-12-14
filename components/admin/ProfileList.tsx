import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  EditButton,
  DeleteButton,
  BooleanField,
  ReferenceField,
  Filter,
  TextInput,
  SelectInput,
  BooleanInput,
  ReferenceInput,
  TopToolbar,
  CreateButton,
} from "react-admin";
import { useExportCSV } from "./useExportCSV";

// Export + create actions
const ProfileListActions = () => {
  const { exportToCSV } = useExportCSV();

  return (
    <TopToolbar>
      <CreateButton />
      <button
        onClick={() =>
          exportToCSV({
            resourceName: "profiles",
            filename: "profiles",
            fields: ["id", "email", "full_name", "role", "is_org_admin", "organization_id", "created_at"],
            referenceFields: {
              organization_id: { resource: "organizations", displayField: "name" },
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
const ProfileFilter = () => (
  <Filter>
    <TextInput source="email" label="Email" alwaysOn />
    <TextInput source="full_name" label="Name" />
    <SelectInput
      source="role"
      label="Role"
      choices={[
        { id: "user", name: "User" },
        { id: "admin", name: "Admin" },
        { id: "staff", name: "Staff" },
      ]}
    />
    <BooleanInput source="is_org_admin" label="Org Admin" />
    <ReferenceInput source="organization_id" reference="organizations" label="Organization">
      <SelectInput optionText="name" />
    </ReferenceInput>
  </Filter>
);

export const ProfileList = () => (
  <List sort={{ field: "email", order: "ASC" }} filters={<ProfileFilter />} actions={<ProfileListActions />}>
    <Datagrid>
      <EmailField source="email" />
      <TextField source="full_name" label="Name" />
      <TextField source="role" />
      <BooleanField source="is_org_admin" label="Org Admin" />
      <ReferenceField source="organization_id" reference="organizations" label="Organization" link="show">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="created_at" label="Created" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);


