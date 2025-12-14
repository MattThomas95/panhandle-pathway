import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  ReferenceField,
  SelectField,
  FunctionField,
  Labeled,
  ReferenceManyField,
  Datagrid,
  NumberField,
} from "react-admin";

const statusChoices = [
  { id: "pending", name: "Pending" },
  { id: "processing", name: "Processing" },
  { id: "completed", name: "Completed" },
  { id: "cancelled", name: "Cancelled" },
  { id: "refunded", name: "Refunded" },
];

export const OrderShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="Order ID" />

      <ReferenceField source="user_id" reference="profiles" label="Customer">
        <TextField source="email" />
      </ReferenceField>

      <SelectField source="status" choices={statusChoices} />

      <FunctionField
        label="Total Amount"
        render={(record: any) => `$${parseFloat(record.total || 0).toFixed(2)}`}
      />

      <TextField source="stripe_payment_id" label="Stripe Payment ID" />
      <TextField source="stripe_payment_status" label="Payment Status" />

      <DateField source="created_at" label="Order Date" showTime />
      <DateField source="updated_at" label="Last Updated" showTime />

      <Labeled label="Shipping Address">
        <FunctionField
          render={(record: any) => {
            if (!record.shipping_address) return "N/A";
            const addr = record.shipping_address;
            return (
              <div>
                {addr.name && <div>{addr.name}</div>}
                {addr.line1 && <div>{addr.line1}</div>}
                {addr.line2 && <div>{addr.line2}</div>}
                {addr.city && addr.state && addr.postal_code && (
                  <div>{`${addr.city}, ${addr.state} ${addr.postal_code}`}</div>
                )}
                {addr.country && <div>{addr.country}</div>}
              </div>
            );
          }}
        />
      </Labeled>

      <TextField source="notes" label="Notes" />

      <Labeled label="Order Items">
        <ReferenceManyField
          reference="order_items"
          target="order_id"
          label="Items"
        >
          <Datagrid bulkActionButtons={false}>
            <ReferenceField source="product_id" reference="products" label="Product">
              <TextField source="name" />
            </ReferenceField>
            <NumberField source="quantity" />
            <FunctionField
              label="Unit Price"
              render={(record: any) => `$${parseFloat(record.price || 0).toFixed(2)}`}
            />
            <FunctionField
              label="Subtotal"
              render={(record: any) =>
                `$${(parseFloat(record.price || 0) * parseInt(record.quantity || 0)).toFixed(2)}`
              }
            />
          </Datagrid>
        </ReferenceManyField>
      </Labeled>
    </SimpleShowLayout>
  </Show>
);


