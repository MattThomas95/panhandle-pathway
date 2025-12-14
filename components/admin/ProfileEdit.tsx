import {
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  BooleanInput,
  ReferenceInput,
  required,
} from "react-admin";

export const ProfileEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="email" validate={required()} fullWidth disabled />
      <TextInput source="full_name" label="Full Name" fullWidth />
      <SelectInput
        source="role"
        choices={[
          { id: "user", name: "User" },
          { id: "admin", name: "Admin" },
        ]}
        validate={required()}
        fullWidth
      />
      <BooleanInput source="is_org_admin" label="Organization Admin" />
      <ReferenceInput source="organization_id" reference="organizations" label="Organization">
        <SelectInput optionText="name" />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
);


