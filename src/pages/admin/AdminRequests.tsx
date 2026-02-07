import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { OrganizationRequest } from "@/types/organization";
import { mockOrganizationRequests } from "@/data/mockData";

const AdminRequests = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<OrganizationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<OrganizationRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    // Load from localStorage and merge with mock data
    const storedRequests = JSON.parse(localStorage.getItem("org_requests") || "[]");
    setRequests([...mockOrganizationRequests, ...storedRequests]);
  }, []);

  const handleApprove = (request: OrganizationRequest) => {
    const updatedRequests = requests.map((r) =>
      r.id === request.id ? { ...r, status: "APPROVED" as const } : r
    );
    setRequests(updatedRequests);
    
    // Create organization account
    const newOrg = {
      id: `org-${Date.now()}`,
      org_name: request.org_name,
      org_type: request.org_type,
      data_domain: request.data_domain,
      country: request.country,
      address_detail: request.address_detail,
      official_email: request.official_email,
      website: request.website,
      contact_name: request.contact_name,
      contact_email: request.contact_email,
      password: "welcome123",
      created_at: new Date().toISOString(),
    };

    const existingOrgs = JSON.parse(localStorage.getItem("organizations") || "[]");
    existingOrgs.push(newOrg);
    localStorage.setItem("organizations", JSON.stringify(existingOrgs));

    toast({
      title: "Request Approved",
      description: `${request.org_name} has been approved. Login credentials sent to ${request.official_email}.`,
    });

    setDetailsOpen(false);
  };

  const handleReject = (request: OrganizationRequest) => {
    const updatedRequests = requests.map((r) =>
      r.id === request.id ? { ...r, status: "REJECTED" as const } : r
    );
    setRequests(updatedRequests);

    toast({
      title: "Request Rejected",
      description: `${request.org_name}'s request has been rejected.`,
    });

    setDetailsOpen(false);
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
                        key={request.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b"
                      >
                        <TableCell className="font-medium">{request.org_name}</TableCell>
                        <TableCell>{request.org_type}</TableCell>
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
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.org_name}</TableCell>
                        <TableCell>{request.org_type}</TableCell>
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
                  <p className="font-medium">{selectedRequest.org_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data Domain</p>
                  <p className="font-medium">{selectedRequest.data_domain}</p>
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

              {selectedRequest.proof_files.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Proof Documents</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.proof_files.map((file, index) => (
                      <Badge key={index} variant="outline">
                        {file}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

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
              onClick={() => selectedRequest && handleApprove(selectedRequest)}
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRequests;
