import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CountrySidebarProps {
  selectedCountries: string[];
  onCountryChange: (countries: string[]) => void;
}

const countries = [
  { name: "Afghanistan", region: "Asia" },
  { name: "Albania", region: "Europe" },
  { name: "Algeria", region: "Africa" },
  { name: "Andorra", region: "Europe" },
  { name: "Angola", region: "Africa" },
  { name: "Antigua and Barbuda", region: "Americas" },
  { name: "Argentina", region: "Americas" },
  { name: "Australia", region: "Oceania" },
  { name: "Austria", region: "Europe" },
  { name: "Bangladesh", region: "Asia" },
  { name: "Belgium", region: "Europe" },
  { name: "Brazil", region: "Americas" },
  { name: "Canada", region: "Americas" },
  { name: "China", region: "Asia" },
  { name: "France", region: "Europe" },
  { name: "Germany", region: "Europe" },
  { name: "India", region: "Asia" },
  { name: "Indonesia", region: "Asia" },
  { name: "Italy", region: "Europe" },
  { name: "Japan", region: "Asia" },
  { name: "Kenya", region: "Africa" },
  { name: "Lao People's Democratic Republic", region: "Asia" },
  { name: "Mexico", region: "Americas" },
  { name: "Myanmar", region: "Asia" },
  { name: "Nepal", region: "Asia" },
  { name: "Nigeria", region: "Africa" },
  { name: "Pakistan", region: "Asia" },
  { name: "Philippines", region: "Asia" },
  { name: "Russian Federation", region: "Europe" },
  { name: "South Africa", region: "Africa" },
  { name: "Republic of Korea", region: "Asia" },
  { name: "Spain", region: "Europe" },
  { name: "Thailand", region: "Asia" },
  { name: "United Kingdom", region: "Europe" },
  { name: "United States of America", region: "Americas" },
  { name: "Viet Nam", region: "Asia" },
];

const regions = ["All", "Africa", "Americas", "Asia", "Europe", "Oceania"];

const CountrySidebar = ({ selectedCountries, onCountryChange }: CountrySidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");

  const filteredCountries = countries.filter((country) => {
    const matchesSearch = country.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === "All" || country.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const handleCountryToggle = (countryName: string) => {
    if (selectedCountries.includes(countryName)) {
      onCountryChange(selectedCountries.filter((c) => c !== countryName));
    } else {
      onCountryChange([...selectedCountries, countryName]);
    }
  };

  const clearSelection = () => {
    onCountryChange([]);
  };

  if (isCollapsed) {
    return (
      <div className="w-12 border-r border-border bg-sidebar flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="mb-4"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="flex-1 flex items-center">
          <span className="text-xs text-muted-foreground [writing-mode:vertical-lr] rotate-180">
            Countries
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-border bg-sidebar flex flex-col h-[calc(100vh-4rem)] min-h-0 animate-slide-in-left">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sidebar-foreground">Countries</h3>
          <p className="text-xs text-muted-foreground">Select regions to display</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(true)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-sidebar-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Type to add a country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      {/* Region Filter */}
      <div className="p-3 border-b border-sidebar-border">
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
        >
          {regions.map((region) => (
            <option key={region} value={region}>
              {region === "All" ? "All Regions" : region}
            </option>
          ))}
        </select>
      </div>

      {/* Country List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {filteredCountries.map((country) => (
            <label
              key={country.name}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-sidebar-accent cursor-pointer"
            >
              <Checkbox
                checked={selectedCountries.includes(country.name)}
                onCheckedChange={() => handleCountryToggle(country.name)}
              />
              <span className="text-sm text-sidebar-foreground">{country.name}</span>
            </label>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      {selectedCountries.length > 0 && (
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={clearSelection}
            className="text-sm text-accent hover:underline"
          >
            ✕ Clear selection ({selectedCountries.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default CountrySidebar;
