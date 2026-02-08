import { storage, STORAGE_KEYS } from "@/lib/storage/localStorage";

interface IpApiResponse {
  country_code: string;
  country_name: string;
}

export const ipService = {
  async detectCountry(): Promise<string> {
    // First check localStorage for last selected nationality
    const lastNationality = storage.get<string>(STORAGE_KEYS.LAST_NATIONALITY, "");
    
    try {
      const response = await fetch("https://ipapi.co/json/", {
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch IP info");
      }
      
      const data: IpApiResponse = await response.json();
      
      // Save detected country
      if (data.country_code) {
        storage.set(STORAGE_KEYS.LAST_NATIONALITY, data.country_code);
        return data.country_code;
      }
      
      throw new Error("No country code in response");
    } catch (error) {
      console.warn("IP detection failed, using fallback:", error);
      
      // Return last saved nationality or default to Azerbaijan
      return lastNationality || "AZ";
    }
  },

  saveLastNationality(code: string): void {
    storage.set(STORAGE_KEYS.LAST_NATIONALITY, code);
  },

  getLastNationality(): string {
    return storage.get<string>(STORAGE_KEYS.LAST_NATIONALITY, "AZ");
  },
};
