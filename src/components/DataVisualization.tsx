import { Fragment, useEffect, useMemo, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Map as MapIcon, Table2, TrendingUp, ZoomIn, Play, Pause, Sparkles, Download, Share2, Maximize2 } from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import LeafletMap from "./LeafletMap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  getIMHECountrySummaryWithPollution,
  getIMHEPercentiles,
  getIMHETrend,
  getOpenAQList,
  getOpenAQTrend,
  OpenAQItem,
} from "@/lib/API";
import { measureNameMap } from "@/lib/imheFilters";

interface DataVisualizationProps {
  selectedCountries: string[];
  defaultTableCountries?: string[];
  pollutionType: string;
  pollutionMetric: string;
  healthArea: string;
  metric: string;
  ageName: string;
  sexName: string;
  causeName: string;
  yearRange: number[];
  minYear: number;
  maxYear: number;
  onYearRangeChange: (values: number[]) => void;
}

interface OpenAQPin {
  latitude: number;
  longitude: number;
  location_name: string;
  pollutant: string;
  units: string;
  coverage_percent?: number | null;
  metric_value?: number | null;
}

const DataVisualization = ({
  selectedCountries,
  defaultTableCountries = [],
  pollutionType,
  pollutionMetric,
  healthArea,
  metric,
  ageName,
  sexName,
  causeName,
  yearRange,
  minYear,
  maxYear,
  onYearRangeChange,
}: DataVisualizationProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("map");
  const [mapDataByYear, setMapDataByYear] = useState<Record<number, Record<string, number>>>({});
  const [mapPollutionByYear, setMapPollutionByYear] = useState<Record<number, Record<string, number | null>>>({});
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [openaqPinsByYear, setOpenaqPinsByYear] = useState<Record<number, OpenAQPin[]>>({});
  const [openaqLoading, setOpenaqLoading] = useState(false);
  const [tablePage, setTablePage] = useState(1);
  const tablePageSize = 10;
  const [percentileRange, setPercentileRange] = useState<{ min: number; max: number } | null>(null);
  const [percentileLoading, setPercentileLoading] = useState(false);
  const [trendData, setTrendData] = useState<Array<{ year: string; healthValue?: number | null; pollutionValue?: number | null }>>([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [tableYear, setTableYear] = useState<number>(yearRange[0]);
  const [tableMode, setTableMode] = useState<"health" | "pollution">("health");
  const [pollutionTableItems, setPollutionTableItems] = useState<OpenAQItem[]>([]);
  const [pollutionTableTotal, setPollutionTableTotal] = useState(0);
  const [pollutionTableLoading, setPollutionTableLoading] = useState(false);
  const [pollutionTableError, setPollutionTableError] = useState<string | null>(null);
  const [trendYearFrom, setTrendYearFrom] = useState<number>(2020);
  const [trendYearTo, setTrendYearTo] = useState<number>(2023);
  const [mapYearRange, setMapYearRange] = useState<number[]>(yearRange.length ? [yearRange[0]] : [minYear]);
  const [pinLegendTint, setPinLegendTint] = useState<string | null>(null);
  const [pollutionTrendMethod, setPollutionTrendMethod] = useState<"weighted" | "unweighted" | "balanced" | "median">("weighted");
  const isComparing = yearRange.length === 2;
  const isMapComparing = mapYearRange.length === 2;
  const prefersReducedMotion = useReducedMotion();

  

  const metricLabels: Record<string, string> = {
    rate: "Rate per 100,000",
    deaths: "Deaths",
    dalys: "DALYs (Disability-Adjusted Life Years)",
    prevalence: "Prevalence (%)",
  };

  const pollutionLabels: Record<string, string> = {
    mixed: "Mixed",
    pm25: "PM2.5",
    pm10: "PM10",
    ozone: "O₃",
    no2: "NO₂",
    so2: "SO₂",
    co: "CO",
  };
  const pollutionMetricLabels: Record<string, string> = {
    value: "Value",
    avg: "Average",
    min: "Minimum",
    max: "Maximum",
    median: "Median",
  };

  const pollutionParamMap: Record<string, string> = {
    pm25: "PM2.5",
    pm10: "PM10",
    ozone: "O₃ mass",
    no2: "NO₂ mass",
    so2: "SO₂ mass",
    co: "CO mass",
  };
  const mixedPollutants = ["PM2.5", "PM10", "O₃ mass", "NO₂ mass", "SO₂ mass", "CO mass"];

  const healthLabel = causeName !== "all" ? causeName : "All causes";

  const chartData1 = trendData;
  const chartData2 = trendData;

  useEffect(() => {
    const load = async () => {
      setMapLoading(true);
      setMapError(null);
      setMapDataByYear({});
      setMapPollutionByYear({});
      try {
        const years = Array.from(new Set(mapYearRange)).sort((a, b) => a - b);
        const params: any = {};
        if (measureNameMap[metric]) params.measure_name = measureNameMap[metric];
        if (causeName && causeName !== "all") params.cause_name = causeName;
        if (ageName && ageName !== "all") params.age_name = ageName;
        if (sexName && sexName !== "all") params.sex_name = sexName;
        const results = await Promise.all(
          years.map(async (yearValue) => {
            const rows = await getIMHECountrySummaryWithPollution({
              ...params,
              year: yearValue,
              pollutant: "PM2.5",
            });
            const map: Record<string, number> = {};
            const pollutionMap: Record<string, number | null> = {};
            (rows || []).forEach((row: { country: string; value: number; pollution_value?: number | null; pollution_pm25?: number | null }) => {
              map[row.country] = row.value;
              if (row.pollution_value !== undefined) {
                pollutionMap[row.country] = row.pollution_value ?? null;
              } else if (row.pollution_pm25 !== undefined) {
                pollutionMap[row.country] = row.pollution_pm25 ?? null;
              }
            });
            return [yearValue, map, pollutionMap] as const;
          })
        );
        const next: Record<number, Record<string, number>> = {};
        const pollutionNext: Record<number, Record<string, number | null>> = {};
        results.forEach(([yearValue, map, pollutionMap]) => {
          next[yearValue] = map;
          pollutionNext[yearValue] = pollutionMap;
        });
        setMapDataByYear(next);
        setMapPollutionByYear(pollutionNext);
      } catch (err: any) {
        const message =
          err?.response?.data?.detail || err?.message || "Failed to load map data.";
        setMapError(message);
        setMapDataByYear({});
        setMapPollutionByYear({});
      } finally {
        setMapLoading(false);
      }
    };
    load();
  }, [mapYearRange, metric, causeName, ageName, sexName]);

  useEffect(() => {
    const loadPins = async () => {
      setOpenaqLoading(true);
      setOpenaqPinsByYear({});
      try {
        const years = Array.from(new Set(mapYearRange)).sort((a, b) => a - b);
        const countryFilter =
          selectedCountries.length === 1 ? selectedCountries[0] : undefined;
        const countryFilters = selectedCountries.length ? selectedCountries : undefined;
        const isMixed = pollutionType === "mixed";
        const selectedPollutant = pollutionParamMap[pollutionType] || pollutionType;
        const pollutantList = isMixed ? mixedPollutants : [selectedPollutant];
        const results = await Promise.all(
          years.map(async (yearValue) => {
            const responses = await Promise.all(
              pollutantList.map((pollutantValue) =>
                getOpenAQList({
                  year: yearValue,
                  country_name: countryFilter,
                  pollutant: pollutantValue,
                  metric: pollutionMetric as any,
                  limit: 1000,
                })
              )
            );
            const items: OpenAQItem[] = responses.flatMap((res) =>
              Array.isArray(res?.items) ? res.items : []
            );
            const pins = items
              .filter((item) =>
                Number.isFinite(item.latitude) && Number.isFinite(item.longitude)
              )
              .map((item) => ({
                latitude: Number(item.latitude),
                longitude: Number(item.longitude),
                location_name: item.location_name,
                pollutant: item.pollutant,
                units: item.units,
                coverage_percent: item.coverage_percent ?? null,
                metric_value: item.metric_value ?? item.value ?? null,
              }));
            return [yearValue, pins] as const;
          })
        );
        const next: Record<number, OpenAQPin[]> = {};
        results.forEach(([yearValue, pins]) => {
          next[yearValue] = pins;
        });
        setOpenaqPinsByYear(next);
      } catch {
        setOpenaqPinsByYear({});
      } finally {
        setOpenaqLoading(false);
      }
    };
    loadPins();
  }, [mapYearRange, selectedCountries, pollutionType, pollutionMetric]);

  useEffect(() => {
    const loadPercentiles = async () => {
      setPercentileLoading(true);
      try {
        const params: any = {};
        if (measureNameMap[metric]) params.measure_name = measureNameMap[metric];
        if (causeName && causeName !== "all") params.cause_name = causeName;
        if (ageName && ageName !== "all") params.age_name = ageName;
        if (sexName && sexName !== "all") params.sex_name = sexName;
        const res = await getIMHEPercentiles({
          ...params,
          p: [0.01, 0.99],
          dense_years: false,
          year_from: 2020,
          year_to: 2023,
        });
        const [p01, p99] = (res?.percentiles || []) as number[];
        if (Number.isFinite(p01) && Number.isFinite(res?.max_val) && res.max_val > p01) {
          setPercentileRange({ min: p01, max: res.max_val });
        } else if (Number.isFinite(p01) && Number.isFinite(p99) && p99 > p01) {
          setPercentileRange({ min: p01, max: p99 });
        } else if (Number.isFinite(res?.min_val) && Number.isFinite(res?.max_val)) {
          setPercentileRange({ min: res.min_val, max: res.max_val });
        } else {
          setPercentileRange(null);
        }
      } catch {
        setPercentileRange(null);
      } finally {
        setPercentileLoading(false);
      }
    };
    loadPercentiles();
  }, [metric, causeName, ageName, sexName]);

  useEffect(() => {
    const loadTrend = async () => {
      setTrendLoading(true);
      try {
        const params: any = {};
        if (measureNameMap[metric]) params.measure_name = measureNameMap[metric];
        if (causeName && causeName !== "all") params.cause_name = causeName;
        if (ageName && ageName !== "all") params.age_name = ageName;
        if (sexName && sexName !== "all") params.sex_name = sexName;
        const countryFilter =
          selectedCountries.length === 1 ? selectedCountries[0] : undefined;
        const pollutant = pollutionParamMap[pollutionType] || pollutionType;
        const isMixed = pollutionType === "mixed";

        const healthParams = { ...params };
        if (countryFilter) {
          healthParams.location_name = countryFilter;
        }

        const rangeFrom = Math.min(trendYearFrom, trendYearTo);
        const rangeTo = Math.max(trendYearFrom, trendYearTo);

        const [healthRes, pollutionRes] = await Promise.allSettled([
          getIMHETrend({
            ...healthParams,
            year_from: rangeFrom,
            year_to: rangeTo,
          } as any),
          isMixed
            ? Promise.resolve([])
            : getOpenAQTrend({
                year_from: rangeFrom,
                year_to: rangeTo,
                country_name: countryFilter,
                pollutant,
                metric: pollutionMetric as any,
                method: pollutionTrendMethod,
              }),
        ]);

        const healthSeries =
          healthRes.status === "fulfilled" ? healthRes.value : [];
        const pollutionSeries =
          pollutionRes.status === "fulfilled" ? pollutionRes.value : [];
        const healthList = Array.isArray(healthSeries) ? healthSeries : [];
        const pollutionList = Array.isArray(pollutionSeries) ? pollutionSeries : [];

        try {
          const healthMap = new Map<string, number | null>();
          healthList.forEach((row: { year: number; value: number }) => {
            healthMap.set(String(row.year), row.value);
          });
          const pollutionMap = new Map<string, number | null>();
          pollutionList.forEach((row: { year: number; value: number | null }) => {
            pollutionMap.set(String(row.year), row.value ?? null);
          });

          const years = Array.from(
            new Set([
              ...Array.from(healthMap.keys()),
              ...Array.from(pollutionMap.keys()),
            ])
          )
            .sort((a, b) => Number(a) - Number(b))
            .filter((year) => Number(year) >= rangeFrom && Number(year) <= rangeTo);

          const merged = years.map((year) => ({
            year,
            healthValue: healthMap.get(year) ?? null,
            pollutionValue: pollutionMap.get(year) ?? null,
          }));
          setTrendData([...merged]);
        } catch (mergeErr) {
          setTrendData([]);
        }
      } catch {
        setTrendData([]);
      } finally {
        setTrendLoading(false);
      }
    };
    loadTrend();
  }, [metric, causeName, ageName, sexName, pollutionType, pollutionMetric, pollutionTrendMethod, selectedCountries, trendYearFrom, trendYearTo]);

  useEffect(() => {
    const loadPollutionTable = async () => {
      if (tableMode !== "pollution") return;
      setPollutionTableLoading(true);
      setPollutionTableError(null);
      try {
        const isMixed = pollutionType === "mixed";
        const selectedPollutant = pollutionParamMap[pollutionType] || pollutionType;
        const pollutantList = isMixed ? [] : [selectedPollutant];
        const countryFilter =
          selectedCountries.length === 1 ? selectedCountries[0] : undefined;
        const countryFilters = selectedCountries.length ? selectedCountries : undefined;
        const offset = (tablePage - 1) * tablePageSize;
        const responses = pollutantList.length
          ? await Promise.all(
              pollutantList.map((pollutantValue) =>
                getOpenAQList({
                  year: tableYear,
                  country_name: countryFilter,
                  country_names: countryFilters,
                  pollutant: pollutantValue,
                  metric: pollutionMetric as any,
                  limit: tablePageSize,
                  offset,
                })
              )
            )
          : [
              await getOpenAQList({
                year: tableYear,
                country_name: countryFilter,
                country_names: countryFilters,
                metric: pollutionMetric as any,
                limit: tablePageSize,
                offset,
              }),
            ];
        const items: OpenAQItem[] = responses.flatMap((res) =>
          Array.isArray(res?.items) ? res.items : []
        );
        const total = responses.reduce(
          (acc, res) => acc + (typeof res?.total === "number" ? res.total : 0),
          0
        );
        setPollutionTableItems(items);
        setPollutionTableTotal(total);
      } catch (err: any) {
        const message =
          err?.response?.data?.detail || err?.message || "Failed to load pollution table.";
        setPollutionTableError(message);
        setPollutionTableItems([]);
        setPollutionTableTotal(0);
      } finally {
        setPollutionTableLoading(false);
      }
    };
    loadPollutionTable();
  }, [tableMode, tableYear, pollutionType, pollutionMetric, selectedCountries, tablePage]);

  
  useEffect(() => {
    setTablePage(1);
  }, [selectedCountries, mapDataByYear, tableMode, tableYear, pollutionType, pollutionMetric]);

  useEffect(() => {
    setTableYear(yearRange[0]);
  }, [yearRange]);

  useEffect(() => {
    setMapYearRange((prev) => {
      const base = prev.length ? prev : [minYear];
      const clamped = base
        .map((y) => Math.min(Math.max(y, minYear), maxYear))
        .filter((y, idx, arr) => arr.indexOf(y) === idx)
        .sort((a, b) => a - b);
      return clamped.length ? clamped : [minYear];
    });
  }, [minYear, maxYear]);

  useEffect(() => {
    if (pollutionType === "mixed") {
      setPinLegendTint(null);
      return;
    }
    const label = normalizePollutant(pollutionLabels[pollutionType] || pollutionType);
    setPinLegendTint(label);
  }, [pollutionType]);

  useEffect(() => {
    const defaultFrom = 2020;
    const defaultTo = 2023;
    const clampedFrom = Math.min(Math.max(defaultFrom, minYear), maxYear);
    const clampedTo = Math.min(Math.max(defaultTo, minYear), maxYear);
    setTrendYearFrom(clampedFrom);
    setTrendYearTo(clampedTo);
  }, [minYear, maxYear]);

  const tableCountries = selectedCountries.length ? selectedCountries : defaultTableCountries;
  const totalPages =
    tableMode === "pollution"
      ? Math.ceil(pollutionTableTotal / tablePageSize)
      : Math.ceil(tableCountries.length / tablePageSize);
  const pagedCountries =
    tableMode === "pollution"
      ? []
      : tableCountries.slice((tablePage - 1) * tablePageSize, tablePage * tablePageSize);
  const pagedPollutionItems =
    tableMode === "pollution"
      ? pollutionTableItems.slice((tablePage - 1) * tablePageSize, tablePage * tablePageSize)
      : [];

  const valueStats = useMemo(() => {
    const values = Object.values(mapDataByYear[mapYearRange[0]] || {}).filter((v) => Number.isFinite(v));
    if (!values.length) return { min: 0, max: 0 };
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [mapDataByYear, mapYearRange]);

  const scaleStats = useMemo(() => {
    if (percentileRange) {
      const cappedMax = Math.min(percentileRange.max, 200000);
      return {
        min: percentileRange.min,
        max: cappedMax,
      };
    }
    return valueStats;
  }, [percentileRange, valueStats]);

  const getPaginationItems = (current: number, total: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, 4, "ellipsis", total];
    }
    if (current >= total - 2) {
      return [1, "ellipsis", total - 3, total - 2, total - 1, total];
    }
    return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const mapTransition = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3 }
  };

  const PIN_GRAYSCALE = ["#F8FAFC", "#E2E8F0", "#CBD5E1", "#94A3B8", "#64748B", "#475569", "#334155"];
  const PIN_TINTS: Record<string, string> = {
    "PM2.5": "#7E22CE",
    "PM10": "#2563EB",
    "NO₂": "#0E7490",
    "O₃": "#F97316",
    "SO₂": "#DC2626",
    "CO": "#57534E",
  };
  const PIN_LEGEND_ITEMS = ["PM2.5", "PM10", "NO₂", "O₃", "SO₂", "CO"];

  const hexToRgb = (hex: string) => {
    const clean = hex.replace("#", "");
    if (clean.length !== 6) return null;
    const num = Number.parseInt(clean, 16);
    if (Number.isNaN(num)) return null;
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const multiplyTint = (grayHex: string, tintHex: string) => {
    const gray = hexToRgb(grayHex);
    const tint = hexToRgb(tintHex);
    if (!gray || !tint) return grayHex;
    const r = Math.round((gray.r * tint.r) / 255);
    const g = Math.round((gray.g * tint.g) / 255);
    const b = Math.round((gray.b * tint.b) / 255);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const normalizePollutant = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.endsWith(" mass")) return trimmed.replace(" mass", "");
    return trimmed;
  };

  const getPercentile = (values: number[], p: number) => {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const idx = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * p)));
    return sorted[idx];
  };

  const isMixed = pollutionType === "mixed";

  const pinScale = useMemo(() => {
    const years = mapYearRange.length ? mapYearRange : [minYear];
    const values: number[] = [];
    const selectedLabel = normalizePollutant(pollutionLabels[pollutionType] || pollutionType);
    years.forEach((y) => {
      (openaqPinsByYear[y] || []).forEach((p) => {
        if (!isMixed && normalizePollutant(p.pollutant) !== selectedLabel) return;
        if (typeof p.metric_value === "number" && Number.isFinite(p.metric_value)) {
          values.push(p.metric_value);
        }
      });
    });
    if (!values.length) return null;
    const p05 = getPercentile(values, 0.05);
    const p95 = getPercentile(values, 0.95);
    const min = p05 !== null ? p05 : Math.min(...values);
    const max = p95 !== null ? p95 : Math.max(...values);
    return { min, max };
  }, [openaqPinsByYear, mapYearRange, pollutionType, isMixed, pollutionLabels, minYear]);
  const pinLegendLabel = isMixed
    ? "Mixed pollutants"
    : normalizePollutant(pollutionLabels[pollutionType] || pollutionType);

  const pinLegendColors = useMemo(() => {
    if (!pinScale) return [];
    if (!pinLegendTint) return PIN_GRAYSCALE;
    const tint = PIN_TINTS[pinLegendTint];
    if (!tint) return PIN_GRAYSCALE;
    return PIN_GRAYSCALE.map((gray) => multiplyTint(gray, tint));
  }, [pinScale, pinLegendTint]);

  // Helper to render a single map using Leaflet
  const renderMap = (yearValue: number, index: number = 0) => (
    <motion.div 
      className="flex-1 flex flex-col min-h-[400px] bg-card rounded-xl shadow-sm overflow-hidden"
      initial={prefersReducedMotion ? {} : { opacity: 0, x: index === 0 ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={prefersReducedMotion ? {} : { boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
    >
          {isMapComparing && (
            <motion.div 
              className="py-3 px-4 border-b border-border bg-secondary/30"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <h2 className="text-xl font-semibold text-center text-foreground">{yearValue}</h2>
            </motion.div>
          )}
      <div className="flex-1 rounded-b-xl overflow-hidden">
        <LeafletMap
          key={`map-${yearValue}`}
          selectedCountries={selectedCountries}
          year={yearValue}
          metricLabel={metricLabels[metric]}
          dataByCountry={mapDataByYear[yearValue] || {}}
          pollutionByCountry={mapPollutionByYear[yearValue] || {}}
          pollutionLabel={`${pollutionType === "mixed" ? "Pollution" : pollutionLabels[pollutionType] || pollutionType} (coverage avg)`}
          pins={openaqPinsByYear[yearValue] || []}
          pinsMetricLabel={pollutionMetricLabels[pollutionMetric] || pollutionMetric}
          pinsLoading={openaqLoading}
          scaleMin={scaleStats.min}
          scaleMax={scaleStats.max}
          isLoading={mapLoading}
          isActive={activeTab === "map"}
        />
      </div>
    </motion.div>
  );

  return (
    <motion.div 
      className="flex-1 flex flex-col bg-background overflow-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Title Section */}
      <motion.div 
        className="p-6 border-b border-border"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-foreground">
          {healthLabel} - {pollutionLabels[pollutionType]}{!isMapComparing && `, ${mapYearRange[0]}`}
        </h1>
        <p className="text-muted-foreground mt-1">
          {metricLabels[metric]} affected by air pollution exposure
          {isMapComparing && ` (comparing ${mapYearRange[0]} vs ${mapYearRange[1]})`}
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <motion.div 
          className="px-6 pt-4 flex items-center justify-between"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <TabsList>
            {[
              { value: 'table', icon: Table2, label: 'Table' },
              { value: 'map', icon: MapIcon, label: 'Map' },
              { value: 'chart', icon: TrendingUp, label: 'Line' }
            ].map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="default" 
                size="sm" 
                className="gap-2 bg-primary hover:bg-primary/90"
                onClick={() => navigate(`/prediction?role=${searchParams.get("role") || "user"}`)}
              >
                <Sparkles className="h-4 w-4" />
                Prediction
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" size="sm" className="gap-2">
                <ZoomIn className="h-4 w-4" />
                Zoom to selection
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <TabsContent value="map" className="flex-1 p-6 m-0" forceMount>
          <motion.div
            key={`map-${mapYearRange.join("-")}`}
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full border-border bg-muted/30">
              <CardContent className="p-6 h-full">
                {/* Map Container - side by side when comparing */}
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={isMapComparing ? 'comparing' : 'single'}
                    className={`flex ${isMapComparing ? 'gap-6' : ''} h-full`}
                    initial={prefersReducedMotion ? {} : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderMap(mapYearRange[0], 0)}
                    {isMapComparing && renderMap(mapYearRange[1], 1)}
                  </motion.div>
                </AnimatePresence>

              {/* Color Scale Legend */}
              <div className="mt-6 flex flex-col gap-1 bg-card rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-xs text-muted-foreground">
                    {mapError ? `Error: ${mapError}` : `Metric: ${metricLabels[metric]}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {mapLoading || percentileLoading
                      ? "Loading scale..."
                      : percentileRange
                        ? `Scale (2020-2023 P1 + max, log, gamma): ${scaleStats.min.toLocaleString()} - ${scaleStats.max.toLocaleString()}`
                        : `Range: ${valueStats.min.toLocaleString()} - ${valueStats.max.toLocaleString()}`}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">No data</span>
                    <div
                      className="w-8 h-4 border border-border"
                      style={{
                        background: `repeating-linear-gradient(
                          45deg,
                          hsl(var(--muted)),
                          hsl(var(--muted)) 2px,
                          hsl(var(--background)) 2px,
                          hsl(var(--background)) 4px
                        )`,
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-0">
                    <span className="text-xs text-muted-foreground mr-2">Low</span>
                    <div className="flex">
                      <div className="w-8 h-4" style={{ background: "#FEF3E2" }} />
                      <div className="w-8 h-4" style={{ background: "#FDDFB8" }} />
                      <div className="w-8 h-4" style={{ background: "#FCCC8A" }} />
                      <div className="w-8 h-4" style={{ background: "#FC8D59" }} />
                      <div className="w-8 h-4" style={{ background: "#E34A33" }} />
                      <div className="w-8 h-4" style={{ background: "#B30000" }} />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">High</span>
                  </div>
                </div>
              </div>
              {pinScale && (
                <div className="mt-3 flex flex-col gap-1 bg-card rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-xs text-muted-foreground">
                      Pollution pins: {pinLegendLabel}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      P5–P95: {pinScale.min.toLocaleString()} - {pinScale.max.toLocaleString()}
                    </div>
                  </div>
                  {pollutionType === "mixed" && (
                    <div className="text-xs text-muted-foreground">
                      Mixed pins use a global scale across all pollutants.
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground mr-2">Low</span>
                    <div className="flex">
                      {pinLegendColors.map((c, idx) => (
                        <div key={`${c}-${idx}`} className="w-8 h-4" style={{ background: c }} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">High</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">Colors</span>
                    {PIN_LEGEND_ITEMS.map((label) => {
                      const tint = PIN_TINTS[label];
                      const isActive = pinLegendTint === label;
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setPinLegendTint(isActive ? null : label)}
                          className={`inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs transition ${
                            isActive
                              ? "border-primary text-foreground bg-primary/10"
                              : "border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ background: tint }}
                          />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <motion.div
                className="mt-6 border-t border-border pt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-4">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </motion.div>
                  {mapYearRange.length < 2 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const base = mapYearRange[0] ?? maxYear;
                        const candidate = Math.min(base + 1, maxYear);
                        const fallback = Math.max(minYear, base - 1);
                        const next = candidate !== base ? candidate : fallback;
                        setMapYearRange([base, next].sort((a, b) => a - b));
                      }}
                    >
                      Add comparison year
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMapYearRange([mapYearRange[0]])}
                    >
                      Remove comparison
                    </Button>
                  )}
                  <span className="text-sm font-medium w-12">{minYear}</span>
                  <Slider
                    value={mapYearRange}
                    onValueChange={(values) => setMapYearRange(values)}
                    min={minYear}
                    max={maxYear}
                    step={1}
                    minStepsBetweenThumbs={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12">{maxYear}</span>
                </div>
                <motion.p
                  className="text-xs text-muted-foreground mt-2 text-center"
                  key={isMapComparing ? "comparing-text" : "single-text"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMapComparing
                    ? `Comparing ${mapYearRange[0]} and ${mapYearRange[1]}`
                    : `Viewing ${mapYearRange[0]} • Use "Add comparison year" to compare`}
                  <br />
                  Some years may have limited data coverage.
                </motion.p>
              </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Table View */}
        <TabsContent value="table" className="flex-1 p-6 m-0">
          <Card className="h-full">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Data Table</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-md border border-input bg-background p-1">
                    <button
                      type="button"
                      onClick={() => setTableMode("health")}
                      className={`px-2 py-1 text-xs rounded-md transition ${
                        tableMode === "health"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Health
                    </button>
                    <button
                      type="button"
                      onClick={() => setTableMode("pollution")}
                      className={`px-2 py-1 text-xs rounded-md transition ${
                        tableMode === "pollution"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Pollution
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground">Year</span>
                  <select
                    value={tableYear}
                    onChange={(e) => setTableYear(Number(e.target.value))}
                    className="h-8 px-2 text-sm rounded-md border border-input bg-background"
                  >
                    {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {tableMode === "health" ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium">Country</th>
                        <th className="text-right py-3 px-4 font-medium">{metricLabels[metric]}</th>
                        <th className="text-right py-3 px-4 font-medium">Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableCountries.length === 0 ? (
                        <tr>
                          <td className="py-6 px-4 text-center text-muted-foreground" colSpan={3}>
                            Select countries to populate the table.
                          </td>
                        </tr>
                      ) : (
                        pagedCountries.map((country) => (
                          <tr key={country} className="border-b border-border/50 hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{country}</td>
                            <td className="text-right py-3 px-4">
                              {mapDataByYear[tableYear]?.[country] !== undefined
                                ? mapDataByYear[tableYear]?.[country].toLocaleString()
                                : "—"}
                            </td>
                            <td className="text-right py-3 px-4">{tableYear}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium">Location</th>
                        <th className="text-left py-3 px-4 font-medium">Pollutant</th>
                        <th className="text-right py-3 px-4 font-medium">
                          {pollutionMetricLabels[pollutionMetric] || pollutionMetric}
                        </th>
                        <th className="text-right py-3 px-4 font-medium">Coverage %</th>
                        <th className="text-right py-3 px-4 font-medium">Year</th>
                        <th className="text-left py-3 px-4 font-medium">Country</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pollutionTableLoading ? (
                        <tr>
                          <td className="py-6 px-4 text-center text-muted-foreground" colSpan={6}>
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                              Loading pollution data...
                            </div>
                          </td>
                        </tr>
                      ) : pollutionTableError ? (
                        <tr>
                          <td className="py-6 px-4 text-center text-muted-foreground" colSpan={6}>
                            {pollutionTableError}
                          </td>
                        </tr>
                      ) : pagedPollutionItems.length === 0 ? (
                        <tr>
                          <td className="py-6 px-4 text-center text-muted-foreground" colSpan={6}>
                            No pollution data available.
                          </td>
                        </tr>
                      ) : (
                        pagedPollutionItems.map((item, idx) => {
                          const value = item.metric_value ?? item.value ?? null;
                          const valueLabel = value !== null ? value.toLocaleString() : "—";
                          const coverage =
                            item.coverage_percent !== undefined && item.coverage_percent !== null
                              ? `${item.coverage_percent}%`
                              : "—";
                          return (
                            <tr key={`${item.location_name}-${idx}`} className="border-b border-border/50 hover:bg-muted/50">
                              <td className="py-3 px-4 font-medium">{item.location_name}</td>
                              <td className="py-3 px-4">{item.pollutant}</td>
                              <td className="text-right py-3 px-4">
                                {valueLabel} {item.units || ""}
                              </td>
                              <td className="text-right py-3 px-4">{coverage}</td>
                              <td className="text-right py-3 px-4">{item.year ?? tableYear}</td>
                              <td className="py-3 px-4">{item.country_name || "—"}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                    disabled={tablePage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {getPaginationItems(tablePage, totalPages).map((item, idx) => {
                      if (item === "ellipsis") {
                        return (
                          <span key={`ellipsis-${idx}`} className="px-2 text-xs text-muted-foreground">
                            ...
                          </span>
                        );
                      }
                      const page = item as number;
                      return (
                        <Button
                          key={page}
                          variant={page === tablePage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTablePage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTablePage((p) => Math.min(totalPages, p + 1))}
                    disabled={tablePage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Line Chart View */}
        <TabsContent value="chart" className="flex-1 p-6 m-0">
          <motion.div
            key={`chart-${trendYearFrom}-${trendYearTo}`}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="h-full border-border bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>Trend Analysis</span>
                  <motion.span
                    className="text-sm font-normal text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {trendYearFrom}–{trendYearTo}
                  </motion.span>
                </CardTitle>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>From</span>
                  <select
                    value={trendYearFrom}
                    onChange={(e) => setTrendYearFrom(Number(e.target.value))}
                    className="h-8 px-2 text-sm rounded-md border border-input bg-background"
                  >
                    {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <span>To</span>
                  <select
                    value={trendYearTo}
                    onChange={(e) => setTrendYearTo(Number(e.target.value))}
                    className="h-8 px-2 text-sm rounded-md border border-input bg-background"
                  >
                    {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <span>Method</span>
                  <select
                    value={pollutionTrendMethod}
                    onChange={(e) => setPollutionTrendMethod(e.target.value as any)}
                    disabled={pollutionType === "mixed"}
                    className="h-8 px-2 text-sm rounded-md border border-input bg-background"
                  >
                    <option value="weighted">Weighted</option>
                    <option value="unweighted">Unweighted</option>
                    <option value="balanced">Balanced</option>
                    <option value="median">Median</option>
                  </select>
                  {pollutionType === "mixed" && (
                    <span className="text-xs text-muted-foreground">
                      Mixed mode disables pollution trend.
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="h-[400px]">
                {trendLoading ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    Loading trend data...
                  </div>
                ) : trendData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    No trend data available.
                  </div>
                ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isComparing ? "comparing-chart" : "single-chart"}
                    className={`flex ${isComparing ? "gap-6" : ""} h-full`}
                    initial={prefersReducedMotion ? {} : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className={`${isComparing ? "flex-1" : "w-full"} h-full flex flex-col bg-card rounded-xl p-4 shadow-sm`}
                      initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={prefersReducedMotion ? {} : { boxShadow: "0 8px 20px -5px rgb(0 0 0 / 0.1)" }}
                    >
                      {isComparing && (
                        <div className="py-2 px-4 border-b border-border mb-2 bg-secondary/30">
                          <h3 className="text-lg font-semibold text-center text-foreground">{yearRange[0]}</h3>
                        </div>
                      )}
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={chartData1}
                          margin={{ top: 20, right: isComparing ? 20 : 60, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="year"
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                            axisLine={{ stroke: "hsl(var(--border))" }}
                          />
                          <YAxis
                            yAxisId="left"
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                            axisLine={{ stroke: "hsl(var(--border))" }}
                            label={{
                              value: healthLabel,
                              angle: -90,
                              position: "insideLeft",
                              style: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
                            }}
                          />
                          {pollutionType !== "mixed" && (
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                              axisLine={{ stroke: "hsl(var(--border))" }}
                              label={{
                                value: `${pollutionLabels[pollutionType] || pollutionType} (µg/m³)`,
                                angle: 90,
                                position: "insideRight",
                                style: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
                              }}
                            />
                          )}
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Bar
                            yAxisId="left"
                            dataKey="healthValue"
                            name={healthLabel}
                            fill="hsl(204, 70%, 53%)"
                            radius={[4, 4, 0, 0]}
                            barSize={isComparing ? 24 : 40}
                            animationDuration={800}
                            animationBegin={0}
                          />
                          {pollutionType !== "mixed" && (
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="pollutionValue"
                              name={pollutionLabels[pollutionType]}
                              stroke="hsl(6, 78%, 57%)"
                              strokeWidth={2}
                              dot={{ fill: "hsl(6, 78%, 57%)", strokeWidth: 2, r: 4 }}
                              animationDuration={1000}
                              animationBegin={200}
                            />
                          )}
                        </ComposedChart>
                      </ResponsiveContainer>
                    </motion.div>

                    {isComparing && (
                      <motion.div
                        className="flex-1 h-full flex flex-col bg-card rounded-xl p-4 shadow-sm"
                        initial={prefersReducedMotion ? {} : { opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        whileHover={prefersReducedMotion ? {} : { boxShadow: "0 8px 20px -5px rgb(0 0 0 / 0.1)" }}
                      >
                        <div className="py-2 px-4 border-b border-border mb-2 bg-secondary/30">
                          <h3 className="text-lg font-semibold text-center text-foreground">{yearRange[1]}</h3>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                            data={chartData2}
                            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                              dataKey="year"
                              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                              axisLine={{ stroke: "hsl(var(--border))" }}
                            />
                            <YAxis
                              yAxisId="left"
                              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                              axisLine={{ stroke: "hsl(var(--border))" }}
                            />
                            {pollutionType !== "mixed" && (
                              <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                                axisLine={{ stroke: "hsl(var(--border))" }}
                              />
                            )}
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                              }}
                            />
                            <Legend />
                            <Bar
                              yAxisId="left"
                              dataKey="healthValue"
                              name={healthLabel}
                              fill="hsl(204, 70%, 53%)"
                              radius={[4, 4, 0, 0]}
                              barSize={24}
                              animationDuration={800}
                              animationBegin={200}
                            />
                            {pollutionType !== "mixed" && (
                              <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="pollutionValue"
                                name={pollutionLabels[pollutionType]}
                                stroke="hsl(6, 78%, 57%)"
                                strokeWidth={2}
                                dot={{ fill: "hsl(6, 78%, 57%)", strokeWidth: 2, r: 4 }}
                                animationDuration={1000}
                                animationBegin={400}
                              />
                            )}
                          </ComposedChart>
                        </ResponsiveContainer>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

      </Tabs>
    </motion.div>
  );
};

export default DataVisualization;


