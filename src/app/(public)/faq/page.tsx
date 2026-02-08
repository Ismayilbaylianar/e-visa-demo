"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    category: "Application Process",
    questions: [
      {
        q: "How do I apply for a visa?",
        a: "Simply select your nationality, destination country, and visa type on our homepage. Then fill out the application form, upload required documents, and complete the payment. You'll receive your e-Visa via email once approved.",
      },
      {
        q: "What documents do I need to apply?",
        a: "Required documents typically include a valid passport, passport-sized photo, and proof of travel arrangements. Specific requirements vary by destination country and visa type. The application form will clearly indicate all required documents.",
      },
      {
        q: "How long does the application process take?",
        a: "Standard processing takes 3-5 business days. Expedited processing (1-2 business days) is available for most destinations for an additional fee.",
      },
      {
        q: "Can I apply for multiple people at once?",
        a: "Yes! You can add multiple applicants to a single application. Each applicant will receive their own application code and e-Visa.",
      },
    ],
  },
  {
    category: "Payment & Fees",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards including Visa, Mastercard, and American Express. Payment is processed securely through our payment gateway.",
      },
      {
        q: "Is my payment secure?",
        a: "Yes, all payments are processed using bank-level encryption. We never store your complete card details on our servers.",
      },
      {
        q: "What happens if my application is rejected?",
        a: "If your application is rejected, you will be notified via email with the reason. Depending on the circumstances, you may be eligible for a partial refund of the service fee.",
      },
      {
        q: "How long do I have to complete payment?",
        a: "You have 3 hours to complete payment after submitting your application. After this time, your application will expire and you'll need to start a new one.",
      },
    ],
  },
  {
    category: "Tracking & Support",
    questions: [
      {
        q: "How can I track my application?",
        a: "Use the 'Track Application' feature on our website. Enter your email address and application code to see your current status.",
      },
      {
        q: "What do the different statuses mean?",
        a: "Draft: Application started but not submitted. Submitted: Application received and being processed. In Review: Under review by authorities. Need Docs: Additional documents required. Approved: Visa approved. Rejected: Application denied.",
      },
      {
        q: "How do I contact customer support?",
        a: "You can reach our support team via email at support@evisa.example.com or through our Contact page. We typically respond within 24 hours.",
      },
      {
        q: "What if I made a mistake in my application?",
        a: "If you notice an error before payment, you can go back and edit your application. After payment, please contact our support team immediately to request corrections.",
      },
    ],
  },
  {
    category: "E-Visa Usage",
    questions: [
      {
        q: "How do I receive my e-Visa?",
        a: "Once approved, your e-Visa will be sent to the email address provided during application. You can also download it from your account on our portal.",
      },
      {
        q: "Do I need to print my e-Visa?",
        a: "We recommend printing a copy of your e-Visa to present at immigration. Some countries also accept digital copies on your mobile device.",
      },
      {
        q: "How long is my e-Visa valid?",
        a: "Validity depends on the visa type you applied for. Check your e-Visa document for specific validity dates and maximum stay duration.",
      },
      {
        q: "Can I extend my e-Visa?",
        a: "E-Visa extensions are generally not possible through our portal. You would need to contact the immigration authorities of your destination country for extension options.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions about our visa services
          </p>
        </div>

        {/* FAQ Categories */}
        {faqs.map((category, index) => (
          <Card key={index} className="mb-6">
            <CardHeader>
              <CardTitle>{category.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((faq, faqIndex) => (
                  <AccordionItem key={faqIndex} value={`item-${index}-${faqIndex}`}>
                    <AccordionTrigger className="text-left">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}

        {/* Still have questions */}
        <div className="text-center mt-12 p-8 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Still have questions?</h2>
          <p className="text-muted-foreground mb-4">
            Our support team is here to help you with any questions or concerns.
          </p>
          <a
            href="/contact"
            className="text-primary hover:underline font-medium"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
