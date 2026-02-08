"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { az } from "@/lib/i18n/az";
import { en } from "@/lib/i18n/en";

export type Language = "az" | "en";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof az;
}

const translations = { az, en };

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: "az",
      setLanguage: (lang: Language) => set({ language: lang }),
      get t() {
        return translations[get().language];
      },
    }),
    {
      name: "evisa-language",
    }
  )
);

// Helper hook to get translations
export function useTranslations() {
  const language = useLanguageStore((state) => state.language);
  return translations[language];
}
