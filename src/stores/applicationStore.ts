"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Application, Applicant } from "@/types";

interface ApplicantFormData {
  id: string;
  formData: Record<string, unknown>;
  documents: Record<string, File>;
}

interface ApplicationState {
  // Current application being filled
  currentApplication: {
    nationalityCode: string;
    destinationCode: string;
    visaTypeId: string;
    templateId: string;
    expedited: boolean;
  } | null;
  
  // Applicants data (before submission)
  applicantsData: ApplicantFormData[];
  
  // Email verification
  verifiedEmail: string | null;
  
  // Resume token for current application
  resumeToken: string | null;
  applicationId: string | null;
  
  // Actions
  setCurrentApplication: (data: ApplicationState["currentApplication"]) => void;
  setVerifiedEmail: (email: string | null) => void;
  addApplicant: () => string;
  removeApplicant: (id: string) => void;
  updateApplicantFormData: (id: string, data: Record<string, unknown>) => void;
  updateApplicantDocument: (id: string, fieldId: string, file: File | null) => void;
  setResumeToken: (token: string | null) => void;
  setApplicationId: (id: string | null) => void;
  setExpedited: (expedited: boolean) => void;
  clearApplication: () => void;
  
  // Get applicant by id
  getApplicant: (id: string) => ApplicantFormData | undefined;
}

const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set, get) => ({
      currentApplication: null,
      applicantsData: [],
      verifiedEmail: null,
      resumeToken: null,
      applicationId: null,
      
      setCurrentApplication: (data) => set({ currentApplication: data }),
      
      setVerifiedEmail: (email) => set({ verifiedEmail: email }),
      
      addApplicant: () => {
        const id = generateTempId();
        set((state) => ({
          applicantsData: [
            ...state.applicantsData,
            { id, formData: {}, documents: {} },
          ],
        }));
        return id;
      },
      
      removeApplicant: (id) => {
        set((state) => ({
          applicantsData: state.applicantsData.filter((a) => a.id !== id),
        }));
      },
      
      updateApplicantFormData: (id, data) => {
        set((state) => ({
          applicantsData: state.applicantsData.map((a) =>
            a.id === id ? { ...a, formData: { ...a.formData, ...data } } : a
          ),
        }));
      },
      
      updateApplicantDocument: (id, fieldId, file) => {
        set((state) => ({
          applicantsData: state.applicantsData.map((a) => {
            if (a.id !== id) return a;
            const documents = { ...a.documents };
            if (file) {
              documents[fieldId] = file;
            } else {
              delete documents[fieldId];
            }
            return { ...a, documents };
          }),
        }));
      },
      
      setResumeToken: (token) => set({ resumeToken: token }),
      
      setApplicationId: (id) => set({ applicationId: id }),
      
      setExpedited: (expedited) => {
        set((state) => ({
          currentApplication: state.currentApplication
            ? { ...state.currentApplication, expedited }
            : null,
        }));
      },
      
      clearApplication: () => set({
        currentApplication: null,
        applicantsData: [],
        verifiedEmail: null,
        resumeToken: null,
        applicationId: null,
      }),
      
      getApplicant: (id) => get().applicantsData.find((a) => a.id === id),
    }),
    {
      name: "evisa-application-storage",
      partialize: (state) => ({
        currentApplication: state.currentApplication,
        applicantsData: state.applicantsData.map((a) => ({
          id: a.id,
          formData: a.formData,
          // Don't persist File objects
          documents: {},
        })),
        verifiedEmail: state.verifiedEmail,
        resumeToken: state.resumeToken,
        applicationId: state.applicationId,
      }),
    }
  )
);
