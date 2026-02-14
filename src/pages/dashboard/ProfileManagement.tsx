import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Building2, Mail, Globe, MapPin, User, CheckCircle2, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Organization } from "@/types/organization";
import { ORG_TYPE_LABELS, DATA_DOMAIN_LABELS } from "@/lib/enumMaps";
import { Link } from "react-router-dom";

const profileSchema = z.object({
  contact_name: z.string().min(2, "Contact name is required").max(100),
  contact_email: z.string().email("Invalid email address"),
  website: z.string().url("Invalid URL").or(z.literal("")),
  address_detail: z.string().min(10, "Address is required").max(500),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfileManagement = () => {
  const { user, updateOrganizationProfile } = useAuth();
  const org = user as Organization;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      contact_name: org?.contact_name || "",
      contact_email: org?.contact_email || "",
      website: org?.website || "",
      address_detail: org?.address_detail || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateOrganizationProfile(data);
    
    setIsSubmitting(false);
    setShowSuccess(true);
    
    toast({
      title: "Profile updated",
      description: "Your organization profile has been updated successfully.",
    });

    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (!org) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">Profile Management</h1>
        <p className="text-muted-foreground mb-6">
          View and update your organization information
        </p>

        {/* Organization Info Card (Read-only) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Information
            </CardTitle>
            <CardDescription>
              Contact an administrator to update these details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Organization Name</Label>
                <p className="font-medium">{org.org_name}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Organization Type</Label>
                <p className="font-medium">{ORG_TYPE_LABELS[org.org_type] || org.org_type}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Data Domain</Label>
                <p className="font-medium">{DATA_DOMAIN_LABELS[org.data_domain] || org.data_domain}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Country</Label>
                <p className="font-medium">{org.country}</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-muted-foreground text-xs">Official Email</Label>
                <p className="font-medium">{org.official_email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editable Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Update your contact details and address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link to="/dashboard/password">
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Link>
              </Button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Contact Name</Label>
                  <Input
                    id="contact_name"
                    {...register("contact_name")}
                    className={errors.contact_name ? "border-destructive" : ""}
                  />
                  {errors.contact_name && (
                    <p className="text-sm text-destructive">{errors.contact_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contact_email"
                      type="email"
                      className={`pl-9 ${errors.contact_email ? "border-destructive" : ""}`}
                      {...register("contact_email")}
                    />
                  </div>
                  {errors.contact_email && (
                    <p className="text-sm text-destructive">{errors.contact_email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://"
                    className={`pl-9 ${errors.website ? "border-destructive" : ""}`}
                    {...register("website")}
                  />
                </div>
                {errors.website && (
                  <p className="text-sm text-destructive">{errors.website.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_detail">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="address_detail"
                    rows={3}
                    className={`pl-9 ${errors.address_detail ? "border-destructive" : ""}`}
                    {...register("address_detail")}
                  />
                </div>
                {errors.address_detail && (
                  <p className="text-sm text-destructive">{errors.address_detail.message}</p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <Button type="submit" disabled={!isDirty || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <motion.div
                        className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>

                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-green-600"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">Saved!</span>
                  </motion.div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProfileManagement;
