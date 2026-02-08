export interface Account {
  account_id: number;
  email: string;
  role: "ADMIN" | "ORG";
  org_id?: number | null;
  is_active: boolean;
  created_at: string;
}

export type UserRole = "guest" | "admin" | "organization";
