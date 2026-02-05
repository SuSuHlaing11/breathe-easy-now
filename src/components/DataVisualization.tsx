import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Map, Table2, TrendingUp, ZoomIn, Play, Pause, Sparkles, Download, Share2, Maximize2 } from "lucide-react";
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

interface DataVisualizationProps {
  selectedCountries: string[];
  pollutionType: string;
  healthArea: string;
  metric: string;
}

const DataVisualization = ({
  selectedCountries,
  pollutionType,
  healthArea,
  metric,
}: DataVisualizationProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [yearRange, setYearRange] = useState<number[]>([2000]);
  const [isPlaying, setIsPlaying] = useState(false);
  const isComparing = yearRange.length === 2;

  // Sample chart data for dual-axis visualization
  const chartData = [
    { year: '2018', healthValue: 50, pollutionValue: 22 },
    { year: '2019', healthValue: 100, pollutionValue: 58 },
    { year: '2020', healthValue: 30, pollutionValue: 25 },
    { year: '2021', healthValue: 105, pollutionValue: 140 },
    { year: '2022', healthValue: 85, pollutionValue: 95 },
    { year: '2023', healthValue: 150, pollutionValue: 148 },
  ];

  const metricLabels: Record<string, string> = {
    rate: "Rate per 100,000",
    deaths: "Number of Deaths",
    dalys: "DALYs",
    prevalence: "Prevalence (%)",
  };

  const pollutionLabels: Record<string, string> = {
    pm25: "PM2.5",
    pm10: "PM10",
    ozone: "Ozone",
    no2: "NO₂",
    so2: "SO₂",
    co: "CO",
  };

  const healthLabels: Record<string, string> = {
    respiratory: "Respiratory Diseases",
    cardiovascular: "Cardiovascular Diseases",
    child_health: "Child Health",
    lung_cancer: "Lung Cancer",
    mortality: "All-cause Mortality",
    stroke: "Stroke",
  };

  // Helper to render a single map using Leaflet
  const renderMap = (yearValue: number, showTooltip: boolean = true) => (
    <div className="flex-1 flex flex-col min-h-[400px] bg-card rounded-xl shadow-sm">
      {isComparing && (
        <div className="py-3 px-4 border-b border-border">
          <h2 className="text-xl font-semibold text-center text-foreground">{yearValue}</h2>
        </div>
      )}
      <div className="flex-1 rounded-b-xl overflow-hidden">
        <LeafletMap
          selectedCountries={selectedCountries}
          year={yearValue}
          showTooltip={showTooltip}
          metric={metric}
          metricLabel={metricLabels[metric]}
        />
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-background overflow-auto">
      {/* Title Section */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">
          {healthLabels[healthArea]} - {pollutionLabels[pollutionType]}{!isComparing && `, ${yearRange[0]}`}
        </h1>
        <p className="text-muted-foreground mt-1">
          {metricLabels[metric]} affected by air pollution exposure
          {isComparing && ` (comparing ${yearRange[0]} vs ${yearRange[1]})`}
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="map" className="flex-1 flex flex-col">
        <div className="px-6 pt-4 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="table" className="gap-2">
              <Table2 className="h-4 w-4" />
              Table
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <Map className="h-4 w-4" />
              Map
            </TabsTrigger>
            <TabsTrigger value="chart" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Line
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm" 
              className="gap-2 bg-primary hover:bg-primary/90"
              onClick={() => navigate(`/prediction?role=${searchParams.get("role") || "user"}`)}
            >
              <Sparkles className="h-4 w-4" />
              Prediction
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <ZoomIn className="h-4 w-4" />
              Zoom to selection
            </Button>
          </div>
        </div>

        {/* Map View */}
        <TabsContent value="map" className="flex-1 p-6 m-0">
          <Card className="h-full border-border bg-muted/30">
            <CardContent className="p-6 h-full">
              {/* Map Container - side by side when comparing */}
              <div className={`flex ${isComparing ? 'gap-6' : ''} h-full`}>
                {renderMap(yearRange[0], true)}
                {isComparing && renderMap(yearRange[1], false)}
              </div>

              {/* Color Scale Legend */}
              <div className="mt-6 flex flex-col gap-1 bg-card rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-center gap-2">
                  {/* No data indicator */}
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
                        )`
                      }}
                    />
                  </div>
                  
                  {/* Percentage scale legend */}
                  <div className="flex items-center gap-0">
                    <span className="text-xs text-muted-foreground mr-2">0%</span>
                    <div className="flex">
                      <div className="w-8 h-4" style={{ background: '#FEF3E2' }} />
                      <div className="w-8 h-4" style={{ background: '#FDDFB8' }} />
                      <div className="w-8 h-4" style={{ background: '#FCCC8A' }} />
                      <div className="w-8 h-4" style={{ background: '#FC8D59' }} />
                      <div className="w-8 h-4" style={{ background: '#E34A33' }} />
                      <div className="w-8 h-4" style={{ background: '#B30000' }} />
                    </div>
                  </div>
                  
                  {/* Percentage labels */}
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span className="w-8 text-center">0.5%</span>
                    <span className="w-8 text-center">1%</span>
                    <span className="w-8 text-center">2%</span>
                    <span className="w-8 text-center">5%</span>
                    <span className="w-8 text-center">10%</span>
                    <span className="w-8 text-center">20%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Table View */}
        <TabsContent value="table" className="flex-1 p-6 m-0">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Data Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">Country</th>
                      <th className="text-right py-3 px-4 font-medium">{pollutionLabels[pollutionType]} Level</th>
                      <th className="text-right py-3 px-4 font-medium">{metricLabels[metric]}</th>
                      <th className="text-right py-3 px-4 font-medium">Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedCountries.length > 0 ? selectedCountries : ["Global Average"]).map((country) => (
                      <tr key={country} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{country}</td>
                        <td className="text-right py-3 px-4">{(Math.random() * 50 + 10).toFixed(1)} μg/m³</td>
                        <td className="text-right py-3 px-4">{(Math.random() * 100).toFixed(1)}</td>
                        <td className="text-right py-3 px-4">{yearRange[0]}{isComparing ? ` - ${yearRange[1]}` : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Line Chart View */}
        <TabsContent value="chart" className="flex-1 p-6 m-0">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Trend Analysis {isComparing && `(${yearRange[0]} vs ${yearRange[1]})`}</CardTitle>
            </CardHeader>
            <CardContent className={isComparing ? "h-[400px]" : "h-[400px]"}>
              <div className={`flex ${isComparing ? 'gap-4' : ''} h-full`}>
                {/* First Chart (or only chart) */}
                <div className={`${isComparing ? 'flex-1' : 'w-full'} h-full flex flex-col`}>
                  {isComparing && (
                    <h3 className="text-lg font-semibold text-center mb-2">{yearRange[0]}</h3>
                  )}
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 20, right: isComparing ? 20 : 60, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="year" 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis 
                        yAxisId="left"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        label={{ 
                          value: healthLabels[healthArea], 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { fill: 'hsl(var(--muted-foreground))', fontSize: 11 }
                        }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        label={{ 
                          value: `${pollutionLabels[pollutionType]} (μg/m³)`, 
                          angle: 90, 
                          position: 'insideRight',
                          style: { fill: 'hsl(var(--muted-foreground))', fontSize: 11 }
                        }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar 
                        yAxisId="left" 
                        dataKey="healthValue" 
                        name={healthLabels[healthArea]}
                        fill="hsl(204, 70%, 53%)" 
                        radius={[2, 2, 0, 0]}
                        barSize={isComparing ? 20 : 40}
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="pollutionValue" 
                        name={pollutionLabels[pollutionType]}
                        stroke="hsl(6, 78%, 57%)" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(6, 78%, 57%)', strokeWidth: 2, r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Second Chart (only when comparing) */}
                {isComparing && (
                  <div className="flex-1 h-full flex flex-col">
                    <h3 className="text-lg font-semibold text-center mb-2">{yearRange[1]}</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={chartData}
                        margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="year" 
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <YAxis 
                          yAxisId="left"
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right"
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Bar 
                          yAxisId="left" 
                          dataKey="healthValue" 
                          name={healthLabels[healthArea]}
                          fill="hsl(204, 70%, 53%)" 
                          radius={[2, 2, 0, 0]}
                          barSize={20}
                        />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="pollutionValue" 
                          name={pollutionLabels[pollutionType]}
                          stroke="hsl(6, 78%, 57%)" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(6, 78%, 57%)', strokeWidth: 2, r: 4 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Year Range Slider with Export Buttons */}
        <div className="p-6 border-t border-border bg-card">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <span className="text-sm font-medium w-12">1990</span>
            <Slider
              value={yearRange}
              onValueChange={(values) => setYearRange(values.sort((a, b) => a - b))}
              onAddThumb={(newValue) => {
                if (yearRange.length < 2) {
                  setYearRange([...yearRange, newValue].sort((a, b) => a - b));
                }
              }}
              onRemoveThumb={(index) => {
                if (yearRange.length > 1) {
                  setYearRange(yearRange.filter((_, i) => i !== index));
                }
              }}
              min={1990}
              max={2023}
              step={1}
              minStepsBetweenThumbs={1}
              className="flex-1"
            />
            <span className="text-sm font-medium w-12">2023</span>
            
            {/* Export Buttons */}
            <div className="flex items-center gap-1 ml-4 border-l border-border pl-4">
              <Button variant="ghost" size="icon" title="Download">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Share">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Fullscreen">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {isComparing 
              ? `Comparing ${yearRange[0]} and ${yearRange[1]} • Double-click a thumb to remove` 
              : `Viewing ${yearRange[0]} • Click on the timeline to add a comparison year`}
          </p>
        </div>
      </Tabs>
    </div>
  );
};

export default DataVisualization;
