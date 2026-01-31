import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, ExternalLink } from "lucide-react";

interface HistoryPageProps {
  isAdmin?: boolean;
}

const HistoryPage = ({ isAdmin = false }: HistoryPageProps) => {
  const historyItems = [
    {
      id: 1,
      title: "PM2.5 Analysis - India",
      timestamp: "2024-01-20 14:30",
      countries: ["India"],
      user: isAdmin ? "john@example.com" : undefined,
    },
    {
      id: 2,
      title: "Ozone Trends - Europe",
      timestamp: "2024-01-20 10:15",
      countries: ["Germany", "France", "Italy"],
      user: isAdmin ? "sarah@example.com" : undefined,
    },
    {
      id: 3,
      title: "Child Health Impact - Africa",
      timestamp: "2024-01-19 16:45",
      countries: ["Nigeria", "Kenya"],
      user: isAdmin ? "mike@example.com" : undefined,
    },
    {
      id: 4,
      title: "Global CO Levels 2023",
      timestamp: "2024-01-19 09:00",
      countries: ["Global"],
      user: isAdmin ? "john@example.com" : undefined,
    },
    {
      id: 5,
      title: "Southeast Asia Respiratory",
      timestamp: "2024-01-18 11:20",
      countries: ["Thailand", "Vietnam", "Myanmar"],
      user: isAdmin ? "anna@example.com" : undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header variant="app" userRole={isAdmin ? "admin" : "user"} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {isAdmin ? "User Activity History" : "Your History"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin
              ? "View all user activities and data access"
              : "Your recent data exploration activities"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{item.title}</div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.timestamp}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.countries.join(", ")}
                      </span>
                      {item.user && (
                        <span className="px-2 py-0.5 rounded bg-accent/20 text-accent text-xs">
                          {item.user}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Open
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HistoryPage;
