"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Plus,
  Trash2,
  User,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import type { ApplicationTemplate, FormField, FormSection, NationalityBinding } from "@/types";
import { getPhoneCodeByCountry } from "@/data/country_phone_codes";
import { PhoneCodeSelect } from "@/components/shared/PhoneCodeSelect";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { UN_COUNTRIES } from "@/data/un_countries";

function ApplyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  const nationality = searchParams.get("nationality") || "";
  const destination = searchParams.get("destination") || "";
  const visaTypeId = searchParams.get("visaType") || "";
  const templateId = searchParams.get("template") || "";

  const {
    verifiedEmail,
    setVerifiedEmail,
    applicantsData,
    addApplicant,
    removeApplicant,
    updateApplicantFormData,
    updateApplicantDocument,
    setCurrentApplication,
    currentApplication,
    setExpedited,
    clearApplication,
  } = useApplicationStore();

  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<ApplicationTemplate | null>(null);
  const [fees, setFees] = useState<NationalityBinding | null>(null);

  // Email verification
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifying, setVerifying] = useState(false);

  // Applicant expansion state
  const [expandedApplicants, setExpandedApplicants] = useState<Set<string>>(new Set());
  
  // Date validation errors per applicant
  const [dateErrors, setDateErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!nationality || !destination || !visaTypeId || !templateId) {
      router.push("/");
      return;
    }

    const templateData = templatesService.getById(templateId);
    const feesData = bindingsService.getFees(nationality, destination, visaTypeId);

    if (!templateData || !feesData) {
      toast.error("Invalid application configuration");
      router.push("/");
      return;
    }

    setTemplate(templateData);
    setFees(feesData);

    // Set current application
    setCurrentApplication({
      nationalityCode: nationality,
      destinationCode: destination,
      visaTypeId,
      templateId,
      expedited: currentApplication?.expedited || false,
    });

    // Add first applicant if none exists
    if (applicantsData.length === 0) {
      const id = addApplicant();
      setExpandedApplicants(new Set([id]));
    } else {
      setExpandedApplicants(new Set([applicantsData[0].id]));
    }

    setLoading(false);
  }, [nationality, destination, visaTypeId, templateId]);

  // Auto-fill issuing country fields with nationality
  useEffect(() => {
    if (!template || !nationality || applicantsData.length === 0) return;
    
    // Find issuing country fields and auto-fill them
    for (const section of template.sections) {
      for (const field of section.fields) {
        const fieldLabel = field.label.toLowerCase();
        // Check if this is an issuing country field
        if (fieldLabel.includes("issuing") && (fieldLabel.includes("country") || fieldLabel.includes("ölkə"))) {
          // Auto-fill for all applicants
          for (const applicant of applicantsData) {
            if (!applicant.formData[field.id]) {
              updateApplicantFormData(applicant.id, { [field.id]: nationality });
            }
          }
        }
      }
    }
  }, [template, nationality, applicantsData.length]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendCode = () => {
    if (!email) {
      toast.error(t.public.apply.enterEmail);
      return;
    }

    // Simulate sending code
    setCodeSent(true);
    setResendCooldown(60);
    toast.success(t.toast.codeSent);
  };

  const handleVerifyCode = () => {
    setVerifying(true);

    // Only accept "123456" for demo
    if (usersService.verifyCode(verificationCode)) {
      setVerifiedEmail(email);
      usersService.create(email);
      toast.success(t.toast.codeVerified);

      // Update first applicant with email
      if (applicantsData.length > 0) {
        updateApplicantFormData(applicantsData[0].id, { email });
      }
    } else {
      toast.error(t.toast.invalidCode);
    }

    setVerifying(false);
  };

  const handleAddApplicant = () => {
    const id = addApplicant();
    setExpandedApplicants(new Set([...expandedApplicants, id]));
    
    // Auto-fill issuing country for new applicant
    if (template && nationality) {
      for (const section of template.sections) {
        for (const field of section.fields) {
          const fieldLabel = field.label.toLowerCase();
          if (fieldLabel.includes("issuing") && (fieldLabel.includes("country") || fieldLabel.includes("ölkə"))) {
            updateApplicantFormData(id, { [field.id]: nationality });
          }
        }
      }
    }
    
    toast.success(t.toast.created);
  };

  const handleRemoveApplicant = (id: string) => {
    if (applicantsData.length <= 1) {
      toast.error(t.common.required);
      return;
    }
    removeApplicant(id);
    const newExpanded = new Set(expandedApplicants);
    newExpanded.delete(id);
    setExpandedApplicants(newExpanded);
    toast.success(t.toast.deleted);
  };

  const toggleApplicantExpanded = (id: string) => {
    const newExpanded = new Set(expandedApplicants);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedApplicants(newExpanded);
  };

  const handleFieldChange = (applicantId: string, fieldId: string, value: unknown) => {
    updateApplicantFormData(applicantId, { [fieldId]: value });
  };

  const handleFileChange = async (applicantId: string, fieldId: string, file: File | null) => {
    if (file) {
      updateApplicantDocument(applicantId, fieldId, file);
    } else {
      updateApplicantDocument(applicantId, fieldId, null);
    }
  };

  const shouldShowField = (field: FormField, formData: Record<string, unknown>): boolean => {
    if (!field.conditionalVisibility) return true;

    const { fieldId, operator, value } = field.conditionalVisibility;
    const fieldValue = String(formData[fieldId] || "");

    switch (operator) {
      case "equals":
        return fieldValue === value;
      case "not_equals":
        return fieldValue !== value;
      case "contains":
        return fieldValue.includes(value);
      default:
        return true;
    }
  };

  const renderField = (
    field: FormField,
    applicantId: string,
    formData: Record<string, unknown>,
    disabled: boolean
  ) => {
    if (!shouldShowField(field, formData)) return null;

    const value = formData[field.id];
    const applicant = applicantsData.find((a) => a.id === applicantId);
    const fileValue = applicant?.documents[field.id];

    const commonProps = {
      disabled,
      id: `${applicantId}-${field.id}`,
    };

    // Check if this is an issuing country field
    const fieldLabel = field.label.toLowerCase();
    const isIssuingCountryField = fieldLabel.includes("issuing") && (fieldLabel.includes("country") || fieldLabel.includes("ölkə"));

    switch (field.type) {
      case "text":
        // Special handling for issuing country field - show country selector
        if (isIssuingCountryField) {
          const countryValue = String(value || nationality || "");
          const selectedCountry = UN_COUNTRIES.find(c => c.cca2 === countryValue || c.name === countryValue);
          
          return (
            <CountrySelect
              value={selectedCountry?.cca2 || countryValue}
              onChange={(code) => handleFieldChange(applicantId, field.id, code)}
              placeholder={field.placeholder || t.public.home.selectNationality}
              disabled={disabled}
            />
          );
        }
        
        return (
          <Input
            {...commonProps}
            type="text"
            value={String(value || "")}
            onChange={(e) => handleFieldChange(applicantId, field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case "email":
        return (
          <Input
            {...commonProps}
            type="email"
            value={String(value || "")}
            onChange={(e) => handleFieldChange(applicantId, field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case "phone":
        const phoneValue = String(value || "");
        const phoneCodeMatch = phoneValue.match(/^(\+[\d-]+)\s*/);
        const currentPhoneCode = phoneCodeMatch ? phoneCodeMatch[1].trim() : getPhoneCodeByCountry(nationality);
        const phoneNumber = phoneCodeMatch ? phoneValue.replace(phoneCodeMatch[0], "") : phoneValue;
        
        // Only allow digits in phone number
        const handlePhoneNumberChange = (inputValue: string) => {
          const digitsOnly = inputValue.replace(/\D/g, "");
          handleFieldChange(applicantId, field.id, `${currentPhoneCode} ${digitsOnly}`);
        };
        
        return (
          <div className="flex gap-2">
            <PhoneCodeSelect
              value={currentPhoneCode}
              onValueChange={(code) => {
                handleFieldChange(applicantId, field.id, `${code} ${phoneNumber}`);
              }}
              disabled={disabled}
            />
            <Input
              {...commonProps}
              type="tel"
              className="flex-1"
              value={phoneNumber}
              onChange={(e) => handlePhoneNumberChange(e.target.value)}
              placeholder={field.placeholder || "50 123 45 67"}
            />
          </div>
        );

      case "number":
        return (
          <Input
            {...commonProps}
            type="number"
            value={String(value || "")}
            onChange={(e) => handleFieldChange(applicantId, field.id, e.target.value)}
            placeholder={field.placeholder}
            min={field.validation.min}
            max={field.validation.max}
          />
        );

      case "textarea":
        return (
          <Textarea
            {...commonProps}
            value={String(value || "")}
            onChange={(e) => handleFieldChange(applicantId, field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
          />
        );

      case "date":
        const dateValue = String(value || "");
        const fieldLabel = field.label.toLowerCase();
        const isDepartureField = fieldLabel.includes("departure") || fieldLabel.includes("travel") || fieldLabel.includes("səfər") || fieldLabel.includes("gediş");
        const errorKey = `${applicantId}-${field.id}`;
        const dateError = dateErrors[errorKey];
        
        const handleDateChange = (newValue: string) => {
          handleFieldChange(applicantId, field.id, newValue);
          
          // Real-time validation for departure date
          if (isDepartureField && newValue) {
            // Find passport expiry date in the same applicant's form data
            let passportExpiryDate: string | null = null;
            
            for (const section of template?.sections || []) {
              for (const f of section.fields) {
                if (f.type === "date") {
                  const fLabel = f.label.toLowerCase();
                  if (fLabel.includes("passport") && (fLabel.includes("expiry") || fLabel.includes("expire") || fLabel.includes("bitmə") || fLabel.includes("etibarlılıq"))) {
                    passportExpiryDate = String(formData[f.id] || "");
                    break;
                  }
                }
              }
              if (passportExpiryDate) break;
            }
            
            if (passportExpiryDate) {
              const departureDate = new Date(newValue);
              const expiryDate = new Date(passportExpiryDate);
              
              if (departureDate >= expiryDate) {
                setDateErrors(prev => ({
                  ...prev,
                  [errorKey]: t.public.apply.passportExpiryError || "Səfər tarixi pasportun bitmə tarixindən əvvəl olmalıdır"
                }));
              } else {
                // Check 6 months validity
                const sixMonthsFromDeparture = new Date(departureDate);
                sixMonthsFromDeparture.setMonth(sixMonthsFromDeparture.getMonth() + 6);
                
                if (expiryDate < sixMonthsFromDeparture) {
                  setDateErrors(prev => ({
                    ...prev,
                    [errorKey]: t.public.apply.passportValidityWarning || "Pasportun səfər tarixindən ən azı 6 ay etibarlı olması tövsiyə olunur"
                  }));
                } else {
                  setDateErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[errorKey];
                    return newErrors;
                  });
                }
              }
            }
          }
        };
        
        return (
          <div className="space-y-1">
            <Input
              {...commonProps}
              type="date"
              value={dateValue}
              onChange={(e) => handleDateChange(e.target.value)}
              className={dateError ? "border-destructive" : ""}
            />
            {dateError && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {dateError}
              </p>
            )}
          </div>
        );

      case "select":
        return (
          <Select
            value={String(value || "")}
            onValueChange={(v) => handleFieldChange(applicantId, field.id, v)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <RadioGroup
            value={String(value || "")}
            onValueChange={(v) => handleFieldChange(applicantId, field.id, v)}
            disabled={disabled}
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${applicantId}-${field.id}-${option.value}`} />
                <Label htmlFor={`${applicantId}-${field.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              {...commonProps}
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleFieldChange(applicantId, field.id, checked)}
            />
            <Label htmlFor={commonProps.id} className="text-sm font-normal">
              {field.label}
            </Label>
          </div>
        );

      case "file":
        return (
          <div className="space-y-2">
            <Input
              {...commonProps}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                handleFileChange(applicantId, field.id, file);
              }}
              accept="image/*,.pdf"
            />
            {fileValue && (
              <p className="text-sm text-muted-foreground">
                Selected: {fileValue.name}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const calculateTotalFee = () => {
    if (!fees) return 0;
    const baseFee = fees.governmentFee + fees.serviceFee;
    const expeditedFee = currentApplication?.expedited && fees.expeditedEnabled ? (fees.expeditedFee || 0) : 0;
    return (baseFee + expeditedFee) * applicantsData.length;
  };

  const handleProceedToReview = async () => {
    // Basic validation
    if (!verifiedEmail) {
      toast.error(t.public.apply.emailVerification);
      return;
    }

    if (applicantsData.length === 0) {
      toast.error(t.common.required);
      return;
    }
    
    // Check if there are any date validation errors
    if (Object.keys(dateErrors).length > 0) {
      // Find the first error that contains "expiry" (blocking error)
      const blockingError = Object.values(dateErrors).find(err => 
        err.includes("əvvəl") || err.includes("before")
      );
      if (blockingError) {
        toast.error(blockingError);
        return;
      }
    }

    // Check required fields for each applicant
    for (let i = 0; i < applicantsData.length; i++) {
      const applicant = applicantsData[i];
      
      // Collect date fields for cross-validation
      let passportExpiryDate: string | null = null;
      let departureDate: string | null = null;
      
      for (const section of template?.sections || []) {
        for (const field of section.fields) {
          // Skip validation if field is conditionally hidden
          if (!shouldShowField(field, applicant.formData)) continue;
          
          // Collect date values for cross-validation
          if (field.type === "date") {
            const fieldLabel = field.label.toLowerCase();
            const fieldValue = String(applicant.formData[field.id] || "");
            
            if (fieldLabel.includes("passport") && (fieldLabel.includes("expiry") || fieldLabel.includes("expire") || fieldLabel.includes("bitmə") || fieldLabel.includes("etibarlılıq"))) {
              passportExpiryDate = fieldValue;
            }
            if (fieldLabel.includes("departure") || fieldLabel.includes("travel") || fieldLabel.includes("səfər") || fieldLabel.includes("gediş")) {
              departureDate = fieldValue;
            }
          }
          
          if (field.validation.required) {
            // For file fields, check documents object
            if (field.type === "file") {
              if (!applicant.documents[field.id]) {
                toast.error(`${field.label} - ${t.public.apply.applicant} #${i + 1}`);
                return;
              }
            } 
            // For checkbox, check if true
            else if (field.type === "checkbox") {
              if (!applicant.formData[field.id]) {
                toast.error(`${field.label} - ${t.public.apply.applicant} #${i + 1}`);
                return;
              }
            }
            // For other fields, check formData
            else {
              const value = applicant.formData[field.id];
              if (value === undefined || value === null || value === "") {
                toast.error(`${field.label} - ${t.public.apply.applicant} #${i + 1}`);
                return;
              }
            }
          }
        }
      }
      
      // Cross-validate passport expiry and departure date
      if (passportExpiryDate && departureDate) {
        const expiryDateObj = new Date(passportExpiryDate);
        const departureDateObj = new Date(departureDate);
        
        if (departureDateObj >= expiryDateObj) {
          toast.error(
            t.public.apply.passportExpiryError || 
            `Səfər tarixi pasportun bitmə tarixindən əvvəl olmalıdır - ${t.public.apply.applicant} #${i + 1}`
          );
          return;
        }
        
        // Also check if passport has at least 6 months validity from departure
        const sixMonthsFromDeparture = new Date(departureDateObj);
        sixMonthsFromDeparture.setMonth(sixMonthsFromDeparture.getMonth() + 6);
        
        if (expiryDateObj < sixMonthsFromDeparture) {
          toast.error(
            t.public.apply.passportValidityWarning ||
            `Pasportun səfər tarixindən ən azı 6 ay etibarlı olması tövsiyə olunur - ${t.public.apply.applicant} #${i + 1}`
          );
          // This is a warning, not blocking - user can still proceed
        }
      }
    }

    router.push("/apply/review");
  };

  if (loading) {
    return <PageLoader />;
  }

  const country = countriesService.getByCode(destination);
  const visaType = visaTypesService.getById(visaTypeId);
  const nationalityCountry = countriesService.getByCode(nationality);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t.public.apply.title}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{nationalityCountry?.flag} {nationalityCountry?.name}</Badge>
            <Badge variant="outline">{t.common.to}</Badge>
            <Badge variant="outline">{country?.flag} {country?.name}</Badge>
            <Badge>{visaType?.label}</Badge>
          </div>
        </div>

        {/* Email Verification */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t.public.apply.emailVerification}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {verifiedEmail ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>{t.public.apply.verified}: {verifiedEmail}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setVerifiedEmail(null);
                    setCodeSent(false);
                    setVerificationCode("");
                  }}
                >
                  {t.public.apply.change}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder={t.public.apply.enterEmail}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={codeSent}
                    />
                  </div>
                  <Button onClick={handleSendCode} disabled={codeSent && resendCooldown > 0}>
                    {codeSent
                      ? resendCooldown > 0
                        ? `${t.public.apply.resendCode} (${resendCooldown}s)`
                        : t.public.apply.resendCode
                      : t.public.apply.sendCode}
                  </Button>
                </div>

                {codeSent && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder={t.public.apply.enterCode}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                      />
                    </div>
                    <Button onClick={handleVerifyCode} disabled={verifying || verificationCode.length !== 6}>
                      {verifying ? t.public.apply.verifying : t.public.apply.verify}
                    </Button>
                  </div>
                )}

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t.public.apply.demoCodeHint}: <strong>123456</strong>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Applicants */}
        <div className="space-y-6 mb-8">
          {applicantsData.map((applicant, index) => (
            <Card key={applicant.id}>
              <Collapsible
                open={expandedApplicants.has(applicant.id)}
                onOpenChange={() => toggleApplicantExpanded(applicant.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {t.public.apply.applicant} #{index + 1}
                        {index === 0 && <Badge variant="secondary">{t.public.apply.mainApplicant}</Badge>}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {index > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveApplicant(applicant.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                        {expandedApplicants.has(applicant.id) ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {/* Read-only info for additional applicants */}
                    {index > 0 && (
                      <Alert className="mb-6">
                        <AlertDescription>
                          {t.public.apply.sharedInfo}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Form Sections */}
                    {template?.sections
                      .sort((a, b) => a.order - b.order)
                      .map((section) => (
                        <div key={section.id} className="mb-8">
                          <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
                          {section.description && (
                            <p className="text-sm text-muted-foreground mb-4">
                              {section.description}
                            </p>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {section.fields
                              .sort((a, b) => a.order - b.order)
                              .map((field) => {
                                // Skip rendering if field shouldn't be shown
                                if (!shouldShowField(field, applicant.formData)) return null;

                                // Checkbox renders its own label
                                if (field.type === "checkbox") {
                                  return (
                                    <div key={field.id} className="md:col-span-2">
                                      {renderField(field, applicant.id, applicant.formData, !verifiedEmail)}
                                      {field.helpText && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {field.helpText}
                                        </p>
                                      )}
                                    </div>
                                  );
                                }

                                return (
                                  <div
                                    key={field.id}
                                    className={
                                      field.type === "textarea" || field.type === "file"
                                        ? "md:col-span-2"
                                        : ""
                                    }
                                  >
                                    <Label htmlFor={`${applicant.id}-${field.id}`}>
                                      {field.label}
                                      {field.validation.required && (
                                        <span className="text-destructive ml-1">*</span>
                                      )}
                                    </Label>
                                    <div className="mt-1">
                                      {renderField(field, applicant.id, applicant.formData, !verifiedEmail)}
                                    </div>
                                    {field.helpText && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {field.helpText}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}

          {/* Add Applicant Button */}
          <Button variant="outline" className="w-full" onClick={handleAddApplicant}>
            <Plus className="h-4 w-4 mr-2" />
            {t.public.apply.addApplicant}
          </Button>
        </div>

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

              {fees?.expeditedEnabled && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="font-medium">{t.public.apply.expeditedProcessing}</span>
                    <p className="text-sm text-muted-foreground">
                      +{formatCurrency(fees.expeditedFee || 0, fees.currency)} {t.public.home.perPerson}
                    </p>
                  </div>
                  <Switch
                    checked={currentApplication?.expedited || false}
                    onCheckedChange={(checked) => setExpedited(checked)}
                  />
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>{t.public.home.total}</span>
                <span>{formatCurrency(calculateTotalFee(), fees?.currency || "USD")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.push("/")}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleProceedToReview} disabled={!verifiedEmail}>
            {t.public.apply.reviewApplication}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ApplyPageContent />
    </Suspense>
  );
}
