import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LeafletMapProps {
  selectedCountries: string[];
  year: number;
  metricLabel?: string;
  dataByCountry: Record<string, number>;
  scaleMin?: number;
  scaleMax?: number;
  isLoading?: boolean;
  isActive?: boolean;
}

const GEOJSON_URL =
  import.meta.env.VITE_GEOJSON_URL ||
  "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";

const COUNTRY_ALIASES: Record<string, string> = {
  "united states of america": "united states",
  "russian federation": "russia",
  "iran (islamic republic of)": "iran",
  "bolivia (plurinational state of)": "bolivia",
  "venezuela (bolivarian republic of)": "venezuela",
  "tanzania, united republic of": "tanzania",
  "viet nam": "vietnam",
  "lao people's democratic republic": "laos",
  "cote d'ivoire": "ivory coast",
  "republic of korea": "south korea",
  "democratic people's republic of korea": "north korea",
};

const normalizeCountryName = (value: string) => {
  const base = value.trim().toLowerCase();
  return COUNTRY_ALIASES[base] || base;
};

const getColor = (value: number, min: number, max: number): string => {
  if (!Number.isFinite(value) || max <= min) return "hsl(0, 0%, 90%)";
  const safeValue = Math.max(value, 0);
  const logMin = Math.log10(Math.max(min, 0) + 1);
  const logMax = Math.log10(Math.max(max, 0) + 1);
  const logVal = Math.log10(safeValue + 1);
  const ratio = logMax > logMin ? (logVal - logMin) / (logMax - logMin) : 0;
  const adjusted = Math.pow(ratio, 1.25);
  if (adjusted <= 0.2) return "#FEF3E2";
  if (adjusted <= 0.4) return "#FDDFB8";
  if (adjusted <= 0.6) return "#FCCC8A";
  if (adjusted <= 0.8) return "#FC8D59";
  if (adjusted <= 0.9) return "#E34A33";
  return "#B30000";
};

const LeafletMap = ({
  selectedCountries,
  year,
  metricLabel = "Rate per 100,000",
  dataByCountry,
  scaleMin,
  scaleMax,
  isLoading = false,
  isActive = false,
}: LeafletMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  const normalizedData = useMemo(() => {
    const map: Record<string, number> = {};
    Object.entries(dataByCountry || {}).forEach(([k, v]) => {
      map[normalizeCountryName(k)] = v;
    });
    return map;
  }, [dataByCountry]);

  const values = useMemo(
    () => Object.values(normalizedData).filter((v) => Number.isFinite(v)),
    [normalizedData]
  );
  const hasScaleOverride =
    Number.isFinite(scaleMin) && Number.isFinite(scaleMax) && (scaleMax as number) > 0;
  const minValue = hasScaleOverride
    ? (scaleMin as number)
    : values.length
      ? Math.min(...values)
      : 0;
  const maxValue = hasScaleOverride
    ? (scaleMax as number)
    : values.length
      ? Math.max(...values)
      : 1;

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      const bounds = L.latLngBounds(
        L.latLng(-85, -180),
        L.latLng(85, 180)
      );
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 6,
        zoomControl: true,
        attributionControl: true,
        maxBounds: bounds,
        maxBoundsViscosity: 0.9,
        worldCopyJump: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution:
          "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> &copy; <a href=\"https://carto.com/attributions\">CARTO</a>",
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || geoJsonLayerRef.current) return;

    let cancelled = false;
    const controller = new AbortController();

    fetch(GEOJSON_URL, { signal: controller.signal })
      .then((res) => res.json())
      .then((geojson) => {
        if (cancelled) return;
        if (!mapInstanceRef.current || !mapInstanceRef.current.getContainer()) return;
        const layer = L.geoJSON(geojson, {
          style: () => ({
            color: "hsl(215, 10%, 75%)",
            weight: 1,
            fillColor: "hsl(0, 0%, 90%)",
            fillOpacity: 0.7,
          }),
        });
        layer.addTo(map);
        geoJsonLayerRef.current = layer;
      })
      .catch(() => {
        /* ignore aborted fetches */
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const layer = geoJsonLayerRef.current;
    if (!layer) return;

    const selected = new Set(
      (selectedCountries || []).map((c) => normalizeCountryName(c))
    );
    const hasSelection = selected.size > 0;

    layer.eachLayer((l: any) => {
      const feature = l?.feature;
      const rawName =
        feature?.properties?.name ||
        feature?.properties?.NAME ||
        feature?.properties?.ADMIN ||
        feature?.properties?.admin ||
        "";
      const name = normalizeCountryName(String(rawName || ""));
      const value = normalizedData[name];
      const hasValue = typeof value === "number" && Number.isFinite(value);
      const color = hasValue ? getColor(value, minValue, maxValue) : "hsl(0, 0%, 90%)";
      const isSelected = hasSelection ? selected.has(name) : false;

      l.setStyle({
        fillColor: color,
        fillOpacity: hasSelection ? (isSelected ? 0.85 : 0.25) : 0.75,
        weight: hasSelection && isSelected ? 2 : 1,
        color: "hsl(215, 10%, 70%)",
      });

      const displayValue = hasValue ? value.toLocaleString() : "No data";
      l.bindTooltip(
        `<div style=\"font-family: system-ui; font-size: 12px;\">
          <div style=\"font-weight: 600; margin-bottom: 4px;\">${rawName}</div>
          <div style=\"color: #6A8D8D;\">${year}</div>
          <div style=\"margin-top: 6px;\">
            <span style=\"color:#6A8D8D;\">${metricLabel}:</span>
            <span style=\"font-weight: 600; margin-left: 4px;\">${displayValue}</span>
          </div>
        </div>`,
        { sticky: true }
      );
    });
  }, [normalizedData, selectedCountries, year, metricLabel, minValue, maxValue]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      geoJsonLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isActive || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 50);
    return () => clearTimeout(timer);
  }, [isActive]);

  return (
    <div className="relative z-0 w-full h-full rounded-lg overflow-hidden">
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ minHeight: "300px", background: "hsl(220, 20%, 95%)" }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-sm text-muted-foreground">
          Loading map data...
        </div>
      )}
    </div>
  );
};

export default LeafletMap;
