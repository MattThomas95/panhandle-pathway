import {
  Create,
  SimpleForm,
  TextInput,
  required,
} from "react-admin";

export const OrganizationCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" validate={required()} fullWidth />
      <TextInput source="slug" validate={required()} fullWidth helperText="URL-friendly identifier (e.g., 'acme-corp')" />
      <TextInput source="email" type="email" fullWidth />
      <TextInput source="phone" fullWidth />
      <TextInput source="address" multiline rows={3} fullWidth />
    </SimpleForm>
  </Create>
);
