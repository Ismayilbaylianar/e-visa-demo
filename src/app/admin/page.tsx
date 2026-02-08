"use client";

import { useEffect, useState } from "react";
import { FileText, Globe, Stamp, Users, DollarSign, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { applicationsService, visaTypesService, countryPagesService, bindingsService } from "@/services";
import { seedDemoData } from "@/services/seedService";
import { useTranslations } from "@/stores/languageStore";
import type { Application } from "@/types";

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  totalCountries: number;
  totalVisaTypes: number;
  totalBindings: number;
  recentApplications: Application[];
}

export default function AdminDashboardPage() {
  const t = useTranslations();
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    totalCountries: 0,
    totalVisaTypes: 0,
    totalBindings: 0,
    recentApplications: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      // Seed demo data if needed
      await seedDemoData();

      const applications = applicationsService.getAll();
      const visaTypes = visaTypesService.getAll();
      const countryPages = countryPagesService.getAll();
      const bindings = bindingsService.getAll();

      const pendingCount = applications.filter((a) =>
        a.applicants.some((ap) => ["submitted", "in_review"].includes(ap.status))
      ).length;

      const approvedCount = applications.filter((a) =>
        a.applicants.some((ap) => ap.status === "approved")
      ).length;

      setStats({
        totalApplications: applications.length,
        pendingApplications: pendingCount,
        approvedApplications: approvedCount,
        totalCountries: countryPages.length,
        totalVisaTypes: visaTypes.length,
        totalBindings: bindings.length,
        recentApplications: applications.slice(-5).reverse(),
      });
      setLoading(false);
    };

    loadStats();
  }, []);

  const statCards = [
    {
      title: t.dashboard.totalApplications,
      value: stats.totalApplications,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: t.dashboard.pendingReview,
      value: stats.pendingApplications,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: t.dashboard.approved,
      value: stats.approvedApplications,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: t.dashboard.countryPages,
      value: stats.totalCountries,
      icon: Globe,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: t.dashboard.visaTypes,
      value: stats.totalVisaTypes,
      icon: Stamp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: t.dashboard.activeBindings,
      value: stats.totalBindings,
      icon: DollarSign,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t.dashboard.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.dashboard.title}</h1>
        <p className="text-muted-foreground">{t.dashboard.welcome}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.recentApplications}</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentApplications.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {t.dashboard.noApplications}
            </p>
          ) : (
            <div className="space-y-4">
              {stats.recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{app.userEmail}</p>
                    <p className="text-sm text-muted-foreground">
                      {app.applicants.length} {t.applications.applicants.toLowerCase()} - {app.destinationCode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {app.totalFee} {app.currency}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
