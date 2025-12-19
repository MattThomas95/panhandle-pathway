import React, { useState } from "react";
import {
  Edit,
  TabbedForm,
  FormTab,
  TextInput,
  NumberInput,
  SelectInput,
  BooleanInput,
  FormDataConsumer,
  required,
  minValue,
  useDataProvider,
  useNotify,
  useRefresh,
  useRecordContext,
} from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";

import TimeSlotGenerator from "./TimeSlotGenerator";
import { SliderInput } from "./SliderInput";

type GeneratedSlot = {
  start_time: string;
  end_time: string;
  capacity: number;
  service_id?: string;
};

const TimeSlotGeneratorWithWatch = ({
  serviceId,
  defaultCapacity,
  record,
  onGenerate,
}: {
  serviceId: string;
  defaultCapacity: number;
  record: any;
  onGenerate: (slots: GeneratedSlot[]) => void;
}) => {
  const form = useFormContext();
  const watchedIsMultiDay = useWatch({
    control: form?.control,
    name: "is_multi_day",
    defaultValue: record?.is_multi_day || false,
  });
  const isMultiDay = (watchedIsMultiDay ?? record?.is_multi_day ?? false) || false;

  return (
    <TimeSlotGenerator
      serviceId={serviceId}
      defaultCapacity={defaultCapacity}
      isMultiDay={isMultiDay}
      onGenerate={onGenerate}
    />
  );
};

export const ServiceEdit = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const record = useRecordContext();
  const [previewSlots, setPreviewSlots] = useState<GeneratedSlot[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);
  const [totalToCreate, setTotalToCreate] = useState(0);

  const handleGenerate = (slots: GeneratedSlot[]) => setPreviewSlots(slots);

  const createSlots = async () => {
    if (!previewSlots || previewSlots.length === 0) {
      notify("No slots to create", { type: "info" });
      return;
    }

    setIsCreating(true);
    setCreatedCount(0);

    try {
      // Fetch existing slots for this service to avoid duplicates
      const { data: existing = [] } = await dataProvider.getList("time_slots", {
        filter: { service_id: record?.id },
        pagination: { page: 1, perPage: 10000 },
        sort: { field: "start_time", order: "ASC" },
      });

      const existingStarts = new Set((existing as any[]).map((s) => s.start_time));

      const newSlots = previewSlots.filter((s) => !existingStarts.has(s.start_time));
      const skipped = previewSlots.length - newSlots.length;
      setTotalToCreate(newSlots.length);

      if (newSlots.length === 0) {
        notify(`No new slots to create. ${skipped} duplicates skipped.`, { type: "info" });
        setPreviewSlots([]);
        setIsCreating(false);
        return;
      }

      // Create sequentially to allow progress updates and to avoid overwhelming the backend
      for (let i = 0; i < newSlots.length; i++) {
        const s = newSlots[i];
        await dataProvider.create("time_slots", { data: { ...s, service_id: record?.id } });
        setCreatedCount((c) => c + 1);
      }

      notify(`Created ${newSlots.length} slots. ${skipped} duplicates skipped.`, { type: "info" });
      setPreviewSlots([]);
      refresh();
    } catch (err) {
      console.error(err);
      notify("Error creating slots", { type: "warning" });
    } finally {
      setIsCreating(false);
      setTotalToCreate(0);
      setCreatedCount(0);
    }
  };

  return (
    <Edit>
      <TabbedForm>
        <FormTab label="Details">
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
            fullWidth
          />
          <NumberInput source="price" validate={[required(), minValue(0)]} fullWidth />

          <BooleanInput
            source="use_late_fees"
            label="Apply late fees"
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
                    suffix=" $"
                    helperText="Late fee applied inside the window."
                    fullWidth
                  />
                </>
              ) : null
            }
          </FormDataConsumer>

          <BooleanInput source="is_active" label="Active" />
          <BooleanInput
            source="is_multi_day"
            label="Multi-day Activity"
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
                  suffix=" min"
                  validate={[required(), minValue(1)]}
                  fullWidth
                />
              ) : null
            }
          </FormDataConsumer>
        </FormTab>

        <FormTab label="Time Slots">
          <div style={{ marginBottom: 12 }}>
            <TimeSlotGeneratorWithWatch
              serviceId={String(record?.id ?? "")}
              defaultCapacity={record?.capacity || 1}
              record={record}
              onGenerate={handleGenerate}
            />
          </div>

          {previewSlots.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 8 }}>
                Previewing <strong>{previewSlots.length}</strong> slots ready to create.
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={createSlots}
                  style={{ padding: "6px 12px" }}
                  disabled={isCreating}
                >
                  Create Slots
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSlots([])}
                  style={{ padding: "6px 12px" }}
                  disabled={isCreating}
                >
                  Clear Preview
                </button>

                {isCreating && (
                  <div style={{ marginLeft: 12 }}>
                    <div style={{ marginBottom: 6 }}>
                      Creating {createdCount}/{totalToCreate}
                    </div>
                    <div style={{ width: 200, height: 8, background: '#eee', borderRadius: 4 }}>
                      <div
                        style={{
                          width: totalToCreate > 0 ? `${(createdCount / totalToCreate) * 100}%` : '0%',
                          height: '100%',
                          background: '#4caf50',
                          borderRadius: 4,
                          transition: 'width 200ms linear',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};
