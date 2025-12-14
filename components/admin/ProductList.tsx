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
  Filter,
  TextInput,
  BooleanInput,
  TopToolbar,
  CreateButton,
} from "react-admin";
import { useExportCSV } from "./useExportCSV";

// Export + create actions
const ProductListActions = () => {
  const { exportToCSV } = useExportCSV();

  return (
    <TopToolbar>
      <CreateButton />
      <button
        onClick={() =>
          exportToCSV({
            resourceName: "products",
            filename: "products",
            fields: ["id", "name", "price", "inventory", "is_active", "created_at"],
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
const ProductFilter = () => (
  <Filter>
    <TextInput source="name" label="Product Name" alwaysOn />
    <BooleanInput source="is_active" label="Active Only" />
  </Filter>
);

export const ProductList = () => (
  <List sort={{ field: "name", order: "ASC" }} filters={<ProductFilter />} actions={<ProductListActions />}>
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


