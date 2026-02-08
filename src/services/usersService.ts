import { storage, STORAGE_KEYS } from "@/lib/storage/localStorage";
import { generateId } from "@/lib/utils/generators";
import type { User } from "@/types";

export const usersService = {
  getAll(): User[] {
    return storage.get<User[]>(STORAGE_KEYS.USERS, []);
  },

  getById(id: string): User | undefined {
    return this.getAll().find((u) => u.id === id);
  },

  getByEmail(email: string): User | undefined {
    return this.getAll().find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  create(email: string): User {
    const users = this.getAll();
    
    // Check if user already exists
    const existing = this.getByEmail(email);
    if (existing) return existing;
    
    const newUser: User = {
      id: generateId(),
      email: email.toLowerCase(),
      applicationIds: [],
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    storage.set(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  update(id: string, data: Partial<User>): User | null {
    const users = this.getAll();
    const index = users.findIndex((u) => u.id === id);
    
    if (index === -1) return null;
    
    users[index] = {
      ...users[index],
      ...data,
    };
    
    storage.set(STORAGE_KEYS.USERS, users);
    return users[index];
  },

  addApplicationToUser(email: string, applicationId: string): User {
    let user = this.getByEmail(email);
    
    if (!user) {
      user = this.create(email);
    }
    
    if (!user.applicationIds.includes(applicationId)) {
      user.applicationIds.push(applicationId);
      this.update(user.id, { applicationIds: user.applicationIds });
    }
    
    return user;
  },

  updateLastLogin(email: string): User | null {
    const user = this.getByEmail(email);
    if (!user) return null;
    
    return this.update(user.id, { lastLogin: new Date().toISOString() });
  },

  // Demo verification - only accepts "123456"
  verifyCode(code: string): boolean {
    return code === "123456";
  },
};
