import { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, MapPin, Calendar } from "lucide-react";

const SavedPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const savedItems = [
    {
      id: 1,
      title: "India PM2.5 vs Respiratory Diseases",
      countries: ["India"],
      pollutionType: "PM2.5",
      healthArea: "Respiratory Diseases",
      savedAt: "2024-01-15",
    },
    {
      id: 2,
      title: "Global Ozone Analysis 2023",
      countries: ["Global"],
      pollutionType: "Ozone",
      healthArea: "Cardiovascular",
      savedAt: "2024-01-14",
    },
    {
      id: 3,
      title: "Southeast Asia Health Impact",
      countries: ["Vietnam", "Thailand", "Myanmar"],
      pollutionType: "PM10",
      healthArea: "Child Health",
      savedAt: "2024-01-10",
    },
  ];

  const filteredItems = savedItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header variant="app" userRole="user" />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Saved Analyses</h1>
          <p className="text-muted-foreground mt-1">Your saved data visualizations and reports</p>
        </div>

        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search saved items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Saved on {item.savedAt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{item.countries.join(", ")}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded bg-accent/20 text-accent text-xs">
                      {item.pollutionType}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">
                      {item.healthArea}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="flex-1">
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No saved analyses found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPage;
