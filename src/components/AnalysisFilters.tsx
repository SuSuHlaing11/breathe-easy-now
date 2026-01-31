import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnalysisFiltersProps {
  pollutionType: string;
  healthArea: string;
  metric: string;
  onPollutionTypeChange: (value: string) => void;
  onHealthAreaChange: (value: string) => void;
  onMetricChange: (value: string) => void;
}

const pollutionTypes = [
  { value: "pm25", label: "PM2.5" },
  { value: "pm10", label: "PM10" },
  { value: "ozone", label: "Ozone (O₃)" },
  { value: "no2", label: "Nitrogen Dioxide (NO₂)" },
  { value: "so2", label: "Sulfur Dioxide (SO₂)" },
  { value: "co", label: "Carbon Monoxide (CO)" },
];

const healthAreas = [
  { value: "respiratory", label: "Respiratory Diseases" },
  { value: "cardiovascular", label: "Cardiovascular Diseases" },
  { value: "child_health", label: "Child Health" },
  { value: "lung_cancer", label: "Lung Cancer" },
  { value: "mortality", label: "All-cause Mortality" },
  { value: "stroke", label: "Stroke" },
];

const metrics = [
  { value: "rate", label: "Rate (per 100,000)" },
  { value: "deaths", label: "Number of Deaths" },
  { value: "dalys", label: "DALYs" },
  { value: "prevalence", label: "Prevalence (%)" },
];

const AnalysisFilters = ({
  pollutionType,
  healthArea,
  metric,
  onPollutionTypeChange,
  onHealthAreaChange,
  onMetricChange,
}: AnalysisFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-card border-b border-border">
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
          Health Area
        </label>
        <Select value={healthArea} onValueChange={onHealthAreaChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select health area" />
          </SelectTrigger>
          <SelectContent>
            {healthAreas.map((area) => (
              <SelectItem key={area.value} value={area.value}>
                {area.label}
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
    </div>
  );
};

export default AnalysisFilters;
