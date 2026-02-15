import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface AnalysisFiltersProps {
  pollutionType: string;
  pollutionMetric: string;
  healthArea: string;
  metric: string;
  ageName: string;
  ageOptions: Array<{ age_id: number; age_name: string }>;
  sexName: string;
  sexOptions: Array<{ sex_id: number; sex_name: string }>;
  causeName: string;
  causeOptions: Array<{ cause_id: number; cause_name: string }>;
  onPollutionTypeChange: (value: string) => void;
  onPollutionMetricChange: (value: string) => void;
  onHealthAreaChange: (value: string) => void;
  onMetricChange: (value: string) => void;
  onAgeChange: (value: string) => void;
  onSexChange: (value: string) => void;
  onCauseChange: (value: string) => void;
  onResetFilters: () => void;
}

const pollutionTypes = [
  { value: "mixed", label: "Mixed (All Pollutants)" },
  { value: "pm25", label: "PM2.5" },
  { value: "pm10", label: "PM10" },
  { value: "ozone", label: "Ozone (O3)" },
  { value: "no2", label: "Nitrogen Dioxide (NO2)" },
  { value: "so2", label: "Sulfur Dioxide (SO2)" },
  { value: "co", label: "Carbon Monoxide (CO)" },
];

const metrics = [
  { value: "rate", label: "Rate (per 100,000)" },
  { value: "deaths", label: "Number of Deaths" },
  { value: "dalys", label: "DALYs" },
  { value: "prevalence", label: "Prevalence (%)" },
];

const pollutionMetrics = [
  { value: "value", label: "Value" },
  { value: "avg", label: "Average" },
  { value: "min", label: "Minimum" },
  { value: "max", label: "Maximum" },
  { value: "median", label: "Median" },
];

const AnalysisFilters = ({
  pollutionType,
  pollutionMetric,
  healthArea,
  metric,
  ageName,
  ageOptions,
  sexName,
  sexOptions,
  causeName,
  causeOptions,
  onPollutionTypeChange,
  onPollutionMetricChange,
  onHealthAreaChange,
  onMetricChange,
  onAgeChange,
  onSexChange,
  onCauseChange,
  onResetFilters,
}: AnalysisFiltersProps) => {
  const [showPollution, setShowPollution] = useState(true);
  const [showHealth, setShowHealth] = useState(true);

  return (
    <div className="relative z-50 flex flex-col gap-4 p-4 bg-card border-b border-border">
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={onResetFilters}>
          Reset Filters
        </Button>
      </div>

      {showPollution && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-foreground">Pollution Filters</div>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowPollution((prev) => !prev)}
            >
              Hide
            </button>
          </div>
          <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Air Pollution
            </label>
            <Select value={pollutionType} onValueChange={onPollutionTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select pollution type" />
              </SelectTrigger>
              <SelectContent>
                {pollutionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Pollution Metric
            </label>
            <Select
              value={pollutionMetric}
              onValueChange={onPollutionMetricChange}
              disabled={pollutionType === "mixed"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pollution metric" />
              </SelectTrigger>
              <SelectContent>
                {pollutionMetrics.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {pollutionType === "mixed" && (
              <p className="mt-1 text-xs text-muted-foreground">
                Mixed pins use a shared scale; metric filter is disabled.
              </p>
            )}
          </div>
          </div>
        </div>
      )}

      {showHealth && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-foreground">Health Filters</div>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowHealth((prev) => !prev)}
            >
              Hide
            </button>
          </div>
          <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Health Area
            </label>
            <Select value={causeName} onValueChange={onCauseChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select health area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All causes</SelectItem>
                {causeOptions.map((cause) => (
                  <SelectItem key={cause.cause_id} value={cause.cause_name}>
                    {cause.cause_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Metric
            </label>
            <Select value={metric} onValueChange={onMetricChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {metrics.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Age Group
            </label>
            <Select value={ageName} onValueChange={onAgeChange}>
              <SelectTrigger>
                <SelectValue placeholder="All ages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ages</SelectItem>
                {ageOptions.map((age) => (
                  <SelectItem key={age.age_id} value={age.age_name}>
                    {age.age_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Sex
            </label>
            <Select value={sexName} onValueChange={onSexChange}>
              <SelectTrigger>
                <SelectValue placeholder="All sexes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sexes</SelectItem>
                {sexOptions.map((sex) => (
                  <SelectItem key={sex.sex_id} value={sex.sex_name}>
                    {sex.sex_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          </div>
        </div>
      )}

      {!showPollution && (
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-foreground">Pollution Filters</div>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setShowPollution(true)}
          >
            Show
          </button>
        </div>
      )}

      {!showHealth && (
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-foreground">Health Filters</div>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setShowHealth(true)}
          >
            Show
          </button>
        </div>
      )}
    </div>
  );
};

export default AnalysisFilters;

