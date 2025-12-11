import { useEffect } from "react";
import {
  Create,
  SimpleForm,
  ReferenceInput,
  SelectInput,
  DateTimeInput,
  NumberInput,
  required,
  minValue,
  useGetOne,
} from "react-admin";
import { useWatch, useFormContext } from "react-hook-form";

// Custom validator to ensure end_time > start_time
const validateEndTime = (value: string, allValues: any) => {
  if (value && allValues.start_time && new Date(value) <= new Date(allValues.start_time)) {
    return "End time must be after start time";
  }
  return undefined;
};

// Auto-populate capacity from selected service
const ServiceCapacitySync = () => {
  const { setValue } = useFormContext();
  const serviceId = useWatch({ name: "service_id" });
  const { data: service } = useGetOne(
    "services",
    { id: serviceId },
    { enabled: !!serviceId }
  );

  useEffect(() => {
    if (service?.capacity) {
      setValue("capacity", service.capacity);
    }
  }, [service, setValue]);

  return null;
};

export const TimeSlotCreate = () => (
  <Create>
    <SimpleForm>
      <ReferenceInput source="service_id" reference="services" label="Service">
        <SelectInput optionText="name" validate={required()} fullWidth />
      </ReferenceInput>

      <ServiceCapacitySync />

      <DateTimeInput
        source="start_time"
        validate={required()}
        fullWidth
        helperText="Select the start date and time for this slot"
      />

      <DateTimeInput
        source="end_time"
        validate={[required(), validateEndTime]}
        fullWidth
        helperText="End time must be after start time"
      />

      <NumberInput
        source="capacity"
        validate={[required(), minValue(1)]}
        defaultValue={1}
        fullWidth
        helperText="Defaults to service capacity, can be customized"
      />
    </SimpleForm>
  </Create>
);
