"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2, ExternalLink, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { countryPagesService, countriesService } from "@/services";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";
import { useTranslations } from "@/stores/languageStore";
import type { CountryPage, CountryPageSection } from "@/types";
import { generateId } from "@/lib/utils/generators";

export default function EditCountryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations();

  const [page, setPage] = useState<CountryPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);

  useEffect(() => {
    const pageData = countryPagesService.getById(id);
    if (!pageData) {
      toast.error("Səhifə tapılmadı");
      router.push("/admin/countries");
      return;
    }
    setPage(pageData);
    setLoading(false);
  }, [id, router]);

  const handleSave = () => {
    if (!page) return;
    countryPagesService.update(page.id, page);
    toast.success(t.toast.saved);
  };

  const handleAddSection = () => {
    if (!page) return;
    const newSection: CountryPageSection = {
      id: generateId(),
      title: "",
      content: "",
      order: page.sections.length,
    };
    setPage({
      ...page,
      sections: [...page.sections, newSection],
    });
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<CountryPageSection>) => {
    if (!page) return;
    setPage({
      ...page,
      sections: page.sections.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    });
  };

  const handleDeleteSection = () => {
    if (!page || !deletingSectionId) return;
    setPage({
      ...page,
      sections: page.sections.filter((s) => s.id !== deletingSectionId),
    });
    setDeleteDialogOpen(false);
    setDeletingSectionId(null);
    toast.success(t.toast.deleted);
  };

  const confirmDeleteSection = (sectionId: string) => {
    setDeletingSectionId(sectionId);
    setDeleteDialogOpen(true);
  };

  if (loading || !page) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const country = countriesService.getByCode(page.countryCode);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/countries")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t.countries.edit.title}</h1>
            <p className="text-muted-foreground">
              {country?.flag} {country?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <a href={`/country/${page.slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              {t.countries.edit.viewPublic}
            </a>
          </Button>
          <Button onClick={handleSave}>{t.common.save}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t.countries.edit.basicInfo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t.countries.form.title}</Label>
                <Input
                  value={page.title}
                  onChange={(e) => setPage({ ...page, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>{t.countries.form.overview}</Label>
                <Textarea
                  value={page.overview || ""}
                  onChange={(e) => setPage({ ...page, overview: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>{t.countries.form.requirements}</Label>
                <Textarea
                  value={page.requirements || ""}
                  onChange={(e) => setPage({ ...page, requirements: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>{t.countries.form.processingTime}</Label>
                <Input
                  value={page.processingTime || ""}
                  onChange={(e) => setPage({ ...page, processingTime: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Custom Sections */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t.countries.edit.customSections}</CardTitle>
              <Button size="sm" onClick={handleAddSection}>
                <Plus className="h-4 w-4 mr-2" />
                {t.countries.edit.addSection}
              </Button>
            </CardHeader>
            <CardContent>
              {page.sections.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {t.countries.edit.noSections}
                </p>
              ) : (
                <div className="space-y-6">
                  {page.sections
                    .sort((a, b) => a.order - b.order)
                    .map((section, index) => (
                      <div key={section.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                            <span className="text-sm text-muted-foreground">
                              {t.countries.edit.order}: {index + 1}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDeleteSection(section.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>{t.countries.edit.sectionTitle}</Label>
                            <Input
                              value={section.title}
                              onChange={(e) =>
                                handleUpdateSection(section.id, { title: e.target.value })
                              }
                              placeholder="Bölmə başlığı..."
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>{t.countries.edit.sectionContent}</Label>
                            <Textarea
                              value={section.content}
                              onChange={(e) =>
                                handleUpdateSection(section.id, { content: e.target.value })
                              }
                              rows={4}
                              placeholder="Bölmə məzmunu..."
                            />
                            <p className="text-xs text-muted-foreground">
                              {t.countries.edit.sectionContentHelp}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.countries.edit.pageInfo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t.countries.published}</Label>
                <Switch
                  checked={page.isPublished}
                  onCheckedChange={(checked) => setPage({ ...page, isPublished: checked })}
                />
              </div>
              <Separator />
              <div>
                <Label className="text-muted-foreground">Slug</Label>
                <p className="font-mono text-sm">/country/{page.slug}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t.countries.country}</Label>
                <p>{country?.flag} {country?.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t.common.status}</Label>
                <div className="mt-1">
                  <Badge variant={page.isPublished ? "default" : "secondary"}>
                    {page.isPublished ? t.countries.published : t.countries.draft}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Section Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t.confirm.deleteSection}
        description={t.confirm.deleteSectionMessage}
        confirmLabel={t.common.delete}
        onConfirm={handleDeleteSection}
        variant="destructive"
      />
    </div>
  );
}
