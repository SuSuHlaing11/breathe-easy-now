import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { countries, orgTypes, dataDomains } from "@/data/countries";

const adminSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const orgSchema = z.object({
  org_name: z.string().min(2, "Organization name is required"),
  org_type: z.enum(["Weather Station", "Hospital", "Research", "Government", "Other"]),
  data_domain: z.enum(["Health Data", "Pollution Data"]),
  country: z.string().min(1, "Country is required"),
  official_email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  address_detail: z.string().min(10, "Address is required"),
  contact_name: z.string().min(2, "Contact name is required"),
  contact_email: z.string().email("Invalid contact email"),
});

type AdminFormData = z.infer<typeof adminSchema>;
type OrgFormData = z.infer<typeof orgSchema>;

const AdminCreateUser = () => {
  const { toast } = useToast();
  const [userType, setUserType] = useState<"admin" | "organization">("organization");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const adminForm = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
  });

  const orgForm = useForm<OrgFormData>({
    resolver: zodResolver(orgSchema),
  });

  const handleAdminSubmit = async (data: AdminFormData) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newAdmin = {
      id: `admin-${Date.now()}`,
      ...data,
      role: "admin",
      created_at: new Date().toISOString(),
    };

    const existingAdmins = JSON.parse(localStorage.getItem("admin_users") || "[]");
    existingAdmins.push(newAdmin);
    localStorage.setItem("admin_users", JSON.stringify(existingAdmins));

    setIsSubmitting(false);
    setShowSuccess(true);
    adminForm.reset();

    toast({
      title: "Admin Created",
      description: `Admin account for ${data.name} has been created.`,
    });

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleOrgSubmit = async (data: OrgFormData) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newOrg = {
      id: `org-${Date.now()}`,
      ...data,
      website: "",
      created_at: new Date().toISOString(),
    };

    const existingOrgs = JSON.parse(localStorage.getItem("organizations") || "[]");
    existingOrgs.push(newOrg);
    localStorage.setItem("organizations", JSON.stringify(existingOrgs));

    setIsSubmitting(false);
    setShowSuccess(true);
    orgForm.reset();

    toast({
      title: "Organization Created",
      description: `Account for ${data.org_name} has been created.`,
    });

    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">Create User</h1>
        <p className="text-muted-foreground mb-6">
          Create new admin or organization accounts
        </p>

        {/* User Type Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User Type</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={userType}
              onValueChange={(value) => setUserType(value as "admin" | "organization")}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="organization" id="organization" />
                <Label htmlFor="organization" className="cursor-pointer">Organization</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="admin" />
                <Label htmlFor="admin" className="cursor-pointer">Admin</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Admin Form */}
        {userType === "admin" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  New Admin Account
                </CardTitle>
                <CardDescription>
                  Create a new administrator with full platform access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={adminForm.handleSubmit(handleAdminSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-name">Full Name</Label>
                    <Input
                      id="admin-name"
                      {...adminForm.register("name")}
                      className={adminForm.formState.errors.name ? "border-destructive" : ""}
                    />
                    {adminForm.formState.errors.name && (
                      <p className="text-sm text-destructive">{adminForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      {...adminForm.register("email")}
                      className={adminForm.formState.errors.email ? "border-destructive" : ""}
                    />
                    {adminForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{adminForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      {...adminForm.register("password")}
                      className={adminForm.formState.errors.password ? "border-destructive" : ""}
                    />
                    {adminForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{adminForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Admin"}
                    </Button>
                    {showSuccess && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-green-600"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm">Created!</span>
                      </motion.div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Organization Form */}
        {userType === "organization" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  New Organization Account
                </CardTitle>
                <CardDescription>
                  Create a new organization account with data upload access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={orgForm.handleSubmit(handleOrgSubmit)} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Organization Name</Label>
                      <Input
                        {...orgForm.register("org_name")}
                        className={orgForm.formState.errors.org_name ? "border-destructive" : ""}
                      />
                      {orgForm.formState.errors.org_name && (
                        <p className="text-sm text-destructive">{orgForm.formState.errors.org_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Organization Type</Label>
                      <Select onValueChange={(value) => orgForm.setValue("org_type", value as any)}>
                        <SelectTrigger className={orgForm.formState.errors.org_type ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {orgTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data Domain</Label>
                      <Select onValueChange={(value) => orgForm.setValue("data_domain", value as any)}>
                        <SelectTrigger className={orgForm.formState.errors.data_domain ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataDomains.map((domain) => (
                            <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Select onValueChange={(value) => orgForm.setValue("country", value)}>
                        <SelectTrigger className={orgForm.formState.errors.country ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Official Email</Label>
                      <Input
                        type="email"
                        {...orgForm.register("official_email")}
                        className={orgForm.formState.errors.official_email ? "border-destructive" : ""}
                      />
                      {orgForm.formState.errors.official_email && (
                        <p className="text-sm text-destructive">{orgForm.formState.errors.official_email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input
                        type="password"
                        {...orgForm.register("password")}
                        className={orgForm.formState.errors.password ? "border-destructive" : ""}
                      />
                      {orgForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{orgForm.formState.errors.password.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Textarea
                      rows={2}
                      {...orgForm.register("address_detail")}
                      className={orgForm.formState.errors.address_detail ? "border-destructive" : ""}
                    />
                    {orgForm.formState.errors.address_detail && (
                      <p className="text-sm text-destructive">{orgForm.formState.errors.address_detail.message}</p>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contact Name</Label>
                      <Input
                        {...orgForm.register("contact_name")}
                        className={orgForm.formState.errors.contact_name ? "border-destructive" : ""}
                      />
                      {orgForm.formState.errors.contact_name && (
                        <p className="text-sm text-destructive">{orgForm.formState.errors.contact_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Contact Email</Label>
                      <Input
                        type="email"
                        {...orgForm.register("contact_email")}
                        className={orgForm.formState.errors.contact_email ? "border-destructive" : ""}
                      />
                      {orgForm.formState.errors.contact_email && (
                        <p className="text-sm text-destructive">{orgForm.formState.errors.contact_email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Organization"}
                    </Button>
                    {showSuccess && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-green-600"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm">Created!</span>
                      </motion.div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminCreateUser;
