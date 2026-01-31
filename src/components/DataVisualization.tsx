import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Map, Table2, TrendingUp, ZoomIn, Play, Pause } from "lucide-react";

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
  const [year, setYear] = useState([2023]);
  const [isPlaying, setIsPlaying] = useState(false);

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

  return (
    <div className="flex-1 flex flex-col bg-background overflow-auto">
      {/* Title Section */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">
          {healthLabels[healthArea]} - {pollutionLabels[pollutionType]}, {year[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          {metricLabels[metric]} affected by air pollution exposure
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

          <Button variant="outline" size="sm" className="gap-2">
            <ZoomIn className="h-4 w-4" />
            Zoom to selection
          </Button>
        </div>

        {/* Map View */}
        <TabsContent value="map" className="flex-1 p-6 m-0">
          <Card className="h-full">
            <CardContent className="p-0 h-full relative">
              {/* Simplified World Map SVG */}
              <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gradient-to-b from-card to-secondary/30 rounded-lg overflow-hidden">
                <svg
                  viewBox="0 0 1000 500"
                  className="w-full h-full"
                  style={{ maxHeight: "500px" }}
                >
                  {/* Ocean background */}
                  <rect x="0" y="0" width="1000" height="500" fill="hsl(210 20% 96%)" />
                  
                  {/* Simplified continents with data colors */}
                  {/* North America */}
                  <path
                    d="M100,80 L200,70 L280,100 L300,180 L280,200 L200,220 L150,200 L100,150 Z"
                    fill={selectedCountries.includes("United States") || selectedCountries.includes("Canada") ? "hsl(25 85% 60%)" : "hsl(45 70% 85%)"}
                    stroke="hsl(210 20% 80%)"
                    strokeWidth="1"
                  />
                  
                  {/* South America */}
                  <path
                    d="M200,240 L260,230 L300,280 L290,380 L240,430 L200,400 L180,320 Z"
                    fill={selectedCountries.includes("Brazil") || selectedCountries.includes("Argentina") ? "hsl(25 85% 60%)" : "hsl(45 70% 85%)"}
                    stroke="hsl(210 20% 80%)"
                    strokeWidth="1"
                  />
                  
                  {/* Europe */}
                  <path
                    d="M440,60 L520,50 L560,80 L550,130 L500,150 L450,140 L430,100 Z"
                    fill={selectedCountries.includes("Germany") || selectedCountries.includes("France") || selectedCountries.includes("United Kingdom") ? "hsl(25 85% 60%)" : "hsl(35 80% 70%)"}
                    stroke="hsl(210 20% 80%)"
                    strokeWidth="1"
                  />
                  
                  {/* Africa */}
                  <path
                    d="M440,160 L520,150 L560,200 L570,300 L520,380 L460,360 L430,280 L420,200 Z"
                    fill={selectedCountries.includes("Nigeria") || selectedCountries.includes("Kenya") || selectedCountries.includes("South Africa") ? "hsl(15 85% 50%)" : "hsl(5 80% 40%)"}
                    stroke="hsl(210 20% 80%)"
                    strokeWidth="1"
                  />
                  
                  {/* Asia */}
                  <path
                    d="M560,50 L800,40 L900,120 L880,200 L800,250 L700,240 L620,200 L580,140 Z"
                    fill={selectedCountries.includes("China") || selectedCountries.includes("India") || selectedCountries.includes("Japan") ? "hsl(0 70% 30%)" : "hsl(15 85% 50%)"}
                    stroke="hsl(210 20% 80%)"
                    strokeWidth="1"
                  />
                  
                  {/* Southeast Asia */}
                  <path
                    d="M720,250 L800,260 L850,300 L830,360 L760,350 L720,310 Z"
                    fill={selectedCountries.includes("Indonesia") || selectedCountries.includes("Vietnam") || selectedCountries.includes("Thailand") || selectedCountries.includes("Myanmar") ? "hsl(15 85% 50%)" : "hsl(25 85% 60%)"}
                    stroke="hsl(210 20% 80%)"
                    strokeWidth="1"
                  />
                  
                  {/* Australia */}
                  <path
                    d="M780,360 L880,350 L920,400 L890,450 L800,440 L770,400 Z"
                    fill={selectedCountries.includes("Australia") ? "hsl(25 85% 60%)" : "hsl(45 70% 85%)"}
                    stroke="hsl(210 20% 80%)"
                    strokeWidth="1"
                  />
                </svg>

                {/* Tooltip example */}
                {selectedCountries.length > 0 && (
                  <div className="absolute top-4 right-4 map-tooltip max-w-[200px]">
                    <div className="font-semibold">{selectedCountries[0]}</div>
                    <div className="text-xs text-muted-foreground">{year[0]}</div>
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">{metricLabels[metric]}:</span>
                      <span className="ml-1 font-semibold text-data-high">
                        {(Math.random() * 20).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Color Scale Legend */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">No data</span>
                <div className="flex-1 h-3 data-scale rounded" />
                <span className="text-muted-foreground">20%</span>
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
                        <td className="text-right py-3 px-4">{year[0]}</td>
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
              <CardTitle>Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              {/* Placeholder chart - using simple SVG visualization */}
              <div className="w-full h-full flex items-end gap-1 pr-8">
                {/* Y-axis labels */}
                <div className="flex flex-col justify-between h-full text-xs text-muted-foreground w-12">
                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                  <span>25</span>
                  <span>0</span>
                </div>
                
                {/* Chart area */}
                <div className="flex-1 flex items-end gap-1 border-l border-b border-border relative h-full">
                  {/* Sample bars and lines */}
                  {Array.from({ length: 20 }, (_, i) => {
                    const pollutionHeight = 30 + Math.sin(i * 0.5) * 20 + Math.random() * 15;
                    const healthHeight = 25 + Math.cos(i * 0.3) * 15 + Math.random() * 20;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center relative h-full justify-end gap-1">
                        {/* Bar for health data */}
                        <div
                          className="w-full max-w-[20px] bg-chart-health rounded-t opacity-80"
                          style={{ height: `${healthHeight}%` }}
                        />
                        {/* Line point for pollution */}
                        <div
                          className="absolute w-2 h-2 rounded-full bg-chart-pollution"
                          style={{ bottom: `${pollutionHeight}%` }}
                        />
                      </div>
                    );
                  })}
                  
                  {/* X-axis labels */}
                  <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-muted-foreground">
                    <span>2004</span>
                    <span>2014</span>
                    <span>2023</span>
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex justify-center gap-6 mt-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 rounded bg-chart-pollution" />
                  <span>{pollutionLabels[pollutionType]} (Line)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 rounded bg-chart-health" />
                  <span>{healthLabels[healthArea]} (Bar)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Year Slider */}
        <div className="p-6 border-t border-border bg-card">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <span className="text-sm font-medium w-12">{year[0]}</span>
            <Slider
              value={year}
              onValueChange={setYear}
              min={1990}
              max={2023}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">1990 - 2023</span>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default DataVisualization;
