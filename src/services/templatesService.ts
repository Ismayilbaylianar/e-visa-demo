import { storage, STORAGE_KEYS } from "@/lib/storage/localStorage";
import { generateId } from "@/lib/utils/generators";
import type { ApplicationTemplate, FormSection, FormField } from "@/types";

export const templatesService = {
  getAll(): ApplicationTemplate[] {
    return storage.get<ApplicationTemplate[]>(STORAGE_KEYS.TEMPLATES, []);
  },

  getActive(): ApplicationTemplate[] {
    return this.getAll().filter((t) => t.isActive);
  },

  getById(id: string): ApplicationTemplate | undefined {
    return this.getAll().find((t) => t.id === id);
  },

  create(data: Omit<ApplicationTemplate, "id" | "createdAt" | "updatedAt">): ApplicationTemplate {
    const templates = this.getAll();
    
    const newTemplate: ApplicationTemplate = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    templates.push(newTemplate);
    storage.set(STORAGE_KEYS.TEMPLATES, templates);
    return newTemplate;
  },

  update(id: string, data: Partial<ApplicationTemplate>): ApplicationTemplate | null {
    const templates = this.getAll();
    const index = templates.findIndex((t) => t.id === id);
    
    if (index === -1) return null;
    
    templates[index] = {
      ...templates[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    storage.set(STORAGE_KEYS.TEMPLATES, templates);
    return templates[index];
  },

  delete(id: string): boolean {
    const templates = this.getAll();
    const filtered = templates.filter((t) => t.id !== id);
    
    if (filtered.length === templates.length) return false;
    
    storage.set(STORAGE_KEYS.TEMPLATES, filtered);
    return true;
  },

  // Section operations
  addSection(templateId: string, section: Omit<FormSection, "id">): ApplicationTemplate | null {
    const template = this.getById(templateId);
    if (!template) return null;

    const newSection: FormSection = {
      ...section,
      id: generateId(),
    };

    template.sections.push(newSection);
    template.sections.sort((a, b) => a.order - b.order);
    return this.update(templateId, { sections: template.sections });
  },

  updateSection(templateId: string, sectionId: string, data: Partial<FormSection>): ApplicationTemplate | null {
    const template = this.getById(templateId);
    if (!template) return null;

    const sectionIndex = template.sections.findIndex((s) => s.id === sectionId);
    if (sectionIndex === -1) return null;

    template.sections[sectionIndex] = { ...template.sections[sectionIndex], ...data };
    template.sections.sort((a, b) => a.order - b.order);
    return this.update(templateId, { sections: template.sections });
  },

  deleteSection(templateId: string, sectionId: string): ApplicationTemplate | null {
    const template = this.getById(templateId);
    if (!template) return null;

    template.sections = template.sections.filter((s) => s.id !== sectionId);
    return this.update(templateId, { sections: template.sections });
  },

  // Field operations
  addField(templateId: string, sectionId: string, field: Omit<FormField, "id">): ApplicationTemplate | null {
    const template = this.getById(templateId);
    if (!template) return null;

    const section = template.sections.find((s) => s.id === sectionId);
    if (!section) return null;

    const newField: FormField = {
      ...field,
      id: generateId(),
    };

    section.fields.push(newField);
    section.fields.sort((a, b) => a.order - b.order);
    return this.update(templateId, { sections: template.sections });
  },

  updateField(templateId: string, sectionId: string, fieldId: string, data: Partial<FormField>): ApplicationTemplate | null {
    const template = this.getById(templateId);
    if (!template) return null;

    const section = template.sections.find((s) => s.id === sectionId);
    if (!section) return null;

    const fieldIndex = section.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1) return null;

    section.fields[fieldIndex] = { ...section.fields[fieldIndex], ...data };
    section.fields.sort((a, b) => a.order - b.order);
    return this.update(templateId, { sections: template.sections });
  },

  deleteField(templateId: string, sectionId: string, fieldId: string): ApplicationTemplate | null {
    const template = this.getById(templateId);
    if (!template) return null;

    const section = template.sections.find((s) => s.id === sectionId);
    if (!section) return null;

    section.fields = section.fields.filter((f) => f.id !== fieldId);
    return this.update(templateId, { sections: template.sections });
  },

  // Duplicate template
  duplicate(id: string): ApplicationTemplate | null {
    const template = this.getById(id);
    if (!template) return null;

    const duplicated = this.create({
      ...template,
      name: `${template.name} (Copy)`,
      isActive: false,
      sections: template.sections.map((s) => ({
        ...s,
        id: generateId(),
        fields: s.fields.map((f) => ({ ...f, id: generateId() })),
      })),
    });

    return duplicated;
  },
};
