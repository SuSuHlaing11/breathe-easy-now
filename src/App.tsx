import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Analysis from "./pages/Analysis";
import Prediction from "./pages/Prediction";
import OrganizationDashboard from "./pages/OrganizationDashboard";
import UploadData from "./pages/dashboard/UploadData";
import UploadHistory from "./pages/dashboard/UploadHistory";
import ProfileManagement from "./pages/dashboard/ProfileManagement";
import ChangePassword from "./pages/dashboard/ChangePassword";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminOrganizations from "./pages/admin/AdminOrganizations";
import AdminDataUploads from "./pages/admin/AdminDataUploads";
import AdminCreateUser from "./pages/admin/AdminCreateUser";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/prediction" element={<Prediction />} />

            {/* Organization Dashboard Routes */}
            <Route path="/dashboard" element={<OrganizationDashboard />}>
              <Route path="upload" element={<UploadData />} />
              <Route path="history" element={<UploadHistory />} />
              <Route path="profile" element={<ProfileManagement />} />
              <Route path="password" element={<ChangePassword />} />
            </Route>

            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<AdminOverview />} />
              <Route path="requests" element={<AdminRequests />} />
              <Route path="organizations" element={<AdminOrganizations />} />
              <Route path="data" element={<AdminDataUploads />} />
              <Route path="create-user" element={<AdminCreateUser />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
