import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Database, FileText, Eye } from "lucide-react";
import { listUploads, listOrgs } from "@/lib/API";
import { DATA_DOMAIN_LABELS } from "@/lib/enumMaps";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listUploadRecords } from "@/lib/API";

interface BackendUpload {
  upload_id: number;
  org_id: number;
  data_domain: "HEALTH" | "POLLUTION";
  mongo_collection: string;
  mongo_ref_id: string;
  country: string;
  status: "RECEIVED" | "PROCESSED" | "FAILED";
  error_message?: string | null;
  created_at: string;
}

interface OrgRow {
  org_id: number;
  org_name: string;
}

const AdminDataUploads = () => {
  const { toast } = useToast();
  const [uploads, setUploads] = useState<BackendUpload[]>([]);
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState<BackendUpload | null>(null);
  const [uploadRecords, setUploadRecords] = useState<Array<Record<string, any>>>([]);
  const [recordsTotal, setRecordsTotal] = useState(0);
  const [recordsPage, setRecordsPage] = useState(1);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [uploadData, orgData] = await Promise.all([listUploads(), listOrgs()]);
        setUploads(Array.isArray(uploadData) ? uploadData : []);
        setOrgs(Array.isArray(orgData) ? orgData : []);
      } catch (err: any) {
        const message =
          err?.response?.data?.detail || err?.message || "Failed to load uploads.";
        setError(message);
        toast({ title: "Load failed", description: message, variant: "destructive" });
        setUploads([]);
        setOrgs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const filteredUploads = uploads.filter((upload) => {
    const query = searchQuery.toLowerCase();
    const orgName = orgs.find((o) => o.org_id === upload.org_id)?.org_name || "";
    const label = `${upload.mongo_collection} ${upload.mongo_ref_id} ${upload.country} ${orgName}`.toLowerCase();
    return label.includes(query);
  });

  const getOrgName = (orgId: number) =>
    orgs.find((o) => o.org_id === orgId)?.org_name || "Unknown Organization";

  const getStatusBadge = (status: BackendUpload["status"]) => {
    switch (status) {
      case "PROCESSED":
        return <Badge className="bg-green-600">Completed</Badge>;
      case "RECEIVED":
        return <Badge variant="secondary">Processing</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const openDetails = (upload: BackendUpload) => {
    setSelectedUpload(upload);
    setRecordsPage(1);
    setDetailsOpen(true);
  };

  useEffect(() => {
    if (!detailsOpen || !selectedUpload) return;
    const loadRecords = async () => {
      setRecordsLoading(true);
      setRecordError(null);
      try {
        const limit = 6;
        const offset = (recordsPage - 1) * limit;
        const data = await listUploadRecords(selectedUpload.upload_id, { limit, offset });
        setUploadRecords(Array.isArray(data?.items) ? data.items : []);
        setRecordsTotal(typeof data?.total === "number" ? data.total : 0);
      } catch (err: any) {
        const message =
          err?.response?.data?.detail || err?.message || "Failed to load records.";
        setRecordError(message);
        setUploadRecords([]);
        setRecordsTotal(0);
      } finally {
        setRecordsLoading(false);
      }
    };
    loadRecords();
  }, [detailsOpen, selectedUpload, recordsPage]);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">Data Uploads</h1>
        <p className="text-muted-foreground mb-6">
          Monitor all data uploads from organizations
        </p>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>All Uploads</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading uploads...</div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">{error}</div>
            ) : filteredUploads.length === 0 ? (
              <div className="text-center py-12">
                <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">No uploads found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try adjusting your search" : "Data uploads will appear here"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUploads.map((upload, index) => (
                      <motion.tr
                        key={upload.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium" title={upload.mongo_ref_id}>
                              {upload.mongo_collection}:{upload.mongo_ref_id.slice(0, 10)}...
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getOrgName(upload.org_id)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {DATA_DOMAIN_LABELS[upload.data_domain] || upload.data_domain}
                          </Badge>
                        </TableCell>
                        <TableCell>{upload.country}</TableCell>
                        <TableCell>{getStatusBadge(upload.status)}</TableCell>
                        <TableCell>
                          {new Date(upload.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDetails(upload)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Upload Details</DialogTitle>
            <DialogDescription>
              {selectedUpload
                ? `${selectedUpload.mongo_collection} • ${selectedUpload.mongo_ref_id}`
                : "Upload details"}
            </DialogDescription>
          </DialogHeader>
          {recordsLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading records...</div>
          ) : recordError ? (
            <div className="py-4 text-destructive">{recordError}</div>
          ) : uploadRecords.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No records found.</div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto border rounded-md">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {selectedUpload?.data_domain === "POLLUTION" ? (
                        <>
                          <th className="text-left p-2">Location</th>
                          <th className="text-left p-2">Pollutant</th>
                          <th className="text-right p-2">Year</th>
                          <th className="text-right p-2">Value</th>
                          <th className="text-right p-2">Coverage %</th>
                          <th className="text-right p-2">Lat</th>
                          <th className="text-right p-2">Lon</th>
                        </>
                      ) : (
                        <>
                          <th className="text-left p-2">Measure</th>
                          <th className="text-left p-2">Cause</th>
                          <th className="text-left p-2">Age</th>
                          <th className="text-left p-2">Sex</th>
                          <th className="text-left p-2">Metric</th>
                          <th className="text-right p-2">Year</th>
                          <th className="text-right p-2">Val</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {uploadRecords.map((rec) => (
                      <tr key={rec.id} className="border-b">
                        {selectedUpload?.data_domain === "POLLUTION" ? (
                          <>
                            <td className="p-2">{rec.location_name}</td>
                            <td className="p-2">{rec.pollutant}</td>
                            <td className="p-2 text-right">{rec.year}</td>
                            <td className="p-2 text-right">{rec.value ?? rec.val}</td>
                            <td className="p-2 text-right">{rec.coverage_percent ?? "—"}</td>
                            <td className="p-2 text-right">{rec.latitude ?? "—"}</td>
                            <td className="p-2 text-right">{rec.longitude ?? "—"}</td>
                          </>
                        ) : (
                          <>
                            <td className="p-2">{rec.measure_name}</td>
                            <td className="p-2">{rec.cause_name}</td>
                            <td className="p-2">{rec.age_name}</td>
                            <td className="p-2">{rec.sex_name}</td>
                            <td className="p-2">{rec.metric_name}</td>
                            <td className="p-2 text-right">{rec.year}</td>
                            <td className="p-2 text-right">{rec.val}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={recordsPage === 1}
                  onClick={() => setRecordsPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <div className="text-xs text-muted-foreground">
                  Page {recordsPage} of {Math.max(1, Math.ceil(recordsTotal / 6))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={recordsPage >= Math.ceil(recordsTotal / 6)}
                  onClick={() => setRecordsPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDataUploads;
