import { Navigate, Outlet, useLocation } from "react-router-dom";
import OrganizationSidebar from "@/components/OrganizationSidebar";
import { useAuth } from "@/contexts/AuthContext";

const OrganizationDashboard = () => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect admin to admin dashboard
  if (role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  // Redirect to upload page if on base dashboard path
  if (location.pathname === "/dashboard") {
    return <Navigate to="/dashboard/upload" replace />;
  }

  return (
    <OrganizationSidebar>
      <Outlet />
    </OrganizationSidebar>
  );
};

export default OrganizationDashboard;
