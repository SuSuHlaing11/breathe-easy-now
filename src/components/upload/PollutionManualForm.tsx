import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

interface PollutionManualFormProps {
  country: string;
  pollutionValues: {
    location_name: string;
    pollutant: string;
    units: string;
    year: string;
    value: string;
    latitude: string;
    longitude: string;
  };
  pollutionAdvancedValues: Record<string, string>;
  pollutionOptions: string[];
  pollutionUnits: string[];
  locationSuggestions: string[];
  pollutionLoading: boolean;
  pollutionOptionsError: string | null;
  unitsLoading: boolean;
  unitsError: string | null;
  showAdvanced: boolean;
  setShowAdvanced: (value: boolean) => void;
  onChange: (key: string, value: string) => void;
  onAdvancedChange: (key: string, value: string) => void;
  onMapOpen: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
  onLocationQuery: (value: string) => void;
}

const PollutionManualForm = ({
  country,
  pollutionValues,
  pollutionAdvancedValues,
  pollutionOptions,
  pollutionUnits,
  locationSuggestions,
  pollutionLoading,
  pollutionOptionsError,
  unitsLoading,
  unitsError,
  showAdvanced,
  setShowAdvanced,
  onChange,
  onAdvancedChange,
  onMapOpen,
  onSubmit,
  submitting,
  error,
  onLocationQuery,
}: PollutionManualFormProps) => (
  <div className="rounded-lg border border-border p-4 space-y-4">
    <div>
      <h3 className="text-sm font-semibold text-foreground">Manual Entry</h3>
      <p className="text-xs text-muted-foreground">
        Add a single OpenAQ record. Country is taken from your organization profile.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-xs">Country</Label>
        <input
          type="text"
          value={country}
          readOnly
          className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background read-only:bg-muted read-only:text-muted-foreground"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Location Name</Label>
        <input
          type="text"
          list="pollution-location-suggestions"
          value={pollutionValues.location_name}
          onChange={(e) => {
            onChange("location_name", e.target.value);
            onLocationQuery(e.target.value);
          }}
          className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
        />
        <datalist id="pollution-location-suggestions">
          {locationSuggestions.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Pollutant</Label>
        <select
          value={pollutionValues.pollutant}
          onChange={(e) => onChange("pollutant", e.target.value)}
          className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
        >
          <option value="">Select pollutant</option>
          {pollutionOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {pollutionLoading && (
          <p className="text-xs text-muted-foreground">Loading pollutants…</p>
        )}
        {pollutionOptionsError && (
          <p className="text-xs text-muted-foreground">{pollutionOptionsError}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Units</Label>
        <select
          value={pollutionValues.units}
          onChange={(e) => onChange("units", e.target.value)}
          className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
        >
          <option value="">Select units</option>
          {pollutionUnits.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {unitsLoading && (
          <p className="text-xs text-muted-foreground">Loading units…</p>
        )}
        {unitsError && (
          <p className="text-xs text-muted-foreground">{unitsError}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Year</Label>
        <input
          type="number"
          value={pollutionValues.year}
          onChange={(e) => onChange("year", e.target.value)}
          className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Value</Label>
        <input
          type="number"
          value={pollutionValues.value}
          onChange={(e) => onChange("value", e.target.value)}
          className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Coverage Percent</Label>
        <input
          type="number"
          value={(pollutionAdvancedValues as any).coverage_percent}
          onChange={(e) => onAdvancedChange("coverage_percent", e.target.value)}
          className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Latitude</Label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={pollutionValues.latitude}
            onChange={(e) => onChange("latitude", e.target.value)}
            className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onMapOpen}
            title="Pick location on map"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Longitude</Label>
        <input
          type="number"
          value={pollutionValues.longitude}
          onChange={(e) => onChange("longitude", e.target.value)}
          className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
        />
      </div>
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
          { key: "min", label: "Minimum" },
          { key: "max", label: "Maximum" },
          { key: "median", label: "Median" },
          { key: "avg", label: "Average" },
        ].map((field) => (
          <div key={field.key} className="space-y-1">
            <Label className="text-xs">{field.label}</Label>
            <input
              type="number"
              value={(pollutionAdvancedValues as any)[field.key]}
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

export default PollutionManualForm;
