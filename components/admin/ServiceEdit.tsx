import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  BooleanInput,
  required,
  minValue,
} from "react-admin";

export const ServiceEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" validate={required()} fullWidth />
      <TextInput source="description" multiline rows={3} fullWidth />
      <NumberInput
        source="duration"
        label="Duration (minutes)"
        validate={[required(), minValue(1)]}
        fullWidth
      />
      <NumberInput
        source="capacity"
        label="Max Capacity"
        validate={[required(), minValue(1)]}
        fullWidth
      />
      <NumberInput
        source="price"
        validate={[required(), minValue(0)]}
        fullWidth
      />
      <BooleanInput source="is_active" label="Active" />
    </SimpleForm>
  </Edit>
);
