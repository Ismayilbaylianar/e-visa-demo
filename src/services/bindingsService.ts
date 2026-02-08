import { storage, STORAGE_KEYS } from "@/lib/storage/localStorage";
import { generateId } from "@/lib/utils/generators";
import type { TemplateBinding, NationalityBinding } from "@/types";

export const bindingsService = {
  getAll(): TemplateBinding[] {
    return storage.get<TemplateBinding[]>(STORAGE_KEYS.BINDINGS, []);
  },

  getActive(): TemplateBinding[] {
    return this.getAll().filter((b) => b.isActive);
  },

  getById(id: string): TemplateBinding | undefined {
    return this.getAll().find((b) => b.id === id);
  },

  // Get binding by destination + visa type
  getByDestinationAndVisaType(destinationCode: string, visaTypeId: string): TemplateBinding | undefined {
    return this.getActive().find(
      (b) => b.destinationCode === destinationCode && b.visaTypeId === visaTypeId
    );
  },

  // Get all bindings for a destination
  getByDestination(destinationCode: string): TemplateBinding[] {
    return this.getActive().filter((b) => b.destinationCode === destinationCode);
  },

  // Get all unique destinations that have bindings
  getDestinationsWithBindings(): string[] {
    const bindings = this.getActive();
    return [...new Set(bindings.map((b) => b.destinationCode))];
  },

  // Get visa types available for a destination
  getVisaTypesForDestination(destinationCode: string): string[] {
    const bindings = this.getByDestination(destinationCode);
    return [...new Set(bindings.map((b) => b.visaTypeId))];
  },

  // Check if a nationality can apply for a specific destination + visa type
  canApply(nationalityCode: string, destinationCode: string, visaTypeId: string): boolean {
    const binding = this.getByDestinationAndVisaType(destinationCode, visaTypeId);
    if (!binding) return false;
    return binding.nationalities.some((n) => n.nationalityCode === nationalityCode);
  },

  // Get fees for a specific combination
  getFees(nationalityCode: string, destinationCode: string, visaTypeId: string): NationalityBinding | null {
    const binding = this.getByDestinationAndVisaType(destinationCode, visaTypeId);
    if (!binding) return null;
    return binding.nationalities.find((n) => n.nationalityCode === nationalityCode) || null;
  },

  // Get available destinations for a nationality
  getDestinationsForNationality(nationalityCode: string): string[] {
    const bindings = this.getActive();
    const destinations: string[] = [];
    
    bindings.forEach((b) => {
      if (b.nationalities.some((n) => n.nationalityCode === nationalityCode)) {
        if (!destinations.includes(b.destinationCode)) {
          destinations.push(b.destinationCode);
        }
      }
    });
    
    return destinations;
  },

  // Get visa types available for nationality + destination
  getVisaTypesForNationalityAndDestination(nationalityCode: string, destinationCode: string): string[] {
    const bindings = this.getByDestination(destinationCode);
    return bindings
      .filter((b) => b.nationalities.some((n) => n.nationalityCode === nationalityCode))
      .map((b) => b.visaTypeId);
  },

  create(data: Omit<TemplateBinding, "id" | "createdAt" | "updatedAt">): TemplateBinding {
    const bindings = this.getAll();
    
    const newBinding: TemplateBinding = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    bindings.push(newBinding);
    storage.set(STORAGE_KEYS.BINDINGS, bindings);
    return newBinding;
  },

  update(id: string, data: Partial<TemplateBinding>): TemplateBinding | null {
    const bindings = this.getAll();
    const index = bindings.findIndex((b) => b.id === id);
    
    if (index === -1) return null;
    
    bindings[index] = {
      ...bindings[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    storage.set(STORAGE_KEYS.BINDINGS, bindings);
    return bindings[index];
  },

  delete(id: string): boolean {
    const bindings = this.getAll();
    const filtered = bindings.filter((b) => b.id !== id);
    
    if (filtered.length === bindings.length) return false;
    
    storage.set(STORAGE_KEYS.BINDINGS, filtered);
    return true;
  },

  // Add/update nationality binding
  setNationalityBinding(bindingId: string, nationalityBinding: NationalityBinding): TemplateBinding | null {
    const binding = this.getById(bindingId);
    if (!binding) return null;

    const existingIndex = binding.nationalities.findIndex(
      (n) => n.nationalityCode === nationalityBinding.nationalityCode
    );

    if (existingIndex >= 0) {
      binding.nationalities[existingIndex] = nationalityBinding;
    } else {
      binding.nationalities.push(nationalityBinding);
    }

    return this.update(bindingId, { nationalities: binding.nationalities });
  },

  // Remove nationality from binding
  removeNationalityBinding(bindingId: string, nationalityCode: string): TemplateBinding | null {
    const binding = this.getById(bindingId);
    if (!binding) return null;

    binding.nationalities = binding.nationalities.filter(
      (n) => n.nationalityCode !== nationalityCode
    );

    return this.update(bindingId, { nationalities: binding.nationalities });
  },
};
