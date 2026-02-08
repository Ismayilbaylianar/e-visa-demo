"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { applicationsService, countriesService, visaTypesService } from "@/services";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDateTime, formatCurrency } from "@/lib/utils/generators";
import { useTranslations } from "@/stores/languageStore";
import type { Application, ApplicationStatus } from "@/types";

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = () => {
    const apps = applicationsService.getAll();
    // Sort by creation date, newest first
    apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setApplications(apps);
    setLoading(false);
  };

  const getCountryName = (code: string) => {
    const country = countriesService.getByCode(code);
    return country ? `${country.flag} ${country.name}` : code;
  };

  const getVisaTypeName = (id: string) => {
    const type = visaTypesService.getById(id);
    return type?.label || id;
  };

  const getOverallStatus = (app: Application): ApplicationStatus => {
    if (app.applicants.length === 0) return "draft";
    
    // Return the "worst" status among applicants
    const statusPriority: ApplicationStatus[] = [
      "rejected",
      "need_docs",
      "in_review",
      "submitted",
      "unpaid",
      "draft",
      "approved",
      "ready_to_download",
    ];

    for (const status of statusPriority) {
      if (app.applicants.some((a) => a.status === status)) {
        return status;
      }
    }
    return "draft";
  };

  const filteredApplications = applications.filter((app) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      app.userEmail.toLowerCase().includes(searchLower) ||
      app.applicants.some(
        (a) =>
          a.email.toLowerCase().includes(searchLower) ||
          a.applicationCode?.toLowerCase().includes(searchLower)
      );

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      app.applicants.some((a) => a.status === statusFilter);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t.applications.title}</h1>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.applications.title}</h1>
        <p className="text-muted-foreground">{t.applications.subtitle}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.applications.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder={t.applications.filterByStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.applications.allStatuses}</SelectItem>
            <SelectItem value="draft">{t.applications.statuses.draft}</SelectItem>
            <SelectItem value="unpaid">{t.applications.statuses.unpaid}</SelectItem>
            <SelectItem value="submitted">{t.applications.statuses.submitted}</SelectItem>
            <SelectItem value="in_review">{t.applications.statuses.in_review}</SelectItem>
            <SelectItem value="need_docs">{t.applications.statuses.need_docs}</SelectItem>
            <SelectItem value="approved">{t.applications.statuses.approved}</SelectItem>
            <SelectItem value="rejected">{t.applications.statuses.rejected}</SelectItem>
            <SelectItem value="ready_to_download">{t.applications.statuses.ready_to_download}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredApplications.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={t.applications.noApplications}
              description={
                searchQuery || statusFilter !== "all"
                  ? t.applications.adjustFilters
                  : t.dashboard.noApplications
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-poçt</TableHead>
                  <TableHead>{t.applications.destination}</TableHead>
                  <TableHead>{t.applications.visaType}</TableHead>
                  <TableHead>{t.applications.applicants}</TableHead>
                  <TableHead>{t.applications.totalFee}</TableHead>
                  <TableHead>{t.common.status}</TableHead>
                  <TableHead>{t.applications.created}</TableHead>
                  <TableHead className="text-right">{t.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.userEmail}</TableCell>
                    <TableCell>{getCountryName(app.destinationCode)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {getVisaTypeName(app.visaTypeId)}
                    </TableCell>
                    <TableCell>{app.applicants.length}</TableCell>
                    <TableCell>{formatCurrency(app.totalFee, app.currency)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={getOverallStatus(app)} />
                        {app.paymentStatus === "expired" && (
                          <Badge variant="destructive">Vaxtı keçmiş</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(app.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/applications/${app.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
