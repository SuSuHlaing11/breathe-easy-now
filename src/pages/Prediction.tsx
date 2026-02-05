 import { useState, useRef, useEffect } from "react";
 import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Card, CardContent } from "@/components/ui/card";
 import { Send, Sparkles, TrendingUp, Users, Globe } from "lucide-react";

const Prediction = () => {
  const [searchParams] = useSearchParams();
  const role = (searchParams.get("role") as "user" | "admin") || "user";
  const [prompt, setPrompt] = useState("");
   const [messages, setMessages] = useState<Array<{role: 'user' | 'ai', content: string}>>([]);
   const messagesEndRef = useRef<HTMLDivElement>(null);
 
   const scrollToBottom = () => {
     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   };
 
   useEffect(() => {
     scrollToBottom();
   }, [messages]);

  const handleSubmit = () => {
    if (prompt.trim()) {
       setMessages(prev => [...prev, { role: 'user', content: prompt }]);
       // Simulate AI response
       setTimeout(() => {
         setMessages(prev => [...prev, { 
           role: 'ai', 
           content: `Based on current trends and historical data analysis for your query: "${prompt}", I'm analyzing pollution patterns and health correlations. This is a placeholder response - connect to an AI backend for real predictions.`
         }]);
       }, 1000);
       setPrompt("");
    }
  };

   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
 
   const suggestionChips = [
     { icon: TrendingUp, label: "Predict PM2.5 levels", prompt: "What will be the PM2.5 levels in Myanmar by 2030?" },
     { icon: Users, label: "Health impact scenarios", prompt: "How will respiratory disease rates change if pollution decreases by 20%?" },
     { icon: Globe, label: "Compare countries", prompt: "Compare predicted mortality rates between countries" },
   ];

  return (
     <div className="min-h-screen flex flex-col bg-background">
      <Header variant="app" userRole={role} />
      
       <div className="flex-1 flex flex-col">
         {/* Messages area */}
         <div className="flex-1 overflow-y-auto px-4 py-6">
           <div className="max-w-3xl mx-auto space-y-6">
             {messages.length === 0 ? (
               /* Welcome state */
               <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
                 <div className="space-y-4">
                   <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                     <Sparkles className="h-8 w-8 text-primary" />
                   </div>
                   <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
                     AI Prediction Assistant
                   </h1>
                   <p className="text-muted-foreground max-w-md">
                     Ask questions about future pollution trends, health impact scenarios, or compare predictions across countries.
                   </p>
                 </div>
                 
                 {/* Suggestion cards */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                   {suggestionChips.map((chip, index) => (
                     <Card 
                       key={index}
                       className="cursor-pointer hover:bg-accent/50 transition-colors border-border"
                       onClick={() => setPrompt(chip.prompt)}
                     >
                       <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                         <chip.icon className="h-6 w-6 text-primary" />
                         <span className="text-sm font-medium text-foreground">{chip.label}</span>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               </div>
             ) : (
               /* Chat messages */
               messages.map((message, index) => (
                 <div 
                   key={index} 
                   className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                 >
                   <div 
                     className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                       message.role === 'user' 
                         ? 'bg-primary text-primary-foreground' 
                         : 'bg-card border border-border text-card-foreground'
                     }`}
                   >
                     {message.role === 'ai' && (
                       <div className="flex items-center gap-2 mb-2 text-primary">
                         <Sparkles className="h-4 w-4" />
                         <span className="text-xs font-medium">AI Prediction</span>
                       </div>
                     )}
                     <p className="text-sm leading-relaxed">{message.content}</p>
                   </div>
                 </div>
               ))
             )}
             <div ref={messagesEndRef} />
            </div>
          </div>

         {/* Input area - fixed at bottom */}
         <div className="border-t border-border bg-background p-4">
           <div className="max-w-3xl mx-auto">
             <div className="flex items-center gap-3 bg-card border border-border rounded-full px-4 py-2 shadow-sm">
               <Input
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 onKeyDown={handleKeyDown}
                 placeholder="Ask about future predictions..."
                 className="flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground"
               />
               <Button
                 size="icon"
                 className="flex-shrink-0 rounded-full"
                 onClick={handleSubmit}
                 disabled={!prompt.trim()}
               >
                 <Send className="h-4 w-4" />
               </Button>
             </div>
             <p className="text-xs text-muted-foreground text-center mt-2">
               AI predictions are based on historical data trends and may not reflect actual future outcomes.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prediction;
