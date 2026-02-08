import { storage, STORAGE_KEYS } from "@/lib/storage/localStorage";
import { generateId, generateApplicationCode, generateResumeToken } from "@/lib/utils/generators";
import { bindingsService } from "./bindingsService";
import type { Application, Applicant, ApplicationStatus, StatusHistoryEntry, ApplicantDocument } from "@/types";

export const applicationsService = {
  getAll(): Application[] {
    return storage.get<Application[]>(STORAGE_KEYS.APPLICATIONS, []);
  },

  getById(id: string): Application | undefined {
    return this.getAll().find((a) => a.id === id);
  },

  getByResumeToken(token: string): Application | undefined {
    return this.getAll().find((a) => a.resumeToken === token);
  },

  getByUserEmail(email: string): Application[] {
    return this.getAll().filter((a) => a.userEmail.toLowerCase() === email.toLowerCase());
  },

  getByApplicantCode(email: string, code: string): { application: Application; applicant: Applicant } | null {
    const applications = this.getAll();
    
    for (const app of applications) {
      const applicant = app.applicants.find(
        (a) => a.email.toLowerCase() === email.toLowerCase() && a.applicationCode === code
      );
      if (applicant) {
        return { application: app, applicant };
      }
    }
    
    return null;
  },

  create(data: {
    nationalityCode: string;
    destinationCode: string;
    visaTypeId: string;
    templateId: string;
    userEmail: string;
    expedited?: boolean;
  }): Application {
    const applications = this.getAll();
    const fees = bindingsService.getFees(data.nationalityCode, data.destinationCode, data.visaTypeId);
    
    const baseFee = fees ? fees.governmentFee + fees.serviceFee : 0;
    const expeditedFee = data.expedited && fees?.expeditedEnabled ? (fees.expeditedFee || 0) : 0;
    
    const newApplication: Application = {
      id: generateId(),
      nationalityCode: data.nationalityCode,
      destinationCode: data.destinationCode,
      visaTypeId: data.visaTypeId,
      templateId: data.templateId,
      applicants: [],
      totalFee: baseFee + expeditedFee,
      currency: fees?.currency || "USD",
      expedited: data.expedited || false,
      paymentStatus: "pending",
      resumeToken: generateResumeToken(),
      userEmail: data.userEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    applications.push(newApplication);
    storage.set(STORAGE_KEYS.APPLICATIONS, applications);
    return newApplication;
  },

  update(id: string, data: Partial<Application>): Application | null {
    const applications = this.getAll();
    const index = applications.findIndex((a) => a.id === id);
    
    if (index === -1) return null;
    
    applications[index] = {
      ...applications[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    storage.set(STORAGE_KEYS.APPLICATIONS, applications);
    return applications[index];
  },

  delete(id: string): boolean {
    const applications = this.getAll();
    const filtered = applications.filter((a) => a.id !== id);
    
    if (filtered.length === applications.length) return false;
    
    storage.set(STORAGE_KEYS.APPLICATIONS, filtered);
    return true;
  },

  // Applicant operations
  addApplicant(applicationId: string, data: {
    email: string;
    phone?: string;
    isMainApplicant?: boolean;
    formData?: Record<string, unknown>;
  }): Application | null {
    const application = this.getById(applicationId);
    if (!application) return null;

    const newApplicant: Applicant = {
      id: generateId(),
      applicationId,
      isMainApplicant: data.isMainApplicant || application.applicants.length === 0,
      email: data.email,
      phone: data.phone,
      formData: data.formData || {},
      documents: [],
      status: "draft",
      statusHistory: [{
        status: "draft",
        timestamp: new Date().toISOString(),
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    application.applicants.push(newApplicant);
    this.recalculateFees(application);
    return this.update(applicationId, { applicants: application.applicants, totalFee: application.totalFee });
  },

  updateApplicant(applicationId: string, applicantId: string, data: Partial<Applicant>): Application | null {
    const application = this.getById(applicationId);
    if (!application) return null;

    const applicantIndex = application.applicants.findIndex((a) => a.id === applicantId);
    if (applicantIndex === -1) return null;

    application.applicants[applicantIndex] = {
      ...application.applicants[applicantIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return this.update(applicationId, { applicants: application.applicants });
  },

  removeApplicant(applicationId: string, applicantId: string): Application | null {
    const application = this.getById(applicationId);
    if (!application) return null;

    application.applicants = application.applicants.filter((a) => a.id !== applicantId);
    
    // If removed main applicant, make first remaining one the main
    if (application.applicants.length > 0 && !application.applicants.some((a) => a.isMainApplicant)) {
      application.applicants[0].isMainApplicant = true;
    }

    this.recalculateFees(application);
    return this.update(applicationId, { applicants: application.applicants, totalFee: application.totalFee });
  },

  // Status operations
  updateApplicantStatus(applicationId: string, applicantId: string, status: ApplicationStatus, note?: string, changedBy?: string): Application | null {
    const application = this.getById(applicationId);
    if (!application) return null;

    const applicant = application.applicants.find((a) => a.id === applicantId);
    if (!applicant) return null;

    const historyEntry: StatusHistoryEntry = {
      status,
      timestamp: new Date().toISOString(),
      note,
      changedBy,
    };

    applicant.status = status;
    applicant.statusHistory.push(historyEntry);
    applicant.updatedAt = new Date().toISOString();

    return this.update(applicationId, { applicants: application.applicants });
  },

  // Document operations
  addDocument(applicationId: string, applicantId: string, document: Omit<ApplicantDocument, "id">): Application | null {
    const application = this.getById(applicationId);
    if (!application) return null;

    const applicant = application.applicants.find((a) => a.id === applicantId);
    if (!applicant) return null;

    const newDocument: ApplicantDocument = {
      ...document,
      id: generateId(),
    };

    if (Array.isArray(applicant.documents)) {
      applicant.documents.push(newDocument);
    }
    return this.update(applicationId, { applicants: application.applicants });
  },

  removeDocument(applicationId: string, applicantId: string, documentId: string): Application | null {
    const application = this.getById(applicationId);
    if (!application) return null;

    const applicant = application.applicants.find((a) => a.id === applicantId);
    if (!applicant) return null;

    if (Array.isArray(applicant.documents)) {
      applicant.documents = applicant.documents.filter((d) => d.id !== documentId);
    }
    return this.update(applicationId, { applicants: application.applicants });
  },

  // Payment operations
  setPaymentDeadline(applicationId: string): Application | null {
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 3);
    return this.update(applicationId, { paymentDeadline: deadline.toISOString() });
  },

  markAsPaid(applicationId: string): Application | null {
    const application = this.getById(applicationId);
    if (!application) return null;

    // Generate application codes for all applicants
    application.applicants.forEach((applicant) => {
      applicant.applicationCode = generateApplicationCode();
      applicant.status = "submitted";
      applicant.statusHistory.push({
        status: "submitted",
        timestamp: new Date().toISOString(),
        note: "Payment completed",
      });
    });

    return this.update(applicationId, {
      paymentStatus: "paid",
      applicants: application.applicants,
    });
  },

  checkExpiredPayments(): void {
    const applications = this.getAll();
    const now = new Date();
    let updated = false;

    applications.forEach((app) => {
      if (app.paymentStatus === "pending" && app.paymentDeadline) {
        if (new Date(app.paymentDeadline) < now) {
          app.paymentStatus = "expired";
          updated = true;
        }
      }
    });

    if (updated) {
      storage.set(STORAGE_KEYS.APPLICATIONS, applications);
    }
  },

  // Fee calculation
  recalculateFees(application: Application): void {
    const fees = bindingsService.getFees(
      application.nationalityCode,
      application.destinationCode,
      application.visaTypeId
    );

    if (!fees) {
      application.totalFee = 0;
      return;
    }

    const applicantCount = application.applicants.length;
    const baseFeePerPerson = fees.governmentFee + fees.serviceFee;
    const expeditedFeePerPerson = application.expedited && fees.expeditedEnabled ? (fees.expeditedFee || 0) : 0;
    
    application.totalFee = applicantCount * (baseFeePerPerson + expeditedFeePerPerson);
    application.currency = fees.currency;
  },

  // Request additional docs
  requestAdditionalDocs(applicationId: string, applicantId: string, docRequests: string[]): Application | null {
    const application = this.getById(applicationId);
    if (!application) return null;

    const applicant = application.applicants.find((a) => a.id === applicantId);
    if (!applicant) return null;

    applicant.requiredDocuments = docRequests;
    return this.updateApplicantStatus(applicationId, applicantId, "need_docs", "Additional documents requested");
  },

  // Update applicant email
  updateApplicantEmail(applicationId: string, applicantId: string, newEmail: string): Application | null {
    const application = this.getById(applicationId);
    if (!application) return null;

    const applicant = application.applicants.find((a) => a.id === applicantId);
    if (!applicant) return null;

    applicant.email = newEmail;
    applicant.updatedAt = new Date().toISOString();
    
    return this.update(applicationId, { applicants: application.applicants });
  },

  // Upload result file
  uploadResultFile(applicationId: string, applicantId: string, fileId: string): Application | null {
    const application = this.getById(applicationId);
    if (!application) return null;

    const applicant = application.applicants.find((a) => a.id === applicantId);
    if (!applicant) return null;

    applicant.resultFileId = fileId;
    applicant.status = "ready_to_download";
    applicant.statusHistory.push({
      status: "ready_to_download",
      timestamp: new Date().toISOString(),
      note: "Result file uploaded",
    });
    applicant.updatedAt = new Date().toISOString();
    
    return this.update(applicationId, { applicants: application.applicants });
  },

  // Set result file (legacy)
  setResultFile(applicationId: string, applicantId: string, file: { fileName: string; blobUrl?: string; indexedDbKey?: string }): Application | null {
    const application = this.getById(applicationId);
    if (!application) return null;

    const applicant = application.applicants.find((a) => a.id === applicantId);
    if (!applicant) return null;

    applicant.resultFile = file;
    return this.update(applicationId, { applicants: application.applicants });
  },
};
