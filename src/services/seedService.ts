import { visaTypesService } from "./visaTypesService";
import { templatesService } from "./templatesService";
import { bindingsService } from "./bindingsService";
import { countryPagesService, countriesService } from "./countriesService";
import { adminAuthService } from "./adminAuthService";
import { emailTemplatesService } from "./emailTemplatesService";

// Seed demo data for the application
export async function seedDemoData(): Promise<void> {
  // Initialize admin users
  adminAuthService.initializeDefaultUsers();
  
  // Initialize email templates
  emailTemplatesService.initializeDefaults();

  // Check if data already exists
  if (visaTypesService.getAll().length > 0) {
    return; // Already seeded
  }

  // Create visa types
  const tourismSingle = visaTypesService.create({
    purpose: "Tourism",
    validityDays: 90,
    maxStay: 30,
    entries: "single",
    label: "Tourism - Single Entry - 30 days",
    description: "For tourists visiting for leisure purposes",
    isActive: true,
  });

  const tourismMultiple = visaTypesService.create({
    purpose: "Tourism",
    validityDays: 180,
    maxStay: 60,
    entries: "multiple",
    label: "Tourism - Multiple Entry - 60 days",
    description: "For frequent tourists",
    isActive: true,
  });

  const businessSingle = visaTypesService.create({
    purpose: "Business",
    validityDays: 90,
    maxStay: 30,
    entries: "single",
    label: "Business - Single Entry - 30 days",
    description: "For business meetings and conferences",
    isActive: true,
  });

  const businessMultiple = visaTypesService.create({
    purpose: "Business",
    validityDays: 365,
    maxStay: 90,
    entries: "multiple",
    label: "Business - Multiple Entry - 90 days",
    description: "For frequent business travelers",
    isActive: true,
  });

  const transit = visaTypesService.create({
    purpose: "Transit",
    validityDays: 15,
    maxStay: 3,
    entries: "single",
    label: "Transit - Single Entry - 3 days",
    description: "For travelers passing through",
    isActive: true,
  });

  // Create application template
  const standardTemplate = templatesService.create({
    name: "Standard Visa Application",
    description: "Standard application form for most visa types",
    isActive: true,
    sections: [
      {
        id: "personal",
        title: "Personal Information",
        description: "Please provide your personal details",
        order: 1,
        fields: [
          {
            id: "firstName",
            type: "text",
            label: "First Name",
            placeholder: "Enter your first name",
            validation: { required: true, minLength: 2, maxLength: 50 },
            order: 1,
          },
          {
            id: "lastName",
            type: "text",
            label: "Last Name",
            placeholder: "Enter your last name",
            validation: { required: true, minLength: 2, maxLength: 50 },
            order: 2,
          },
          {
            id: "dateOfBirth",
            type: "date",
            label: "Date of Birth",
            validation: { required: true },
            order: 3,
          },
          {
            id: "gender",
            type: "select",
            label: "Gender",
            options: [
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
              { label: "Other", value: "other" },
            ],
            validation: { required: true },
            order: 4,
          },
          {
            id: "placeOfBirth",
            type: "text",
            label: "Place of Birth",
            placeholder: "City, Country",
            validation: { required: true },
            order: 5,
          },
        ],
      },
      {
        id: "passport",
        title: "Passport Information",
        description: "Enter your passport details",
        order: 2,
        fields: [
          {
            id: "passportNumber",
            type: "text",
            label: "Passport Number",
            placeholder: "Enter passport number",
            validation: { required: true, minLength: 5, maxLength: 20 },
            order: 1,
          },
          {
            id: "passportIssueDate",
            type: "date",
            label: "Issue Date",
            validation: { required: true },
            order: 2,
          },
          {
            id: "passportExpiryDate",
            type: "date",
            label: "Expiry Date",
            helpText: "Must be valid for at least 6 months",
            validation: { required: true },
            order: 3,
          },
          {
            id: "passportIssuingCountry",
            type: "text",
            label: "Issuing Country",
            validation: { required: true },
            order: 4,
          },
        ],
      },
      {
        id: "contact",
        title: "Contact Information",
        description: "How can we reach you?",
        order: 3,
        fields: [
          {
            id: "email",
            type: "email",
            label: "Email Address",
            placeholder: "your@email.com",
            validation: { required: true },
            order: 1,
          },
          {
            id: "phone",
            type: "phone",
            label: "Phone Number",
            placeholder: "+1 234 567 8900",
            validation: { required: true },
            order: 2,
          },
          {
            id: "address",
            type: "textarea",
            label: "Current Address",
            placeholder: "Street, City, Country",
            validation: { required: true },
            order: 3,
          },
        ],
      },
      {
        id: "travel",
        title: "Travel Details",
        description: "Tell us about your trip",
        order: 4,
        fields: [
          {
            id: "purposeOfVisit",
            type: "textarea",
            label: "Purpose of Visit",
            placeholder: "Describe the purpose of your visit",
            validation: { required: true, minLength: 20 },
            order: 1,
          },
          {
            id: "plannedArrivalDate",
            type: "date",
            label: "Planned Arrival Date",
            validation: { required: true },
            order: 2,
          },
          {
            id: "plannedDepartureDate",
            type: "date",
            label: "Planned Departure Date",
            validation: { required: true },
            order: 3,
          },
          {
            id: "accommodationAddress",
            type: "textarea",
            label: "Accommodation Address",
            placeholder: "Hotel name and address",
            validation: { required: true },
            order: 4,
          },
        ],
      },
      {
        id: "documents",
        title: "Required Documents",
        description: "Upload the required documents",
        order: 5,
        fields: [
          {
            id: "passportPhoto",
            type: "file",
            label: "Passport Photo",
            helpText: "Recent passport-sized photo (JPEG/PNG, max 5MB)",
            validation: { required: true },
            order: 1,
          },
          {
            id: "passportCopy",
            type: "file",
            label: "Passport Copy",
            helpText: "Scan of passport bio page (PDF/JPEG, max 10MB)",
            validation: { required: true },
            order: 2,
          },
          {
            id: "flightBooking",
            type: "file",
            label: "Flight Booking",
            helpText: "Confirmed flight itinerary (PDF, max 10MB)",
            validation: { required: false },
            order: 3,
          },
          {
            id: "hotelBooking",
            type: "file",
            label: "Hotel Booking",
            helpText: "Hotel reservation confirmation (PDF, max 10MB)",
            validation: { required: false },
            order: 4,
          },
        ],
      },
      {
        id: "declaration",
        title: "Declaration",
        description: "Please confirm the following",
        order: 6,
        fields: [
          {
            id: "declarationAccuracy",
            type: "checkbox",
            label: "I declare that all information provided is true and accurate",
            validation: { required: true, customError: "You must confirm that the information is accurate" },
            order: 1,
          },
          {
            id: "declarationTerms",
            type: "checkbox",
            label: "I agree to the terms and conditions",
            validation: { required: true, customError: "You must agree to the terms and conditions" },
            order: 2,
          },
        ],
      },
    ],
  });

  // Create bindings for popular destinations
  const destinations = ["US", "GB", "FR", "DE", "AE", "TR", "JP", "AU"];
  const popularNationalities = ["AZ", "TR", "RU", "UA", "GE", "KZ", "UZ", "IN", "PK", "BD", "CN", "NG", "EG", "SA"];

  destinations.forEach((dest) => {
    // Tourism Single binding
    const tourismSingleBinding = bindingsService.create({
      destinationCode: dest,
      visaTypeId: tourismSingle.id,
      templateId: standardTemplate.id,
      nationalities: [],
      isActive: true,
    });

    // Add nationalities with fees
    popularNationalities.forEach((nat) => {
      bindingsService.setNationalityBinding(tourismSingleBinding.id, {
        nationalityCode: nat,
        governmentFee: 50 + Math.floor(Math.random() * 50),
        serviceFee: 20 + Math.floor(Math.random() * 30),
        currency: "USD",
        expeditedFee: 50,
        expeditedEnabled: true,
      });
    });

    // Tourism Multiple binding
    const tourismMultipleBinding = bindingsService.create({
      destinationCode: dest,
      visaTypeId: tourismMultiple.id,
      templateId: standardTemplate.id,
      nationalities: [],
      isActive: true,
    });

    popularNationalities.forEach((nat) => {
      bindingsService.setNationalityBinding(tourismMultipleBinding.id, {
        nationalityCode: nat,
        governmentFee: 100 + Math.floor(Math.random() * 50),
        serviceFee: 30 + Math.floor(Math.random() * 30),
        currency: "USD",
        expeditedFee: 75,
        expeditedEnabled: true,
      });
    });

    // Business Single binding
    const businessSingleBinding = bindingsService.create({
      destinationCode: dest,
      visaTypeId: businessSingle.id,
      templateId: standardTemplate.id,
      nationalities: [],
      isActive: true,
    });

    popularNationalities.forEach((nat) => {
      bindingsService.setNationalityBinding(businessSingleBinding.id, {
        nationalityCode: nat,
        governmentFee: 80 + Math.floor(Math.random() * 50),
        serviceFee: 35 + Math.floor(Math.random() * 30),
        currency: "USD",
        expeditedFee: 60,
        expeditedEnabled: true,
      });
    });
  });

  // Create country pages for some destinations
  const countryDescriptions: Record<string, { overview: string; requirements: string; processingTime: string }> = {
    US: {
      overview: "The United States welcomes millions of visitors each year for tourism, business, and other purposes. Our e-Visa system makes it easy to apply for your visa online.",
      requirements: "Valid passport with at least 6 months validity, recent passport photo, proof of accommodation, return flight booking, sufficient funds for your stay.",
      processingTime: "Standard processing: 3-5 business days. Expedited processing: 1-2 business days.",
    },
    GB: {
      overview: "The United Kingdom offers a rich cultural experience with its historic landmarks, vibrant cities, and beautiful countryside. Apply for your UK visa online.",
      requirements: "Valid passport, passport photo, travel itinerary, proof of accommodation, bank statements showing sufficient funds.",
      processingTime: "Standard processing: 3-5 business days. Expedited processing: 24-48 hours.",
    },
    FR: {
      overview: "France is one of the world's most visited countries, known for its art, culture, cuisine, and iconic landmarks like the Eiffel Tower.",
      requirements: "Valid passport, Schengen visa photo requirements, travel insurance, hotel booking, return ticket.",
      processingTime: "Standard processing: 5-7 business days. Expedited processing: 2-3 business days.",
    },
    AE: {
      overview: "The United Arab Emirates offers a unique blend of traditional Arabian culture and modern luxury. Dubai and Abu Dhabi await your visit.",
      requirements: "Valid passport with 6 months validity, passport photo, confirmed hotel booking, return flight ticket.",
      processingTime: "Standard processing: 2-4 business days. Expedited processing: 24 hours.",
    },
    TR: {
      overview: "Turkey bridges Europe and Asia, offering incredible history, stunning landscapes, and warm hospitality. Apply for your Turkish e-Visa today.",
      requirements: "Valid passport, passport photo, travel dates, accommodation details.",
      processingTime: "Standard processing: 1-3 business days. Expedited processing: Same day.",
    },
  };

  Object.entries(countryDescriptions).forEach(([code, info]) => {
    const country = countriesService.getByCode(code);
    if (country) {
      countryPagesService.create({
        countryCode: code,
        title: `${country.name} Visa`,
        overview: info.overview,
        requirements: info.requirements,
        processingTime: info.processingTime,
        sections: [
          {
            id: "eligibility",
            title: "Eligibility",
            content: "Citizens of eligible countries can apply for an e-Visa online. Check if your nationality is eligible by starting an application.",
            order: 1,
          },
          {
            id: "howToApply",
            title: "How to Apply",
            content: "1. Select your nationality and visa type\n2. Fill out the online application form\n3. Upload required documents\n4. Pay the visa fee\n5. Receive your e-Visa by email",
            order: 2,
          },
        ],
        isPublished: true,
      });
    }
  });

  console.log("Demo data seeded successfully!");
}
