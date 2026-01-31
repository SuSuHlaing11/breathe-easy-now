import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import CountrySidebar from "@/components/CountrySidebar";
import AnalysisFilters from "@/components/AnalysisFilters";
import DataVisualization from "@/components/DataVisualization";

const Analysis = () => {
  const [searchParams] = useSearchParams();
  const role = (searchParams.get("role") as "user" | "admin") || "user";
  
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["Myanmar"]);
  const [pollutionType, setPollutionType] = useState("pm25");
  const [healthArea, setHealthArea] = useState("respiratory");
  const [metric, setMetric] = useState("rate");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header variant="app" userRole={role} />
      
      <div className="flex-1 flex">
        <CountrySidebar
          selectedCountries={selectedCountries}
          onCountryChange={setSelectedCountries}
        />
        
        <div className="flex-1 flex flex-col">
          <AnalysisFilters
            pollutionType={pollutionType}
            healthArea={healthArea}
            metric={metric}
            onPollutionTypeChange={setPollutionType}
            onHealthAreaChange={setHealthArea}
            onMetricChange={setMetric}
          />
          
          <DataVisualization
            selectedCountries={selectedCountries}
            pollutionType={pollutionType}
            healthArea={healthArea}
            metric={metric}
          />
        </div>
      </div>
    </div>
  );
};

export default Analysis;
