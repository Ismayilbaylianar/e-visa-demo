"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  FileText,
  Eye,
  LogOut,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  applicationsService,
  usersService,
  countriesService,
  visaTypesService,
} from "@/services";
import { useAuthStore } from "@/stores/authStore";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDateTime } from "@/lib/utils/generators";
import { toast } from "sonner";
import { useTranslations } from "@/stores/languageStore";
import type { Application } from "@/types";

export default function UserPortalPage() {
  const router = useRouter();
  const t = useTranslations();
  const { userEmail, isUserVerified, setUserEmail, setUserVerified, clearUserSession } = useAuthStore();

  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    if (userEmail && isUserVerified) {
      loadApplications(userEmail);
    }
  }, [userEmail, isUserVerified]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const loadApplications = (email: string) => {
    setLoading(true);
    const apps = applicationsService.getByUserEmail(email);
    // Sort by creation date, newest first
    apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setApplications(apps);
    setLoading(false);
  };

  const handleSendCode = () => {
    if (!email) {
      toast.error(t.public.apply.enterEmail);
      return;
    }

    // Check if user exists
    const user = usersService.getByEmail(email);
    if (!user) {
      toast.error(t.public.me.noApplications);
      return;
    }

    setCodeSent(true);
    setResendCooldown(60);
    toast.success(t.toast.codeSent);
  };

  const handleVerifyCode = () => {
    setVerifying(true);

    if (usersService.verifyCode(verificationCode)) {
      setUserEmail(email);
      setUserVerified(true);
      usersService.updateLastLogin(email);
      loadApplications(email);
      toast.success(t.toast.codeVerified);
    } else {
      toast.error(t.toast.invalidCode);
    }

    setVerifying(false);
  };

  const handleLogout = () => {
    clearUserSession();
    setCodeSent(false);
    setVerificationCode("");
    setEmail("");
    setApplications([]);
    toast.success(t.toast.logoutSuccess);
  };

  const getOverallStatus = (app: Application) => {
    if (app.applicants.length === 0) return "draft";
    // Return the first applicant's status as representative
    return app.applicants[0].status;
  };

  // Login form
  if (!userEmail || !isUserVerified) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{t.public.me.title}</h1>
            <p className="text-muted-foreground">
              {t.public.me.loginSubtitle}
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.public.track.email}</Label>
                  <Input
                    type="email"
                    placeholder={t.public.apply.enterEmail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={codeSent}
                  />
                </div>

                {!codeSent ? (
                  <Button className="w-full" onClick={handleSendCode}>
                    <Mail className="h-4 w-4 mr-2" />
                    {t.public.apply.sendCode}
                  </Button>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>{t.public.me.verificationCode}</Label>
                      <Input
                        placeholder={t.public.apply.enterCode}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleVerifyCode}
                      disabled={verifying || verificationCode.length !== 6}
                    >
                      {verifying ? t.public.apply.verifying : t.public.me.login}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={handleSendCode}
                      disabled={resendCooldown > 0}
                    >
                      {resendCooldown > 0 ? `${t.public.apply.resendCode} (${resendCooldown}s)` : t.public.apply.resendCode}
                    </Button>
                  </>
                )}

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t.public.apply.demoCodeHint}: <strong>123456</strong>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // User portal
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t.public.me.title}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t.public.apply.verified}: {userEmail}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            {t.nav.logout}
          </Button>
        </div>

        {/* Applications */}
        <Card>
          <CardHeader>
            <CardTitle>{t.public.me.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : applications.length === 0 ? (
              <EmptyState
                icon={FileText}
                title={t.public.me.noApplications}
                description={t.public.me.subtitle}
                action={{
                  label: t.public.me.startNew,
                  onClick: () => router.push("/"),
                }}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.public.home.selectDestination}</TableHead>
                    <TableHead>{t.public.home.selectVisaType}</TableHead>
                    <TableHead>{t.applications.applicants}</TableHead>
                    <TableHead>{t.common.status}</TableHead>
                    <TableHead>{t.applications.created}</TableHead>
                    <TableHead className="text-right">{t.common.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        {countriesService.getByCode(app.destinationCode)?.flag}{" "}
                        {countriesService.getByCode(app.destinationCode)?.name}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {visaTypesService.getById(app.visaTypeId)?.purpose}
                      </TableCell>
                      <TableCell>{app.applicants.length}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={getOverallStatus(app)} />
                          {app.paymentStatus === "pending" && (
                            <Badge variant="outline">{t.applications.statuses.unpaid}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(app.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {app.paymentStatus === "pending" ? (
                          <Button
                            size="sm"
                            onClick={() => router.push(`/payment?id=${app.id}`)}
                          >
                            {t.public.payment.payNow}
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Navigate to track with first applicant's code
                              const firstApplicant = app.applicants[0];
                              if (firstApplicant?.applicationCode) {
                                router.push(`/track?email=${firstApplicant.email}&code=${firstApplicant.applicationCode}`);
                              }
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {t.common.view}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Applicant Codes */}
        {applications.some((app) => app.paymentStatus === "paid") && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t.public.payment.success.applicationCodes}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications
                  .filter((app) => app.paymentStatus === "paid")
                  .flatMap((app) =>
                    app.applicants.map((applicant) => ({
                      ...applicant,
                      destination: countriesService.getByCode(app.destinationCode)?.name,
                    }))
                  )
                  .map((applicant) => (
                    <div
                      key={applicant.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{applicant.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {applicant.destination}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <StatusBadge status={applicant.status} />
                        <code className="font-mono font-bold text-lg">
                          {applicant.applicationCode}
                        </code>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
