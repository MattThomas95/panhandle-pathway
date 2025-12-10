"use client";

import {
  List,
  Datagrid,
  TextField,
  NumberField,
  BooleanField,
  DateField,
  ImageField,
  EditButton,
  DeleteButton,
} from "react-admin";

export const ProductList = () => (
  <List>
    <Datagrid rowClick="edit">
      <ImageField source="image_url" label="Image" />
      <TextField source="name" />
      <NumberField source="price" options={{ style: "currency", currency: "USD" }} />
      <NumberField source="inventory" />
      <BooleanField source="is_active" label="Active" />
      <DateField source="created_at" label="Created" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);
