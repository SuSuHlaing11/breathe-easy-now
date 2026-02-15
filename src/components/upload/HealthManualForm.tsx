import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ManualField {
  key: string;
  label: string;
  type: string;
}

interface HealthManualFormProps {
  manualFields: ReadonlyArray<ManualField>;
  manualValues: Record<string, string>;
  advancedValues: Record<string, string>;
  showAdvanced: boolean;
  setShowAdvanced: (value: boolean) => void;
  onChange: (key: string, value: string) => void;
  onAdvancedChange: (key: string, value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
  options: {
    measureOptions: Array<{ measure_name: string }>;
    metricOptions: Array<{ metric_name: string }>;
    ageOptions: Array<{ age_name: string }>;
    sexOptions: Array<{ sex_name: string }>;
    causeOptions: Array<{ cause_name: string }>;
  };
}

const HealthManualForm = ({
  manualFields,
  manualValues,
  advancedValues,
  showAdvanced,
  setShowAdvanced,
  onChange,
  onAdvancedChange,
  onSubmit,
  submitting,
  error,
  options,
}: HealthManualFormProps) => (
  <div className="rounded-lg border border-border p-4 space-y-4">
    <div>
      <h3 className="text-sm font-semibold text-foreground">Manual Entry</h3>
      <p className="text-xs text-muted-foreground">
        Add a single IHME record. Location name must match your org country.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {manualFields.map((field) => {
        const isSelect =
          field.key !== "year" && field.key !== "val" && field.key !== "location_name";
        const optionsList =
          field.key === "measure_name"
            ? options.measureOptions.map((m) => m.measure_name)
            : field.key === "metric_name"
              ? options.metricOptions.map((m) => m.metric_name)
              : field.key === "age_name"
                ? options.ageOptions.map((a) => a.age_name)
                : field.key === "sex_name"
                  ? options.sexOptions.map((s) => s.sex_name)
                  : field.key === "cause_name"
                    ? options.causeOptions.map((c) => c.cause_name)
                    : [];

        return (
          <div key={field.key} className="space-y-1">
            <Label className="text-xs">{field.label}</Label>
            {field.key === "location_name" ? (
              <input
                type="text"
                value={manualValues.location_name}
                readOnly
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background read-only:bg-muted read-only:text-muted-foreground"
              />
            ) : isSelect ? (
              <select
                value={manualValues[field.key]}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
              >
                <option value="">Select {field.label}</option>
                {optionsList.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={manualValues[field.key]}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
              />
            )}
          </div>
        );
      })}
    </div>
    <div className="flex items-center justify-between">
      <button
        type="button"
        className="text-sm text-muted-foreground hover:text-foreground"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? "Hide advanced fields" : "Show advanced fields"}
      </button>
    </div>
    {showAdvanced && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { key: "upper", label: "Upper", type: "number" },
          { key: "lower", label: "Lower", type: "number" },
        ].map((field) => (
          <div key={field.key} className="space-y-1">
            <Label className="text-xs">{field.label}</Label>
            <input
              type={field.type}
              value={advancedValues[field.key]}
              onChange={(e) => onAdvancedChange(field.key, e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
            />
          </div>
        ))}
      </div>
    )}
    {error && (
      <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
        {error}
      </div>
    )}
    <div className="flex justify-end">
      <Button variant="outline" disabled={submitting} onClick={onSubmit}>
        {submitting ? "Saving..." : "Add Record"}
      </Button>
    </div>
  </div>
);

export default HealthManualForm;
