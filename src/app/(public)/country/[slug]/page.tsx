"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowRight, Clock, FileText, DollarSign, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { countryPagesService, countriesService, bindingsService, visaTypesService } from "@/services";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import type { CountryPage, VisaType } from "@/types";

export default function CountryPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [page, setPage] = useState<CountryPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableVisaTypes, setAvailableVisaTypes] = useState<VisaType[]>([]);

  useEffect(() => {
    const pageData = countryPagesService.getBySlug(slug);
    if (pageData && pageData.isPublished) {
      setPage(pageData);

      // Get available visa types for this destination
      const visaTypeIds = bindingsService.getVisaTypesForDestination(pageData.countryCode);
      const types = visaTypeIds
        .map((id) => visaTypesService.getById(id))
        .filter((t): t is VisaType => t !== undefined);
      setAvailableVisaTypes(types);
    }
    setLoading(false);
  }, [slug]);

  if (loading) {
    return <PageLoader />;
  }

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The country page you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push("/")}>Back to Home</Button>
      </div>
    );
  }

  const country = countriesService.getByCode(page.countryCode);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-6xl">{country?.flag}</span>
              <div>
                <h1 className="text-4xl font-bold">{page.title}</h1>
                <p className="text-blue-100">{country?.name}</p>
              </div>
            </div>
            {page.overview && (
              <p className="text-lg text-blue-100 mt-4">{page.overview}</p>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Requirements */}
            {page.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {page.requirements.split("\n").map((line, i) => (
                      <p key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        {line}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Processing Time */}
            {page.processingTime && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Processing Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{page.processingTime}</p>
                </CardContent>
              </Card>
            )}

            {/* Custom Sections */}
            {page.sections
              .filter((s) => s.content)
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <Card key={section.id}>
                  <CardHeader>
                    <CardTitle>{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                      {section.content}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply CTA */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Ready to Apply?</h3>
                <p className="text-sm opacity-90 mb-4">
                  Start your visa application now and get approved quickly.
                </p>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => router.push(`/?destination=${page.countryCode}`)}
                >
                  Apply Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Available Visa Types */}
            {availableVisaTypes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Available Visas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {availableVisaTypes.map((type) => (
                    <div key={type.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{type.purpose}</span>
                        <Badge variant="secondary" className="capitalize">
                          {type.entries}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Validity: {type.validityDays} days</p>
                        <p>Max Stay: {type.maxStay} days</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Need Help */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Our support team is available to assist you with your visa application.
                </p>
                <Button variant="outline" className="w-full" onClick={() => router.push("/contact")}>
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
