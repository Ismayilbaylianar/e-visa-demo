"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Mail, Eye } from "lucide-react";
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
import { emailTemplatesService } from "@/services";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";
import { useTranslations } from "@/stores/languageStore";
import type { EmailTemplate } from "@/types";

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState({ subject: "", body: "" });

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    variables: "",
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    emailTemplatesService.initializeDefaults();
    const data = emailTemplatesService.getAll();
    setTemplates(data);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      subject: "",
      body: "",
      variables: "",
    });
    setEditingTemplate(null);
  };

  const handleOpenDialog = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        subject: template.subject,
        body: template.body,
        variables: template.variables.join(", "),
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handlePreview = (template: EmailTemplate) => {
    const preview = emailTemplatesService.preview(template.id);
    if (preview) {
      setPreviewContent(preview);
      setPreviewDialogOpen(true);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.subject || !formData.body) {
      toast.error("Ad, mövzu və mətn tələb olunur");
      return;
    }

    const variables = formData.variables
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v);

    if (editingTemplate) {
      emailTemplatesService.update(editingTemplate.id, {
        name: formData.name,
        subject: formData.subject,
        body: formData.body,
        variables,
      });
      toast.success(t.toast.updated);
    } else {
      emailTemplatesService.create({
        name: formData.name,
        subject: formData.subject,
        body: formData.body,
        variables,
        isActive: true,
      });
      toast.success(t.toast.created);
    }

    setDialogOpen(false);
    resetForm();
    loadTemplates();
  };

  const handleDelete = () => {
    if (deletingId) {
      emailTemplatesService.delete(deletingId);
      toast.success(t.toast.deleted);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      loadTemplates();
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t.emailTemplates.title}</h1>
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
          <h1 className="text-2xl font-bold">{t.emailTemplates.title}</h1>
          <p className="text-muted-foreground">{t.emailTemplates.subtitle}</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          {t.emailTemplates.addTemplate}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {templates.length === 0 ? (
            <EmptyState
              icon={Mail}
              title={t.emailTemplates.noTemplates}
              description={t.emailTemplates.createFirst}
              action={{
                label: t.emailTemplates.addTemplate,
                onClick: () => handleOpenDialog(),
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.emailTemplates.name}</TableHead>
                  <TableHead>{t.emailTemplates.subject}</TableHead>
                  <TableHead>{t.emailTemplates.variables}</TableHead>
                  <TableHead className="text-right">{t.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{template.subject}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.slice(0, 3).map((v) => (
                          <Badge key={v} variant="outline" className="text-xs">
                            {v}
                          </Badge>
                        ))}
                        {template.variables.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.variables.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePreview(template)}
                          title={t.emailTemplates.preview}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(template)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(template.id)}
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
              {editingTemplate ? `${t.common.edit}` : t.emailTemplates.addTemplate}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.emailTemplates.form.templateName} *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t.emailTemplates.form.templateNamePlaceholder}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.emailTemplates.form.subject} *</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder={t.emailTemplates.form.subjectPlaceholder}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.emailTemplates.form.body} *</Label>
              <Textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder={t.emailTemplates.form.bodyPlaceholder}
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                {t.emailTemplates.form.bodyHelp}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t.emailTemplates.form.variables}</Label>
              <Input
                value={formData.variables}
                onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                placeholder={t.emailTemplates.form.variablesPlaceholder}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleSubmit}>
                {editingTemplate ? t.common.update : t.common.create}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.emailTemplates.preview}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{t.emailTemplates.subject}:</p>
              <p className="font-medium">{previewContent.subject}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">{t.emailTemplates.form.body}:</p>
              <div className="whitespace-pre-wrap text-sm">{previewContent.body}</div>
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
