import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Building2 } from "lucide-react";
import { listOrgs } from "@/lib/API";
import { ORG_TYPE_LABELS, DATA_DOMAIN_LABELS } from "@/lib/enumMaps";
import { useToast } from "@/hooks/use-toast";

interface OrgRow {
  org_id: number;
  org_name: string;
  org_type: string;
  data_domain: string;
  country: string;
  address_detail: string;
  official_email: string;
  contact_name: string;
  contact_email: string;
  status: string;
  created_at: string;
}

const AdminOrganizations = () => {
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<OrgRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listOrgs();
        setOrganizations(data || []);
      } catch (err: any) {
        const message =
          err?.response?.data?.detail || err?.message || "Failed to load organizations.";
        toast({ title: "Load failed", description: message, variant: "destructive" });
      }
    };
    load();
  }, [toast]);

  const filteredOrgs = organizations.filter(
    (org) =>
      org.org_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">Organizations</h1>
        <p className="text-muted-foreground mb-6">
          Manage approved organization accounts
        </p>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>All Organizations</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredOrgs.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">No organizations found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try adjusting your search" : "Approved organizations will appear here"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Data Domain</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrgs.map((org, index) => (
                      <motion.tr
                        key={org.org_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b"
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{org.org_name}</p>
                            <p className="text-sm text-muted-foreground">{org.official_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {ORG_TYPE_LABELS[org.org_type] || org.org_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {DATA_DOMAIN_LABELS[org.data_domain] || org.data_domain}
                          </Badge>
                        </TableCell>
                        <TableCell>{org.country}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{org.contact_name}</p>
                            <p className="text-xs text-muted-foreground">{org.contact_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(org.created_at).toLocaleDateString()}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminOrganizations;
