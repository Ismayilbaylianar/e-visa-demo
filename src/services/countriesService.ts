import { UN_COUNTRIES, type Country } from "@/data/un_countries";
import { storage, STORAGE_KEYS } from "@/lib/storage/localStorage";
import { generateId, generateSlug } from "@/lib/utils/generators";
import type { CountryPage, CountryPageSection } from "@/types";

// Countries data (static from UN list)
export const countriesService = {
  getAll(): Country[] {
    return UN_COUNTRIES;
  },

  getByCode(code: string): Country | undefined {
    return UN_COUNTRIES.find(
      (c) => c.cca2 === code.toUpperCase() || c.cca3 === code.toUpperCase()
    );
  },

  search(query: string): Country[] {
    const q = query.toLowerCase();
    return UN_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.cca2.toLowerCase().includes(q) ||
        c.cca3.toLowerCase().includes(q)
    );
  },
};

// Country Pages (admin-editable content)
export const countryPagesService = {
  getAll(): CountryPage[] {
    return storage.get<CountryPage[]>(STORAGE_KEYS.COUNTRY_PAGES, []);
  },

  getById(id: string): CountryPage | undefined {
    const pages = this.getAll();
    return pages.find((p) => p.id === id);
  },

  getBySlug(slug: string): CountryPage | undefined {
    const pages = this.getAll();
    return pages.find((p) => p.slug === slug);
  },

  getByCountryCode(code: string): CountryPage | undefined {
    const pages = this.getAll();
    return pages.find((p) => p.countryCode === code);
  },

  getPublished(): CountryPage[] {
    return this.getAll().filter((p) => p.isPublished);
  },

  create(data: Omit<CountryPage, "id" | "createdAt" | "updatedAt" | "slug">): CountryPage {
    const pages = this.getAll();
    const country = countriesService.getByCode(data.countryCode);
    
    const newPage: CountryPage = {
      ...data,
      id: generateId(),
      slug: generateSlug(country?.name || data.title),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    pages.push(newPage);
    storage.set(STORAGE_KEYS.COUNTRY_PAGES, pages);
    return newPage;
  },

  update(id: string, data: Partial<CountryPage>): CountryPage | null {
    const pages = this.getAll();
    const index = pages.findIndex((p) => p.id === id);
    
    if (index === -1) return null;
    
    pages[index] = {
      ...pages[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    storage.set(STORAGE_KEYS.COUNTRY_PAGES, pages);
    return pages[index];
  },

  delete(id: string): boolean {
    const pages = this.getAll();
    const filtered = pages.filter((p) => p.id !== id);
    
    if (filtered.length === pages.length) return false;
    
    storage.set(STORAGE_KEYS.COUNTRY_PAGES, filtered);
    return true;
  },

  addSection(pageId: string, section: Omit<CountryPageSection, "id">): CountryPage | null {
    const page = this.getById(pageId);
    if (!page) return null;

    const newSection: CountryPageSection = {
      ...section,
      id: generateId(),
    };

    page.sections.push(newSection);
    return this.update(pageId, { sections: page.sections });
  },

  updateSection(pageId: string, sectionId: string, data: Partial<CountryPageSection>): CountryPage | null {
    const page = this.getById(pageId);
    if (!page) return null;

    const sectionIndex = page.sections.findIndex((s) => s.id === sectionId);
    if (sectionIndex === -1) return null;

    page.sections[sectionIndex] = { ...page.sections[sectionIndex], ...data };
    return this.update(pageId, { sections: page.sections });
  },

  deleteSection(pageId: string, sectionId: string): CountryPage | null {
    const page = this.getById(pageId);
    if (!page) return null;

    page.sections = page.sections.filter((s) => s.id !== sectionId);
    return this.update(pageId, { sections: page.sections });
  },
};
