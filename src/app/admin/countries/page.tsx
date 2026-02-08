"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Globe, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { countryPagesService, countriesService } from "@/services";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";
import { useTranslations } from "@/stores/languageStore";
import type { CountryPage } from "@/types";

export default function CountriesPage() {
  const router = useRouter();
  const [countryPages, setCountryPages] = useState<CountryPage[]>([]);
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CountryPage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    countryCode: "",
    title: "",
    overview: "",
    requirements: "",
    processingTime: "",
  });

  useEffect(() => {
    loadCountryPages();
  }, []);

  const loadCountryPages = () => {
    const pages = countryPagesService.getAll();
    setCountryPages(pages);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      countryCode: "",
      title: "",
      overview: "",
      requirements: "",
      processingTime: "",
    });
    setEditingPage(null);
  };

  const handleOpenDialog = (page?: CountryPage) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        countryCode: page.countryCode,
        title: page.title,
        overview: page.overview || "",
        requirements: page.requirements || "",
        processingTime: page.processingTime || "",
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.countryCode) {
      toast.error(`${t.countries.country} ${t.common.required.toLowerCase()}`);
      return;
    }

    const country = countriesService.getByCode(formData.countryCode);
    const title = formData.title || `${country?.name} Vizası`;

    if (editingPage) {
      countryPagesService.update(editingPage.id, {
        ...formData,
        title,
      });
      toast.success(t.toast.updated);
    } else {
      countryPagesService.create({
        ...formData,
        title,
        isPublished: false,
        sections: [],
      });
      toast.success(t.toast.created);
    }

    setDialogOpen(false);
    resetForm();
    loadCountryPages();
  };

  const handleDelete = () => {
    if (deletingId) {
      countryPagesService.delete(deletingId);
      toast.success(t.toast.deleted);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      loadCountryPages();
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const togglePublish = (page: CountryPage) => {
    countryPagesService.update(page.id, { isPublished: !page.isPublished });
    toast.success(page.isPublished ? t.toast.pageUnpublished : t.toast.pagePublished);
    loadCountryPages();
  };

  const getCountryName = (code: string) => {
    const country = countriesService.getByCode(code);
    return country ? `${country.flag} ${country.name}` : code;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t.countries.title}</h1>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.countries.title}</h1>
          <p className="text-muted-foreground">{t.countries.subtitle}</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          {t.countries.addPage}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {countryPages.length === 0 ? (
            <EmptyState
              icon={Globe}
              title={t.countries.noPages}
              description={t.countries.createFirst}
              action={{
                label: t.countries.addPage,
                onClick: () => handleOpenDialog(),
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.countries.country}</TableHead>
                  <TableHead>{t.countries.pageTitle}</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>{t.common.status}</TableHead>
                  <TableHead className="text-right">{t.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countryPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell>{getCountryName(page.countryCode)}</TableCell>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell className="text-muted-foreground">/country/{page.slug}</TableCell>
                    <TableCell>
                      <Badge variant={page.isPublished ? "default" : "secondary"}>
                        {page.isPublished ? t.countries.published : t.countries.draft}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePublish(page)}
                          title={page.isPublished ? t.countries.unpublish : t.countries.publish}
                        >
                          {page.isPublished ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/countries/${page.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(page.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? `${t.common.edit} ${t.countries.title}` : t.countries.addPage}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.countries.form.selectCountry} *</Label>
              <CountrySelect
                value={formData.countryCode}
                onChange={(code) => setFormData({ ...formData, countryCode: code })}
                disabled={!!editingPage}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.countries.form.title}</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t.countries.form.titlePlaceholder}
              />
              <p className="text-xs text-muted-foreground">
                {t.countries.form.titleHelp}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t.countries.form.overview}</Label>
              <Textarea
                value={formData.overview}
                onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                placeholder={t.countries.form.overviewPlaceholder}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.countries.form.requirements}</Label>
              <Textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder={t.countries.form.requirementsPlaceholder}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.countries.form.processingTime}</Label>
              <Input
                value={formData.processingTime}
                onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
                placeholder={t.countries.form.processingTimePlaceholder}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleSubmit}>
                {editingPage ? t.common.update : t.common.create}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t.confirm.deleteTitle}
        description={t.confirm.deleteMessage}
        confirmLabel={t.common.delete}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
