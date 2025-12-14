import {
  Edit,
  SimpleForm,
  ReferenceInput,
  SelectInput,
  TextInput,
  DateField,
  required,
  FunctionField,
  Labeled,
  TextField,
} from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import { useNotify, useRecordContext, useRefresh } from "react-admin";
import { useState } from "react";

const statusChoices = [
  { id: "pending", name: "Pending" },
  { id: "processing", name: "Processing" },
  { id: "completed", name: "Completed" },
  { id: "cancelled", name: "Cancelled" },
  { id: "refunded", name: "Refunded" },
];

export const OrderEdit = () => (
  <Edit>
    <SimpleForm>
      <Labeled label="Order ID">
        <TextField source="id" />
      </Labeled>

      <ReferenceInput source="user_id" reference="profiles" label="Customer">
        <SelectInput optionText="email" disabled />
      </ReferenceInput>

      <Labeled label="Total">
        <FunctionField
          render={(record: any) => `$${parseFloat(record.total || 0).toFixed(2)}`}
        />
      </Labeled>

      <Labeled label="Order Date">
        <DateField source="created_at" showTime />
      </Labeled>

      <SelectInput
        source="status"
        choices={statusChoices}
        validate={required()}
        fullWidth
      />

      <TextInput source="stripe_payment_id" label="Stripe Payment ID" disabled fullWidth />
      <TextInput source="stripe_payment_status" label="Payment Status" disabled fullWidth />

      <TextInput source="notes" multiline rows={4} fullWidth />

      <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", margin: "16px 0" }} />

      <TrackingSection />
    </SimpleForm>
  </Edit>
);

const TrackingSection = () => {
  const form = useFormContext();
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const [isSending, setIsSending] = useState(false);

  const trackingNumber = useWatch({
    control: form?.control,
    name: "shipping_tracking_number",
    defaultValue: record?.shipping_tracking_number || "",
  });

  const handleSaveAndSend = async () => {
    if (!record?.id) return;
    if (!trackingNumber || typeof trackingNumber !== "string" || !trackingNumber.trim()) {
      notify("Enter a tracking number first.", { type: "warning" });
      return;
    }

    setIsSending(true);
    try {
      // API endpoint will save tracking number AND send email
      const res = await fetch("/api/orders/send-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: record.id,
          trackingNumber: trackingNumber.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send tracking email");
      }

      notify("Tracking saved and email sent.", { type: "info" });

      // Refresh the data to show the updated tracking number
      refresh();
    } catch (err: any) {
      console.error("Tracking send error:", err);
      notify(err.message || "Failed to send tracking email", { type: "warning" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr auto", gap: 12, alignItems: "end" }}>
      <TextInput
        source="shipping_tracking_number"
        label="Shipping / Tracking Number"
        helperText="Add a carrier tracking number or fulfillment reference"
        fullWidth
      />
      <button
        type="button"
        onClick={handleSaveAndSend}
        disabled={isSending}
        style={{
          padding: "10px 14px",
          borderRadius: 8,
          border: "1px solid rgba(30,127,182,0.2)",
          background: isSending ? "#9ca3af" : "#1e7fb6",
          color: "white",
          cursor: isSending ? "not-allowed" : "pointer",
          minWidth: 140,
        }}
      >
        {isSending ? "Sending..." : "Save & send email"}
      </button>
    </div>
  );
};
