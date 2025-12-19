import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  BooleanInput,
  required,
  minValue,
  useRecordContext,
} from "react-admin";
import { SliderInput } from "./SliderInput";
import { ServiceSelector } from "./ServiceSelector";

// Validate that at least 2 services are selected
const validateServiceCount = (value: string[]) => {
  if (!value || value.length < 2) {
    return "Select at least 2 services";
  }
  return undefined;
};

// Transform bundle data for the form
const transform = (data: any) => {
  // Extract service IDs from services array
  const service_ids = data.services?.map((s: any) => s.service_id || s.id) || [];

  return {
    ...data,
    service_ids,
  };
};

export const BundleEdit = () => (
  <Edit transform={transform} mutationMode="pessimistic">
    <SimpleForm>
      <TextInput source="name" validate={required()} fullWidth />
      <TextInput source="description" multiline rows={3} fullWidth />

      <NumberInput
        source="custom_price"
        label="Bundle Price"
        validate={[required(), minValue(0)]}
        fullWidth
        helperText="Set custom bundle pricing (can be discounted from individual service prices)"
      />

      <SliderInput
        source="late_fee_days"
        label="Late fee window (days)"
        min={0}
        max={30}
        step={1}
        suffix=" days"
        helperText="Apply late fee when booking within this many days"
        fullWidth
      />

      <SliderInput
        source="late_fee_amount"
        label="Late fee amount"
        min={0}
        max={100}
        step={5}
        suffix=" $"
        helperText="Late fee applied when booking inside the window"
        fullWidth
      />

      <ServiceSelector
        source="service_ids"
        label="Included Services"
        validate={[required(), validateServiceCount]}
      />

      <BooleanInput source="is_active" label="Active" />
    </SimpleForm>
  </Edit>
);
