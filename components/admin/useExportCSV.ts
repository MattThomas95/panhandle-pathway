import { useDataProvider, useNotify } from "react-admin";

interface ExportOptions {
  resourceName: string;
  filename?: string;
  fields?: string[];
  referenceFields?: Record<string, { resource: string; displayField: string }>;
}

export const useExportCSV = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();

  const exportToCSV = async (options: ExportOptions) => {
    try {
      const { resourceName, filename = resourceName, fields, referenceFields = {} } = options;

      // Fetch all records
      const { data } = await dataProvider.getList(resourceName, {
        pagination: { page: 1, perPage: 10000 },
        sort: { field: "id", order: "ASC" },
      });

      if (!data || data.length === 0) {
        notify("No data to export", { type: "warning" });
        return;
      }

      // Determine fields to export
      const exportFields = fields || Object.keys(data[0]).filter((key) => key !== "id");

      // Fetch reference data if needed
      const referenceData: Record<string, Record<string, Record<string, unknown>>> = {};
      for (const [fieldName, refConfig] of Object.entries(referenceFields)) {
        try {
          const { data: refData } = await dataProvider.getList(refConfig.resource, {
            pagination: { page: 1, perPage: 10000 },
            sort: { field: "id", order: "ASC" },
          });
          referenceData[fieldName] = {};
          refData.forEach((item: Record<string, unknown>) => {
            referenceData[fieldName][String(item.id)] = item;
          });
        } catch (err) {
          console.error(`Failed to fetch ${refConfig.resource}`, err);
        }
      }

      // Create CSV header
      const header = exportFields.map((field) => {
        // Replace field names for display
        if (field === "service_id") return "Service";
        if (field === "user_id") return "User";
        if (field === "organization_id") return "Organization";
        return field.charAt(0).toUpperCase() + field.slice(1);
      });

      // Create CSV rows
      const rows = data.map((record: Record<string, unknown>) =>
        exportFields
          .map((field) => {
            let value = record[field];

            // Resolve reference field if configured
            if (referenceFields[field] && value) {
              const refRecord = referenceData[field]?.[String(value)];
              if (refRecord) {
                value = refRecord[referenceFields[field].displayField];
              }
            }

            // Escape quotes and wrap in quotes if contains comma or quotes
            if (value === null || value === undefined) return "";
            const stringValue = String(value);
            if (stringValue.includes(",") || stringValue.includes('"')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
          .join(",")
      );

      // Combine header and rows
      const csv = [header.join(","), ...rows].join("\n");

      // Create blob and download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      notify(`Exported ${data.length} records to CSV`, { type: "info" });
    } catch (error) {
      console.error("Export error:", error);
      notify("Error exporting to CSV", { type: "warning" });
    }
  };

  return { exportToCSV };
};
