"use client";

import { Globe, Shield, Clock, Users, Award, HeartHandshake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About E-Visa Portal</h1>
          <p className="text-xl text-muted-foreground">
            Your trusted partner for online visa applications
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-12">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              E-Visa Portal is dedicated to simplifying the visa application process for travelers
              worldwide. We believe that obtaining a visa should be straightforward, transparent,
              and accessible to everyone. Our platform leverages modern technology to provide a
              seamless experience from application to approval.
            </p>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Security First</h3>
              <p className="text-sm text-muted-foreground">
                Your personal data is protected with industry-leading security measures.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fast Processing</h3>
              <p className="text-sm text-muted-foreground">
                We process applications quickly to get you traveling sooner.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartHandshake className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Customer Support</h3>
              <p className="text-sm text-muted-foreground">
                Our dedicated team is here to help you every step of the way.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <Card className="mb-12">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold text-primary">190+</p>
                <p className="text-muted-foreground">Countries Served</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary">1M+</p>
                <p className="text-muted-foreground">Visas Processed</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary">98%</p>
                <p className="text-muted-foreground">Approval Rate</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary">24/7</p>
                <p className="text-muted-foreground">Support Available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Our Commitment</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We are committed to making international travel accessible to everyone.
            Our team works tirelessly to ensure that your visa application experience
            is smooth, efficient, and stress-free. Thank you for choosing E-Visa Portal
            as your travel companion.
          </p>
        </div>
      </div>
    </div>
  );
}
