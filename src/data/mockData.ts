import { OrganizationRequest, Organization, UploadRecord, AdminUser, Announcement } from "@/types/organization";

export const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "New Data Upload Guidelines Released",
    content: "We've updated our data upload guidelines to ensure higher quality submissions. Please review the new requirements before uploading.",
    date: "2025-02-05",
    type: "info"
  },
  {
    id: "2",
    title: "System Maintenance Scheduled",
    content: "Scheduled maintenance on February 15th from 2:00 AM - 4:00 AM UTC. The platform will be temporarily unavailable.",
    date: "2025-02-03",
    type: "warning"
  },
  {
    id: "3",
    title: "New Countries Added",
    content: "We've expanded our coverage to include 15 additional countries in the Pacific region.",
    date: "2025-02-01",
    type: "success"
  }
];

export const mockOrganizationRequests: OrganizationRequest[] = [
  {
    id: "req-001",
    org_name: "Bangkok Air Quality Lab",
    org_type: "Research",
    data_domain: "Pollution Data",
    country: "Thailand",
    address_detail: "123 Sukhumvit Road, Bangkok 10110",
    official_email: "info@bangkokairlab.org",
    website: "https://bangkokairlab.org",
    contact_name: "Dr. Somchai Prasert",
    contact_email: "somchai@bangkokairlab.org",
    proof_files: ["registration_cert.pdf", "license.pdf"],
    declaration_checkbox: true,
    status: "PENDING",
    submitted_at: "2025-02-06T10:30:00Z"
  },
  {
    id: "req-002",
    org_name: "Manila General Hospital",
    org_type: "Hospital",
    data_domain: "Health Data",
    country: "Philippines",
    address_detail: "456 Taft Avenue, Manila",
    official_email: "research@manilageneral.ph",
    website: "https://manilageneral.ph",
    contact_name: "Dr. Maria Santos",
    contact_email: "maria.santos@manilageneral.ph",
    proof_files: ["hospital_license.pdf"],
    declaration_checkbox: true,
    status: "PENDING",
    submitted_at: "2025-02-05T08:15:00Z"
  }
];

export const mockOrganizations: Organization[] = [
  {
    id: "org-001",
    org_name: "Singapore Environmental Agency",
    org_type: "Government",
    data_domain: "Pollution Data",
    country: "Singapore",
    address_detail: "40 Scotts Road, Singapore 228231",
    official_email: "data@sea.gov.sg",
    website: "https://sea.gov.sg",
    contact_name: "Mr. Lee Wei Ming",
    contact_email: "weiming.lee@sea.gov.sg",
    password: "demo123",
    created_at: "2024-12-01T00:00:00Z"
  },
  {
    id: "org-002",
    org_name: "Tokyo Medical Research Center",
    org_type: "Research",
    data_domain: "Health Data",
    country: "Japan",
    address_detail: "2-1-1 Nihonbashi, Chuo-ku, Tokyo",
    official_email: "research@tmrc.jp",
    website: "https://tmrc.jp",
    contact_name: "Dr. Yuki Tanaka",
    contact_email: "yuki.tanaka@tmrc.jp",
    password: "demo123",
    created_at: "2024-11-15T00:00:00Z"
  }
];

export const mockUploadRecords: UploadRecord[] = [
  {
    id: "upload-001",
    org_id: "org-001",
    file_name: "singapore_pm25_jan2025.csv",
    file_type: "pollution",
    file_size: "2.4 MB",
    uploaded_at: "2025-02-01T14:30:00Z",
    status: "completed"
  },
  {
    id: "upload-002",
    org_id: "org-001",
    file_name: "singapore_aqi_feb2025.csv",
    file_type: "pollution",
    file_size: "1.8 MB",
    uploaded_at: "2025-02-05T09:15:00Z",
    status: "completed"
  },
  {
    id: "upload-003",
    org_id: "org-002",
    file_name: "tokyo_respiratory_q4_2024.xlsx",
    file_type: "health",
    file_size: "5.2 MB",
    uploaded_at: "2025-01-28T11:00:00Z",
    status: "completed"
  }
];

export const mockAdminUsers: AdminUser[] = [
  {
    id: "admin-001",
    email: "admin@airhealth.org",
    name: "System Administrator",
    role: "admin",
    created_at: "2024-01-01T00:00:00Z"
  }
];

// Demo credentials
export const demoCredentials = {
  admin: {
    email: "admin@airhealth.org",
    password: "admin123"
  },
  organization: {
    email: "data@sea.gov.sg",
    password: "demo123"
  }
};
