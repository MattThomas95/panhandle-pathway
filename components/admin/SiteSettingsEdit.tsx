import {
  Edit,
  SimpleForm,
  TextInput,
  required,
  useRecordContext,
} from "react-admin";
import { Typography, Box, Alert } from "@mui/material";

const EditTitle = () => {
  const record = useRecordContext();
  return <span>Edit Setting: {record ? record.label : ""}</span>;
};

export const SiteSettingsEdit = () => (
  <Edit title={<EditTitle />}>
    <SimpleForm>
      <Box sx={{ mb: 2, width: "100%" }}>
        <Alert severity="info">
          Changes made here will be reflected across the website. The value you enter will replace the current advertised date/text wherever it appears.
        </Alert>
      </Box>

      <TextInput source="label" label="Setting Name" disabled fullWidth />
      
      <TextInput
        source="value"
        label="Value"
        validate={required()}
        fullWidth
        helperText="This is the text that will appear on the website"
      />

      <TextInput
        source="description"
        label="Description"
        disabled
        fullWidth
        multiline
        rows={2}
      />

      <TextInput source="key" label="Key (System)" disabled fullWidth />
      <TextInput source="category" label="Category" disabled />
    </SimpleForm>
  </Edit>
);
