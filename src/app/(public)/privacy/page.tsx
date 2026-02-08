"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <Card>
          <CardContent className="pt-6 prose prose-sm max-w-none">
            <p className="text-muted-foreground mb-6">
              Last updated: January 2024
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              We collect information you provide directly to us when applying for a visa, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
              <li>Personal identification information (name, date of birth, nationality)</li>
              <li>Passport details</li>
              <li>Contact information (email, phone number, address)</li>
              <li>Travel information</li>
              <li>Uploaded documents (passport copies, photos)</li>
              <li>Payment information</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
              <li>Process your visa application</li>
              <li>Communicate with you about your application status</li>
              <li>Process payments</li>
              <li>Provide customer support</li>
              <li>Improve our services</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">3. Information Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We may share your information with:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
              <li>Government authorities for visa processing</li>
              <li>Payment processors to complete transactions</li>
              <li>Service providers who assist in our operations</li>
              <li>Legal authorities when required by law</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">4. Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement appropriate technical and organizational measures to protect your
              personal information against unauthorized access, alteration, disclosure, or
              destruction. This includes encryption, secure servers, and access controls.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">5. Data Retention</h2>
            <p className="text-muted-foreground mb-4">
              We retain your personal information for as long as necessary to fulfill the
              purposes for which it was collected, including to satisfy legal, accounting,
              or reporting requirements.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to processing of your information</li>
              <li>Request data portability</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-4">7. Cookies</h2>
            <p className="text-muted-foreground mb-4">
              We use cookies and similar technologies to improve your experience on our
              website, analyze usage patterns, and personalize content. You can control
              cookie settings through your browser.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">8. Changes to This Policy</h2>
            <p className="text-muted-foreground mb-4">
              We may update this privacy policy from time to time. We will notify you of
              any changes by posting the new policy on this page and updating the "Last
              updated" date.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">9. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this privacy policy, please contact us at:
            </p>
            <p className="text-muted-foreground">
              Email: privacy@evisa.example.com<br />
              Address: 123 Visa Street, Global City, 12345
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
