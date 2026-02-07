import { OrgType, DataDomain } from "@/data/countries";

export interface OrganizationRequest {
  id: string;
  org_name: string;
  org_type: OrgType;
  data_domain: DataDomain;
  country: string;
  address_detail: string;
  official_email: string;
  website: string;
  contact_name: string;
  contact_email: string;
  proof_files: string[];
  declaration_checkbox: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submitted_at: string;
}

export interface Organization {
  id: string;
  org_name: string;
  org_type: OrgType;
  data_domain: DataDomain;
  country: string;
  address_detail: string;
  official_email: string;
  website: string;
  contact_name: string;
  contact_email: string;
  password?: string;
  created_at: string;
}

export interface UploadRecord {
  id: string;
  org_id: string;
  file_name: string;
  file_type: "health" | "pollution";
  file_size: string;
  uploaded_at: string;
  status: "processing" | "completed" | "failed";
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "organization";
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: "info" | "warning" | "success";
}
