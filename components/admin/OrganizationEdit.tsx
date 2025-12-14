import {
  Edit,
  SimpleForm,
  TextInput,
  required,
} from "react-admin";

export const OrganizationEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" validate={required()} fullWidth />
      <TextInput source="slug" validate={required()} fullWidth />
      <TextInput source="email" type="email" fullWidth />
      <TextInput source="phone" fullWidth />
      <TextInput source="address" multiline rows={3} fullWidth />
    </SimpleForm>
  </Edit>
);


