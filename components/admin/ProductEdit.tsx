"use client";

import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  BooleanInput,
  required,
} from "react-admin";

export const ProductEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" validate={required()} fullWidth />
      <TextInput source="description" multiline rows={4} fullWidth />
      <NumberInput source="price" validate={required()} />
      <NumberInput source="inventory" />
      <TextInput source="image_url" label="Image URL" fullWidth />
      <BooleanInput source="is_active" label="Active" />
    </SimpleForm>
  </Edit>
);


