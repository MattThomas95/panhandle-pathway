import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  BooleanInput,
  required,
  minValue,
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

export const BundleCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" validate={required()} fullWidth />
      <TextInput source="description" multiline rows={3} fullWidth />

      <NumberInput
        source="custom_price"
        label="Bundle Price"
        validate={[required(), minValue(0)]}
        defaultValue={0}
        fullWidth
        helperText="Set custom bundle pricing (can be discounted from individual service prices)"
      />

      <SliderInput
        source="late_fee_days"
        label="Late fee window (days)"
        min={0}
        max={30}
        step={1}
        defaultValue={7}
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
        defaultValue={25}
        suffix=" $"
        helperText="Late fee applied when booking inside the window"
        fullWidth
      />

      <ServiceSelector
        source="service_ids"
        label="Included Services"
        validate={[required(), validateServiceCount]}
      />

      <BooleanInput source="is_active" label="Active" defaultValue={true} />
    </SimpleForm>
  </Create>
);
