import { storage, STORAGE_KEYS } from "@/lib/storage/localStorage";
import { generateId } from "@/lib/utils/generators";
import type { EmailTemplate } from "@/types";

// Default email templates
const DEFAULT_TEMPLATES: Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "Application Submitted",
    subject: "Your Visa Application Has Been Submitted - {{applicationCode}}",
    body: `Dear {{applicantName}},

Thank you for submitting your visa application.

Your application code is: {{applicationCode}}

Please keep this code safe as you will need it to track your application status.

Application Details:
- Destination: {{destination}}
- Visa Type: {{visaType}}
- Submission Date: {{submissionDate}}

You can track your application status at: {{trackingUrl}}

Best regards,
E-Visa Portal Team`,
    variables: ["applicantName", "applicationCode", "destination", "visaType", "submissionDate", "trackingUrl"],
    isActive: true,
  },
  {
    name: "Additional Documents Required",
    subject: "Additional Documents Required - {{applicationCode}}",
    body: `Dear {{applicantName}},

We have reviewed your visa application and require additional documents to proceed.

Application Code: {{applicationCode}}

Required Documents:
{{documentsList}}

Please upload the required documents within 7 days to avoid delays in processing.

Best regards,
E-Visa Portal Team`,
    variables: ["applicantName", "applicationCode", "documentsList"],
    isActive: true,
  },
  {
    name: "Application Approved",
    subject: "Congratulations! Your Visa Has Been Approved - {{applicationCode}}",
    body: `Dear {{applicantName}},

Great news! Your visa application has been approved.

Application Code: {{applicationCode}}

Your e-Visa is now ready for download. Please log in to your account to download your visa document.

Important Information:
- Visa Validity: {{validityDays}} days
- Maximum Stay: {{maxStay}} days
- Entry Type: {{entryType}}

Safe travels!

Best regards,
E-Visa Portal Team`,
    variables: ["applicantName", "applicationCode", "validityDays", "maxStay", "entryType"],
    isActive: true,
  },
  {
    name: "Application Rejected",
    subject: "Visa Application Update - {{applicationCode}}",
    body: `Dear {{applicantName}},

We regret to inform you that your visa application has been rejected.

Application Code: {{applicationCode}}

Reason: {{rejectionReason}}

If you believe this decision was made in error, you may submit a new application with additional supporting documents.

Best regards,
E-Visa Portal Team`,
    variables: ["applicantName", "applicationCode", "rejectionReason"],
    isActive: true,
  },
  {
    name: "Payment Reminder",
    subject: "Payment Reminder - Complete Your Visa Application",
    body: `Dear {{applicantName}},

This is a reminder that your visa application payment is still pending.

Application Reference: {{applicationId}}
Payment Deadline: {{paymentDeadline}}

Please complete your payment before the deadline to avoid cancellation of your application.

Payment Link: {{paymentUrl}}

Best regards,
E-Visa Portal Team`,
    variables: ["applicantName", "applicationId", "paymentDeadline", "paymentUrl"],
    isActive: true,
  },
];

export const emailTemplatesService = {
  initializeDefaults(): void {
    const templates = this.getAll();
    if (templates.length === 0) {
      DEFAULT_TEMPLATES.forEach((template) => {
        this.create(template);
      });
    }
  },

  getAll(): EmailTemplate[] {
    return storage.get<EmailTemplate[]>(STORAGE_KEYS.EMAIL_TEMPLATES, []);
  },

  getActive(): EmailTemplate[] {
    return this.getAll().filter((t) => t.isActive);
  },

  getById(id: string): EmailTemplate | undefined {
    return this.getAll().find((t) => t.id === id);
  },

  getByName(name: string): EmailTemplate | undefined {
    return this.getAll().find((t) => t.name === name);
  },

  create(data: Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">): EmailTemplate {
    const templates = this.getAll();
    
    const newTemplate: EmailTemplate = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    templates.push(newTemplate);
    storage.set(STORAGE_KEYS.EMAIL_TEMPLATES, templates);
    return newTemplate;
  },

  update(id: string, data: Partial<EmailTemplate>): EmailTemplate | null {
    const templates = this.getAll();
    const index = templates.findIndex((t) => t.id === id);
    
    if (index === -1) return null;
    
    templates[index] = {
      ...templates[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    storage.set(STORAGE_KEYS.EMAIL_TEMPLATES, templates);
    return templates[index];
  },

  delete(id: string): boolean {
    const templates = this.getAll();
    const filtered = templates.filter((t) => t.id !== id);
    
    if (filtered.length === templates.length) return false;
    
    storage.set(STORAGE_KEYS.EMAIL_TEMPLATES, filtered);
    return true;
  },

  // Render template with variables
  render(templateId: string, variables: Record<string, string>): { subject: string; body: string } | null {
    const template = this.getById(templateId);
    if (!template) return null;

    let subject = template.subject;
    let body = template.body;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      subject = subject.replace(regex, value);
      body = body.replace(regex, value);
    });

    return { subject, body };
  },

  // Preview template (for admin)
  preview(templateId: string): { subject: string; body: string } | null {
    const template = this.getById(templateId);
    if (!template) return null;

    const sampleVariables: Record<string, string> = {
      applicantName: "John Doe",
      applicationCode: "VEA7K2X9Q",
      destination: "United States",
      visaType: "Tourism - Single Entry - 30 days",
      submissionDate: new Date().toLocaleDateString(),
      trackingUrl: "https://evisa.example.com/track",
      documentsList: "• Passport copy\n• Bank statement\n• Hotel booking",
      validityDays: "90",
      maxStay: "30",
      entryType: "Single Entry",
      rejectionReason: "Incomplete documentation",
      applicationId: "APP123456",
      paymentDeadline: new Date(Date.now() + 3 * 60 * 60 * 1000).toLocaleString(),
      paymentUrl: "https://evisa.example.com/payment",
    };

    return this.render(templateId, sampleVariables);
  },
};
