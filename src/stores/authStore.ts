"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdminRole } from "@/types";

interface AdminSession {
  userId: string;
  email: string;
  name: string;
  role: AdminRole;
  loginAt: string;
}

interface AuthState {
  // Admin auth
  adminSession: AdminSession | null;
  setAdminSession: (session: AdminSession | null) => void;
  isAdminLoggedIn: () => boolean;
  hasPermission: (permission: string) => boolean;
  
  // User auth (public portal)
  userEmail: string | null;
  isUserVerified: boolean;
  setUserEmail: (email: string | null) => void;
  setUserVerified: (verified: boolean) => void;
  clearUserSession: () => void;
}

// Role permissions
const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: [
    "dashboard",
    "applications",
    "countries",
    "visa_types",
    "templates",
    "bindings",
    "payment_page",
    "email_templates",
    "users",
    "settings",
  ],
  admin: [
    "dashboard",
    "applications",
    "countries",
    "visa_types",
    "templates",
    "bindings",
    "payment_page",
    "email_templates",
  ],
  operator: [
    "dashboard",
    "applications",
  ],
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Admin
      adminSession: null,
      setAdminSession: (session) => set({ adminSession: session }),
      isAdminLoggedIn: () => get().adminSession !== null,
      hasPermission: (permission) => {
        const session = get().adminSession;
        if (!session) return false;
        return ROLE_PERMISSIONS[session.role]?.includes(permission) || false;
      },
      
      // User
      userEmail: null,
      isUserVerified: false,
      setUserEmail: (email) => set({ userEmail: email }),
      setUserVerified: (verified) => set({ isUserVerified: verified }),
      clearUserSession: () => set({ userEmail: null, isUserVerified: false }),
    }),
    {
      name: "evisa-auth-storage",
      partialize: (state) => ({
        adminSession: state.adminSession,
        userEmail: state.userEmail,
        isUserVerified: state.isUserVerified,
      }),
    }
  )
);
