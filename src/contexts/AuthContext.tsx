import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Organization, AdminUser } from "@/types/organization";
import { mockOrganizations, mockAdminUsers, demoCredentials } from "@/data/mockData";

type UserRole = "guest" | "organization" | "admin";

interface AuthState {
  isAuthenticated: boolean;
  user: Organization | AdminUser | null;
  role: UserRole;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateOrganizationProfile: (updates: Partial<Organization>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "airhealth_auth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    role: "guest"
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAuthState(parsed);
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, []);

  // Persist auth state to localStorage
  const persistAuthState = (state: AuthState) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
    setAuthState(state);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Check admin credentials
    if (email === demoCredentials.admin.email && password === demoCredentials.admin.password) {
      const admin = mockAdminUsers.find(a => a.email === email);
      if (admin) {
        const newState: AuthState = {
          isAuthenticated: true,
          user: admin,
          role: "admin"
        };
        persistAuthState(newState);
        return { success: true };
      }
    }

    // Check organization credentials
    const org = mockOrganizations.find(o => o.official_email === email && o.password === password);
    if (org) {
      const newState: AuthState = {
        isAuthenticated: true,
        user: org,
        role: "organization"
      };
      persistAuthState(newState);
      return { success: true };
    }

    return { success: false, error: "Invalid email or password" };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthState({
      isAuthenticated: false,
      user: null,
      role: "guest"
    });
  };

  const updateOrganizationProfile = (updates: Partial<Organization>) => {
    if (authState.role === "organization" && authState.user) {
      const updatedUser = { ...authState.user, ...updates } as Organization;
      const newState: AuthState = {
        ...authState,
        user: updatedUser
      };
      persistAuthState(newState);
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, updateOrganizationProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
