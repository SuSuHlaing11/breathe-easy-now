import type { RefObject } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Upload, FileText } from "lucide-react";

interface CsvUploadPanelProps {
  fileType: "health" | "pollution";
  onFileTypeChange: (value: "health" | "pollution") => void;
  files: File[];
  validationResults: Array<{ file: File }>;
  isUploading: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (file: File) => void;
  onClearFiles: () => void;
  onUpload: () => void;
  hideTypeSwitch?: boolean;
}

const CsvUploadPanel = ({
  fileType,
  onFileTypeChange,
  files,
  validationResults,
  isUploading,
  fileInputRef,
  onFileSelect,
  onRemoveFile,
  onClearFiles,
  onUpload,
  hideTypeSwitch = false,
}: CsvUploadPanelProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Data Upload</CardTitle>
      <CardDescription>
        Supported formats: CSV, Excel (.xlsx/.xls), JSON. Maximum size: 50MB
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-8">
      <div className="rounded-lg border border-border p-4 space-y-5">
        {!hideTypeSwitch && (
          <div className="space-y-3">
            <Label>Data Type</Label>
            <RadioGroup
              value={fileType}
              onValueChange={(value) => onFileTypeChange(value as "health" | "pollution")}
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
        )}

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
              multiple
              onChange={onFileSelect}
              className="hidden"
            />
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Click to select a file or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              CSV, Excel, or JSON files only
            </p>
            {validationResults.length === 0 && files.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                {files.map((file) => (
                  <motion.div
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between rounded-md border border-border bg-background/80 px-3 py-2 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFile(file);
                      }}
                    >
                      Remove
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {files.length > 0 && (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={onClearFiles}>
              Clear all
            </Button>
          </div>
        )}
        <Button
          className="w-full"
          size="lg"
          disabled={!files.length || isUploading}
          onClick={onUpload}
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
      </div>
    </CardContent>
  </Card>
);

export default CsvUploadPanel;
