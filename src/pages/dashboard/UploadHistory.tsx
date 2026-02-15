import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Trash2, Edit2, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Organization } from "@/types/organization";
import {
  listUploads,
  listUploadRecords,
  updateUploadRecord,
  deleteUpload,
  getIMHEMeasures,
  getIMHEMetrics,
  getIMHEAges,
  getIMHESexes,
  getIMHECauses,
} from "@/lib/API";

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

const UploadHistory = () => {
  const { user } = useAuth();
  const org = user as Organization;
  
  const [records, setRecords] = useState<BackendUpload[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadsPage, setUploadsPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState<BackendUpload | null>(null);
  const [uploadRecords, setUploadRecords] = useState<Array<Record<string, any>>>([]);
  const [recordsTotal, setRecordsTotal] = useState(0);
  const [recordsPage, setRecordsPage] = useState(1);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [editRecord, setEditRecord] = useState<Record<string, any> | null>(null);
  const [editValues, setEditValues] = useState({
    measure_name: "",
    sex_name: "",
    age_name: "",
    cause_name: "",
    metric_name: "",
    year: "",
    val: "",
    upper: "",
    lower: "",
  });

  const [measureOptions, setMeasureOptions] = useState<string[]>([]);
  const [metricOptions, setMetricOptions] = useState<string[]>([]);
  const [ageOptions, setAgeOptions] = useState<string[]>([]);
  const [sexOptions, setSexOptions] = useState<string[]>([]);
  const [causeOptions, setCauseOptions] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listUploads();
        const orgRecords = Array.isArray(data)
          ? data.filter((r: BackendUpload) => r.org_id === org?.org_id)
          : [];
        setRecords(orgRecords);
      } catch (err: any) {
        const message =
          err?.response?.data?.detail || err?.message || "Failed to load uploads.";
        setError(message);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [org?.org_id]);

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

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const params = org?.country ? { location_name: org.country } : undefined;
        const [measures, metrics, ages, sexes, causes] = await Promise.all([
          getIMHEMeasures(params),
          getIMHEMetrics(params),
          getIMHEAges(params),
          getIMHESexes(params),
          getIMHECauses(params),
        ]);
        setMeasureOptions((measures || []).map((m: any) => m.measure_name));
        setMetricOptions((metrics || []).map((m: any) => m.metric_name));
        setAgeOptions((ages || []).map((a: any) => a.age_name));
        setSexOptions((sexes || []).map((s: any) => s.sex_name));
        const cleaned = (causes || [])
          .map((c: any) => c.cause_name)
          .filter((name: string) => name && name.toLowerCase() !== "asthma");
        setCauseOptions(cleaned);
      } catch {
        setMeasureOptions([]);
        setMetricOptions([]);
        setAgeOptions([]);
        setSexOptions([]);
        setCauseOptions([]);
      }
    };
    loadOptions();
  }, [org?.country]);

  const filteredRecords = records.filter((record) => {
    const label = `${record.mongo_collection} ${record.mongo_ref_id}`.toLowerCase();
    return label.includes(searchQuery.toLowerCase());
  });
  const uploadsPageSize = 10;
  const uploadsTotalPages = Math.max(1, Math.ceil(filteredRecords.length / uploadsPageSize));
  const pagedUploads = filteredRecords.slice(
    (uploadsPage - 1) * uploadsPageSize,
    uploadsPage * uploadsPageSize
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROCESSED":
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
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

  const handleDelete = async (upload: BackendUpload) => {
    if (!window.confirm("Delete this upload and its records? This cannot be undone.")) return;
    try {
      await deleteUpload(upload.upload_id);
      setRecords((prev) => prev.filter((r) => r.upload_id !== upload.upload_id));
      if (selectedUpload?.upload_id === upload.upload_id) {
        setDetailsOpen(false);
        setSelectedUpload(null);
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || "Delete failed.";
      setError(message);
    }
  };

  const openEditRecord = (record: Record<string, any>) => {
    setEditRecord(record);
    setEditValues({
      measure_name: record.measure_name || "",
      sex_name: record.sex_name || "",
      age_name: record.age_name || "",
      cause_name: record.cause_name || "",
      metric_name: record.metric_name || "",
      year: record.year?.toString() || "",
      val: record.val?.toString() || "",
      upper: record.upper?.toString() || "",
      lower: record.lower?.toString() || "",
    });
  };

  const saveEditRecord = async () => {
    if (!selectedUpload || !editRecord) return;
    const year = Number(editValues.year);
    const val = Number(editValues.val);
    if (!editValues.measure_name || !editValues.sex_name || !editValues.age_name ||
        !editValues.cause_name || !editValues.metric_name || !Number.isFinite(year) || !Number.isFinite(val)) {
      setRecordError("Please fill all required fields.");
      return;
    }
    const payload = {
      measure_name: editValues.measure_name,
      sex_name: editValues.sex_name,
      age_name: editValues.age_name,
      cause_name: editValues.cause_name,
      metric_name: editValues.metric_name,
      year,
      val,
      upper: editValues.upper ? Number(editValues.upper) : undefined,
      lower: editValues.lower ? Number(editValues.lower) : undefined,
    };
    try {
      await updateUploadRecord(selectedUpload.upload_id, editRecord.id, payload);
      setEditRecord(null);
      setRecordsPage(1);
      setDetailsOpen(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || "Update failed.";
      setRecordError(message);
    }
  };

  const getPaginationItems = (current: number, total: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, 4, "ellipsis", total];
    }
    if (current >= total - 2) {
      return [1, "ellipsis", total - 3, total - 2, total - 1, total];
    }
    return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">Upload History</h1>
        <p className="text-muted-foreground mb-6">
          View and manage your uploaded data files
        </p>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Your Uploads</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setUploadsPage(1);
                  }}
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
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">No uploads yet</h3>
                <p className="text-muted-foreground">
                  Your uploaded files will appear here
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Batch</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {pagedUploads.map((record, index) => (
                          <motion.tr
                            key={record.upload_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b"
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span title={record.mongo_ref_id}>
                                  {record.mongo_collection}:{record.mongo_ref_id.slice(0, 10)}...
                                </span>
                              </div>
                              {record.error_message && record.status === "FAILED" && (
                                <p className="text-xs text-destructive mt-1">
                                  {record.error_message}
                                </p>
                              )}
                            </TableCell>
                            <TableCell className="capitalize">{record.data_domain.toLowerCase()}</TableCell>
                            <TableCell>{record.country}</TableCell>
                            <TableCell>
                              {new Date(record.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{getStatusBadge(record.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDetails(record)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(record)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
                {filteredRecords.length > uploadsPageSize && (
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={uploadsPage === 1}
                      onClick={() => setUploadsPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {getPaginationItems(uploadsPage, uploadsTotalPages).map((item, idx) => {
                        if (item === "ellipsis") {
                          return (
                            <span key={`uploads-ellipsis-${idx}`} className="px-2 text-xs text-muted-foreground">
                              ...
                            </span>
                          );
                        }
                        const page = item as number;
                        return (
                          <Button
                            key={`uploads-page-${page}`}
                            variant={page === uploadsPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setUploadsPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={uploadsPage >= uploadsTotalPages}
                      onClick={() => setUploadsPage((p) => Math.min(uploadsTotalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* No edit/delete until backend supports it */}
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
                          <th className="text-right p-2">Actions</th>
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
                            <td className="p-2 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={selectedUpload?.data_domain === "POLLUTION"}
                                onClick={() => openEditRecord(rec)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </td>
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
                <div className="flex items-center gap-1">
                  {getPaginationItems(recordsPage, Math.max(1, Math.ceil(recordsTotal / 6))).map((item, idx) => {
                    if (item === "ellipsis") {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 text-xs text-muted-foreground">
                          ...
                        </span>
                      );
                    }
                    const page = item as number;
                    return (
                      <Button
                        key={page}
                        variant={page === recordsPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setRecordsPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
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

      <Dialog open={!!editRecord} onOpenChange={() => setEditRecord(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Measure</Label>
              <select
                value={editValues.measure_name}
                onChange={(e) => setEditValues((p) => ({ ...p, measure_name: e.target.value }))}
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
              >
                <option value="">Select</option>
                {measureOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Cause</Label>
              <select
                value={editValues.cause_name}
                onChange={(e) => setEditValues((p) => ({ ...p, cause_name: e.target.value }))}
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
              >
                <option value="">Select</option>
                {causeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Age</Label>
              <select
                value={editValues.age_name}
                onChange={(e) => setEditValues((p) => ({ ...p, age_name: e.target.value }))}
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
              >
                <option value="">Select</option>
                {ageOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Sex</Label>
              <select
                value={editValues.sex_name}
                onChange={(e) => setEditValues((p) => ({ ...p, sex_name: e.target.value }))}
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
              >
                <option value="">Select</option>
                {sexOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Metric</Label>
              <select
                value={editValues.metric_name}
                onChange={(e) => setEditValues((p) => ({ ...p, metric_name: e.target.value }))}
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
              >
                <option value="">Select</option>
                {metricOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Year</Label>
              <input
                type="number"
                value={editValues.year}
                onChange={(e) => setEditValues((p) => ({ ...p, year: e.target.value }))}
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Value</Label>
              <input
                type="number"
                value={editValues.val}
                onChange={(e) => setEditValues((p) => ({ ...p, val: e.target.value }))}
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Upper</Label>
              <input
                type="number"
                value={editValues.upper}
                onChange={(e) => setEditValues((p) => ({ ...p, upper: e.target.value }))}
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Lower</Label>
              <input
                type="number"
                value={editValues.lower}
                onChange={(e) => setEditValues((p) => ({ ...p, lower: e.target.value }))}
                className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRecord(null)}>
              Cancel
            </Button>
            <Button onClick={saveEditRecord}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadHistory;



