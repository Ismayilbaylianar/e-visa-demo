"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  applicationsService,
  countriesService,
  visaTypesService,
  paymentPageService,
} from "@/services";
import { useApplicationStore } from "@/stores/applicationStore";
import { formatCurrency } from "@/lib/utils/generators";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";
import { useTranslations } from "@/stores/languageStore";
import type { Application, PaymentPageConfig } from "@/types";

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("id");
  const t = useTranslations();

  const { clearApplication } = useApplicationStore();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<Application | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentPageConfig | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Email preview dialog
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);

  // Payment form
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  useEffect(() => {
    if (!applicationId) {
      router.push("/");
      return;
    }

    const app = applicationsService.getById(applicationId);
    if (!app) {
      toast.error(t.toast.error);
      router.push("/");
      return;
    }

    // Check if already paid
    if (app.paymentStatus === "paid") {
      setApplication(app);
      setPaymentComplete(true);
      setLoading(false);
      return;
    }

    // Check if expired
    if (app.paymentStatus === "expired") {
      toast.error(t.public.payment.expired);
      router.push("/");
      return;
    }

    setApplication(app);
    setPaymentConfig(paymentPageService.getPublicConfig());
    setLoading(false);
  }, [applicationId, router, t]);

  // Countdown timer
  useEffect(() => {
    if (!application?.paymentDeadline || paymentComplete) return;

    const updateTimer = () => {
      const deadline = new Date(application.paymentDeadline!);
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft(t.public.payment.expired);
        applicationsService.checkExpiredPayments();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}${t.common.hours.charAt(0)} ${minutes}${t.common.minutes.charAt(0)} ${seconds}${t.common.seconds.charAt(0)}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [application?.paymentDeadline, paymentComplete, t]);

  const handlePayment = async () => {
    if (!application) return;

    // Basic validation
    if (!cardNumber || !expiry || !cvv || !cardName) {
      toast.error(t.common.required);
      return;
    }

    setProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mark as paid and generate codes
    const updatedApp = applicationsService.markAsPaid(application.id);

    if (updatedApp) {
      setApplication(updatedApp);
      setPaymentComplete(true);
      clearApplication();
      toast.success(t.toast.paymentSuccess);

      // Show email preview
      setCurrentEmailIndex(0);
      setEmailDialogOpen(true);
    } else {
      toast.error(t.toast.error);
    }

    setProcessing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t.toast.copied);
  };

  const showNextEmail = () => {
    if (application && currentEmailIndex < application.applicants.length - 1) {
      setCurrentEmailIndex(currentEmailIndex + 1);
    } else {
      setEmailDialogOpen(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!application) {
    return null;
  }

  const country = countriesService.getByCode(application.destinationCode);
  const visaType = visaTypesService.getById(application.visaTypeId);

  // Payment complete view
  if (paymentComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">{t.public.payment.success.title}</h1>
              <p className="text-muted-foreground mb-6">
                {t.public.payment.success.message}
              </p>

              <div className="bg-muted p-4 rounded-lg mb-6">
                <p className="text-sm text-muted-foreground mb-2">{t.public.payment.success.applicationCodes}</p>
                {application.applicants.map((applicant, index) => (
                  <div key={applicant.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span>{t.public.apply.applicant} #{index + 1} ({applicant.email})</span>
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold text-lg">
                        {applicant.applicationCode}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(applicant.applicationCode!)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="text-left mb-6">
                <Mail className="h-4 w-4" />
                <AlertTitle>{t.public.payment.success.saveCode}</AlertTitle>
                <AlertDescription>
                  {t.public.payment.success.emailSent}
                </AlertDescription>
              </Alert>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => router.push("/track")}>
                  {t.public.payment.success.trackApplication}
                </Button>
                <Button onClick={() => router.push("/")}>
                  {t.public.payment.success.backToHome}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Preview Dialog */}
          <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Preview ({currentEmailIndex + 1}/{application.applicants.length})
                </DialogTitle>
              </DialogHeader>
              {application.applicants[currentEmailIndex] && (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">To:</p>
                    <p className="font-medium">{application.applicants[currentEmailIndex].email}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Subject:</p>
                    <p className="font-medium">
                      Your Visa Application Has Been Submitted - {application.applicants[currentEmailIndex].applicationCode}
                    </p>
                  </div>
                  <div className="border p-4 rounded-lg">
                    <p className="mb-4">Dear Applicant,</p>
                    <p className="mb-4">
                      Thank you for submitting your visa application for {country?.name}.
                    </p>
                    <p className="mb-4">
                      Your application code is: <strong>{application.applicants[currentEmailIndex].applicationCode}</strong>
                    </p>
                    <p className="mb-4">
                      Please keep this code safe as you will need it to track your application status.
                    </p>
                    <p className="mb-4">
                      You can track your application at: <span className="text-primary">evisa.example.com/track</span>
                    </p>
                    <p>
                      Best regards,<br />
                      E-Visa Portal Team
                    </p>
                  </div>
                  <Button className="w-full" onClick={showNextEmail}>
                    {currentEmailIndex < application.applicants.length - 1 ? t.common.next : t.common.close}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t.public.payment.title}</h1>
          <p className="text-muted-foreground">
            {t.public.payment.subtitle}
          </p>
        </div>

        {/* Timer Warning */}
        <Alert className="mb-8" variant={timeLeft === t.public.payment.expired ? "destructive" : "default"}>
          <Clock className="h-4 w-4" />
          <AlertTitle>{t.public.payment.paymentDeadline}</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{t.public.payment.timeRemaining}</span>
            <Badge variant={timeLeft === t.public.payment.expired ? "destructive" : "secondary"} className="text-lg">
              {timeLeft}
            </Badge>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t.public.payment.cardNumber}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t.public.payment.demoPayment}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>{t.public.payment.cardNumber}</Label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.public.payment.expiryDate}</Label>
                    <Input
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.public.payment.cvv}</Label>
                    <Input
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      maxLength={4}
                      type="password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t.public.payment.cardHolder}</Label>
                  <Input
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>

                {/* Additional info sections from payment page config (read-only, only shown if has content) */}
                {paymentConfig?.sections
                  .filter((section) => {
                    // Only show sections that have content (title or description or fields with values)
                    const hasTitle = section.title && section.title.trim() !== "";
                    const hasDescription = section.description && section.description.trim() !== "";
                    const hasFieldsWithContent = section.fields.some(
                      (field) => field.label && field.label.trim() !== ""
                    );
                    return hasTitle || hasDescription || hasFieldsWithContent;
                  })
                  .map((section) => {
                    // Filter fields that have content
                    const fieldsWithContent = section.fields.filter(
                      (field) => field.label && field.label.trim() !== ""
                    );
                    
                    // Don't render if no content at all
                    if (!section.title && !section.description && fieldsWithContent.length === 0) {
                      return null;
                    }
                    
                    return (
                      <div key={section.id} className="pt-4 border-t">
                        {section.title && (
                          <h4 className="font-medium mb-2">{section.title}</h4>
                        )}
                        {section.description && (
                          <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                        )}
                        {fieldsWithContent.length > 0 && (
                          <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                            {fieldsWithContent.map((field) => (
                              <div key={field.id} className="text-sm">
                                <span className="font-medium">{field.label}</span>
                                {field.placeholder && (
                                  <span className="text-muted-foreground ml-2">- {field.placeholder}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t.public.payment.applicationSummary}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t.public.home.selectDestination}</p>
                  <p className="font-medium">{country?.flag} {country?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.public.home.selectVisaType}</p>
                  <p className="font-medium">{visaType?.label}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.applications.applicants}</p>
                  <p className="font-medium">{application.applicants.length}</p>
                </div>
                {application.expedited && (
                  <Badge>{t.public.apply.expeditedProcessing}</Badge>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>{t.public.home.total}</span>
                  <span>{formatCurrency(application.totalFee, application.currency)}</span>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePayment}
                  disabled={processing || timeLeft === t.public.payment.expired}
                >
                  {processing ? t.public.payment.processing : `${t.public.payment.payNow} ${formatCurrency(application.totalFee, application.currency)}`}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  {t.nav.terms}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PaymentPageContent />
    </Suspense>
  );
}
