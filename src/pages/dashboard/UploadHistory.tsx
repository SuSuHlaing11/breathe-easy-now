import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, Trash2, Edit2, FileText, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UploadRecord, Organization } from "@/types/organization";
import { mockUploadRecords } from "@/data/mockData";

const UploadHistory = () => {
  const { user } = useAuth();
  const org = user as Organization;
  const { toast } = useToast();
  
  const [records, setRecords] = useState<UploadRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; record: UploadRecord | null }>({
    open: false,
    record: null,
  });
  const [editDialog, setEditDialog] = useState<{ open: boolean; record: UploadRecord | null }>({
    open: false,
    record: null,
  });
  const [editFileName, setEditFileName] = useState("");

  useEffect(() => {
    // Load records from localStorage and merge with mock data
    const storedRecords = JSON.parse(localStorage.getItem("upload_records") || "[]");
    const orgRecords = [...mockUploadRecords, ...storedRecords].filter(
      (r: UploadRecord) => r.org_id === org?.org_id
    );
    setRecords(orgRecords);
  }, [org?.id]);

  const filteredRecords = records.filter((record) =>
    record.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (!deleteDialog.record) return;

    const updatedRecords = records.filter((r) => r.id !== deleteDialog.record!.id);
    setRecords(updatedRecords);

    // Update localStorage
    const storedRecords = JSON.parse(localStorage.getItem("upload_records") || "[]");
    const filteredStored = storedRecords.filter((r: UploadRecord) => r.id !== deleteDialog.record!.id);
    localStorage.setItem("upload_records", JSON.stringify(filteredStored));

    setDeleteDialog({ open: false, record: null });
    toast({
      title: "Record deleted",
      description: "The upload record has been removed.",
    });
  };

  const handleEdit = () => {
    if (!editDialog.record || !editFileName.trim()) return;

    const updatedRecords = records.map((r) =>
      r.id === editDialog.record!.id ? { ...r, file_name: editFileName } : r
    );
    setRecords(updatedRecords);

    // Update localStorage
    const storedRecords = JSON.parse(localStorage.getItem("upload_records") || "[]");
    const updatedStored = storedRecords.map((r: UploadRecord) =>
      r.id === editDialog.record!.id ? { ...r, file_name: editFileName } : r
    );
    localStorage.setItem("upload_records", JSON.stringify(updatedStored));

    setEditDialog({ open: false, record: null });
    setEditFileName("");
    toast({
      title: "Record updated",
      description: "The file name has been updated.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case "processing":
        return <Badge variant="secondary">Processing</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">No uploads yet</h3>
                <p className="text-muted-foreground">
                  Your uploaded files will appear here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredRecords.map((record, index) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              {record.file_name}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{record.file_type}</TableCell>
                          <TableCell>{record.file_size}</TableCell>
                          <TableCell>
                            {new Date(record.uploaded_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditFileName(record.file_name);
                                  setEditDialog({ open: true, record });
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteDialog({ open: true, record })}
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
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, record: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Upload Record
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.record?.file_name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, record: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, record: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit File Name</DialogTitle>
            <DialogDescription>
              Update the name for this upload record.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editFileName}
              onChange={(e) => setEditFileName(e.target.value)}
              placeholder="File name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, record: null })}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadHistory;
