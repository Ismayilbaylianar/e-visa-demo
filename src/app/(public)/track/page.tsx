"use client";

import { useState } from "react";
import { Search, CheckCircle, Clock, AlertCircle, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { applicationsService, countriesService, visaTypesService } from "@/services";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime } from "@/lib/utils/generators";
import { toast } from "sonner";
import { useTranslations } from "@/stores/languageStore";
import type { Application, Applicant } from "@/types";

export default function TrackPage() {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<{ application: Application; applicant: Applicant } | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = () => {
    if (!email || !code) {
      toast.error(t.common.required);
      return;
    }

    setSearching(true);
    setNotFound(false);
    setResult(null);

    // Search for application
    const found = applicationsService.getByApplicantCode(email, code);

    if (found) {
      setResult(found);
    } else {
      setNotFound(true);
    }

    setSearching(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "ready_to_download":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "need_docs":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{t.public.track.title}</h1>
          <p className="text-muted-foreground">
            {t.public.track.subtitle}
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t.public.track.email}</Label>
                <Input
                  type="email"
                  placeholder={t.public.apply.enterEmail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.public.track.applicationCode}</Label>
                <Input
                  placeholder="e.g., VEA7K2X9Q"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={9}
                />
              </div>
              <Button className="w-full" onClick={handleSearch} disabled={searching}>
                <Search className="h-4 w-4 mr-2" />
                {searching ? t.common.loading : t.public.track.trackButton}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Not Found */}
        {notFound && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t.public.track.notFound}
            </AlertDescription>
          </Alert>
        )}

        {/* Result */}
        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t.public.track.status}
                </CardTitle>
                <StatusBadge status={result.applicant.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Icon */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                {getStatusIcon(result.applicant.status)}
                <div>
                  <p className="font-medium capitalize">
                    {result.applicant.status.replace("_", " ")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t.public.track.lastUpdate}: {formatDateTime(result.applicant.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Application Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t.public.track.applicationCode}</p>
                  <p className="font-mono font-bold">{result.applicant.applicationCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.public.home.selectDestination}</p>
                  <p className="font-medium">
                    {countriesService.getByCode(result.application.destinationCode)?.flag}{" "}
                    {countriesService.getByCode(result.application.destinationCode)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.public.home.selectVisaType}</p>
                  <p className="font-medium">
                    {visaTypesService.getById(result.application.visaTypeId)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.applications.created}</p>
                  <p className="font-medium">{formatDateTime(result.application.createdAt)}</p>
                </div>
              </div>

              {/* Additional Docs Required */}
              {result.applicant.status === "need_docs" && result.applicant.additionalDocsRequested && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-2">{t.applications.detail.requestDocs}:</p>
                    <ul className="list-disc list-inside">
                      {result.applicant.additionalDocsRequested.map((doc, i) => (
                        <li key={i}>{doc}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Download Button */}
              {result.applicant.status === "ready_to_download" && result.applicant.resultFile && (
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  {t.applications.detail.downloadVisa}
                </Button>
              )}

              <Separator />

              {/* Status Timeline */}
              <div>
                <h4 className="font-medium mb-4">{t.public.track.timeline}</h4>
                <div className="space-y-4">
                  {result.applicant.statusHistory.map((entry, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          index === result.applicant.statusHistory.length - 1
                            ? "bg-primary"
                            : "bg-muted-foreground"
                        }`} />
                        {index < result.applicant.statusHistory.length - 1 && (
                          <div className="w-0.5 h-full bg-muted-foreground/30 my-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium capitalize">
                          {entry.status.replace("_", " ")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(entry.timestamp)}
                        </p>
                        {entry.note && (
                          <p className="text-sm mt-1">{entry.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
