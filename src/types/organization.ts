import { OrgType, DataDomain } from "@/data/countries";

export type OrgTypeEnum =
  | "WEATHER_STATION"
  | "HOSPITAL"
  | "RESEARCH_INSTITUTION"
  | "GOVERNMENT"
  | "OTHER";

export type DataDomainEnum = "HEALTH" | "POLLUTION";

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

export interface OrgApplication {
  application_id: number;
  org_name: string;
  org_type: string;
  data_domain: string;
  country: string;
  address_detail: string;
  official_email: string;
  website?: string | null;
  contact_name: string;
  contact_email: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  admin_note?: string | null;
  submitted_at: string;
  reviewed_at?: string | null;
}

export interface Organization {
  org_id: number;
  org_name: string;
  org_type: OrgTypeEnum;
  data_domain: DataDomainEnum;
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
  org_id: number;
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
