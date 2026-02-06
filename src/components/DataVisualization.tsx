import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import { useReducedMotion } from "@/hooks/useReducedMotion";

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
  const [activeTab, setActiveTab] = useState("map");
  const isComparing = yearRange.length === 2;
  const prefersReducedMotion = useReducedMotion();

  // Generate chart data based on selected year
  const generateChartData = (selectedYear: number) => {
    const baseData = [
      { year: '2018', healthValue: 50, pollutionValue: 22 },
      { year: '2019', healthValue: 100, pollutionValue: 58 },
      { year: '2020', healthValue: 30, pollutionValue: 25 },
      { year: '2021', healthValue: 105, pollutionValue: 140 },
      { year: '2022', healthValue: 85, pollutionValue: 95 },
      { year: '2023', healthValue: 150, pollutionValue: 148 },
    ];
    // Add year-specific variation for comparison visualization
    const yearOffset = (selectedYear - 2000) * 2;
    return baseData.map(d => ({
      ...d,
      healthValue: Math.max(10, d.healthValue + yearOffset + Math.random() * 20 - 10),
      pollutionValue: Math.max(10, d.pollutionValue + yearOffset * 0.5 + Math.random() * 15 - 7),
    }));
  };

  const chartData1 = generateChartData(yearRange[0]);
  const chartData2 = isComparing ? generateChartData(yearRange[1]) : [];

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
  const renderMap = (yearValue: number, showTooltip: boolean = true, index: number = 0) => (
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
          selectedCountries={selectedCountries}
          year={yearValue}
          showTooltip={showTooltip}
          metric={metric}
          metricLabel={metricLabels[metric]}
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
          {healthLabels[healthArea]} - {pollutionLabels[pollutionType]}{!isComparing && `, ${yearRange[0]}`}
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
              { value: 'map', icon: Map, label: 'Map' },
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

        <TabsContent value="map" className="flex-1 p-6 m-0">
          <motion.div
            key={`map-${yearRange.join('-')}`}
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full border-border bg-muted/30">
              <CardContent className="p-6 h-full">
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
                    {renderMap(yearRange[0], true, 0)}
                    {isComparing && renderMap(yearRange[1], false, 1)}
                  </motion.div>
                </AnimatePresence>

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
          </motion.div>
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
          <motion.div
            key={`chart-${yearRange.join('-')}`}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="h-full border-border bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>Trend Analysis</span>
                  {isComparing && (
                    <motion.span 
                      className="text-sm font-normal text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Comparing {yearRange[0]} vs {yearRange[1]}
                    </motion.span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={isComparing ? 'comparing-chart' : 'single-chart'}
                    className={`flex ${isComparing ? 'gap-6' : ''} h-full`}
                    initial={prefersReducedMotion ? {} : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* First Chart (or only chart) */}
                    <motion.div 
                      className={`${isComparing ? 'flex-1' : 'w-full'} h-full flex flex-col bg-card rounded-xl p-4 shadow-sm`}
                      initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={prefersReducedMotion ? {} : { boxShadow: '0 8px 20px -5px rgb(0 0 0 / 0.1)' }}
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
                        dot={{ fill: 'hsl(6, 78%, 57%)', strokeWidth: 2, r: 4 }}
                        animationDuration={1000}
                        animationBegin={200}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Second Chart (only when comparing) */}
                {isComparing && (
                  <motion.div 
                    className="flex-1 h-full flex flex-col bg-card rounded-xl p-4 shadow-sm"
                    initial={prefersReducedMotion ? {} : { opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    whileHover={prefersReducedMotion ? {} : { boxShadow: '0 8px 20px -5px rgb(0 0 0 / 0.1)' }}
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
                          dot={{ fill: 'hsl(6, 78%, 57%)', strokeWidth: 2, r: 4 }}
                          animationDuration={1000}
                          animationBegin={400}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Year Range Slider with Export Buttons */}
        <motion.div 
          className="p-6 border-t border-border bg-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
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
              {[
                { icon: Download, title: "Download" },
                { icon: Share2, title: "Share" },
                { icon: Maximize2, title: "Fullscreen" }
              ].map((btn, index) => (
                <motion.div 
                  key={btn.title}
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="ghost" size="icon" title={btn.title}>
                    <btn.icon className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.p 
            className="text-xs text-muted-foreground mt-2 text-center"
            key={isComparing ? 'comparing-text' : 'single-text'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {isComparing 
              ? `Comparing ${yearRange[0]} and ${yearRange[1]} • Double-click a thumb to remove` 
              : `Viewing ${yearRange[0]} • Click on the timeline to add a comparison year`}
          </motion.p>
        </motion.div>
      </Tabs>
    </motion.div>
  );
};

export default DataVisualization;
