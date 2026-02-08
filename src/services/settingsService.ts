import { storage, STORAGE_KEYS } from "@/lib/storage/localStorage";
import { fileStorage } from "@/lib/storage/db";
import type { AppSettings } from "@/types";

const DEFAULT_SETTINGS: AppSettings = {
  siteName: "E-Visa Portal",
  supportEmail: "support@evisa.example.com",
  defaultCurrency: "USD",
  paymentTimeoutHours: 3,
  maintenanceMode: false,
};

export const settingsService = {
  getSettings(): AppSettings {
    return storage.get<AppSettings>(STORAGE_KEYS.APP_SETTINGS, DEFAULT_SETTINGS);
  },

  updateSettings(data: Partial<AppSettings>): AppSettings {
    const settings = this.getSettings();
    const updated: AppSettings = {
      ...settings,
      ...data,
    };
    storage.set(STORAGE_KEYS.APP_SETTINGS, updated);
    return updated;
  },

  resetToDefaults(): AppSettings {
    storage.set(STORAGE_KEYS.APP_SETTINGS, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  },

  // Reset all demo data
  async resetAllData(): Promise<void> {
    // Clear localStorage
    storage.clear();
    
    // Clear IndexedDB files
    await fileStorage.clearAll();
    
    // Re-initialize defaults
    const { adminAuthService } = await import("./adminAuthService");
    const { emailTemplatesService } = await import("./emailTemplatesService");
    const { seedDemoData } = await import("./seedService");
    
    adminAuthService.initializeDefaultUsers();
    emailTemplatesService.initializeDefaults();
    await seedDemoData();
  },
};
