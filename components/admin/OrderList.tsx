import {
  List,
  Datagrid,
  TextField,
  DateField,
  ReferenceField,
  SelectField,
  EditButton,
  ShowButton,
  Filter,
  SelectInput,
  ReferenceInput,
  TopToolbar,
  FunctionField,
} from "react-admin";
import { useExportCSV } from "./useExportCSV";

const statusChoices = [
  { id: "pending", name: "Pending" },
  { id: "processing", name: "Processing" },
  { id: "completed", name: "Completed" },
  { id: "cancelled", name: "Cancelled" },
  { id: "refunded", name: "Refunded" },
];

// Export button component
const OrderListActions = () => {
  const { exportToCSV } = useExportCSV();

  return (
    <TopToolbar>
      <button
        onClick={() =>
          exportToCSV({
            resourceName: "orders",
            filename: "orders",
            fields: ["id", "user_id", "status", "total", "stripe_payment_id", "created_at"],
            referenceFields: {
              user_id: { resource: "profiles", displayField: "email" },
            },
          })
        }
        style={{
          padding: "8px 16px",
          background: "#1976d2",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        Export CSV
      </button>
    </TopToolbar>
  );
};

// Filter component
const OrderFilter = () => (
  <Filter>
    <SelectInput source="status" label="Status" choices={statusChoices} />
    <ReferenceInput source="user_id" reference="profiles" label="User">
      <SelectInput optionText="email" />
    </ReferenceInput>
  </Filter>
);

export const OrderList = () => (
  <List sort={{ field: "created_at", order: "DESC" }} filters={<OrderFilter />} actions={<OrderListActions />}>
    <Datagrid>
      <TextField source="id" label="Order ID" />
      <ReferenceField source="user_id" reference="profiles" label="Customer" link="show">
        <TextField source="email" />
      </ReferenceField>
      <SelectField source="status" choices={statusChoices} />
      <FunctionField label="Total" render={(record: any) => `$${parseFloat(record.total || 0).toFixed(2)}`} />
      <TextField source="stripe_payment_id" label="Payment ID" />
      <TextField source="stripe_payment_status" label="Payment Status" />
      <DateField source="created_at" label="Order Date" showTime />
      <ShowButton />
      <EditButton />
    </Datagrid>
  </List>
);
