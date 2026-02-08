"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, User, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  templatesService,
  bindingsService,
  countriesService,
  visaTypesService,
  applicationsService,
  usersService,
} from "@/services";
import { useApplicationStore } from "@/stores/applicationStore";
import { formatCurrency } from "@/lib/utils/generators";
import { fileStorage } from "@/lib/storage/db";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";
import { useTranslations } from "@/stores/languageStore";
import type { ApplicationTemplate, NationalityBinding } from "@/types";

export default function ReviewPage() {
  const router = useRouter();
  const t = useTranslations();
  const {
    currentApplication,
    applicantsData,
    verifiedEmail,
    setApplicationId,
    setResumeToken,
  } = useApplicationStore();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [template, setTemplate] = useState<ApplicationTemplate | null>(null);
  const [fees, setFees] = useState<NationalityBinding | null>(null);

  useEffect(() => {
    if (!currentApplication || !verifiedEmail || applicantsData.length === 0) {
      router.push("/");
      return;
    }

    const templateData = templatesService.getById(currentApplication.templateId);
    const feesData = bindingsService.getFees(
      currentApplication.nationalityCode,
      currentApplication.destinationCode,
      currentApplication.visaTypeId
    );

    if (!templateData || !feesData) {
      router.push("/");
      return;
    }

    setTemplate(templateData);
    setFees(feesData);
    setLoading(false);
  }, [currentApplication, verifiedEmail, applicantsData, router]);

  const calculateTotalFee = () => {
    if (!fees) return 0;
    const baseFee = fees.governmentFee + fees.serviceFee;
    const expeditedFee = currentApplication?.expedited && fees.expeditedEnabled ? (fees.expeditedFee || 0) : 0;
    return (baseFee + expeditedFee) * applicantsData.length;
  };

  const getFieldLabel = (fieldId: string): string => {
    for (const section of template?.sections || []) {
      const field = section.fields.find((f) => f.id === fieldId);
      if (field) return field.label;
    }
    return fieldId;
  };

  const handleConfirm = async () => {
    if (!currentApplication || !verifiedEmail) return;

    setSubmitting(true);

    try {
      // Create application
      const application = applicationsService.create({
        nationalityCode: currentApplication.nationalityCode,
        destinationCode: currentApplication.destinationCode,
        visaTypeId: currentApplication.visaTypeId,
        templateId: currentApplication.templateId,
        userEmail: verifiedEmail,
        expedited: currentApplication.expedited,
      });

      // Add applicants
      for (let i = 0; i < applicantsData.length; i++) {
        const applicantData = applicantsData[i];

        // Save files to IndexedDB and get keys
        const documents: { fieldId: string; fileName: string; fileType: string; fileSize: number; indexedDbKey: string }[] = [];
        
        for (const [fieldId, file] of Object.entries(applicantData.documents)) {
          if (file) {
            const key = await fileStorage.saveFile(file);
            documents.push({
              fieldId,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              indexedDbKey: key,
            });
          }
        }

        applicationsService.addApplicant(application.id, {
          email: String(applicantData.formData.email || verifiedEmail),
          phone: String(applicantData.formData.phone || ""),
          isMainApplicant: i === 0,
          formData: applicantData.formData,
        });

        // Add documents to applicant
        const updatedApp = applicationsService.getById(application.id);
        if (updatedApp) {
          const applicant = updatedApp.applicants[i];
          for (const doc of documents) {
            applicationsService.addDocument(application.id, applicant.id, doc);
          }
        }
      }

      // Set payment deadline
      applicationsService.setPaymentDeadline(application.id);

      // Add application to user
      usersService.addApplicationToUser(verifiedEmail, application.id);

      // Store application ID and resume token
      setApplicationId(application.id);
      setResumeToken(application.resumeToken);

      toast.success(t.toast.applicationSubmitted);

      // Navigate to payment
      router.push(`/payment?id=${application.id}`);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error(t.toast.error);
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!currentApplication) {
    return null;
  }

  const country = countriesService.getByCode(currentApplication.destinationCode);
  const visaType = visaTypesService.getById(currentApplication.visaTypeId);
  const nationalityCountry = countriesService.getByCode(currentApplication.nationalityCode);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.push(`/apply?nationality=${currentApplication.nationalityCode}&destination=${currentApplication.destinationCode}&visaType=${currentApplication.visaTypeId}&template=${currentApplication.templateId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.public.review.editApplication}
          </Button>
          <h1 className="text-3xl font-bold mb-2">{t.public.review.title}</h1>
          <p className="text-muted-foreground">
            {t.public.review.subtitle}
          </p>
        </div>

        {/* Application Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t.applications.detail.applicationInfo}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t.public.home.selectNationality}</p>
                <p className="font-medium">{nationalityCountry?.flag} {nationalityCountry?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.public.home.selectDestination}</p>
                <p className="font-medium">{country?.flag} {country?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.public.home.selectVisaType}</p>
                <p className="font-medium">{visaType?.label}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.applications.detail.processing}</p>
                <p className="font-medium">
                  {currentApplication.expedited ? (
                    <Badge>{t.applications.detail.expedited}</Badge>
                  ) : (
                    t.applications.detail.standard
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applicants Summary */}
        {applicantsData.map((applicant, index) => (
          <Card key={applicant.id} className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t.public.apply.applicant} #{index + 1}
                  {index === 0 && <Badge variant="secondary">{t.public.apply.mainApplicant}</Badge>}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/apply?nationality=${currentApplication.nationalityCode}&destination=${currentApplication.destinationCode}&visaType=${currentApplication.visaTypeId}&template=${currentApplication.templateId}`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t.common.edit}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(applicant.formData)
                  .filter(([_, value]) => value !== undefined && value !== "")
                  .map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-muted-foreground">{getFieldLabel(key)}</p>
                      <p className="font-medium">
                        {typeof value === "boolean" ? (value ? t.common.yes : t.common.no) : String(value)}
                      </p>
                    </div>
                  ))}
              </div>

              {/* Documents */}
              {Object.keys(applicant.documents).length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">{t.public.review.documents}</p>
                  <div className="space-y-2">
                    {Object.entries(applicant.documents).map(([fieldId, file]) => (
                      <div key={fieldId} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{getFieldLabel(fieldId)}:</span>
                        <span className="text-muted-foreground">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Fee Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t.public.apply.feeSummary}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>{t.public.apply.numberOfApplicants}</span>
                <span>{applicantsData.length}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.public.home.governmentFee}</span>
                <span>{formatCurrency(fees?.governmentFee || 0, fees?.currency || "USD")}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.public.home.serviceFee}</span>
                <span>{formatCurrency(fees?.serviceFee || 0, fees?.currency || "USD")}</span>
              </div>
              {currentApplication.expedited && fees?.expeditedEnabled && (
                <div className="flex justify-between">
                  <span>{t.public.home.expeditedFee}</span>
                  <span>{formatCurrency(fees.expeditedFee || 0, fees.currency)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>{t.public.home.total}</span>
                <span>{formatCurrency(calculateTotalFee(), fees?.currency || "USD")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push(`/apply?nationality=${currentApplication.nationalityCode}&destination=${currentApplication.destinationCode}&visaType=${currentApplication.visaTypeId}&template=${currentApplication.templateId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.public.review.editApplication}
          </Button>
          <Button onClick={handleConfirm} disabled={submitting} size="lg">
            {submitting ? t.common.loading : t.public.review.confirmAndPay}
          </Button>
        </div>
      </div>
    </div>
  );
}
