"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Clock,
  FileText,
  Download,
  Upload,
  Edit,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  applicationsService,
  countriesService,
  visaTypesService,
  templatesService,
} from "@/services";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime, formatCurrency } from "@/lib/utils/generators";
import { fileStorage } from "@/lib/storage/db";
import { toast } from "sonner";
import { useTranslations } from "@/stores/languageStore";
import type { Application, Applicant, ApplicationStatus } from "@/types";

const STATUS_OPTIONS: ApplicationStatus[] = [
  "draft",
  "unpaid",
  "submitted",
  "in_review",
  "need_docs",
  "approved",
  "rejected",
  "ready_to_download",
];

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  // Dialogs
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [docsDialogOpen, setDocsDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  // Form states
  const [newStatus, setNewStatus] = useState<ApplicationStatus>("submitted");
  const [statusNote, setStatusNote] = useState("");
  const [requiredDocs, setRequiredDocs] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [resultFile, setResultFile] = useState<File | null>(null);

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = () => {
    const app = applicationsService.getById(id);
    if (!app) {
      toast.error("Müraciət tapılmadı");
      router.push("/admin/applications");
      return;
    }
    setApplication(app);
    setLoading(false);
  };

  const getCountryName = (code: string) => {
    const country = countriesService.getByCode(code);
    return country ? `${country.flag} ${country.name}` : code;
  };

  const getVisaTypeName = (typeId: string) => {
    const type = visaTypesService.getById(typeId);
    return type?.label || typeId;
  };

  const openStatusDialog = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setNewStatus(applicant.status);
    setStatusNote("");
    setStatusDialogOpen(true);
  };

  const openDocsDialog = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setRequiredDocs("");
    setDocsDialogOpen(true);
  };

  const openEmailDialog = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setNewEmail(applicant.email);
    setEmailDialogOpen(true);
  };

  const openUploadDialog = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setResultFile(null);
    setUploadDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (!application || !selectedApplicant) return;

    applicationsService.updateApplicantStatus(
      application.id,
      selectedApplicant.id,
      newStatus,
      statusNote || undefined
    );

    toast.success(t.toast.statusUpdated);
    setStatusDialogOpen(false);
    loadApplication();
  };

  const handleRequestDocs = () => {
    if (!application || !selectedApplicant || !requiredDocs.trim()) return;

    const docs = requiredDocs.split("\n").filter((d) => d.trim());
    applicationsService.requestAdditionalDocs(application.id, selectedApplicant.id, docs);

    toast.success(t.toast.docsRequested);
    setDocsDialogOpen(false);
    loadApplication();
  };

  const handleUpdateEmail = () => {
    if (!application || !selectedApplicant || !newEmail.trim()) return;

    applicationsService.updateApplicantEmail(application.id, selectedApplicant.id, newEmail);

    toast.success(t.toast.emailUpdated);
    setEmailDialogOpen(false);
    loadApplication();
  };

  const handleUploadResult = async () => {
    if (!application || !selectedApplicant || !resultFile) return;

    // Save file to IndexedDB
    const fileId = await fileStorage.saveFile(resultFile);

    applicationsService.uploadResultFile(application.id, selectedApplicant.id, fileId);

    toast.success(t.toast.saved);
    setUploadDialogOpen(false);
    loadApplication();
  };

  const handleDownloadResult = async (fileId: string) => {
    const url = await fileStorage.getFileUrl(fileId);
    if (url) {
      window.open(url, "_blank");
    }
  };

  if (loading || !application) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/applications")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t.applications.detail.title}</h1>
          <p className="text-muted-foreground">{application.userEmail}</p>
        </div>
      </div>

      {/* Application Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t.applications.detail.applicationInfo}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <Label className="text-muted-foreground">{t.applications.detail.nationality}</Label>
              <p className="font-medium">{getCountryName(application.nationalityCode)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t.applications.destination}</Label>
              <p className="font-medium">{getCountryName(application.destinationCode)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t.applications.visaType}</Label>
              <p className="font-medium">{getVisaTypeName(application.visaTypeId)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t.applications.detail.processing}</Label>
              <Badge variant={application.expedited ? "default" : "secondary"}>
                {application.expedited ? t.applications.detail.expedited : t.applications.detail.standard}
              </Badge>
            </div>
            <div>
              <Label className="text-muted-foreground">{t.applications.totalFee}</Label>
              <p className="font-medium">{formatCurrency(application.totalFee, application.currency)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t.applications.detail.paymentStatus}</Label>
              <Badge variant={application.paymentStatus === "paid" ? "default" : "destructive"}>
                {application.paymentStatus === "paid" ? "Ödənildi" : 
                 application.paymentStatus === "pending" ? "Gözləyir" : "Vaxtı keçdi"}
              </Badge>
            </div>
            <div>
              <Label className="text-muted-foreground">{t.applications.created}</Label>
              <p className="font-medium">{formatDateTime(application.createdAt)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t.applications.detail.lastUpdated}</Label>
              <p className="font-medium">{formatDateTime(application.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applicants */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t.applications.detail.applicantsList} ({application.applicants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={application.applicants.map((a) => a.id)}>
            {application.applicants.map((applicant, index) => (
              <AccordionItem key={applicant.id} value={applicant.id}>
                <AccordionTrigger>
                  <div className="flex items-center gap-4">
                    <User className="h-5 w-5" />
                    <span>
                      {applicant.email || `Müraciətçi #${index + 1}`}
                      {index === 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {t.applications.detail.main}
                        </Badge>
                      )}
                    </span>
                    <StatusBadge status={applicant.status} />
                    {applicant.applicationCode && (
                      <Badge variant="outline" className="font-mono">
                        {applicant.applicationCode}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6 pt-4">
                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => openStatusDialog(applicant)}>
                        <Clock className="h-4 w-4 mr-2" />
                        {t.applications.detail.updateStatus}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openDocsDialog(applicant)}>
                        <FileText className="h-4 w-4 mr-2" />
                        {t.applications.detail.requestDocs}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openUploadDialog(applicant)}>
                        <Upload className="h-4 w-4 mr-2" />
                        {t.applications.detail.uploadResult}
                      </Button>
                      {applicant.resultFileId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadResult(applicant.resultFileId!)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {t.applications.detail.downloadVisa}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => openEmailDialog(applicant)}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t.applications.detail.editEmail}
                      </Button>
                    </div>

                    {/* Status History */}
                    <div>
                      <h4 className="font-medium mb-2">{t.applications.detail.statusHistory}</h4>
                      <div className="space-y-2">
                        {applicant.statusHistory.map((history, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 text-sm p-2 bg-muted rounded"
                          >
                            <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={history.status} />
                                <span className="text-muted-foreground">
                                  {formatDateTime(history.timestamp)}
                                </span>
                              </div>
                              {history.note && (
                                <p className="text-muted-foreground mt-1">{history.note}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Required Docs */}
                    {applicant.requiredDocuments && applicant.requiredDocuments.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          Tələb olunan sənədlər
                        </h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {applicant.requiredDocuments.map((doc, i) => (
                            <li key={i}>{doc}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Form Data */}
                    <div>
                      <h4 className="font-medium mb-2">{t.applications.detail.formData}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {Object.entries(applicant.formData).map(([key, value]) => (
                          <div key={key}>
                            <Label className="text-muted-foreground">{key}</Label>
                            <p>{String(value) || "-"}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Uploaded Documents */}
                    {Object.keys(applicant.documents).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">{t.applications.detail.uploadedDocs}</h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(applicant.documents).map(([key, fileId]) => (
                            <Button
                              key={key}
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadResult(fileId)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {key}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.applications.detail.updateStatus}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.applications.detail.newStatus}</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ApplicationStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {t.applications.statuses[status as keyof typeof t.applications.statuses] || status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.applications.detail.note}</Label>
              <Textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Qeyd əlavə edin..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleUpdateStatus}>{t.common.update}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Docs Dialog */}
      <Dialog open={docsDialogOpen} onOpenChange={setDocsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.applications.detail.requestDocs}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.applications.detail.requiredDocs}</Label>
              <Textarea
                value={requiredDocs}
                onChange={(e) => setRequiredDocs(e.target.value)}
                placeholder="Pasport surəti&#10;Şəkil&#10;Bank hesabı"
                rows={5}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDocsDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleRequestDocs}>{t.applications.detail.sendRequest}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.applications.detail.editEmail}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>E-poçt</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleUpdateEmail}>{t.common.update}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Result Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.applications.detail.uploadResult}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Fayl</Label>
              <Input
                type="file"
                onChange={(e) => setResultFile(e.target.files?.[0] || null)}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleUploadResult} disabled={!resultFile}>
                {t.common.upload}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
