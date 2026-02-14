import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Organization } from "@/types/organization";
import { isHealthDomain } from "@/lib/enumMaps";
import {
  uploadIMHECSVValidate,
  uploadIMHECSVConfirm,
  uploadIMHERecord,
  listUploadDupes,
  getIMHEMeasures,
  getIMHEMetrics,
  getIMHEAges,
  getIMHESexes,
  getIMHECauses,
} from "@/lib/API";

const MANUAL_FIELDS = [
  { key: "measure_name", label: "Measure Name", type: "text" },
  { key: "location_name", label: "Location Name", type: "text" },
  { key: "sex_name", label: "Sex Name", type: "text" },
  { key: "age_name", label: "Age Name", type: "text" },
  { key: "cause_name", label: "Cause Name", type: "text" },
  { key: "metric_name", label: "Metric Name", type: "text" },
  { key: "year", label: "Year", type: "number" },
  { key: "val", label: "Value", type: "number" },
] as const;

const ADVANCED_FIELDS = [
  { key: "upper", label: "Upper", type: "number" },
  { key: "lower", label: "Lower", type: "number" },
] as const;

type AdvancedFieldKey = typeof ADVANCED_FIELDS[number]["key"];

type ManualFieldKey = typeof MANUAL_FIELDS[number]["key"];

const ageSortKey = (name: string) => {
  const value = name.trim().toLowerCase();
  const ltYear = value.match(/^<\s*(\d+)\s*year/);
  if (ltYear) return { start: -1, end: Number(ltYear[1]) };
  const months = value.match(/^(\d+)\s*-\s*(\d+)\s*months?/);
  if (months) return { start: 0, end: Number(months[2]) };
  const days = value.match(/^<\s*(\d+)\s*days?/);
  if (days) return { start: -2, end: Number(days[1]) };
  const range = value.match(/^(\d+)\s*-\s*(\d+)\s*years?/);
  if (range) return { start: Number(range[1]), end: Number(range[2]) };
  const plus = value.match(/^(\d+)\s*\+\s*years?/);
  if (plus) return { start: Number(plus[1]), end: 999 };
  const single = value.match(/^(\d+)\s*years?/);
  if (single) return { start: Number(single[1]), end: Number(single[1]) };
  return { start: 9999, end: 9999 };
};

const UploadData = () => {
  const { user } = useAuth();
  const org = user as Organization;
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<File[]>([]);
  const [fileType, setFileType] = useState<"health" | "pollution">(
    isHealthDomain(org?.data_domain) ? "health" : "pollution"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [validationResults, setValidationResults] = useState<Array<{
    file: File;
    token: string;
    total_rows: number;
    new_rows: number;
    dupe_rows: number;
    dupe_samples: Array<Record<string, any>>;
    dupe_total?: number;
    token_expires_seconds?: number;
    confirming: boolean;
    error?: string;
    dupe_page?: number;
    dupe_items?: Array<Record<string, any>>;
    dupe_loading?: boolean;
  }>>([]);
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [csvPreviews, setCsvPreviews] = useState<Array<{ name: string; lines: string[] }>>([]);
  const [previewStep, setPreviewStep] = useState<"preview" | "validation">("preview");
  const [manualValues, setManualValues] = useState<Record<ManualFieldKey, string>>({
    measure_name: "",
    location_name: "",
    sex_name: "",
    age_name: "",
    cause_name: "",
    metric_name: "",
    year: "",
    val: "",
  });
  const [advancedValues, setAdvancedValues] = useState<Record<AdvancedFieldKey, string>>({
    upper: "",
    lower: "",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [measureOptions, setMeasureOptions] = useState<Array<{ measure_id: number; measure_name: string }>>([]);
  const [metricOptions, setMetricOptions] = useState<Array<{ metric_id: number; metric_name: string }>>([]);
  const [ageOptions, setAgeOptions] = useState<Array<{ age_id: number; age_name: string }>>([]);
  const [sexOptions, setSexOptions] = useState<Array<{ sex_id: number; sex_name: string }>>([]);
  const [causeOptions, setCauseOptions] = useState<Array<{ cause_id: number; cause_name: string }>>([]);

  useEffect(() => {
    if (org?.country) {
      setManualValues((prev) => ({ ...prev, location_name: org.country }));
    }
  }, [org?.country]);

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
        setMeasureOptions(Array.isArray(measures) ? measures : []);
        setMetricOptions(Array.isArray(metrics) ? metrics : []);
        const sortedAges = Array.isArray(ages)
          ? ages
              .filter((a) => a?.age_name)
              .sort((a, b) => {
                const ak = ageSortKey(a.age_name);
                const bk = ageSortKey(b.age_name);
                if (ak.start !== bk.start) return ak.start - bk.start;
                if (ak.end !== bk.end) return ak.end - bk.end;
                return a.age_name.localeCompare(b.age_name);
              })
          : [];
        setAgeOptions(sortedAges);
        setSexOptions(Array.isArray(sexes) ? sexes : []);
        const cleanedCauses = Array.isArray(causes)
          ? causes.filter((c) => c?.cause_name && c.cause_name.toLowerCase() !== "asthma")
          : [];
        setCauseOptions(cleanedCauses);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const validTypes = [".csv"];
    const validFiles: File[] = [];

    for (const selectedFile of selectedFiles) {
      const ext = selectedFile.name
        .substring(selectedFile.name.lastIndexOf("."))
        .toLowerCase();
      if (!validTypes.includes(ext)) {
        toast({
          title: "Invalid file type",
          description: `Only CSV files are supported. Skipped ${selectedFile.name}.`,
          variant: "destructive",
        });
        continue;
      }

      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `Max 50MB. Skipped ${selectedFile.name}.`,
          variant: "destructive",
        });
        continue;
      }

      validFiles.push(selectedFile);
    }

    if (!validFiles.length) return;
    setFiles((prev) => [...prev, ...validFiles]);
    setValidationResults([]);
    setUploadSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!files.length) return;

    setIsUploading(true);

    try {
      if (fileType !== "health") {
        toast({
          title: "Not available",
          description: "Only health CSV uploads are supported right now.",
          variant: "destructive",
        });
        return;
      }
      const previews: Array<{ name: string; lines: string[] }> = [];
      for (const file of files) {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
        previews.push({ name: file.name, lines: lines.slice(0, 5) });
      }
      setCsvPreviews(previews);
      setPreviewStep("preview");
      setPreviewOpen(true);
    } catch (err) {
      const message =
        err?.response?.data?.detail || err?.message || "Upload failed. Please try again.";
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePreviewConfirm = async () => {
    setPreviewStep("validation");
    setIsUploading(true);
    try {
      const results = [];
      for (const file of files) {
        const res = await uploadIMHECSVValidate(file);
        results.push({
          file,
          token: res.token,
          total_rows: res.total_rows,
          new_rows: res.new_rows,
          dupe_rows: res.dupe_rows,
          dupe_samples: res.dupe_samples || [],
          dupe_total: res.dupe_total || res.dupe_rows,
          token_expires_seconds: res.token_expires_seconds,
          confirming: false,
          dupe_page: 1,
          dupe_items: res.dupe_samples || [],
        });
      }
      setValidationResults(results);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || "Upload failed. Please try again.";
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirm = async (token: string) => {
    setValidationResults((prev) =>
      prev.map((r) => (r.token === token ? { ...r, confirming: true, error: undefined } : r))
    );
    try {
      await uploadIMHECSVConfirm(token);
      setValidationResults((prev) => {
        const removed = prev.find((r) => r.token === token);
        if (removed) {
          setFiles((filesPrev) =>
            filesPrev.filter(
              (f) =>
                !(
                  f.name === removed.file.name &&
                  f.size === removed.file.size &&
                  f.lastModified === removed.file.lastModified
                )
            )
          );
        }
        return prev.filter((r) => r.token !== token);
      });
      setUploadSuccess(true);
      if (fileInputRef.current && files.length <= 1) {
        fileInputRef.current.value = "";
      }
      toast({
        title: "Upload complete",
        description: "Non-duplicate rows were added successfully.",
      });
    } catch (err) {
      const message =
        err?.response?.data?.detail || err?.message || "Confirm failed.";
      setValidationResults((prev) =>
        prev.map((r) => (r.token === token ? { ...r, confirming: false, error: message } : r))
      );
    } finally {
      setValidationResults((prev) =>
        prev.map((r) => (r.token === token ? { ...r, confirming: false } : r))
      );
    }
  };

  const loadDupesPage = async (token: string, page: number) => {
    const limit = 5;
    const offset = (page - 1) * limit;
    setValidationResults((prev) =>
      prev.map((r) =>
        r.token === token ? { ...r, dupe_loading: true } : r
      )
    );
    try {
      const res = await listUploadDupes(token, { limit, offset });
      setValidationResults((prev) =>
        prev.map((r) =>
          r.token === token
            ? {
                ...r,
                dupe_items: res.items || r.dupe_items || [],
                dupe_total: res.total ?? r.dupe_total,
                dupe_page: page,
                dupe_loading: false,
              }
            : r
        )
      );
    } catch {
      setValidationResults((prev) =>
        prev.map((r) => (r.token === token ? { ...r, dupe_loading: false } : r))
      );
    }
  };
const handleManualSubmit = async () => {
    setManualSubmitting(true);
    try {
      setManualError(null);
      const requiredFields = [
        "measure_name",
        "location_name",
        "sex_name",
        "age_name",
        "cause_name",
        "metric_name",
        "year",
        "val",
      ] as const;

      for (const key of requiredFields) {
        if (!manualValues[key] || !manualValues[key].toString().trim()) {
          setManualError("All fields are required (except advanced values).");
          setManualSubmitting(false);
          return;
        }
      }

      const year = Number(manualValues.year);
      const maxYear = new Date().getFullYear() + 3;
      if (!Number.isFinite(year) || year < 1900 || year > maxYear) {
        setManualError(`Year must be between 1900 and ${maxYear}.`);
        setManualSubmitting(false);
        return;
      }

      const val = Number(manualValues.val);
      if (!Number.isFinite(val)) {
        setManualError("Value must be a number.");
        setManualSubmitting(false);
        return;
      }

      const payload = {
        measure_name: manualValues.measure_name.trim(),
        location_name: manualValues.location_name.trim(),
        sex_name: manualValues.sex_name.trim(),
        age_name: manualValues.age_name.trim(),
        cause_name: manualValues.cause_name.trim(),
        metric_name: manualValues.metric_name.trim(),
        year,
        val,
        upper: advancedValues.upper ? Number(advancedValues.upper) : undefined,
        lower: advancedValues.lower ? Number(advancedValues.lower) : undefined,
      };

      if (advancedValues.upper && !Number.isFinite(Number(advancedValues.upper))) {
        setManualError("Upper must be a number.");
        setManualSubmitting(false);
        return;
      }
      if (advancedValues.lower && !Number.isFinite(Number(advancedValues.lower))) {
        setManualError("Lower must be a number.");
        setManualSubmitting(false);
        return;
      }

      await uploadIMHERecord(payload);
      setManualValues({
        measure_name: "",
        location_name: org?.country || "",
        sex_name: "",
        age_name: "",
        cause_name: "",
        metric_name: "",
        year: "",
        val: "",
      });
      setAdvancedValues({ upper: "", lower: "" });
      toast({
        title: "Record added",
        description: "The health record was saved.",
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || "Could not save record.";
      setManualError(message);
    } finally {
      setManualSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="w-full max-w-2xl">
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
              Supported format: CSV. Maximum size: 50MB
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Block: Data Type + CSV */}
            <div className="rounded-lg border border-border p-4 space-y-5">
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

              <div className="space-y-3">
                <Label>Select File</Label>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Click to select a file or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    CSV files only
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
                              setFiles((prev) =>
                                prev.filter(
                                  (f) =>
                                    !(
                                      f.name === file.name &&
                                      f.size === file.size &&
                                      f.lastModified === file.lastModified
                                    )
                                )
                              );
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFiles([]);
                      setValidationResults([]);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    Clear all
                  </Button>
                </div>
              )}
              <Button
                className="w-full"
                size="lg"
                disabled={!files.length || isUploading}
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
              {/* Validation results now shown in modal */}
            </div>

            {/* Manual Entry (Health Only) */}
            {fileType === "health" && (
              <div className="rounded-lg border border-border p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Manual Entry</h3>
                  <p className="text-xs text-muted-foreground">
                    Add a single IHME record. Location name must match your org country.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MANUAL_FIELDS.map((field) => {
                    const isSelect =
                      field.key !== "year" && field.key !== "val" && field.key !== "location_name";
                    const options =
                      field.key === "measure_name"
                        ? measureOptions.map((m) => m.measure_name)
                        : field.key === "metric_name"
                          ? metricOptions.map((m) => m.metric_name)
                          : field.key === "age_name"
                            ? ageOptions.map((a) => a.age_name)
                            : field.key === "sex_name"
                              ? sexOptions.map((s) => s.sex_name)
                              : field.key === "cause_name"
                                ? causeOptions.map((c) => c.cause_name)
                                : [];

                    return (
                      <div key={field.key} className="space-y-1">
                        <Label className="text-xs">{field.label}</Label>
                        {field.key === "location_name" ? (
                          <input
                            type="text"
                            value={manualValues.location_name}
                            readOnly
                            className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background read-only:bg-muted read-only:text-muted-foreground"
                          />
                        ) : isSelect ? (
                          <select
                            value={manualValues[field.key]}
                            onChange={(e) =>
                              setManualValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                            }
                            className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
                          >
                            <option value="">Select {field.label}</option>
                            {options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            value={manualValues[field.key]}
                            onChange={(e) =>
                              setManualValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                            }
                            className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setShowAdvanced((prev) => !prev)}
                  >
                    {showAdvanced ? "Hide advanced fields" : "Show advanced fields"}
                  </button>
                </div>
                {showAdvanced && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ADVANCED_FIELDS.map((field) => (
                      <div key={field.key} className="space-y-1">
                        <Label className="text-xs">{field.label}</Label>
                        <input
                          type={field.type}
                          value={advancedValues[field.key]}
                          onChange={(e) =>
                            setAdvancedValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                          }
                          className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
                        />
                      </div>
                    ))}
                  </div>
                )}
                {manualError && (
                  <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                    {manualError}
                  </div>
                )}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    disabled={manualSubmitting}
                    onClick={handleManualSubmit}
                  >
                    {manualSubmitting ? "Saving..." : "Add Record"}
                  </Button>
                </div>
              </div>
            )}

            

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
                    <li>Use standard units (Âµg/mÂ³ for pollution, per 100k for health rates)</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {previewStep === "preview" ? "Confirm CSV Preview" : "Validation Results"}
            </DialogTitle>
            <DialogDescription>
              {previewStep === "preview"
                ? "Please confirm the first 5 lines for each file before validation."
                : "Review duplicates and confirm insertion of non-duplicate rows."}
            </DialogDescription>
          </DialogHeader>
          {previewStep === "preview" ? (
            <>
              <div className="space-y-4 max-h-[60vh] overflow-auto">
                {csvPreviews.map((preview) => (
                  <div key={preview.name} className="border rounded-md p-3">
                    <div className="text-sm font-medium text-foreground mb-2">{preview.name}</div>
                    <div className="bg-muted/50 rounded p-2 overflow-x-auto no-scrollbar">
                      <pre className="text-xs whitespace-pre">
{preview.lines.join("\n")}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePreviewConfirm}>Confirm & Validate</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-4 max-h-[60vh] overflow-auto">
                {validationResults.map((res) => (
                  <div key={res.token} className="rounded-md border border-border p-3 space-y-2">
                    <div className="text-sm font-medium text-foreground">{res.file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Total: {res.total_rows} • New: {res.new_rows} • Duplicates: {res.dupe_rows}
                    </div>
                    {res.dupe_rows > 0 && (
                      <div className="text-xs text-muted-foreground space-y-2">
                        <div>Duplicates (showing 5 per page):</div>
                        <ul className="list-disc list-inside">
                          {(res.dupe_items || res.dupe_samples).map((d, idx) => (
                            <li key={idx}>
                              pop={d.population_group_id}, measure={d.measure_id}, loc={d.location_id}, sex={d.sex_id}, age={d.age_id}, cause={d.cause_id}, metric={d.metric_id}, year={d.year}
                            </li>
                          ))}
                        </ul>
                        {res.dupe_loading && (
                          <div className="text-xs text-muted-foreground">Loading...</div>
                        )}
                        {res.dupe_total && res.dupe_total > 5 && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={(res.dupe_page || 1) <= 1 || res.dupe_loading}
                              onClick={() => loadDupesPage(res.token, (res.dupe_page || 1) - 1)}
                            >
                              Prev
                            </Button>
                            <span className="text-xs">
                              Page {res.dupe_page || 1} of {Math.ceil(res.dupe_total / 5)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={(res.dupe_page || 1) >= Math.ceil(res.dupe_total / 5) || res.dupe_loading}
                              onClick={() => loadDupesPage(res.token, (res.dupe_page || 1) + 1)}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                        <div className="text-[11px] text-muted-foreground">
                          Please confirm within about 30 minutes.
                        </div>
                      </div>
                    )}
                    {res.error && (
                      <div className="text-sm text-destructive">{res.error}</div>
                    )}
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        disabled={res.new_rows === 0 || res.confirming}
                        onClick={() => handleConfirm(res.token)}
                      >
                        {res.confirming ? "Uploading..." : "Insert Non-Dupes"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default UploadData;

