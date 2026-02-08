import { storage, STORAGE_KEYS } from "@/lib/storage/localStorage";
import { generateId } from "@/lib/utils/generators";
import type { PaymentPageConfig, PaymentPageSection, PaymentPageField } from "@/types";

const DEFAULT_CONFIG: PaymentPageConfig = {
  id: "default",
  sections: [],
  updatedAt: new Date().toISOString(),
};

export const paymentPageService = {
  getConfig(): PaymentPageConfig {
    return storage.get<PaymentPageConfig>(STORAGE_KEYS.PAYMENT_PAGE_CONFIG, DEFAULT_CONFIG);
  },

  updateConfig(data: Partial<PaymentPageConfig>): PaymentPageConfig {
    const config = this.getConfig();
    const updated: PaymentPageConfig = {
      ...config,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    storage.set(STORAGE_KEYS.PAYMENT_PAGE_CONFIG, updated);
    return updated;
  },

  addSection(section: Omit<PaymentPageSection, "id">): PaymentPageConfig {
    const config = this.getConfig();
    const newSection: PaymentPageSection = {
      ...section,
      id: generateId(),
    };
    config.sections.push(newSection);
    config.sections.sort((a, b) => a.order - b.order);
    return this.updateConfig({ sections: config.sections });
  },

  updateSection(sectionId: string, data: Partial<PaymentPageSection>): PaymentPageConfig {
    const config = this.getConfig();
    const index = config.sections.findIndex((s) => s.id === sectionId);
    if (index === -1) return config;

    config.sections[index] = { ...config.sections[index], ...data };
    config.sections.sort((a, b) => a.order - b.order);
    return this.updateConfig({ sections: config.sections });
  },

  deleteSection(sectionId: string): PaymentPageConfig {
    const config = this.getConfig();
    config.sections = config.sections.filter((s) => s.id !== sectionId);
    return this.updateConfig({ sections: config.sections });
  },

  addField(sectionId: string, field: Omit<PaymentPageField, "id">): PaymentPageConfig {
    const config = this.getConfig();
    const section = config.sections.find((s) => s.id === sectionId);
    if (!section) return config;

    const newField: PaymentPageField = {
      ...field,
      id: generateId(),
    };
    section.fields.push(newField);
    section.fields.sort((a, b) => (a.order || 0) - (b.order || 0));
    return this.updateConfig({ sections: config.sections });
  },

  updateField(sectionId: string, fieldId: string, data: Partial<PaymentPageField>): PaymentPageConfig {
    const config = this.getConfig();
    const section = config.sections.find((s) => s.id === sectionId);
    if (!section) return config;

    const fieldIndex = section.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1) return config;

    section.fields[fieldIndex] = { ...section.fields[fieldIndex], ...data };
    section.fields.sort((a, b) => (a.order || 0) - (b.order || 0));
    return this.updateConfig({ sections: config.sections });
  },

  deleteField(sectionId: string, fieldId: string): PaymentPageConfig {
    const config = this.getConfig();
    const section = config.sections.find((s) => s.id === sectionId);
    if (!section) return config;

    section.fields = section.fields.filter((f) => f.id !== fieldId);
    return this.updateConfig({ sections: config.sections });
  },

  // Get only sections/fields that have content (for public display)
  getPublicConfig(): PaymentPageConfig {
    const config = this.getConfig();
    return {
      ...config,
      sections: config.sections
        .filter((s) => s.title && s.fields.length > 0)
        .map((s) => ({
          ...s,
          fields: s.fields.filter((f) => f.label),
        })),
    };
  },
};
