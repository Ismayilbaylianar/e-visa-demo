"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { applicationsService } from "@/services";
import { useApplicationStore } from "@/stores/applicationStore";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";

export default function ResumePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const { setCurrentApplication, setApplicationId, setResumeToken, setVerifiedEmail } = useApplicationStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid resume link");
      setLoading(false);
      return;
    }

    const application = applicationsService.getByResumeToken(token);

    if (!application) {
      setError("Application not found or link has expired");
      setLoading(false);
      return;
    }

    // Check if payment is still pending
    if (application.paymentStatus === "paid") {
      toast.info("This application has already been paid");
      router.push(`/track`);
      return;
    }

    if (application.paymentStatus === "expired") {
      setError("Payment deadline has expired for this application");
      setLoading(false);
      return;
    }

    // Restore application state
    setCurrentApplication({
      nationalityCode: application.nationalityCode,
      destinationCode: application.destinationCode,
      visaTypeId: application.visaTypeId,
      templateId: application.templateId,
      expedited: application.expedited,
    });
    setApplicationId(application.id);
    setResumeToken(application.resumeToken);
    setVerifiedEmail(application.userEmail);

    // Redirect to payment
    toast.success("Application restored! Redirecting to payment...");
    router.push(`/payment?id=${application.id}`);
  }, [token, router, setCurrentApplication, setApplicationId, setResumeToken, setVerifiedEmail]);

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Unable to Resume</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="mt-6 text-center">
                <Button onClick={() => router.push("/")}>Start New Application</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <PageLoader />;
}
