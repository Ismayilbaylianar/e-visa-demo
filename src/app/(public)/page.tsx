"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Shield, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CountrySelect } from "@/components/shared/CountrySelect";
import {
  bindingsService,
  visaTypesService,
  countriesService,
  countryPagesService,
} from "@/services";
import { ipService } from "@/services/ipService";
import { seedDemoData } from "@/services/seedService";
import { UN_COUNTRIES } from "@/data/un_countries";
import { useTranslations } from "@/stores/languageStore";
import type { VisaType } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [nationality, setNationality] = useState("");
  const [destination, setDestination] = useState("");
  const [visaTypeId, setVisaTypeId] = useState("");

  const [availableDestinations, setAvailableDestinations] = useState<string[]>([]);
  const [availableVisaTypes, setAvailableVisaTypes] = useState<VisaType[]>([]);
  const [feePreview, setFeePreview] = useState<{ gov: number; service: number; currency: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Seed demo data
        await seedDemoData();
      } catch (error) {
        console.error("Error seeding demo data:", error);
      }

      try {
        // Detect nationality from IP
        const detectedCountry = await ipService.detectCountry();
        setNationality(detectedCountry);
      } catch (error) {
        console.error("Error detecting country:", error);
        setNationality("AZ");
      }
      
      setLoading(false);
    };
    init();
  }, []);

  // Update available destinations when nationality changes
  useEffect(() => {
    if (!nationality) {
      setAvailableDestinations([]);
      return;
    }

    const destinations = bindingsService.getDestinationsForNationality(nationality);
    setAvailableDestinations(destinations);

    // Reset destination if not available
    if (destination && !destinations.includes(destination)) {
      setDestination("");
      setVisaTypeId("");
    }

    // Save nationality preference
    ipService.saveLastNationality(nationality);
  }, [nationality]);

  // Update available visa types when destination changes
  useEffect(() => {
    if (!nationality || !destination) {
      setAvailableVisaTypes([]);
      return;
    }

    const visaTypeIds = bindingsService.getVisaTypesForNationalityAndDestination(
      nationality,
      destination
    );
    const types = visaTypeIds
      .map((id) => visaTypesService.getById(id))
      .filter((vt): vt is VisaType => vt !== undefined);

    setAvailableVisaTypes(types);

    // Reset visa type if not available
    if (visaTypeId && !visaTypeIds.includes(visaTypeId)) {
      setVisaTypeId("");
    }
  }, [nationality, destination]);

  // Update fee preview when visa type changes
  useEffect(() => {
    if (!nationality || !destination || !visaTypeId) {
      setFeePreview(null);
      return;
    }

    const fees = bindingsService.getFees(nationality, destination, visaTypeId);
    if (fees) {
      setFeePreview({
        gov: fees.governmentFee,
        service: fees.serviceFee,
        currency: fees.currency,
      });
    }
  }, [nationality, destination, visaTypeId]);

  const handleContinue = () => {
    if (!nationality || !destination || !visaTypeId) return;

    const binding = bindingsService.getByDestinationAndVisaType(destination, visaTypeId);
    if (!binding) return;

    router.push(
      `/apply?nationality=${nationality}&destination=${destination}&visaType=${visaTypeId}&template=${binding.templateId}`
    );
  };

  const destinationCountries = availableDestinations
    .map((code) => UN_COUNTRIES.find((c) => c.cca2 === code))
    .filter((c) => c !== undefined);

  const featuredCountries = countryPagesService.getPublished().slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t.public.home.title}
            </h1>
            <p className="text-xl text-blue-100">
              {t.public.home.subtitle}
            </p>
          </div>

          {/* Visa Selection Form */}
          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t.public.home.selectNationality}</Label>
                  <CountrySelect
                    value={nationality}
                    onChange={setNationality}
                    placeholder={t.common.select}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.public.home.selectDestination}</Label>
                  <CountrySelect
                    value={destination}
                    onChange={setDestination}
                    placeholder={t.common.select}
                    countries={destinationCountries as typeof UN_COUNTRIES}
                    disabled={!nationality || availableDestinations.length === 0}
                  />
                  {nationality && availableDestinations.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t.public.home.noVisaAvailable}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t.public.home.selectVisaType}</Label>
                  <Select
                    value={visaTypeId}
                    onValueChange={setVisaTypeId}
                    disabled={!destination || availableVisaTypes.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.common.select} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVisaTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fee Preview */}
              {feePreview && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.public.home.feePreview}</p>
                      <p className="text-2xl font-bold">
                        {feePreview.currency} {feePreview.gov + feePreview.service}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.public.home.governmentFee}: {feePreview.currency} {feePreview.gov} + {t.public.home.serviceFee}:{" "}
                        {feePreview.currency} {feePreview.service}
                      </p>
                    </div>
                    <Button
                      size="lg"
                      onClick={handleContinue}
                      disabled={!nationality || !destination || !visaTypeId}
                    >
                      {t.common.continue}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {!feePreview && (
                <div className="mt-4 flex justify-end">
                  <Button
                    size="lg"
                    onClick={handleContinue}
                    disabled={!nationality || !destination || !visaTypeId}
                  >
                    {t.common.continue}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t.nav.about}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {t.public.country.processingTime}
                </h3>
                <p className="text-muted-foreground">
                  {t.public.faq.a1}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {t.nav.privacy}
                </h3>
                <p className="text-muted-foreground">
                  {t.public.footer.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {t.public.faq.q3}
                </h3>
                <p className="text-muted-foreground">
                  {t.public.faq.a3}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      {featuredCountries.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              {t.public.country.visaOptions}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCountries.map((page) => {
                const country = countriesService.getByCode(page.countryCode);
                return (
                  <Card
                    key={page.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => router.push(`/country/${page.slug}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-4xl">{country?.flag}</span>
                        <div>
                          <h3 className="font-semibold text-lg">{country?.name}</h3>
                          <p className="text-sm text-muted-foreground">{page.title}</p>
                        </div>
                      </div>
                      {page.processingTime && (
                        <p className="text-sm text-muted-foreground">
                          {t.public.country.processingTime}: {page.processingTime}
                        </p>
                      )}
                      <Button variant="link" className="p-0 mt-2">
                        {t.common.view} <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t.public.home.title}</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            {t.public.home.subtitle}
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            {t.public.home.startApplication}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
