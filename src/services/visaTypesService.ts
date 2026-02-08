import { storage, STORAGE_KEYS } from "@/lib/storage/localStorage";
import { generateId } from "@/lib/utils/generators";
import type { VisaType } from "@/types";

export const visaTypesService = {
  getAll(): VisaType[] {
    return storage.get<VisaType[]>(STORAGE_KEYS.VISA_TYPES, []);
  },

  getActive(): VisaType[] {
    return this.getAll().filter((v) => v.isActive);
  },

  getById(id: string): VisaType | undefined {
    return this.getAll().find((v) => v.id === id);
  },

  create(data: Omit<VisaType, "id" | "createdAt" | "updatedAt">): VisaType {
    const visaTypes = this.getAll();
    
    const newVisaType: VisaType = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    visaTypes.push(newVisaType);
    storage.set(STORAGE_KEYS.VISA_TYPES, visaTypes);
    return newVisaType;
  },

  update(id: string, data: Partial<VisaType>): VisaType | null {
    const visaTypes = this.getAll();
    const index = visaTypes.findIndex((v) => v.id === id);
    
    if (index === -1) return null;
    
    visaTypes[index] = {
      ...visaTypes[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    storage.set(STORAGE_KEYS.VISA_TYPES, visaTypes);
    return visaTypes[index];
  },

  delete(id: string): boolean {
    const visaTypes = this.getAll();
    const filtered = visaTypes.filter((v) => v.id !== id);
    
    if (filtered.length === visaTypes.length) return false;
    
    storage.set(STORAGE_KEYS.VISA_TYPES, filtered);
    return true;
  },

  getLabel(visaType: VisaType): string {
    const entriesLabel = visaType.entries === "single" 
      ? "Single Entry" 
      : visaType.entries === "double" 
        ? "Double Entry" 
        : "Multiple Entry";
    return `${visaType.purpose} - ${entriesLabel} - ${visaType.maxStay} days`;
  },
};
