// localStorage wrapper with versioning and type safety

const STORAGE_VERSION = "1.0";
const STORAGE_PREFIX = "evisa_";

interface StorageData<T> {
  version: string;
  data: T;
  updatedAt: string;
}

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      if (!item) return defaultValue;
      
      const parsed: StorageData<T> = JSON.parse(item);
      if (parsed.version !== STORAGE_VERSION) {
        // Version mismatch - could migrate here, for now return default
        return defaultValue;
      }
      return parsed.data;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, data: T): void {
    if (typeof window === "undefined") return;
    
    const storageData: StorageData<T> = {
      version: STORAGE_VERSION,
      data,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(storageData));
  },

  remove(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_PREFIX + key);
  },

  clear(): void {
    if (typeof window === "undefined") return;
    
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  },
};

// Storage keys
export const STORAGE_KEYS = {
  VISA_TYPES: "visa_types",
  TEMPLATES: "templates",
  BINDINGS: "bindings",
  COUNTRY_PAGES: "country_pages",
  APPLICATIONS: "applications",
  USERS: "users",
  ADMIN_USERS: "admin_users",
  PAYMENT_PAGE_CONFIG: "payment_page_config",
  EMAIL_TEMPLATES: "email_templates",
  APP_SETTINGS: "app_settings",
  LAST_NATIONALITY: "last_nationality",
  ADMIN_SESSION: "admin_session",
} as const;
