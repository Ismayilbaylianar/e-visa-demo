"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, GripVertical, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { paymentPageService } from "@/services";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { generateId } from "@/lib/utils/generators";
import { toast } from "sonner";
import { useTranslations } from "@/stores/languageStore";
import type { PaymentPageConfig, PaymentPageSection } from "@/types";

export default function PaymentPageBuilderPage() {
  const [config, setConfig] = useState<PaymentPageConfig | null>(null);
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    const data = paymentPageService.getConfig();
    setConfig(data);
    setLoading(false);
  };

  const handleSave = () => {
    if (!config) return;
    paymentPageService.updateConfig(config);
    toast.success(t.toast.saved);
  };

  const handleAddSection = () => {
    if (!config) return;
    const newSection: PaymentPageSection = {
      id: generateId(),
      title: "",
      fields: [{ id: generateId(), label: "", value: "" }],
      order: config.sections.length,
    };
    setConfig({
      ...config,
      sections: [...config.sections, newSection],
    });
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<PaymentPageSection>) => {
    if (!config) return;
    setConfig({
      ...config,
      sections: config.sections.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    });
  };

  const handleAddField = (sectionId: string) => {
    if (!config) return;
    setConfig({
      ...config,
      sections: config.sections.map((s) =>
        s.id === sectionId
          ? { ...s, fields: [...s.fields, { id: generateId(), label: "", value: "" }] }
          : s
      ),
    });
  };

  const handleUpdateField = (
    sectionId: string,
    fieldId: string,
    updates: { label?: string; value?: string }
  ) => {
    if (!config) return;
    setConfig({
      ...config,
      sections: config.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              fields: s.fields.map((f) =>
                f.id === fieldId ? { ...f, ...updates } : f
              ),
            }
          : s
      ),
    });
  };

  const handleRemoveField = (sectionId: string, fieldId: string) => {
    if (!config) return;
    setConfig({
      ...config,
      sections: config.sections.map((s) =>
        s.id === sectionId
          ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) }
          : s
      ),
    });
  };

  const handleDeleteSection = () => {
    if (!config || !deletingSectionId) return;
    setConfig({
      ...config,
      sections: config.sections.filter((s) => s.id !== deletingSectionId),
    });
    setDeleteDialogOpen(false);
    setDeletingSectionId(null);
    toast.success(t.toast.deleted);
  };

  const confirmDeleteSection = (sectionId: string) => {
    setDeletingSectionId(sectionId);
    setDeleteDialogOpen(true);
  };

  if (loading || !config) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t.paymentPage.title}</h1>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold">{t.paymentPage.title}</h1>
          <p className="text-muted-foreground">{t.paymentPage.subtitle}</p>
        </div>
        <Button onClick={handleSave}>{t.common.save}</Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t.paymentPage.sections}</CardTitle>
            <CardDescription>{t.paymentPage.emptySectionsNote}</CardDescription>
          </div>
          <Button onClick={handleAddSection}>
            <Plus className="h-4 w-4 mr-2" />
            {t.paymentPage.addSection}
          </Button>
        </CardHeader>
        <CardContent>
          {config.sections.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">{t.paymentPage.noSections}</p>
              <Button onClick={handleAddSection}>
                <Plus className="h-4 w-4 mr-2" />
                {t.paymentPage.addSection}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {config.sections
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <div key={section.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                        <span className="text-sm text-muted-foreground">
                          Bölmə {index + 1}
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
                        <Label>{t.paymentPage.sectionTitle}</Label>
                        <Input
                          value={section.title}
                          onChange={(e) =>
                            handleUpdateSection(section.id, { title: e.target.value })
                          }
                          placeholder={t.paymentPage.sectionTitlePlaceholder}
                        />
                        <p className="text-xs text-muted-foreground">
                          {t.paymentPage.sectionTitleHelp}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>{t.templates.fields}</Label>
                        {section.fields.map((field) => (
                          <div key={field.id} className="flex gap-2">
                            <Input
                              value={field.label}
                              onChange={(e) =>
                                handleUpdateField(section.id, field.id, { label: e.target.value })
                              }
                              placeholder={t.paymentPage.fieldLabel}
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveField(section.id, field.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <p className="text-xs text-muted-foreground">
                          {t.paymentPage.fieldLabelHelp}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddField(section.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {t.templates.edit.addField}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

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
