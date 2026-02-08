import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Organization } from "@/types/organization";
import { Account, UserRole } from "@/types/auth";
import { getAuthMe, getMyOrg, loginUser } from "@/lib/API";

interface AuthState {
  isAuthenticated: boolean;
  user: Organization | Account | null;
  role: UserRole;
  account: Account | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateOrganizationProfile: (updates: Partial<Organization>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "airhealth_auth";
const ACCESS_TOKEN_KEY = "access_token";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    role: "guest",
    account: null,
  });

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return;

    const hydrate = async () => {
      try {
        const account = await getAuthMe();
        let role: UserRole = account.role === "ADMIN" ? "admin" : "organization";
        let user: Organization | Account = account;

        if (role === "organization") {
          try {
            const org = await getMyOrg();
            user = org;
          } catch {
            user = account;
          }
        }

        const state: AuthState = {
          isAuthenticated: true,
          user,
          role,
          account,
        };
        persistAuthState(state);
      } catch {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    };

    hydrate();
  }, []);

  const persistAuthState = (state: AuthState) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
    setAuthState(state);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const tokenResp = await loginUser({ email, password });
      if (!tokenResp?.access_token) {
        return { success: false, error: "Login failed" };
      }
      localStorage.setItem(ACCESS_TOKEN_KEY, tokenResp.access_token);

      const account = await getAuthMe();
      let role: UserRole = account.role === "ADMIN" ? "admin" : "organization";
      let user: Organization | Account = account;

      if (role === "organization") {
        try {
          const org = await getMyOrg();
          user = org;
        } catch {
          user = account;
        }
      }

      const newState: AuthState = {
        isAuthenticated: true,
        user,
        role,
        account,
      };
      persistAuthState(newState);
      return { success: true };
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || "Invalid email or password";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthState({
      isAuthenticated: false,
      user: null,
      role: "guest",
      account: null,
    });
  };

  const updateOrganizationProfile = (updates: Partial<Organization>) => {
    if (authState.role === "organization" && authState.user) {
      const updatedUser = { ...authState.user, ...updates } as Organization;
      const newState: AuthState = {
        ...authState,
        user: updatedUser,
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
