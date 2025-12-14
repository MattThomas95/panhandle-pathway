import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  BooleanInput,
  required,
  minValue,
} from "react-admin";

export const ServiceCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" validate={required()} fullWidth />
      <TextInput source="description" multiline rows={3} fullWidth />
      <NumberInput
        source="duration"
        label="Duration (minutes)"
        validate={[required(), minValue(1)]}
        defaultValue={60}
        fullWidth
        helperText="Service duration in minutes"
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
      <BooleanInput source="is_active" label="Active" defaultValue={true} />
      <BooleanInput
        source="is_multi_day"
        label="Multi-day Activity"
        defaultValue={false}
        helperText="Check if this service spans multiple days (e.g., retreats, multi-day workshops)"
      />
    </SimpleForm>
  </Create>
);


