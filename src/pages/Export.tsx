import { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileSpreadsheet, FileJson, FileText } from "lucide-react";

const ExportPage = () => {
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState({ start: "2020", end: "2023" });

  const countries = ["India", "China", "United States", "Germany", "Brazil", "Japan", "Nigeria"];

  const formatIcons = {
    csv: FileSpreadsheet,
    json: FileJson,
    xlsx: FileSpreadsheet,
    pdf: FileText,
  };

  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    );
  };

  const handleExport = () => {
    alert(`Exporting data as ${selectedFormat.toUpperCase()} for ${selectedCountries.length} countries`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header variant="app" userRole="user" />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Export Data</h1>
          <p className="text-muted-foreground mt-1">
            Download air pollution and health data for your research
          </p>
        </div>

        <div className="grid gap-6">
          {/* Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Export Format</CardTitle>
              <CardDescription>Choose your preferred file format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(formatIcons).map(([format, Icon]) => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedFormat === format
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <Icon className="h-8 w-8 mx-auto mb-2 text-accent" />
                    <div className="font-medium text-sm uppercase">{format}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Country Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Countries</CardTitle>
              <CardDescription>Choose which countries to include in your export</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {countries.map((country) => (
                  <label
                    key={country}
                    className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedCountries.includes(country)}
                      onCheckedChange={() => toggleCountry(country)}
                    />
                    <span className="text-sm">{country}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCountries(countries)}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCountries([])}
                >
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Year Range */}
          <Card>
            <CardHeader>
              <CardTitle>Date Range</CardTitle>
              <CardDescription>Select the year range for your data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1.5 block">Start Year</label>
                  <Select
                    value={yearRange.start}
                    onValueChange={(value) => setYearRange({ ...yearRange, start: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => 2000 + i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <span className="text-muted-foreground mt-6">to</span>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1.5 block">End Year</label>
                  <Select
                    value={yearRange.end}
                    onValueChange={(value) => setYearRange({ ...yearRange, end: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => 2000 + i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Button */}
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={handleExport}
            disabled={selectedCountries.length === 0}
          >
            <Download className="h-5 w-5" />
            Export Data ({selectedCountries.length} countries)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
