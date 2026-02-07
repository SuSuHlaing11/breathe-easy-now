import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, X, FileText, CheckCircle2, Building2 } from "lucide-react";
import { countries, orgTypes, dataDomains } from "@/data/countries";
import { useToast } from "@/hooks/use-toast";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const formSchema = z.object({
  org_name: z.string().min(2, "Organization name must be at least 2 characters").max(100),
  org_type: z.enum(["Weather Station", "Hospital", "Research", "Government", "Other"]),
  data_domain: z.enum(["Health Data", "Pollution Data"]),
  country: z.string().min(1, "Please select a country"),
  address_detail: z.string().min(10, "Please provide a detailed address").max(500),
  official_email: z.string().email("Please enter a valid email address"),
  website: z.string().url("Please enter a valid URL").or(z.literal("")),
  contact_name: z.string().min(2, "Contact name must be at least 2 characters").max(100),
  contact_email: z.string().email("Please enter a valid contact email"),
  declaration_checkbox: z.boolean().refine(val => val === true, "You must agree to the declaration"),
});

type FormData = z.infer<typeof formSchema>;

const OrganizationRequestForm = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      org_name: "",
      org_type: undefined,
      data_domain: undefined,
      country: "",
      address_detail: "",
      official_email: "",
      website: "",
      contact_name: "",
      contact_email: "",
      declaration_checkbox: false,
    },
  });

  const watchedDeclaration = watch("declaration_checkbox");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > MAX_FILES) {
      toast({
        title: "Too many files",
        description: `Maximum ${MAX_FILES} files allowed`,
        variant: "destructive",
      });
      return;
    }

    const validFiles = selectedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const requestData = {
      ...data,
      proof_files: files.map(f => f.name),
      status: "PENDING",
      submitted_at: new Date().toISOString(),
    };

    // Store in localStorage for demo
    const existingRequests = JSON.parse(localStorage.getItem("org_requests") || "[]");
    existingRequests.push({ id: `req-${Date.now()}`, ...requestData });
    localStorage.setItem("org_requests", JSON.stringify(existingRequests));

    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast({
      title: "Request Submitted",
      description: "Your organization request has been submitted for review.",
    });
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6"
        >
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </motion.div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Request Submitted!</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Thank you for your submission. Our team will review your request and contact you at your official email within 3-5 business days.
        </p>
      </motion.div>
    );
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="text-center pb-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4"
        >
          <Building2 className="h-8 w-8 text-primary" />
        </motion.div>
        <CardTitle className="text-2xl">Organization Registration</CardTitle>
        <CardDescription>
          Submit your organization details to gain access to our data platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Organization Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground border-b pb-2">Organization Details</h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="org_name">Organization Name *</Label>
                <Input
                  id="org_name"
                  placeholder="Enter organization name"
                  {...register("org_name")}
                  className={errors.org_name ? "border-destructive" : ""}
                />
                {errors.org_name && (
                  <p className="text-sm text-destructive">{errors.org_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Organization Type *</Label>
                <Select onValueChange={(value) => setValue("org_type", value as any)}>
                  <SelectTrigger className={errors.org_type ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.org_type && (
                  <p className="text-sm text-destructive">{errors.org_type.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data Domain *</Label>
              <RadioGroup
                onValueChange={(value) => setValue("data_domain", value as any)}
                className="flex gap-6"
              >
                {dataDomains.map(domain => (
                  <div key={domain} className="flex items-center space-x-2">
                    <RadioGroupItem value={domain} id={domain} />
                    <Label htmlFor={domain} className="cursor-pointer">{domain}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.data_domain && (
                <p className="text-sm text-destructive">{errors.data_domain.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country *</Label>
                <Select onValueChange={(value) => setValue("country", value)}>
                  <SelectTrigger className={errors.country ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && (
                  <p className="text-sm text-destructive">{errors.country.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.org"
                  {...register("website")}
                  className={errors.website ? "border-destructive" : ""}
                />
                {errors.website && (
                  <p className="text-sm text-destructive">{errors.website.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_detail">Address *</Label>
              <Textarea
                id="address_detail"
                placeholder="Full address including city, state/province, and postal code"
                rows={3}
                {...register("address_detail")}
                className={errors.address_detail ? "border-destructive" : ""}
              />
              {errors.address_detail && (
                <p className="text-sm text-destructive">{errors.address_detail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="official_email">Official Email *</Label>
              <Input
                id="official_email"
                type="email"
                placeholder="official@organization.org"
                {...register("official_email")}
                className={errors.official_email ? "border-destructive" : ""}
              />
              {errors.official_email && (
                <p className="text-sm text-destructive">{errors.official_email.message}</p>
              )}
            </div>
          </div>

          {/* Contact Person */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground border-b pb-2">Contact Person</h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Name *</Label>
                <Input
                  id="contact_name"
                  placeholder="Full name"
                  {...register("contact_name")}
                  className={errors.contact_name ? "border-destructive" : ""}
                />
                {errors.contact_name && (
                  <p className="text-sm text-destructive">{errors.contact_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  placeholder="contact@organization.org"
                  {...register("contact_email")}
                  className={errors.contact_email ? "border-destructive" : ""}
                />
                {errors.contact_email && (
                  <p className="text-sm text-destructive">{errors.contact_email.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Proof Documents */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground border-b pb-2">
              Proof Documents <span className="font-normal text-muted-foreground">(Max {MAX_FILES} files)</span>
            </h4>
            
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
                id="proof_files"
                disabled={files.length >= MAX_FILES}
              />
              <label htmlFor="proof_files" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, DOCX, JPG, PNG (max 10MB each)
                </p>
              </label>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Declaration */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-secondary/30 rounded-lg">
              <Checkbox
                id="declaration"
                checked={watchedDeclaration}
                onCheckedChange={(checked) => setValue("declaration_checkbox", checked as boolean)}
                className={errors.declaration_checkbox ? "border-destructive" : ""}
              />
              <div className="space-y-1">
                <Label htmlFor="declaration" className="cursor-pointer leading-relaxed">
                  I declare that all information provided is accurate and complete. I understand that providing false information may result in rejection of this application and potential legal consequences. *
                </Label>
                {errors.declaration_checkbox && (
                  <p className="text-sm text-destructive">{errors.declaration_checkbox.message}</p>
                )}
              </div>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </motion.div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrganizationRequestForm;
