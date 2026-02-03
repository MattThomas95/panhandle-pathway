import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  FilterButton,
  TopToolbar,
  TextInput,
  SelectInput,
} from "react-admin";

const filters = [
  <TextInput key="key" source="key" label="Key" alwaysOn />,
  <SelectInput
    key="category"
    source="category"
    label="Category"
    choices={[
      { id: "advertised_times", name: "Advertised Times" },
      { id: "general", name: "General" },
    ]}
    alwaysOn
  />,
];

const ListActions = () => (
  <TopToolbar>
    <FilterButton />
  </TopToolbar>
);

export const SiteSettingsList = () => (
  <List
    filters={filters}
    actions={<ListActions />}
    sort={{ field: "category", order: "ASC" }}
    perPage={25}
    filterDefaultValues={{ category: "advertised_times" }}
  >
    <Datagrid rowClick="edit">
      <TextField source="label" label="Setting" />
      <TextField source="value" label="Current Value" />
      <TextField source="category" label="Category" />
      <DateField source="updated_at" label="Last Updated" showTime />
      <EditButton />
    </Datagrid>
  </List>
);
