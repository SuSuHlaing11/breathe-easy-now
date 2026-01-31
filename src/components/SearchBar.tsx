import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/analysis?search=${encodeURIComponent(query)}`);
  };

  const suggestions = [
    "India air pollution",
    "China respiratory diseases",
    "Global PM2.5 levels",
    "Europe health impact",
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search countries, regions, or health indicators..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-32 text-lg rounded-full border-2 border-border bg-card shadow-lg focus:border-accent focus:ring-accent"
          />
          <Button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-6"
          >
            Explore
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Quick suggestions */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => {
              setQuery(suggestion);
              navigate(`/analysis?search=${encodeURIComponent(suggestion)}`);
            }}
            className="px-3 py-1.5 text-sm rounded-full bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
