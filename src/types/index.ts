// ============ VISA TYPES ============
export interface VisaType {
  id: string;
  purpose: string;
  validityDays: number;
  maxStay: number;
  entries: "single" | "double" | "multiple";
  label: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============ FORM BUILDER TYPES ============
export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "file"
  | "email"
  | "phone"
  | "number";

export interface FieldOption {
  label: string;
  value: string;
}

export interface ConditionalVisibility {
  fieldId: string;
  operator: "equals" | "not_equals" | "contains";
  value: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  options?: FieldOption[];
  validation: {
    required: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    regex?: string;
    customError?: string;
  };
  conditionalVisibility?: ConditionalVisibility;
  order: number;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  order: number;
}

export interface ApplicationTemplate {
  id: string;
  name: string;
  description?: string;
  sections: FormSection[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============ TEMPLATE BINDING ============
export interface NationalityBinding {
  nationalityCode: string;
  governmentFee: number;
  serviceFee: number;
  currency: string;
  expeditedFee?: number;
  expeditedEnabled: boolean;
}

export interface TemplateBinding {
  id: string;
  destinationCode: string;
  visaTypeId: string;
  templateId: string;
  nationalities: NationalityBinding[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============ COUNTRY PAGE ============
export interface CountryPageSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface CountryPage {
  id: string;
  countryCode: string;
  slug: string;
  title: string;
  heroImage?: string;
  overview?: string;
  requirements?: string;
  processingTime?: string;
  sections: CountryPageSection[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============ APPLICATION ============
export type ApplicationStatus =
  | "draft"
  | "unpaid"
  | "submitted"
  | "in_review"
  | "need_docs"
  | "approved"
  | "rejected"
  | "ready_to_download";

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  timestamp: string;
  note?: string;
  changedBy?: string;
}

export interface ApplicantDocument {
  id: string;
  fieldId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  blobUrl?: string;
  indexedDbKey?: string;
}

export interface Applicant {
  id: string;
  applicationId: string;
  isMainApplicant: boolean;
  email: string;
  phone?: string;
  formData: Record<string, unknown>;
  documents: ApplicantDocument[] | Record<string, string>; // Array for service, Record for store
  status: ApplicationStatus;
  statusHistory: StatusHistoryEntry[];
  applicationCode?: string;
  resultFile?: {
    fileName: string;
    blobUrl?: string;
    indexedDbKey?: string;
  };
  resultFileId?: string;
  requiredDocuments?: string[];
  additionalDocsRequested?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  nationalityCode: string;
  destinationCode: string;
  visaTypeId: string;
  templateId: string;
  applicants: Applicant[];
  totalFee: number;
  currency: string;
  expedited: boolean;
  paymentStatus: "pending" | "paid" | "expired";
  paymentDeadline?: string;
  resumeToken: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
}

// ============ USER ============
export interface User {
  id: string;
  email: string;
  applicationIds: string[];
  createdAt: string;
  lastLogin?: string;
}

// ============ ADMIN USER ============
export type AdminRole = "super_admin" | "admin" | "operator";

export interface AdminUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

// ============ PAYMENT PAGE ============
export interface PaymentPageField {
  id: string;
  type?: FieldType;
  label: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  order?: number;
}

export interface PaymentPageSection {
  id: string;
  title: string;
  description?: string;
  fields: PaymentPageField[];
  order: number;
}

export interface PaymentPageConfig {
  id: string;
  sections: PaymentPageSection[];
  updatedAt: string;
}

// ============ EMAIL TEMPLATE ============
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============ SETTINGS ============
export interface AppSettings {
  siteName: string;
  supportEmail: string;
  defaultCurrency: string;
  paymentTimeoutHours: number;
  maintenanceMode: boolean;
}
