import {
  Create,
  SimpleForm,
  TextInput,
  PasswordInput,
  SelectInput,
  BooleanInput,
  ReferenceInput,
  required,
  email,
} from "react-admin";

export const ProfileCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="email" validate={[required(), email()]} fullWidth />
      <PasswordInput source="password" validate={required()} fullWidth helperText="Minimum 6 characters" />
      <TextInput source="full_name" label="Full Name" fullWidth />
      <SelectInput
        source="role"
        choices={[
          { id: "user", name: "User" },
          { id: "admin", name: "Admin" },
        ]}
        defaultValue="user"
        validate={required()}
        fullWidth
      />
      <BooleanInput source="is_org_admin" label="Organization Admin" defaultValue={false} />
      <ReferenceInput source="organization_id" reference="organizations" label="Organization">
        <SelectInput optionText="name" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);


