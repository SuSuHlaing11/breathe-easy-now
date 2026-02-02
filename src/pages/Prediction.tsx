import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Send } from "lucide-react";

const Prediction = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = (searchParams.get("role") as "user" | "admin") || "user";
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (prompt.trim()) {
      // Handle prediction query - placeholder for now
      console.log("Prediction query:", prompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(220,10%,10%)]">
      <Header variant="app" userRole={role} />
      
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-2xl flex flex-col items-center gap-8">
          {/* Back button */}
          <Button
            variant="ghost"
            className="absolute top-20 left-6 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analysis
          </Button>

          {/* Main heading */}
          <h1 className="text-3xl md:text-4xl font-medium text-center">
            <span className="text-muted-foreground">What can </span>
            <span className="text-teal-400">I</span>
            <span className="text-muted-foreground"> help with?</span>
          </h1>

          {/* Input area */}
          <div className="w-full">
            <div className="relative flex items-center bg-[hsl(220,10%,18%)] rounded-full border border-border/50 px-4 py-2">
              <Plus className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                className="flex-1 bg-transparent border-none resize-none min-h-[24px] max-h-[120px] text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                rows={1}
              />
              <Button
                size="icon"
                variant="ghost"
                className="ml-2 flex-shrink-0 text-muted-foreground hover:text-foreground"
                onClick={handleSubmit}
                disabled={!prompt.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Suggestion chips */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-[hsl(220,10%,15%)] border-border/50 text-muted-foreground hover:text-foreground"
              onClick={() => setPrompt("What will be the PM2.5 levels in Myanmar by 2030?")}
            >
              Predict future PM2.5 levels
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-[hsl(220,10%,15%)] border-border/50 text-muted-foreground hover:text-foreground"
              onClick={() => setPrompt("How will respiratory disease rates change if pollution decreases by 20%?")}
            >
              Health impact scenarios
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-[hsl(220,10%,15%)] border-border/50 text-muted-foreground hover:text-foreground"
              onClick={() => setPrompt("Compare predicted mortality rates between countries")}
            >
              Compare countries
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prediction;
