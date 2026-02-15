import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { DragEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Organization } from "@/types/organization";
import { isHealthDomain } from "@/lib/enumMaps";
import CsvUploadPanel from "@/components/upload/CsvUploadPanel";
import HealthManualForm from "@/components/upload/HealthManualForm";
import PollutionManualForm from "@/components/upload/PollutionManualForm";
import MapPickerDialog from "@/components/upload/MapPickerDialog";
import {
  uploadIMHECSVValidate,
  uploadIMHECSVConfirm,
  uploadIMHERecord,
  listUploadDupes,
  uploadOpenAQCSVValidate,
  uploadOpenAQCSVConfirm,
  uploadOpenAQRecord,
  listOpenAQDupes,
  getOpenAQPollutants,
  getOpenAQUnits,
  getOpenAQLocations,
  geocodeLocation,
  reverseGeocode,
  getIMHEMeasures,
  getIMHEMetrics,
  getIMHEAges,
  getIMHESexes,
  getIMHECauses,
} from "@/lib/API";

const MANUAL_FIELDS = [
  { key: "measure_name", label: "Measure Name", type: "text" },
  { key: "location_name", label: "Location Name", type: "text" },
  { key: "sex_name", label: "Sex Name", type: "text" },
  { key: "age_name", label: "Age Name", type: "text" },
  { key: "cause_name", label: "Cause Name", type: "text" },
  { key: "metric_name", label: "Metric Name", type: "text" },
  { key: "year", label: "Year", type: "number" },
  { key: "val", label: "Value", type: "number" },
] as const;

const ADVANCED_FIELDS = [
  { key: "upper", label: "Upper", type: "number" },
  { key: "lower", label: "Lower", type: "number" },
] as const;

type AdvancedFieldKey = typeof ADVANCED_FIELDS[number]["key"];

type ManualFieldKey = typeof MANUAL_FIELDS[number]["key"];

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

const UploadData = () => {
  const { user } = useAuth();
  const org = user as Organization;
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<File[]>([]);
  const [fileType, setFileType] = useState<"health" | "pollution">(
    isHealthDomain(org?.data_domain) ? "health" : "pollution"
  );
  const isHealthOrg = isHealthDomain(org?.data_domain);
  const isPollutionOrg = !isHealthOrg;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [validationResults, setValidationResults] = useState<Array<{
    file: File;
    domain: "health" | "pollution";
    token: string;
    total_rows: number;
    new_rows: number;
    dupe_rows: number;
    dupe_samples: Array<Record<string, any>>;
    dupe_total?: number;
    token_expires_seconds?: number;
    confirming: boolean;
    error?: string;
    dupe_page?: number;
    dupe_items?: Array<Record<string, any>>;
    dupe_loading?: boolean;
  }>>([]);
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [csvPreviews, setCsvPreviews] = useState<Array<{ name: string; lines: string[] }>>([]);
  const [previewStep, setPreviewStep] = useState<"preview" | "validation">("preview");
  const [manualValues, setManualValues] = useState<Record<ManualFieldKey, string>>({
    measure_name: "",
    location_name: "",
    sex_name: "",
    age_name: "",
    cause_name: "",
    metric_name: "",
    year: "",
    val: "",
  });
  const [advancedValues, setAdvancedValues] = useState<Record<AdvancedFieldKey, string>>({
    upper: "",
    lower: "",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPollutionAdvanced, setShowPollutionAdvanced] = useState(false);
  const [pollutionValues, setPollutionValues] = useState({
    location_name: "",
    pollutant: "",
    units: "",
    year: "",
    value: "",
    latitude: "",
    longitude: "",
  });
  const [pollutionAdvancedValues, setPollutionAdvancedValues] = useState({
    min: "",
    max: "",
    median: "",
    avg: "",
    coverage_percent: "",
  });
  const [pollutionOptions, setPollutionOptions] = useState<string[]>([]);
  const [pollutionUnits, setPollutionUnits] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [locationQuery, setLocationQuery] = useState("");
  const [pollutionManualError, setPollutionManualError] = useState<string | null>(null);
  const [pollutionManualSubmitting, setPollutionManualSubmitting] = useState(false);
  const [pollutionLoading, setPollutionLoading] = useState(false);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [pollutionOptionsError, setPollutionOptionsError] = useState<string | null>(null);
  const [unitsError, setUnitsError] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapQuery, setMapQuery] = useState("");
  const [mapResults, setMapResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [mapSearching, setMapSearching] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const mapMarkerRef = useRef<L.Marker | null>(null);
  const pendingMapCenterRef = useRef<[number, number] | null>(null);
  const mapCenteredRef = useRef(false);
  const [mapValidationError, setMapValidationError] = useState<string | null>(null);
  const [pendingLatLng, setPendingLatLng] = useState<[number, number] | null>(null);
  const [pendingLatLngValid, setPendingLatLngValid] = useState(false);
  const [hasPlacedPin, setHasPlacedPin] = useState(false);

  const getCoordsFromValues = () => {
    const latRaw = pollutionValues.latitude?.toString().trim();
    const lonRaw = pollutionValues.longitude?.toString().trim();
    if (!latRaw || !lonRaw) return null;
    const lat = Number(latRaw);
    const lon = Number(lonRaw);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return [lat, lon] as [number, number];
  };

  const [measureOptions, setMeasureOptions] = useState<Array<{ measure_id: number; measure_name: string }>>([]);
  const [metricOptions, setMetricOptions] = useState<Array<{ metric_id: number; metric_name: string }>>([]);
  const [ageOptions, setAgeOptions] = useState<Array<{ age_id: number; age_name: string }>>([]);
  const [sexOptions, setSexOptions] = useState<Array<{ sex_id: number; sex_name: string }>>([]);
  const [causeOptions, setCauseOptions] = useState<Array<{ cause_id: number; cause_name: string }>>([]);

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

  useEffect(() => {
    if (org?.country) {
      setManualValues((prev) => ({ ...prev, location_name: org.country }));
    }
  }, [org?.country]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const params = org?.country ? { location_name: org.country } : undefined;
        const [measures, metrics, ages, sexes, causes] = await Promise.all([
          getIMHEMeasures(params),
          getIMHEMetrics(params),
          getIMHEAges(params),
          getIMHESexes(params),
          getIMHECauses(params),
        ]);
        setMeasureOptions(Array.isArray(measures) ? measures : []);
        setMetricOptions(Array.isArray(metrics) ? metrics : []);
        const sortedAges = Array.isArray(ages)
          ? ages
              .filter((a) => a?.age_name)
              .sort((a, b) => {
                const ak = ageSortKey(a.age_name);
                const bk = ageSortKey(b.age_name);
                if (ak.start !== bk.start) return ak.start - bk.start;
                if (ak.end !== bk.end) return ak.end - bk.end;
                return a.age_name.localeCompare(b.age_name);
              })
          : [];
        setAgeOptions(sortedAges);
        setSexOptions(Array.isArray(sexes) ? sexes : []);
        const cleanedCauses = Array.isArray(causes)
          ? causes.filter((c) => c?.cause_name && c.cause_name.toLowerCase() !== "asthma")
          : [];
        setCauseOptions(cleanedCauses);
      } catch {
        setMeasureOptions([]);
        setMetricOptions([]);
        setAgeOptions([]);
        setSexOptions([]);
        setCauseOptions([]);
      }
    };
    loadOptions();
  }, [org?.country]);

  useEffect(() => {
    if (fileType !== "pollution") return;
    const loadPollutants = async () => {
      setPollutionLoading(true);
      setPollutionOptionsError(null);
      try {
        const res = await getOpenAQPollutants({ country_name: org?.country });
        const items = Array.isArray(res?.items) ? res.items : [];
        const next = items.length ? items : FALLBACK_POLLUTANTS;
        setPollutionOptions(next);
        if (!pollutionValues.pollutant && next.length > 0) {
          setPollutionValues((prev) => ({ ...prev, pollutant: next[0] }));
        }
      } catch (err: any) {
        setPollutionOptionsError(
          err?.response?.data?.detail || err?.message || "Failed to load pollutants."
        );
        setPollutionOptions(FALLBACK_POLLUTANTS);
        if (!pollutionValues.pollutant && FALLBACK_POLLUTANTS.length > 0) {
          setPollutionValues((prev) => ({ ...prev, pollutant: FALLBACK_POLLUTANTS[0] }));
        }
      } finally {
        setPollutionLoading(false);
      }
    };
    loadPollutants();
  }, [fileType, org?.country]);

  useEffect(() => {
    if (fileType !== "pollution") return;
    const loadUnits = async () => {
      setUnitsLoading(true);
      setUnitsError(null);
      try {
        const res = await getOpenAQUnits({
          country_name: org?.country,
          pollutant: pollutionValues.pollutant || undefined,
        });
        const items = Array.isArray(res?.items) ? res.items : [];
        const nextUnits = items.length ? items : FALLBACK_UNITS;
        setPollutionUnits(nextUnits);
        if (!pollutionValues.units || (nextUnits.length > 0 && !nextUnits.includes(pollutionValues.units))) {
          const next = nextUnits[0] || "µg/m³";
          setPollutionValues((prev) => ({ ...prev, units: next }));
        }
      } catch (err: any) {
        setUnitsError(err?.response?.data?.detail || err?.message || "Failed to load units.");
        setPollutionUnits(FALLBACK_UNITS);
        if (!pollutionValues.units) {
          setPollutionValues((prev) => ({ ...prev, units: "µg/m³" }));
        }
      } finally {
        setUnitsLoading(false);
      }
    };
    loadUnits();
  }, [fileType, org?.country, pollutionValues.pollutant, pollutionValues.units]);

  useEffect(() => {
    if (fileType !== "pollution") return;
    if (!locationQuery || locationQuery.trim().length < 2) {
      setLocationSuggestions([]);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        const res = await getOpenAQLocations({
          country_name: org?.country,
          q: locationQuery.trim(),
          limit: 15,
        });
        setLocationSuggestions(Array.isArray(res?.items) ? res.items : []);
      } catch {
        setLocationSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [fileType, org?.country, locationQuery]);

  useEffect(() => {
    if (!mapOpen) return;
    if (mapInstanceRef.current) return;
    let retries = 0;
    const initMap = () => {
      if (!mapOpen || mapInstanceRef.current) return;
      if (!mapRef.current) {
        retries += 1;
        if (retries <= 10) {
          setTimeout(initMap, 80);
        }
        return;
      }
      const coords = getCoordsFromValues();
      const hasCoords = !!coords;
      const lat = coords ? coords[0] : 0;
      const lng = coords ? coords[1] : 0;
      const bounds = L.latLngBounds(
        L.latLng(-85, -180),
        L.latLng(85, 180)
      );
      const pendingCenter = pendingMapCenterRef.current;
      const initialCenter: L.LatLngExpression = hasCoords
        ? ([lat, lng] as L.LatLngTuple)
        : pendingCenter
          ? (pendingCenter as L.LatLngTuple)
          : ([20, 0] as L.LatLngTuple);
      const initialZoom = hasCoords ? 7 : pendingCenter ? 5 : 1;
      const map = L.map(mapRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        worldCopyJump: false,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
        minZoom: 1,
        maxZoom: 18,
        doubleClickZoom: false,
      });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution:
          "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> &copy; <a href=\"https://carto.com/attributions\">CARTO</a>",
        subdomains: "abcd",
        maxZoom: 18,
        noWrap: true,
      }).addTo(map);
      map.on("dblclick", (e: L.LeafletMouseEvent) => {
        if (mapMarkerRef.current) return;
        const { lat, lng } = e.latlng;
        setPendingFromLatLng(lat, lng);
      });
      map.on("click", (e: L.LeafletMouseEvent) => {
        if (!mapMarkerRef.current) return;
        const { lat, lng } = e.latlng;
        setPendingFromLatLng(lat, lng);
      });
      mapInstanceRef.current = map;
      setTimeout(() => {
        map.invalidateSize();
      }, 80);
      if (hasCoords) {
        ensureDraggableMarker(lat, lng);
        setPendingLatLng([lat, lng]);
        setPendingLatLngValid(true);
        setHasPlacedPin(true);
      }
    };
    initMap();
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
      }
      mapInstanceRef.current = null;
      mapMarkerRef.current = null;
      mapCenteredRef.current = false;
      setHasPlacedPin(false);
    };
  }, [mapOpen]);

  useEffect(() => {
    if (!mapOpen || !mapInstanceRef.current) return;
    if (pendingLatLng) {
      ensureDraggableMarker(pendingLatLng[0], pendingLatLng[1]);
      mapInstanceRef.current.invalidateSize();
      return;
    }
    const coords = getCoordsFromValues();
    if (!coords) return;
    ensureDraggableMarker(coords[0], coords[1]);
    mapInstanceRef.current.invalidateSize();
  }, [mapOpen, pollutionValues.latitude, pollutionValues.longitude, pendingLatLng]);

  useEffect(() => {
    if (!mapOpen) return;
    if (!mapQuery.trim() && org?.country) {
      // Leave the search box empty; we only center the map by org country.
      setMapResults([]);
    }
    if (mapQuery.trim().length < 2) {
      setMapResults([]);
      return;
    }
    const handle = setTimeout(() => {
      fetchMapResults(mapQuery);
    }, 300);
    return () => clearTimeout(handle);
  }, [mapOpen, mapQuery]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const validTypes = [".csv", ".xlsx", ".xls", ".json"];
    const validFiles: File[] = [];

    for (const selectedFile of selectedFiles) {
      const ext = selectedFile.name
        .substring(selectedFile.name.lastIndexOf("."))
        .toLowerCase();
      if (!validTypes.includes(ext)) {
        toast({
          title: "Invalid file type",
          description: `Only CSV, Excel (.xlsx/.xls), or JSON files are supported. Skipped ${selectedFile.name}.`,
          variant: "destructive",
        });
        continue;
      }

      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `Max 50MB. Skipped ${selectedFile.name}.`,
          variant: "destructive",
        });
        continue;
      }

      validFiles.push(selectedFile);
    }

    if (!validFiles.length) return;
    setFiles((prev) => [...prev, ...validFiles]);
    setValidationResults([]);
    setUploadSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const buildPreviewLines = (name: string, text: string, maxLines = 8) => {
    const trimmed = text.trim();
    if (!trimmed) return ["[Empty file]"];
    if (name.toLowerCase().endsWith(".json")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          const sample = parsed.slice(0, 2);
          const header = `[JSON array] total=${parsed.length}, showing first ${sample.length}`;
          const body = sample
            .map((item, idx) => `item ${idx + 1}:\n${JSON.stringify(item, null, 2)}`)
            .join("\n");
          return [header, ...body.split(/\r?\n/)].slice(0, maxLines);
        }
        if (parsed && typeof parsed === "object") {
          const header = "[JSON object]";
          return [header, ...JSON.stringify(parsed, null, 2).split(/\r?\n/)].slice(0, maxLines);
        }
      } catch {
        return ["[Invalid JSON]"];
      }
    }
    return trimmed.split(/\r?\n/).filter((l) => l.trim() !== "").slice(0, maxLines);
  };

  const handleUpload = async () => {
    if (!files.length) return;

    setIsUploading(true);

    try {
      const previews: Array<{ name: string; lines: string[] }> = [];
      for (const file of files) {
        const ext = file.name
          .substring(file.name.lastIndexOf("."))
          .toLowerCase();
        if (ext === ".csv" || ext === ".json") {
          const text = await file.text();
          const lines = buildPreviewLines(file.name, text, 12);
          previews.push({ name: file.name, lines });
        } else {
          previews.push({
            name: file.name,
            lines: ["[Preview unavailable for Excel files]"],
          });
        }
      }
      setCsvPreviews(previews);
      setPreviewStep("preview");
      setPreviewOpen(true);
    } catch (err) {
      const message =
        err?.response?.data?.detail || err?.message || "Upload failed. Please try again.";
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePreviewConfirm = async () => {
    setPreviewStep("validation");
    setIsUploading(true);
    try {
      const results = [];
      for (const file of files) {
        const res =
          fileType === "health"
            ? await uploadIMHECSVValidate(file)
            : await uploadOpenAQCSVValidate(file);
        results.push({
          file,
          domain: fileType,
          token: res.token,
          total_rows: res.total_rows,
          new_rows: res.new_rows,
          dupe_rows: res.dupe_rows,
          dupe_samples: res.dupe_samples || [],
          dupe_total: res.dupe_total || res.dupe_rows,
          token_expires_seconds: res.token_expires_seconds,
          confirming: false,
          dupe_page: 1,
          dupe_items: res.dupe_samples || [],
        });
      }
      setValidationResults(results);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || "Upload failed. Please try again.";
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirm = async (token: string) => {
    setValidationResults((prev) =>
      prev.map((r) => (r.token === token ? { ...r, confirming: true, error: undefined } : r))
    );
    try {
      const target = validationResults.find((r) => r.token === token);
      if (target?.domain === "pollution") {
        await uploadOpenAQCSVConfirm(token);
      } else {
        await uploadIMHECSVConfirm(token);
      }
      setValidationResults((prev) => {
        const removed = prev.find((r) => r.token === token);
        if (removed) {
          setFiles((filesPrev) =>
            filesPrev.filter(
              (f) =>
                !(
                  f.name === removed.file.name &&
                  f.size === removed.file.size &&
                  f.lastModified === removed.file.lastModified
                )
            )
          );
        }
        return prev.filter((r) => r.token !== token);
      });
      setUploadSuccess(true);
      if (fileInputRef.current && files.length <= 1) {
        fileInputRef.current.value = "";
      }
      toast({
        title: "Upload complete",
        description: "Non-duplicate rows were added successfully.",
      });
    } catch (err) {
      const message =
        err?.response?.data?.detail || err?.message || "Confirm failed.";
      setValidationResults((prev) =>
        prev.map((r) => (r.token === token ? { ...r, confirming: false, error: message } : r))
      );
    } finally {
      setValidationResults((prev) =>
        prev.map((r) => (r.token === token ? { ...r, confirming: false } : r))
      );
    }
  };

  const loadDupesPage = async (token: string, page: number) => {
    const limit = 5;
    const offset = (page - 1) * limit;
    setValidationResults((prev) =>
      prev.map((r) =>
        r.token === token ? { ...r, dupe_loading: true } : r
      )
    );
    try {
      const target = validationResults.find((r) => r.token === token);
      const res =
        target?.domain === "pollution"
          ? await listOpenAQDupes(token, { limit, offset })
          : await listUploadDupes(token, { limit, offset });
      setValidationResults((prev) =>
        prev.map((r) =>
          r.token === token
            ? {
                ...r,
                dupe_items: res.items || r.dupe_items || [],
                dupe_total: res.total ?? r.dupe_total,
                dupe_page: page,
                dupe_loading: false,
              }
            : r
        )
      );
    } catch {
      setValidationResults((prev) =>
        prev.map((r) => (r.token === token ? { ...r, dupe_loading: false } : r))
      );
    }
  };
  const handleManualSubmit = async () => {
    setManualSubmitting(true);
    try {
      setManualError(null);
      const requiredFields = [
        "measure_name",
        "location_name",
        "sex_name",
        "age_name",
        "cause_name",
        "metric_name",
        "year",
        "val",
      ] as const;

      for (const key of requiredFields) {
        if (!manualValues[key] || !manualValues[key].toString().trim()) {
          setManualError("All fields are required (except advanced values).");
          setManualSubmitting(false);
          return;
        }
      }

      const year = Number(manualValues.year);
      const maxYear = new Date().getFullYear() + 3;
      if (!Number.isFinite(year) || year < 1900 || year > maxYear) {
        setManualError(`Year must be between 1900 and ${maxYear}.`);
        setManualSubmitting(false);
        return;
      }

      const val = Number(manualValues.val);
      if (!Number.isFinite(val)) {
        setManualError("Value must be a number.");
        setManualSubmitting(false);
        return;
      }

      const payload = {
        measure_name: manualValues.measure_name.trim(),
        location_name: manualValues.location_name.trim(),
        sex_name: manualValues.sex_name.trim(),
        age_name: manualValues.age_name.trim(),
        cause_name: manualValues.cause_name.trim(),
        metric_name: manualValues.metric_name.trim(),
        year,
        val,
        upper: advancedValues.upper ? Number(advancedValues.upper) : undefined,
        lower: advancedValues.lower ? Number(advancedValues.lower) : undefined,
      };

      if (advancedValues.upper && !Number.isFinite(Number(advancedValues.upper))) {
        setManualError("Upper must be a number.");
        setManualSubmitting(false);
        return;
      }
      if (advancedValues.lower && !Number.isFinite(Number(advancedValues.lower))) {
        setManualError("Lower must be a number.");
        setManualSubmitting(false);
        return;
      }

      await uploadIMHERecord(payload);
      setManualValues({
        measure_name: "",
        location_name: org?.country || "",
        sex_name: "",
        age_name: "",
        cause_name: "",
        metric_name: "",
        year: "",
        val: "",
      });
      setAdvancedValues({ upper: "", lower: "" });
      toast({
        title: "Record added",
        description: "The health record was saved.",
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || "Could not save record.";
      setManualError(message);
    } finally {
      setManualSubmitting(false);
    }
  };

  const fetchMapResults = async (query: string) => {
    if (!query.trim()) return;
    setMapSearching(true);
    try {
      const res = await geocodeLocation({ q: query.trim(), limit: 5 });
      const data = Array.isArray(res?.items) ? res.items : [];
      setMapResults(data);
      if (Array.isArray(data) && data.length > 0) {
        const lat = Number(data[0].lat);
        const lon = Number(data[0].lon);
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lon], 8);
          } else {
            pendingMapCenterRef.current = [lat, lon];
          }
        }
      }
    } catch {
      setMapResults([]);
    } finally {
      setMapSearching(false);
    }
  };

  const ensureDraggableMarker = (lat: number, lon: number) => {
    if (!mapInstanceRef.current) return;
    if (!mapMarkerRef.current) {
      mapMarkerRef.current = L.marker([lat, lon], { draggable: true }).addTo(mapInstanceRef.current);
      setHasPlacedPin(true);
      mapMarkerRef.current.on("dragend", () => {
        if (!mapMarkerRef.current) return;
        const { lat: dragLat, lng: dragLng } = mapMarkerRef.current.getLatLng();
        setPendingFromLatLng(dragLat, dragLng);
      });
    } else {
      mapMarkerRef.current.setLatLng([lat, lon]);
    }
  };

  const centerMapOnOrgCountry = async () => {
    if (!org?.country) return;
    if (mapCenteredRef.current) return;
    mapCenteredRef.current = true;
    try {
      const res = await geocodeLocation({ q: org.country, limit: 1 });
      const data = Array.isArray(res?.items) ? res.items : [];
      const first = data[0];
      if (!first) return;
      const lat = Number(first.lat);
      const lon = Number(first.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lon], 5);
      } else {
        pendingMapCenterRef.current = [lat, lon];
      }
    } catch {
      // Silent: map still works without centering.
    }
  };

  const COUNTRY_ALIASES: Record<string, string> = {
    "myanmar (burma)": "myanmar",
    "republic of the union of myanmar": "myanmar",
    "union of myanmar": "myanmar",
    "burma": "myanmar",
    "republic of the union of burma": "myanmar",
    "viet nam": "vietnam",
    "lao people's democratic republic": "laos",
    "hong kong sar": "hong kong",
    "hong kong s.a.r.": "hong kong",
    "hong kong china": "hong kong",
    "uk": "united kingdom",
    "u.k.": "united kingdom",
    "great britain": "united kingdom",
    "britain": "united kingdom",
    "united states of america": "united states",
    "u.s.": "united states",
    "u.s.a.": "united states",
  };

  const normalizeCountry = (value: string) => {
    const base = value.trim().toLowerCase().replace(/\s+/g, " ");
    return COUNTRY_ALIASES[base] || base;
  };

  const COUNTRY_CODE_ALIASES: Record<string, string> = {
    "myanmar": "mm",
    "china": "cn",
    "hong kong": "hk",
    "india": "in",
    "united kingdom": "gb",
    "united states": "us",
    "vietnam": "vn",
    "laos": "la",
  };

  const validateLatLngCountry = async (lat: number, lon: number) => {
    setMapValidationError(null);
    return true;
  };

  const setPendingFromLatLng = (lat: number, lon: number) => {
    setPendingLatLng([lat, lon]);
    setPendingLatLngValid(true);
    setMapValidationError(null);
    ensureDraggableMarker(lat, lon);
  };

  useEffect(() => {
    if (!mapOpen) return;
    const coords = getCoordsFromValues();
    if (!coords) {
      centerMapOnOrgCountry();
    }
  }, [mapOpen, pollutionValues.latitude, pollutionValues.longitude, org?.country]);

  useEffect(() => {
    if (!mapOpen) return;
    const coords = getCoordsFromValues();
    if (coords) {
      setPendingLatLng(coords);
      setPendingLatLngValid(true);
      setHasPlacedPin(true);
    } else {
      setPendingLatLng(null);
      setPendingLatLngValid(false);
      setHasPlacedPin(false);
    }
    setMapValidationError(null);
  }, [mapOpen]);

  const handleMapSearch = async () => {
    await fetchMapResults(mapQuery);
  };

  const handleMapSelect = (lat: string, lon: string) => {
    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) return;
    setPendingFromLatLng(latNum, lonNum);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([latNum, lonNum], 10);
    }
  };

  const handlePinDragStart = (event: DragEvent<HTMLDivElement>) => {
    if (!mapMarkerRef.current) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData("text/plain", "pin");
    event.dataTransfer.effectAllowed = "copy";
  };

  const handleMapDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleMapDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!mapInstanceRef.current || !mapRef.current) return;
    if (!mapMarkerRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const point = L.point(event.clientX - rect.left, event.clientY - rect.top);
    const latlng = mapInstanceRef.current.containerPointToLatLng(point);
    setPendingFromLatLng(latlng.lat, latlng.lng);
  };

  const handleConfirmLatLng = async () => {
    if (!pendingLatLng) {
      setMapValidationError("Drag the pin onto the map to select a location.");
      return;
    }
    const [lat, lon] = pendingLatLng;
    const ok = await validateLatLngCountry(lat, lon);
    if (!ok) return;
    setPollutionValues((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lon.toFixed(6),
    }));
    setMapOpen(false);
  };

  const handlePollutionManualSubmit = async () => {
    setPollutionManualSubmitting(true);
    setPollutionManualError(null);
    try {
      const requiredFields = ["location_name", "pollutant", "units", "year", "value"] as const;
      for (const key of requiredFields) {
        if (!pollutionValues[key] || !pollutionValues[key].toString().trim()) {
          setPollutionManualError("All required fields must be filled.");
          setPollutionManualSubmitting(false);
          return;
        }
      }

      const year = Number(pollutionValues.year);
      const maxYear = new Date().getFullYear() + 3;
      if (!Number.isFinite(year) || year < 1900 || year > maxYear) {
        setPollutionManualError(`Year must be between 1900 and ${maxYear}.`);
        setPollutionManualSubmitting(false);
        return;
      }

      const value = Number(pollutionValues.value);
      if (!Number.isFinite(value)) {
        setPollutionManualError("Value must be a number.");
        setPollutionManualSubmitting(false);
        return;
      }

      const lat = pollutionValues.latitude ? Number(pollutionValues.latitude) : undefined;
      const lon = pollutionValues.longitude ? Number(pollutionValues.longitude) : undefined;
      if (pollutionValues.latitude && !Number.isFinite(lat)) {
        setPollutionManualError("Latitude must be a number.");
        setPollutionManualSubmitting(false);
        return;
      }
      if (pollutionValues.longitude && !Number.isFinite(lon)) {
        setPollutionManualError("Longitude must be a number.");
        setPollutionManualSubmitting(false);
        return;
      }
      if (lat !== undefined && lon !== undefined) {
        const ok = await validateLatLngCountry(lat, lon);
        if (!ok) {
          setPollutionManualError(`Latitude/longitude must be inside ${org?.country || "the org country"}.`);
          setPollutionManualSubmitting(false);
          return;
        }
      }

      const payload = {
        location_name: pollutionValues.location_name.trim(),
        pollutant: pollutionValues.pollutant.trim(),
        units: pollutionValues.units.trim(),
        year,
        value,
        latitude: lat,
        longitude: lon,
        min: pollutionAdvancedValues.min ? Number(pollutionAdvancedValues.min) : undefined,
        max: pollutionAdvancedValues.max ? Number(pollutionAdvancedValues.max) : undefined,
        median: pollutionAdvancedValues.median ? Number(pollutionAdvancedValues.median) : undefined,
        avg: pollutionAdvancedValues.avg ? Number(pollutionAdvancedValues.avg) : undefined,
        coverage_percent: pollutionAdvancedValues.coverage_percent
          ? Number(pollutionAdvancedValues.coverage_percent)
          : undefined,
      };

      const advancedNums = [
        payload.min,
        payload.max,
        payload.median,
        payload.avg,
        payload.coverage_percent,
      ];
      if (advancedNums.some((v) => v !== undefined && !Number.isFinite(v))) {
        setPollutionManualError("Advanced values must be valid numbers.");
        setPollutionManualSubmitting(false);
        return;
      }

      await uploadOpenAQRecord(payload);
      setPollutionValues({
        location_name: "",
        pollutant: pollutionOptions[0] || "",
        units: pollutionUnits[0] || "µg/m³",
        year: "",
        value: "",
        latitude: "",
        longitude: "",
      });
      setPollutionAdvancedValues({
        min: "",
        max: "",
        median: "",
        avg: "",
        coverage_percent: "",
      });
      toast({
        title: "Record added",
        description: "The pollution record was saved.",
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || "Could not save record.";
      setPollutionManualError(message);
    } finally {
      setPollutionManualSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="w-full max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">Upload Data</h1>
        <p className="text-muted-foreground mb-6">
          Upload your environmental or health data files for processing
        </p>

        <div className="space-y-8">
          <CsvUploadPanel
            fileType={fileType}
            onFileTypeChange={setFileType}
            files={files}
            validationResults={validationResults}
            isUploading={isUploading}
            fileInputRef={fileInputRef}
            onFileSelect={handleFileSelect}
            onRemoveFile={(file) =>
              setFiles((prev) =>
                prev.filter(
                  (f) =>
                    !(
                      f.name === file.name &&
                      f.size === file.size &&
                      f.lastModified === file.lastModified
                    )
                )
              )
            }
            onClearFiles={() => {
              setFiles([]);
              setValidationResults([]);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            onUpload={handleUpload}
            hideTypeSwitch={isHealthOrg || isPollutionOrg}
          />

          {isHealthOrg && (
            <HealthManualForm
              manualFields={MANUAL_FIELDS}
              manualValues={manualValues}
              advancedValues={advancedValues}
              showAdvanced={showAdvanced}
              setShowAdvanced={setShowAdvanced}
              onChange={(key, value) => setManualValues((prev) => ({ ...prev, [key]: value }))}
              onAdvancedChange={(key, value) => setAdvancedValues((prev) => ({ ...prev, [key]: value }))}
              onSubmit={handleManualSubmit}
              submitting={manualSubmitting}
              error={manualError}
              options={{
                measureOptions,
                metricOptions,
                ageOptions,
                sexOptions,
                causeOptions,
              }}
            />
          )}

          {isPollutionOrg && (
            <PollutionManualForm
              country={org?.country || ""}
              pollutionValues={pollutionValues}
              pollutionAdvancedValues={pollutionAdvancedValues}
              pollutionOptions={pollutionOptions}
              pollutionUnits={pollutionUnits}
              locationSuggestions={locationSuggestions}
              pollutionLoading={pollutionLoading}
              pollutionOptionsError={pollutionOptionsError}
              unitsLoading={unitsLoading}
              unitsError={unitsError}
              showAdvanced={showPollutionAdvanced}
              setShowAdvanced={setShowPollutionAdvanced}
              onChange={(key, value) =>
                setPollutionValues((prev) => ({ ...prev, [key]: value }))
              }
              onAdvancedChange={(key, value) =>
                setPollutionAdvancedValues((prev) => ({ ...prev, [key]: value }))
              }
              onMapOpen={() => setMapOpen(true)}
              onSubmit={handlePollutionManualSubmit}
              submitting={pollutionManualSubmitting}
              error={pollutionManualError}
              onLocationQuery={setLocationQuery}
            />
          )}

          <div className="p-4 bg-secondary/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Data Guidelines:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Ensure data is properly formatted with headers</li>
                  <li>Include date/timestamp columns where applicable</li>
                  <li>Remove any personally identifiable information</li>
                  <li>Use standard units (µg/m³ for pollution, per 100k for health rates)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {previewStep === "preview" ? "Confirm CSV Preview" : "Validation Results"}
            </DialogTitle>
            <DialogDescription>
              {previewStep === "preview"
                ? "Please confirm the first 5 lines for each file before validation."
                : "Review duplicates and confirm insertion of non-duplicate rows."}
            </DialogDescription>
          </DialogHeader>
          {previewStep === "preview" ? (
            <>
              <div className="space-y-4 max-h-[60vh] overflow-auto">
                {csvPreviews.map((preview) => (
                  <div key={preview.name} className="border rounded-md p-3">
                    <div className="text-sm font-medium text-foreground mb-2">{preview.name}</div>
                    <div className="bg-muted/50 rounded p-2 overflow-x-auto no-scrollbar">
                      <pre className="text-xs whitespace-pre">
{preview.lines.join("\n")}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePreviewConfirm}>Confirm & Validate</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-4 max-h-[60vh] overflow-auto">
                {validationResults.map((res) => (
                  <div key={res.token} className="rounded-md border border-border p-3 space-y-2">
                    <div className="text-sm font-medium text-foreground">{res.file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Total: {res.total_rows} • New: {res.new_rows} • Duplicates: {res.dupe_rows}
                    </div>
                    {res.dupe_rows > 0 && (
                      <div className="text-xs text-muted-foreground space-y-2">
                        <div>Duplicates (showing 5 per page):</div>
                        <ul className="list-disc list-inside">
                          {(res.dupe_items || res.dupe_samples).map((d, idx) => (
                            <li key={idx}>
                              {res.domain === "pollution"
                                ? `country=${d.country_name}, location=${d.location_name}, pollutant=${d.pollutant}, year=${d.year}`
                                : `pop=${d.population_group_id}, measure=${d.measure_id}, loc=${d.location_id}, sex=${d.sex_id}, age=${d.age_id}, cause=${d.cause_id}, metric=${d.metric_id}, year=${d.year}`}
                            </li>
                          ))}
                        </ul>
                        {res.dupe_loading && (
                          <div className="text-xs text-muted-foreground">Loading...</div>
                        )}
                        {res.dupe_total && res.dupe_total > 5 && (
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={(res.dupe_page || 1) <= 1 || res.dupe_loading}
                              onClick={() => loadDupesPage(res.token, (res.dupe_page || 1) - 1)}
                            >
                              Prev
                            </Button>
                            <div className="flex items-center gap-1">
                              {getPaginationItems(res.dupe_page || 1, Math.ceil(res.dupe_total / 5)).map((item, idx) => {
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
                                    variant={page === (res.dupe_page || 1) ? "default" : "outline"}
                                    size="sm"
                                    disabled={res.dupe_loading}
                                    onClick={() => loadDupesPage(res.token, page)}
                                  >
                                    {page}
                                  </Button>
                                );
                              })}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={(res.dupe_page || 1) >= Math.ceil(res.dupe_total / 5) || res.dupe_loading}
                              onClick={() => loadDupesPage(res.token, (res.dupe_page || 1) + 1)}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    {res.error && (
                      <div className="text-sm text-destructive">{res.error}</div>
                    )}
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        disabled={res.new_rows === 0 || res.confirming}
                        onClick={() => handleConfirm(res.token)}
                      >
                        {res.confirming ? "Uploading..." : "Insert Non-Dupes"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      <MapPickerDialog
        open={mapOpen}
        onOpenChange={setMapOpen}
        mapQuery={mapQuery}
        setMapQuery={setMapQuery}
        mapResults={mapResults}
        mapSearching={mapSearching}
        onSearch={handleMapSearch}
        onSelect={handleMapSelect}
        mapRef={mapRef}
        onMapDragOver={handleMapDragOver}
        onMapDrop={handleMapDrop}
        onPinDragStart={handlePinDragStart}
        onConfirm={handleConfirmLatLng}
        confirmDisabled={!pendingLatLngValid}
        pendingLabel={
          pendingLatLng
            ? `${pendingLatLng[0].toFixed(6)}, ${pendingLatLng[1].toFixed(6)}`
            : undefined
        }
        pinEnabled={hasPlacedPin}
        validationError={mapValidationError}
      />
      </div>
    </div>
  );
};

export default UploadData;

  const FALLBACK_POLLUTANTS = ["PM2.5", "PM10", "NO₂ mass", "O₃ mass", "SO₂ mass", "CO mass"];
  const FALLBACK_UNITS = ["µg/m³"];
