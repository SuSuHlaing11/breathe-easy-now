import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Eye, Building2, Globe, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OrgApplication } from "@/types/organization";
import {
  listOrgApplications,
  reviewOrgApplication,
  listOrgApplicationFiles,
} from "@/lib/API";

const ORG_TYPE_LABELS: Record<string, string> = {
  WEATHER_STATION: "Weather Station",
  HOSPITAL: "Hospital",
  RESEARCH_INSTITUTION: "Research",
  GOVERNMENT: "Government",
  OTHER: "Other",
};

const DATA_DOMAIN_LABELS: Record<string, string> = {
  HEALTH: "Health Data",
  POLLUTION: "Pollution Data",
};

const AdminRequests = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<OrgApplication[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<OrgApplication | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingApprove, setPendingApprove] = useState<OrgApplication | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listOrgApplications();
        setRequests(data);
      } catch (err: any) {
        const message =
          err?.response?.data?.detail || err?.message || "Failed to load requests.";
        toast({ title: "Load failed", description: message, variant: "destructive" });
      }
    };
    load();
  }, [toast]);

  const handleApprove = async (request: OrgApplication) => {
    setIsApproving(true);
    try {
      const updated = await reviewOrgApplication(request.application_id, {
        status: "APPROVED",
      });
      setRequests((prev) =>
        prev.map((r) => (r.application_id === updated.application_id ? updated : r))
      );
      toast({
        title: "Request Approved",
        description: `${request.org_name} has been approved.`,
      });
      setConfirmOpen(false);
      setPendingApprove(null);
      setDetailsOpen(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || "Failed to approve request.";
      toast({ title: "Approve failed", description: message, variant: "destructive" });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (request: OrgApplication) => {
    try {
      const updated = await reviewOrgApplication(request.application_id, {
        status: "REJECTED",
      });
      setRequests((prev) =>
        prev.map((r) => (r.application_id === updated.application_id ? updated : r))
      );
      toast({
        title: "Request Rejected",
        description: `${request.org_name}'s request has been rejected.`,
      });
      setDetailsOpen(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || "Failed to reject request.";
      toast({ title: "Reject failed", description: message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-600">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const processedRequests = requests.filter((r) => r.status !== "PENDING");

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">Organization Requests</h1>
        <p className="text-muted-foreground mb-6">
          Review and manage organization registration requests
        </p>

        {/* Pending Requests */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Pending Requests
              {pendingRequests.length > 0 && (
                <Badge variant="secondary">{pendingRequests.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <Check className="h-12 w-12 mx-auto text-green-600 mb-3" />
                <p className="text-muted-foreground">No pending requests</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((request, index) => (
                      <motion.tr
                        key={request.application_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b"
                      >
                        <TableCell className="font-medium">{request.org_name}</TableCell>
                        <TableCell>{ORG_TYPE_LABELS[request.org_type] || request.org_type}</TableCell>
                        <TableCell>{request.country}</TableCell>
                        <TableCell>
                          {new Date(request.submitted_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setDetailsOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processed Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Processed Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {processedRequests.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No processed requests yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedRequests.map((request) => (
                      <TableRow key={request.application_id}>
                        <TableCell className="font-medium">{request.org_name}</TableCell>
                        <TableCell>{ORG_TYPE_LABELS[request.org_type] || request.org_type}</TableCell>
                        <TableCell>{request.country}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {new Date(request.submitted_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Request Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedRequest?.org_name}
            </DialogTitle>
            <DialogDescription>
              Review organization details and approve or reject the request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Organization Type</p>
                  <p className="font-medium">
                    {ORG_TYPE_LABELS[selectedRequest.org_type] || selectedRequest.org_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data Domain</p>
                  <p className="font-medium">
                    {DATA_DOMAIN_LABELS[selectedRequest.data_domain] || selectedRequest.data_domain}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedRequest.country}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <p className="font-medium flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    {selectedRequest.website || "Not provided"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{selectedRequest.address_detail}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Official Email</p>
                  <p className="font-medium flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {selectedRequest.official_email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                  <p className="font-medium">{selectedRequest.contact_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.contact_email}</p>
                </div>
              </div>

              <ProofFiles applicationId={selectedRequest.application_id} />

              <div className="text-sm text-muted-foreground">
                Submitted: {new Date(selectedRequest.submitted_at).toLocaleString()}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => selectedRequest && handleReject(selectedRequest)}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              onClick={() => {
                if (selectedRequest) {
                  setPendingApprove(selectedRequest);
                  setConfirmOpen(true);
                }
              }}
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Approval</AlertDialogTitle>
            <AlertDialogDescription>
              This will create an organization account and send login credentials
              to {pendingApprove?.official_email}. Proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingApprove) {
                  handleApprove(pendingApprove);
                }
              }}
              disabled={isApproving}
            >
              {isApproving ? "Approving..." : "Yes, approve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminRequests;

const ProofFiles = ({ applicationId }: { applicationId: number }) => {
  const [files, setFiles] = useState<Array<{ file_name: string }>>([]);
  const [loaded, setLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listOrgApplicationFiles(applicationId);
        setFiles(data || []);
      } catch (err: any) {
        const message =
          err?.response?.data?.detail || err?.message || "Failed to load proof files.";
        toast({ title: "Files load failed", description: message, variant: "destructive" });
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, [applicationId, toast]);

  if (!loaded) {
    return (
      <div className="text-sm text-muted-foreground">Loading proof documents...</div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">No proof documents uploaded.</div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2">Proof Documents</p>
      <div className="flex flex-wrap gap-2">
        {files.map((file, index) => (
          <Badge key={`${file.file_name}-${index}`} variant="outline">
            {file.file_name}
          </Badge>
        ))}
      </div>
    </div>
  );
};
