import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const [trendYearFrom, setTrendYearFrom] = useState<number>(2020);
  const [trendYearTo, setTrendYearTo] = useState<number>(2023);
  const [mapYear, setMapYear] = useState<number>(yearRange[0]);
  const isComparing = yearRange.length === 2;
  const prefersReducedMotion = useReducedMotion();

  

  const metricLabels: Record<string, string> = {
    rate: "Rate per 100,000",
    deaths: "Deaths",
    dalys: "DALYs (Disability-Adjusted Life Years)",
    prevalence: "Prevalence (%)",
  };

  const pollutionLabels: Record<string, string> = {
    pm25: "PM2.5",
    pm10: "PM10",
    ozone: "Ozone",
    no2: "NOâ‚‚",
    so2: "SOâ‚‚",
    co: "CO",
  };

  const pollutionParamMap: Record<string, string> = {
    pm25: "PM2.5",
    pm10: "PM10",
    ozone: "O₃ mass",
    no2: "NO₂ mass",
    so2: "SO₂ mass",
    co: "CO mass",
  };

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
        const years = Array.from(new Set(yearRange)).sort((a, b) => a - b);
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
            (rows || []).forEach((row: { country: string; value: number; pollution_pm25?: number | null }) => {
              map[row.country] = row.value;
              if (row.pollution_pm25 !== undefined) {
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
  }, [yearRange, metric, causeName, ageName, sexName]);

  useEffect(() => {
    const loadPins = async () => {
      setOpenaqLoading(true);
      setOpenaqPinsByYear({});
      try {
        const years = Array.from(new Set(yearRange)).sort((a, b) => a - b);
        const countryFilter =
          selectedCountries.length === 1 ? selectedCountries[0] : undefined;
        const pollutant = pollutionParamMap[pollutionType] || pollutionType;
        const results = await Promise.all(
          years.map(async (yearValue) => {
            const res = await getOpenAQList({
              year: yearValue,
              country_name: countryFilter,
              pollutant,
              metric: pollutionMetric as any,
              limit: 1000,
            });
            const items: OpenAQItem[] = Array.isArray(res?.items) ? res.items : [];
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
  }, [yearRange, selectedCountries, pollutionType, pollutionMetric]);

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

        const healthParams = { ...params };
        if (countryFilter) {
          healthParams.location_name = countryFilter;
        }

        const rangeFrom = Math.min(trendYearFrom, trendYearTo);
        const rangeTo = Math.max(trendYearFrom, trendYearTo);

        console.groupCollapsed("[trend] request params");
        console.log("healthParams:", healthParams);
        console.log("pollutionParams:", {
          year_from: rangeFrom,
          year_to: rangeTo,
          country_name: countryFilter,
          pollutant,
          metric: pollutionMetric,
        });
        console.groupEnd();

        const [healthRes, pollutionRes] = await Promise.allSettled([
          getIMHETrend({
            ...healthParams,
            year_from: rangeFrom,
            year_to: rangeTo,
          } as any),
          getOpenAQTrend({
            year_from: rangeFrom,
            year_to: rangeTo,
            country_name: countryFilter,
            pollutant,
            metric: pollutionMetric as any,
          }),
        ]);

        const healthSeries =
          healthRes.status === "fulfilled" ? healthRes.value : [];
        const pollutionSeries =
          pollutionRes.status === "fulfilled" ? pollutionRes.value : [];
        const healthList = Array.isArray(healthSeries) ? healthSeries : [];
        const pollutionList = Array.isArray(pollutionSeries) ? pollutionSeries : [];

        console.groupCollapsed("[trend] response samples");
        console.log("health status:", healthRes.status);
        if (healthRes.status === "rejected") {
          console.log("health error:", healthRes.reason);
        } else {
          console.log("health count:", healthList.length);
          if (!Array.isArray(healthSeries)) console.log("health payload not array:", healthSeries);
        }
        console.log("pollution status:", pollutionRes.status);
        if (pollutionRes.status === "rejected") {
          console.log("pollution error:", pollutionRes.reason);
        } else {
          console.log("pollution count:", pollutionList.length);
          if (!Array.isArray(pollutionSeries)) console.log("pollution payload not array:", pollutionSeries);
        }
        console.groupEnd();

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
          console.groupCollapsed("[trend] merged");
          console.log("years:", years);
          console.log("merged length:", merged.length);
          console.log("merged sample:", merged.slice(0, 3));
          console.groupEnd();
          setTrendData([...merged]);
        } catch (mergeErr) {
          console.error("[trend] merge error:", mergeErr);
          setTrendData([]);
        }
      } catch {
        setTrendData([]);
      } finally {
        setTrendLoading(false);
      }
    };
    loadTrend();
  }, [metric, causeName, ageName, sexName, pollutionType, pollutionMetric, selectedCountries, trendYearFrom, trendYearTo]);

  
  useEffect(() => {
    setTablePage(1);
  }, [selectedCountries, mapDataByYear]);

  useEffect(() => {
    setTableYear(yearRange[0]);
    setMapYear(yearRange[0]);
  }, [yearRange]);

  useEffect(() => {
    const defaultFrom = 2020;
    const defaultTo = 2023;
    const clampedFrom = Math.min(Math.max(defaultFrom, minYear), maxYear);
    const clampedTo = Math.min(Math.max(defaultTo, minYear), maxYear);
    setTrendYearFrom(clampedFrom);
    setTrendYearTo(clampedTo);
  }, [minYear, maxYear]);

  const tableCountries = selectedCountries.length ? selectedCountries : defaultTableCountries;
  const totalPages = Math.ceil(tableCountries.length / tablePageSize);
  const pagedCountries = tableCountries.slice(
    (tablePage - 1) * tablePageSize,
    tablePage * tablePageSize
  );

  const valueStats = useMemo(() => {
    const values = Object.values(mapDataByYear[yearRange[0]] || {}).filter((v) => Number.isFinite(v));
    if (!values.length) return { min: 0, max: 0 };
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [mapDataByYear, yearRange]);

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

  // Helper to render a single map using Leaflet
  const renderMap = (yearValue: number, index: number = 0) => (
    <motion.div 
      className="flex-1 flex flex-col min-h-[400px] bg-card rounded-xl shadow-sm overflow-hidden"
      initial={prefersReducedMotion ? {} : { opacity: 0, x: index === 0 ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={prefersReducedMotion ? {} : { boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
    >
      {isComparing && (
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
          pollutionLabel="PM2.5 (coverage avg)"
          pins={openaqPinsByYear[yearValue] || []}
          pinsMetricLabel={pollutionMetric}
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
          {healthLabel} - {pollutionLabels[pollutionType]}{!isComparing && `, ${yearRange[0]}`}
        </h1>
        <p className="text-muted-foreground mt-1">
          {metricLabels[metric]} affected by air pollution exposure
          {isComparing && ` (comparing ${yearRange[0]} vs ${yearRange[1]})`}
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
            key={`map-${mapYear}`}
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full border-border bg-muted/30">
              <CardContent className="p-6 h-full">
                <div className="mb-4 flex items-center justify-end gap-2">
                  <span className="text-xs text-muted-foreground">Year</span>
                  <select
                    value={mapYear}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      setMapYear(next);
                      onYearRangeChange([next]);
                    }}
                    className="h-8 px-2 text-sm rounded-md border border-input bg-background"
                  >
                    {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                {/* Map Container - side by side when comparing */}
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={isComparing ? 'comparing' : 'single'}
                    className={`flex ${isComparing ? 'gap-6' : ''} h-full`}
                    initial={prefersReducedMotion ? {} : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderMap(yearRange[0], 0)}
                    {isComparing && renderMap(yearRange[1], 1)}
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
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1;
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
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                            axisLine={{ stroke: "hsl(var(--border))" }}
                            label={{
                              value: `${pollutionLabels[pollutionType]} (µg/m³)`,
                              angle: 90,
                              position: "insideRight",
                              style: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
                            }}
                          />
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
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                              axisLine={{ stroke: "hsl(var(--border))" }}
                            />
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


