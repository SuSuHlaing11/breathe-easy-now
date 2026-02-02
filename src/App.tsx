import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Analysis from "./pages/Analysis";
import Prediction from "./pages/Prediction";
import SavedPage from "./pages/Saved";
import HistoryPage from "./pages/History";
import ExportPage from "./pages/Export";
import UserManagement from "./pages/admin/UserManagement";
import AdminHistory from "./pages/admin/AdminHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/prediction" element={<Prediction />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/export" element={<ExportPage />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/history" element={<AdminHistory />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
