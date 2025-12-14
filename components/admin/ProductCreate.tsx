"use client";

import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  BooleanInput,
  required,
} from "react-admin";

export const ProductCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" validate={required()} fullWidth />
      <TextInput source="description" multiline rows={4} fullWidth />
      <NumberInput source="price" validate={required()} />
      <NumberInput source="inventory" defaultValue={0} />
      <TextInput source="image_url" label="Image URL" fullWidth />
      <BooleanInput source="is_active" label="Active" defaultValue={true} />
    </SimpleForm>
  </Create>
);


