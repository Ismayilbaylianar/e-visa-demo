"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <Card>
          <CardContent className="pt-6 prose prose-sm max-w-none">
            <p className="text-muted-foreground mb-6">
              Last updated: January 2024
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground mb-4">
              By accessing and using E-Visa Portal, you accept and agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">2. Services Description</h2>
            <p className="text-muted-foreground mb-4">
              E-Visa Portal provides an online platform for visa application processing. We act
              as an intermediary between applicants and government visa authorities. We do not
              guarantee visa approval, as final decisions are made by the respective government
              authorities.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">3. User Responsibilities</h2>
            <p className="text-muted-foreground mb-4">
              As a user of our services, you agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
              <li>Provide accurate and truthful information in your application</li>
              <li>Submit genuine and valid documents</li>
              <li>Pay all applicable fees in a timely manner</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not use our services for any illegal purposes</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">4. Fees and Payment</h2>
            <p className="text-muted-foreground mb-4">
              All fees are displayed before you complete your application. Fees include
              government visa fees and our service fees. Payment must be completed within
              the specified timeframe. Fees are generally non-refundable once the application
              has been submitted to authorities.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">5. Refund Policy</h2>
            <p className="text-muted-foreground mb-4">
              Refunds may be issued in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
              <li>Application cancelled before submission to authorities (service fee may apply)</li>
              <li>Technical errors on our part preventing application processing</li>
              <li>Duplicate payments</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Government fees are generally non-refundable once submitted to authorities.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">6. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4">
              E-Visa Portal shall not be liable for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
              <li>Visa application rejections by government authorities</li>
              <li>Delays in processing by government authorities</li>
              <li>Travel disruptions or losses resulting from visa issues</li>
              <li>Inaccurate information provided by users</li>
              <li>Technical issues beyond our reasonable control</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground mb-4">
              All content on this website, including text, graphics, logos, and software,
              is the property of E-Visa Portal and is protected by intellectual property laws.
              You may not reproduce, distribute, or create derivative works without our
              express written permission.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">8. Privacy</h2>
            <p className="text-muted-foreground mb-4">
              Your use of our services is also governed by our Privacy Policy. Please review
              our Privacy Policy to understand how we collect, use, and protect your information.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">9. Modifications</h2>
            <p className="text-muted-foreground mb-4">
              We reserve the right to modify these terms at any time. Changes will be effective
              immediately upon posting on this page. Your continued use of our services after
              changes constitutes acceptance of the modified terms.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">10. Governing Law</h2>
            <p className="text-muted-foreground mb-4">
              These terms shall be governed by and construed in accordance with applicable laws.
              Any disputes arising from these terms shall be resolved through appropriate legal
              channels.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">11. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these terms, please contact us at:<br />
              Email: legal@evisa.example.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
