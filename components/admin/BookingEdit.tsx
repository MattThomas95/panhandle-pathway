import {
  Edit,
  SimpleForm,
  ReferenceInput,
  SelectInput,
  TextInput,
  required,
} from "react-admin";

const statusChoices = [
  { id: "pending", name: "Pending" },
  { id: "confirmed", name: "Confirmed" },
  { id: "cancelled", name: "Cancelled" },
  { id: "completed", name: "Completed" },
];

export const BookingEdit = () => (
  <Edit>
    <SimpleForm>
      <ReferenceInput source="user_id" reference="profiles" label="User">
        <SelectInput optionText="email" disabled />
      </ReferenceInput>
      <ReferenceInput source="service_id" reference="services" label="Service">
        <SelectInput optionText="name" disabled />
      </ReferenceInput>
      <SelectInput
        source="status"
        choices={statusChoices}
        validate={required()}
        fullWidth
      />
      <TextInput source="notes" multiline rows={3} fullWidth />
    </SimpleForm>
  </Edit>
);
