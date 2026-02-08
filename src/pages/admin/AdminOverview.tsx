import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Database, Clock, TrendingUp, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { mockUploadRecords } from "@/data/mockData";
import { listOrgApplications, listOrgs } from "@/lib/API";
import { useToast } from "@/hooks/use-toast";

const AdminOverview = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    pendingRequests: 0,
    totalOrganizations: 0,
    totalUploads: 0,
    recentActivity: 0,
  });

  useEffect(() => {
    // Keep uploads + recent activity mocked for now
    const storedUploads = JSON.parse(localStorage.getItem("upload_records") || "[]");
    const totalUploads = mockUploadRecords.length + storedUploads.length;

    const loadCounts = async () => {
      try {
        const [pending, orgs] = await Promise.all([
          listOrgApplications("PENDING"),
          listOrgs(),
        ]);
        setStats({
          pendingRequests: Array.isArray(pending) ? pending.length : 0,
          totalOrganizations: Array.isArray(orgs) ? orgs.length : 0,
          totalUploads,
          recentActivity: 12,
        });
      } catch (err: any) {
        const message =
          err?.response?.data?.detail || err?.message || "Failed to load overview stats.";
        toast({ title: "Load failed", description: message, variant: "destructive" });
        setStats((prev) => ({
          ...prev,
          totalUploads,
          recentActivity: 12,
        }));
      }
    };

    loadCounts();
  }, [toast]);

  const statCards = [
    {
      title: "Pending Requests",
      value: stats.pendingRequests,
      icon: Clock,
      color: "text-amber-600 bg-amber-100 dark:bg-amber-950",
      description: "Awaiting review",
    },
    {
      title: "Organizations",
      value: stats.totalOrganizations,
      icon: Users,
      color: "text-primary bg-primary/10",
      description: "Approved accounts",
    },
    {
      title: "Data Uploads",
      value: stats.totalUploads,
      icon: Database,
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950",
      description: "Total files",
    },
    {
      title: "This Week",
      value: stats.recentActivity,
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-950",
      description: "New activities",
    },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground mb-6">
          Welcome to the admin panel. Here's an overview of platform activity.
        </p>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                  </div>
                  <h3 className="font-medium text-foreground">{stat.title}</h3>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <motion.div
                className="p-4 rounded-lg border hover:border-primary hover:bg-secondary/50 transition-colors block"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to="/admin/requests" className="block">
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <h4 className="font-medium text-foreground">Review Requests</h4>
                  <p className="text-sm text-muted-foreground">
                    {stats.pendingRequests} pending
                  </p>
                </Link>
              </motion.div>

              <motion.div
                className="p-4 rounded-lg border hover:border-primary hover:bg-secondary/50 transition-colors block"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to="/admin/create-user" className="block">
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <h4 className="font-medium text-foreground">Create User</h4>
                  <p className="text-sm text-muted-foreground">
                    Add new admin or org
                  </p>
                </Link>
              </motion.div>

              <motion.div
                className="p-4 rounded-lg border hover:border-primary hover:bg-secondary/50 transition-colors block"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to="/admin/data" className="block">
                  <Database className="h-8 w-8 text-primary mb-2" />
                  <h4 className="font-medium text-foreground">View Data</h4>
                  <p className="text-sm text-muted-foreground">
                    {stats.totalUploads} uploads
                  </p>
                </Link>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminOverview;
