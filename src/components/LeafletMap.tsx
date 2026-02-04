import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LeafletMapProps {
  selectedCountries: string[];
  year: number;
  showTooltip?: boolean;
  metric?: string;
  metricLabel?: string;
}

// Country coordinates for centering
const countryCoords: Record<string, [number, number]> = {
  "Myanmar": [21.9162, 95.9560],
  "China": [35.8617, 104.1954],
  "India": [20.5937, 78.9629],
  "United States": [37.0902, -95.7129],
  "Brazil": [-14.2350, -51.9253],
  "Russia": [61.5240, 105.3188],
  "Australia": [-25.2744, 133.7751],
  "Indonesia": [-0.7893, 113.9213],
  "Japan": [36.2048, 138.2529],
  "Germany": [51.1657, 10.4515],
  "France": [46.2276, 2.2137],
  "United Kingdom": [55.3781, -3.4360],
  "Nigeria": [9.0820, 8.6753],
  "Kenya": [-0.0236, 37.9062],
  "South Africa": [-30.5595, 22.9375],
  "Thailand": [15.8700, 100.9925],
  "Vietnam": [14.0583, 108.2772],
  "Canada": [56.1304, -106.3468],
  "Mexico": [23.6345, -102.5528],
  "Argentina": [-38.4161, -63.6167],
};

// Pollution level colors based on the Chinese color palette
const getPollutionColor = (value: number): string => {
  if (value < 20) return 'hsl(145, 63%, 49%)';      // data-green - 良好
  if (value < 40) return 'hsl(37, 90%, 51%)';       // data-yellow - 中度
  if (value < 60) return 'hsl(28, 80%, 52%)';       // data-orange - 重度
  if (value < 80) return 'hsl(6, 78%, 57%)';        // data-red - 严重
  return 'hsl(6, 78%, 35%)';                         // data-critical
};

const LeafletMap = ({ 
  selectedCountries, 
  year, 
  showTooltip = true,
  metric = 'rate',
  metricLabel = 'Rate per 100,000'
}: LeafletMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map only once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 8,
        zoomControl: true,
        attributionControl: true,
      });

      // Add CartoDB Positron tiles for a clean, data-friendly look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      markersRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    if (markersRef.current) {
      markersRef.current.clearLayers();
    }

    // Add markers for selected countries
    selectedCountries.forEach((country) => {
      const coords = countryCoords[country];
      if (coords && markersRef.current && mapInstanceRef.current) {
        // Generate random pollution value for demo
        const pollutionValue = Math.random() * 100;
        const healthValue = (Math.random() * 20).toFixed(1);
        const color = getPollutionColor(pollutionValue);

        // Create circle marker
        const circle = L.circleMarker(coords, {
          radius: 20,
          fillColor: color,
          color: 'hsl(197, 10%, 29%)',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.7,
        });

        // Add popup with data
        if (showTooltip) {
          circle.bindPopup(`
            <div style="font-family: system-ui; padding: 4px;">
              <div style="font-weight: 600; font-size: 14px; color: #2C2C2C;">${country}</div>
              <div style="font-size: 12px; color: #6A8D8D;">${year}</div>
              <div style="margin-top: 8px; font-size: 13px;">
                <span style="color: #6A8D8D;">${metricLabel}:</span>
                <span style="font-weight: 600; color: ${color}; margin-left: 4px;">${healthValue}%</span>
              </div>
              <div style="font-size: 12px; margin-top: 4px;">
                <span style="color: #6A8D8D;">PM2.5:</span>
                <span style="font-weight: 500; margin-left: 4px;">${pollutionValue.toFixed(1)} μg/m³</span>
              </div>
            </div>
          `, {
            className: 'custom-popup',
          });
        }

        circle.addTo(markersRef.current!);

        // Add country label
        const label = L.divIcon({
          className: 'country-label',
          html: `<div style="
            background: hsl(213, 45%, 33%);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
            white-space: nowrap;
            transform: translateX(-50%);
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">${country}</div>`,
          iconSize: [0, 0],
          iconAnchor: [0, -25],
        });

        L.marker(coords, { icon: label }).addTo(markersRef.current!);
      }
    });

    // Fit bounds to selected countries
    if (selectedCountries.length > 0) {
      const validCoords = selectedCountries
        .map((c) => countryCoords[c])
        .filter((c): c is [number, number] => !!c);

      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        mapInstanceRef.current?.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
      }
    }

    return () => {
      // Don't destroy map on cleanup, just clear markers
    };
  }, [selectedCountries, year, showTooltip, metric, metricLabel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg overflow-hidden"
      style={{ minHeight: '300px', background: 'hsl(220, 20%, 95%)' }}
    />
  );
};

export default LeafletMap;
