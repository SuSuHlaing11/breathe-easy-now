import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Organization } from "@/types/organization";

const UploadData = () => {
  const { user } = useAuth();
  const org = user as Organization;
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"health" | "pollution">(
    org?.data_domain === "Health Data" ? "health" : "pollution"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [".csv", ".xlsx", ".xls", ".json"];
      const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();
      
      if (!validTypes.includes(ext)) {
        toast({
          title: "Invalid file type",
          description: "Please upload CSV, Excel, or JSON files only.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 50MB.",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);

    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Store in localStorage for demo
    const uploadRecord = {
      id: `upload-${Date.now()}`,
      org_id: org?.id,
      file_name: file.name,
      file_type: fileType,
      file_size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      uploaded_at: new Date().toISOString(),
      status: "completed",
    };

    const existingUploads = JSON.parse(localStorage.getItem("upload_records") || "[]");
    existingUploads.push(uploadRecord);
    localStorage.setItem("upload_records", JSON.stringify(existingUploads));

    setIsUploading(false);
    setUploadSuccess(true);
    setFile(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    toast({
      title: "Upload successful",
      description: "Your data file has been uploaded and is being processed.",
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">Upload Data</h1>
        <p className="text-muted-foreground mb-6">
          Upload your environmental or health data files for processing
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Data Upload</CardTitle>
            <CardDescription>
              Supported formats: CSV, Excel (.xlsx, .xls), JSON. Maximum size: 50MB
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Data Type Selection */}
            <div className="space-y-3">
              <Label>Data Type</Label>
              <RadioGroup
                value={fileType}
                onValueChange={(value) => setFileType(value as "health" | "pollution")}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="health" id="health" />
                  <Label htmlFor="health" className="cursor-pointer">Health Data</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pollution" id="pollution" />
                  <Label htmlFor="pollution" className="cursor-pointer">Pollution Data</Label>
                </div>
              </RadioGroup>
            </div>

            {/* File Upload Area */}
            <div className="space-y-3">
              <Label>Select File</Label>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Click to select a file or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  CSV, Excel, or JSON files
                </p>
              </div>
            </div>

            {/* Selected File */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  Remove
                </Button>
              </motion.div>
            )}

            {/* Upload Success */}
            {uploadSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg"
              >
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-700 dark:text-green-400">
                  File uploaded successfully and is being processed.
                </p>
              </motion.div>
            )}

            {/* Upload Button */}
            <Button
              className="w-full"
              size="lg"
              disabled={!file || isUploading}
              onClick={handleUpload}
            >
              {isUploading ? (
                <>
                  <motion.div
                    className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </>
              )}
            </Button>

            {/* Guidelines */}
            <div className="p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Data Guidelines:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Ensure data is properly formatted with headers</li>
                    <li>Include date/timestamp columns where applicable</li>
                    <li>Remove any personally identifiable information</li>
                    <li>Use standard units (µg/m³ for pollution, per 100k for health rates)</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default UploadData;
