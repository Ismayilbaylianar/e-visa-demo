import { az, type Translations } from "./az";
import { en } from "./en";

export const translations = {
  az,
  en,
};

export type Language = keyof typeof translations;

export function t(key: string, lang: Language = "az"): string {
  const keys = key.split(".");
  let value: unknown = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof value === "string" ? value : key;
}

// Export translations
export { az, en };
export type { Translations };
