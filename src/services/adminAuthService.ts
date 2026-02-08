import { storage, STORAGE_KEYS } from "@/lib/storage/localStorage";
import { generateId } from "@/lib/utils/generators";
import type { AdminUser, AdminRole } from "@/types";

// Default admin users for demo
const DEFAULT_ADMIN_USERS: Omit<AdminUser, "id" | "createdAt">[] = [
  {
    email: "super@visa.com",
    password: "super123",
    name: "Super Admin",
    role: "super_admin",
    isActive: true,
  },
  {
    email: "admin@visa.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    isActive: true,
  },
  {
    email: "operator@visa.com",
    password: "operator123",
    name: "Operator User",
    role: "operator",
    isActive: true,
  },
];

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

export const adminAuthService = {
  initializeDefaultUsers(): void {
    const users = this.getAll();
    if (users.length === 0) {
      DEFAULT_ADMIN_USERS.forEach((user) => {
        this.create(user);
      });
    }
  },

  getAll(): AdminUser[] {
    return storage.get<AdminUser[]>(STORAGE_KEYS.ADMIN_USERS, []);
  },

  getById(id: string): AdminUser | undefined {
    return this.getAll().find((u) => u.id === id);
  },

  getByEmail(email: string): AdminUser | undefined {
    return this.getAll().find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  create(data: Omit<AdminUser, "id" | "createdAt">): AdminUser {
    const users = this.getAll();
    
    const newUser: AdminUser = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    storage.set(STORAGE_KEYS.ADMIN_USERS, users);
    return newUser;
  },

  update(id: string, data: Partial<AdminUser>): AdminUser | null {
    const users = this.getAll();
    const index = users.findIndex((u) => u.id === id);
    
    if (index === -1) return null;
    
    users[index] = {
      ...users[index],
      ...data,
    };
    
    storage.set(STORAGE_KEYS.ADMIN_USERS, users);
    return users[index];
  },

  delete(id: string): boolean {
    const users = this.getAll();
    const filtered = users.filter((u) => u.id !== id);
    
    if (filtered.length === users.length) return false;
    
    storage.set(STORAGE_KEYS.ADMIN_USERS, filtered);
    return true;
  },

  login(email: string, password: string): AdminUser | null {
    const user = this.getByEmail(email);
    
    if (!user || user.password !== password || !user.isActive) {
      return null;
    }
    
    this.update(user.id, { lastLogin: new Date().toISOString() });
    
    // Store session
    storage.set(STORAGE_KEYS.ADMIN_SESSION, {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      loginAt: new Date().toISOString(),
    });
    
    return user;
  },

  logout(): void {
    storage.remove(STORAGE_KEYS.ADMIN_SESSION);
  },

  getCurrentSession(): { userId: string; email: string; name: string; role: AdminRole; loginAt: string } | null {
    return storage.get(STORAGE_KEYS.ADMIN_SESSION, null);
  },

  isLoggedIn(): boolean {
    return this.getCurrentSession() !== null;
  },

  hasPermission(permission: string): boolean {
    const session = this.getCurrentSession();
    if (!session) return false;
    
    return ROLE_PERMISSIONS[session.role]?.includes(permission) || false;
  },

  getPermissions(): string[] {
    const session = this.getCurrentSession();
    if (!session) return [];
    
    return ROLE_PERMISSIONS[session.role] || [];
  },

  getRoleLabel(role: AdminRole): string {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "operator":
        return "Operator";
      default:
        return role;
    }
  },
};
