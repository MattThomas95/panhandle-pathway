import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  SelectInput,
  BooleanInput,
  FormDataConsumer,
  required,
  minValue,
} from "react-admin";
import { SliderInput } from "./SliderInput";

export const ServiceCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" validate={required()} fullWidth />
      <TextInput source="description" multiline rows={3} fullWidth />
      <SelectInput
        source="service_kind"
        label="Service Type"
        choices={[
          { id: "training", name: "Training" },
          { id: "consultation", name: "Consultation" },
        ]}
        defaultValue="training"
        fullWidth
      />
      <NumberInput
        source="capacity"
        label="Max Capacity"
        validate={[required(), minValue(1)]}
        defaultValue={1}
        fullWidth
        helperText="Maximum number of people per time slot"
      />
      <NumberInput
        source="price"
        validate={[required(), minValue(0)]}
        defaultValue={0}
        fullWidth
      />

      <BooleanInput
        source="use_late_fees"
        label="Apply late fees"
        defaultValue={false}
        helperText="Toggle on to configure late fee rules."
      />

      <FormDataConsumer>
        {({ formData }) =>
          formData?.use_late_fees ? (
            <>
              <SliderInput
                source="late_fee_days"
                label="Late fee window (days)"
                min={0}
                max={30}
                step={1}
                defaultValue={7}
                suffix=" days"
                helperText="Apply late fee when booking within this many days."
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
                helperText="Late fee applied inside the window."
                fullWidth
              />
            </>
          ) : null
        }
      </FormDataConsumer>

      <BooleanInput source="is_active" label="Active" defaultValue={true} />
      <BooleanInput
        source="is_multi_day"
        label="Multi-day Activity"
        defaultValue={false}
      />

      <FormDataConsumer>
        {({ formData }) =>
          formData?.service_kind === "consultation" ? (
            <SliderInput
              source="duration"
              label="Duration (minutes)"
              min={15}
              max={480}
              step={15}
              defaultValue={60}
              suffix=" min"
              validate={[required(), minValue(1)]}
              fullWidth
            />
          ) : null
        }
      </FormDataConsumer>
    </SimpleForm>
  </Create>
);
