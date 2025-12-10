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
} from "react-admin";

export const ProfileList = () => (
  <List>
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
