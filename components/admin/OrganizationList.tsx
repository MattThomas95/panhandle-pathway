import {
  List,
  Datagrid,
  TextField,
  DateField,
  EmailField,
  EditButton,
  DeleteButton,
} from "react-admin";

export const OrganizationList = () => (
  <List>
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
