import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import CountrySidebar from "@/components/CountrySidebar";
import AnalysisFilters from "@/components/AnalysisFilters";
import DataVisualization from "@/components/DataVisualization";
import { getIMHEAges, getIMHESexes, getIMHECauses, getIMHESummary } from "@/lib/API";
import { measureNameMap } from "@/lib/imheFilters";

const EXCLUDED_AGE_NAMES = new Set([
  "All ages",
  "10-14 years",
  "15-19 years",
  "<1 year",
  "50-69 years",
  "80-84 years",
  "85-89 years",
  "90-94 years",
  "95+ years",
]);

const ageSortKey = (name: string) => {
  const value = name.trim().toLowerCase();
  const ltYear = value.match(/^<\s*(\d+)\s*year/);
  if (ltYear) return { start: -1, end: Number(ltYear[1]) };
  const months = value.match(/^(\d+)\s*-\s*(\d+)\s*months?/);
  if (months) return { start: 0, end: Number(months[2]) };
  const days = value.match(/^<\s*(\d+)\s*days?/);
  if (days) return { start: -2, end: Number(days[1]) };
  const range = value.match(/^(\d+)\s*-\s*(\d+)\s*years?/);
  if (range) return { start: Number(range[1]), end: Number(range[2]) };
  const plus = value.match(/^(\d+)\s*\+\s*years?/);
  if (plus) return { start: Number(plus[1]), end: 999 };
  const single = value.match(/^(\d+)\s*years?/);
  if (single) return { start: Number(single[1]), end: Number(single[1]) };
  return { start: 9999, end: 9999 };
};

const DEFAULT_SELECTED_COUNTRIES = [
  "Indonesia",
  "Lao People's Democratic Republic",
  "Myanmar",
  "Philippines",
  "Thailand",
  "Viet Nam",
];

const Analysis = () => {
  const [searchParams] = useSearchParams();
  const role = (searchParams.get("role") as "user" | "admin") || "user";
  
  const [selectedCountries, setSelectedCountries] = useState<string[]>(DEFAULT_SELECTED_COUNTRIES);
  const [pollutionType, setPollutionType] = useState("pm25");
  const [pollutionMetric, setPollutionMetric] = useState("value");
  const [healthArea, setHealthArea] = useState("all");
  const [metric, setMetric] = useState("rate");
  const [ageName, setAgeName] = useState("all");
  const [ageOptions, setAgeOptions] = useState<Array<{ age_id: number; age_name: string }>>([]);
  const [sexName, setSexName] = useState("all");
  const [sexOptions, setSexOptions] = useState<Array<{ sex_id: number; sex_name: string }>>([]);
  const [causeName, setCauseName] = useState("all");
  const [causeOptions, setCauseOptions] = useState<Array<{ cause_id: number; cause_name: string }>>([]);
  const [yearRange, setYearRange] = useState<number[]>([2020]);
  const [minYear, setMinYear] = useState<number>(2020);
  const [maxYear, setMaxYear] = useState<number>(2023);

  const resetFilters = () => {
    setPollutionType("pm25");
    setPollutionMetric("value");
    setHealthArea("all");
    setMetric("rate");
    setAgeName("all");
    setSexName("all");
    setCauseName("all");
    setYearRange([maxYear]);
  };

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const summary = await getIMHESummary();
        const min = Number(summary?.min_year);
        const max = Number(summary?.max_year);
        if (Number.isFinite(min) && Number.isFinite(max)) {
          setMinYear(min);
          setMaxYear(max);
          setYearRange((prev) => {
            const next = prev.length ? prev : [max];
            return next
              .map((y) => Math.min(Math.max(y, min), max))
              .sort((a, b) => a - b);
          });
        }
      } catch {
        // keep defaults
      }
    };
    loadSummary();
  }, []);

  useEffect(() => {
    const loadAges = async () => {
      try {
        const params: any = { year: 2020 };
        if (measureNameMap[metric]) params.measure_name = measureNameMap[metric];
        if (causeName && causeName !== "all") params.cause_name = causeName;
        const data = await getIMHEAges(params);
        const cleaned = Array.isArray(data)
          ? data.filter((a) => a?.age_name && !EXCLUDED_AGE_NAMES.has(a.age_name))
          : [];
        const sorted = cleaned.sort((a, b) => {
          const ak = ageSortKey(a.age_name);
          const bk = ageSortKey(b.age_name);
          if (ak.start !== bk.start) return ak.start - bk.start;
          if (ak.end !== bk.end) return ak.end - bk.end;
          return a.age_name.localeCompare(b.age_name);
        });
        setAgeOptions(sorted);
      } catch {
        setAgeOptions([]);
      }
    };
    loadAges();
  }, [metric, causeName]);

  useEffect(() => {
    const loadSexes = async () => {
      try {
        const params: any = { year: 2020 };
        if (measureNameMap[metric]) params.measure_name = measureNameMap[metric];
        if (causeName && causeName !== "all") params.cause_name = causeName;
        if (ageName && ageName !== "all") params.age_name = ageName;
        const data = await getIMHESexes(params);
        setSexOptions(Array.isArray(data) ? data : []);
      } catch {
        setSexOptions([]);
      }
    };
    loadSexes();
  }, [metric, causeName, ageName]);

  useEffect(() => {
    const loadCauses = async () => {
      try {
        const params: any = { year: 2020 };
        if (measureNameMap[metric]) params.measure_name = measureNameMap[metric];
        if (ageName && ageName !== "all") params.age_name = ageName;
        if (sexName && sexName !== "all") params.sex_name = sexName;
        const data = await getIMHECauses(params);
        const cleaned = Array.isArray(data)
          ? data.filter((c) => c?.cause_name && c.cause_name.toLowerCase() !== "asthma")
          : [];
        setCauseOptions(cleaned);
      } catch {
        setCauseOptions([]);
      }
    };
    loadCauses();
  }, [metric, ageName, sexName]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header variant="app" userRole={role} />
      
      <div className="flex-1 flex">
        <CountrySidebar
          selectedCountries={selectedCountries}
          onCountryChange={setSelectedCountries}
        />
        
        <div className="flex-1 flex flex-col">
        <AnalysisFilters
          pollutionType={pollutionType}
          pollutionMetric={pollutionMetric}
          healthArea={healthArea}
          metric={metric}
          ageName={ageName}
          ageOptions={ageOptions}
          sexName={sexName}
          sexOptions={sexOptions}
          causeName={causeName}
          causeOptions={causeOptions}
          onPollutionTypeChange={setPollutionType}
          onPollutionMetricChange={setPollutionMetric}
          onHealthAreaChange={setHealthArea}
          onMetricChange={setMetric}
          onAgeChange={setAgeName}
          onSexChange={setSexName}
          onCauseChange={setCauseName}
          onResetFilters={resetFilters}
        />
          
          <DataVisualization
            selectedCountries={selectedCountries}
            pollutionType={pollutionType}
            pollutionMetric={pollutionMetric}
            healthArea={healthArea}
            metric={metric}
            ageName={ageName}
            sexName={sexName}
            causeName={causeName}
            yearRange={yearRange}
            minYear={minYear}
            maxYear={maxYear}
            onYearRangeChange={setYearRange}
          />
        </div>
      </div>
    </div>
  );
};

export default Analysis;
