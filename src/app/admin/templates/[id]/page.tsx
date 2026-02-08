"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { templatesService } from "@/services";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { generateId } from "@/lib/utils/generators";
import { toast } from "sonner";
import { useTranslations } from "@/stores/languageStore";
import type { ApplicationTemplate, FormSection, FormField } from "@/types";

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations();

  const FIELD_TYPES = [
    { value: "text", label: t.templates.fieldTypes.text },
    { value: "textarea", label: t.templates.fieldTypes.textarea },
    { value: "email", label: t.templates.fieldTypes.email },
    { value: "phone", label: t.templates.fieldTypes.phone },
    { value: "number", label: t.templates.fieldTypes.number },
    { value: "date", label: t.templates.fieldTypes.date },
    { value: "select", label: t.templates.fieldTypes.select },
    { value: "radio", label: t.templates.fieldTypes.radio },
    { value: "checkbox", label: t.templates.fieldTypes.checkbox },
    { value: "file", label: t.templates.fieldTypes.file },
  ];

  const [template, setTemplate] = useState<ApplicationTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ type: "section" | "field"; id: string; sectionId?: string } | null>(null);

  useEffect(() => {
    const templateData = templatesService.getById(id);
    if (!templateData) {
      toast.error("Şablon tapılmadı");
      router.push("/admin/templates");
      return;
    }
    setTemplate(templateData);
    // Expand all sections by default
    setExpandedSections(new Set(templateData.sections.map((s) => s.id)));
    setLoading(false);
  }, [id, router]);

  const handleSave = () => {
    if (!template) return;
    templatesService.update(template.id, template);
    toast.success(t.toast.saved);
  };

  const handleAddSection = () => {
    if (!template) return;
    const newSection: FormSection = {
      id: generateId(),
      title: "",
      description: "",
      order: template.sections.length,
      fields: [],
    };
    setTemplate({
      ...template,
      sections: [...template.sections, newSection],
    });
    setExpandedSections(new Set([...expandedSections, newSection.id]));
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<FormSection>) => {
    if (!template) return;
    setTemplate({
      ...template,
      sections: template.sections.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    });
  };

  const handleAddField = (sectionId: string) => {
    if (!template) return;
    const section = template.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newField: FormField = {
      id: generateId(),
      type: "text",
      label: "",
      placeholder: "",
      helpText: "",
      order: section.fields.length,
      validation: {
        required: false,
      },
    };

    setTemplate({
      ...template,
      sections: template.sections.map((s) =>
        s.id === sectionId ? { ...s, fields: [...s.fields, newField] } : s
      ),
    });
  };

  const handleUpdateField = (sectionId: string, fieldId: string, updates: Partial<FormField>) => {
    if (!template) return;
    setTemplate({
      ...template,
      sections: template.sections.map((s) =>
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

  const handleDelete = () => {
    if (!template || !deletingItem) return;

    if (deletingItem.type === "section") {
      setTemplate({
        ...template,
        sections: template.sections.filter((s) => s.id !== deletingItem.id),
      });
    } else if (deletingItem.type === "field" && deletingItem.sectionId) {
      setTemplate({
        ...template,
        sections: template.sections.map((s) =>
          s.id === deletingItem.sectionId
            ? { ...s, fields: s.fields.filter((f) => f.id !== deletingItem.id) }
            : s
        ),
      });
    }

    setDeleteDialogOpen(false);
    setDeletingItem(null);
    toast.success(t.toast.deleted);
  };

  const confirmDelete = (type: "section" | "field", id: string, sectionId?: string) => {
    setDeletingItem({ type, id, sectionId });
    setDeleteDialogOpen(true);
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getAllFields = () => {
    if (!template) return [];
    return template.sections.flatMap((s) =>
      s.fields.map((f) => ({ ...f, sectionTitle: s.title }))
    );
  };

  if (loading || !template) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/templates")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t.templates.edit.title}</h1>
            <p className="text-muted-foreground">{template.name}</p>
          </div>
        </div>
        <Button onClick={handleSave}>{t.common.save}</Button>
      </div>

      {/* Template Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.templates.form.templateName}</Label>
              <Input
                value={template.name}
                onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.templates.form.description}</Label>
              <Input
                value={template.description || ""}
                onChange={(e) => setTemplate({ ...template, description: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t.templates.sections}</h2>
          <Button onClick={handleAddSection}>
            <Plus className="h-4 w-4 mr-2" />
            {t.templates.edit.addSection}
          </Button>
        </div>

        {template.sections.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">{t.templates.edit.noSections}</p>
              <Button onClick={handleAddSection}>
                <Plus className="h-4 w-4 mr-2" />
                {t.templates.edit.addFirstSection}
              </Button>
            </CardContent>
          </Card>
        ) : (
          template.sections
            .sort((a, b) => a.order - b.order)
            .map((section, sectionIndex) => (
              <Card key={section.id}>
                <Collapsible
                  open={expandedSections.has(section.id)}
                  onOpenChange={() => toggleSection(section.id)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <CardTitle className="text-base">
                              {section.title || `Bölmə ${sectionIndex + 1}`}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {section.fields.length} {t.templates.fields.toLowerCase()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete("section", section.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          {expandedSections.has(section.id) ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-6">
                      {/* Section Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-2">
                          <Label>{t.templates.edit.sectionTitle}</Label>
                          <Input
                            value={section.title}
                            onChange={(e) =>
                              handleUpdateSection(section.id, { title: e.target.value })
                            }
                            placeholder={t.templates.edit.sectionTitlePlaceholder}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t.templates.edit.sectionDescription}</Label>
                          <Input
                            value={section.description || ""}
                            onChange={(e) =>
                              handleUpdateSection(section.id, { description: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="space-y-4">
                        {section.fields
                          .sort((a, b) => a.order - b.order)
                          .map((field, fieldIndex) => (
                            <div
                              key={field.id}
                              className="border rounded-lg p-4 space-y-4"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  <Badge variant="outline">{fieldIndex + 1}</Badge>
                                  <Badge>{FIELD_TYPES.find((t) => t.value === field.type)?.label || field.type}</Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => confirmDelete("field", field.id, section.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label>{t.templates.edit.fieldType}</Label>
                                  <Select
                                    value={field.type}
                                    onValueChange={(value) =>
                                      handleUpdateField(section.id, field.id, {
                                        type: value as FormField["type"],
                                      })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {FIELD_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                          {type.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label>{t.templates.edit.fieldLabel} *</Label>
                                  <Input
                                    value={field.label}
                                    onChange={(e) =>
                                      handleUpdateField(section.id, field.id, {
                                        label: e.target.value,
                                      })
                                    }
                                    placeholder={t.templates.edit.fieldLabelPlaceholder}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>{t.templates.edit.placeholder}</Label>
                                  <Input
                                    value={field.placeholder || ""}
                                    onChange={(e) =>
                                      handleUpdateField(section.id, field.id, {
                                        placeholder: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>{t.templates.edit.helpText}</Label>
                                  <Input
                                    value={field.helpText || ""}
                                    onChange={(e) =>
                                      handleUpdateField(section.id, field.id, {
                                        helpText: e.target.value,
                                      })
                                    }
                                  />
                                </div>

                                <div className="flex items-center gap-4 pt-6">
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={field.validation.required}
                                      onCheckedChange={(checked) =>
                                        handleUpdateField(section.id, field.id, {
                                          validation: { ...field.validation, required: checked },
                                        })
                                      }
                                    />
                                    <Label>{t.templates.edit.required}</Label>
                                  </div>
                                </div>
                              </div>

                              {/* Options for select/radio */}
                              {(field.type === "select" || field.type === "radio") && (
                                <div className="space-y-2">
                                  <Label>{t.templates.edit.options}</Label>
                                  <div className="space-y-2">
                                    {(field.options || []).map((option, optIndex) => (
                                      <div key={optIndex} className="flex gap-2">
                                        <Input
                                          value={option.label}
                                          onChange={(e) => {
                                            const newOptions = [...(field.options || [])];
                                            newOptions[optIndex] = {
                                              ...newOptions[optIndex],
                                              label: e.target.value,
                                            };
                                            handleUpdateField(section.id, field.id, {
                                              options: newOptions,
                                            });
                                          }}
                                          placeholder={t.templates.edit.optionLabel}
                                        />
                                        <Input
                                          value={option.value}
                                          onChange={(e) => {
                                            const newOptions = [...(field.options || [])];
                                            newOptions[optIndex] = {
                                              ...newOptions[optIndex],
                                              value: e.target.value,
                                            };
                                            handleUpdateField(section.id, field.id, {
                                              options: newOptions,
                                            });
                                          }}
                                          placeholder={t.templates.edit.optionValue}
                                        />
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            const newOptions = (field.options || []).filter(
                                              (_, i) => i !== optIndex
                                            );
                                            handleUpdateField(section.id, field.id, {
                                              options: newOptions,
                                            });
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const newOptions = [
                                          ...(field.options || []),
                                          { label: "", value: "" },
                                        ];
                                        handleUpdateField(section.id, field.id, {
                                          options: newOptions,
                                        });
                                      }}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      {t.templates.edit.addOption}
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Conditional Visibility */}
                              <div className="space-y-2">
                                <Label>{t.templates.edit.conditionalVisibility}</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  <Select
                                    value={field.conditionalVisibility?.fieldId || "none"}
                                    onValueChange={(value) =>
                                      handleUpdateField(section.id, field.id, {
                                        conditionalVisibility: value && value !== "none"
                                          ? {
                                              fieldId: value,
                                              operator: field.conditionalVisibility?.operator || "equals",
                                              value: field.conditionalVisibility?.value || "",
                                            }
                                          : undefined,
                                      })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder={t.templates.edit.selectField} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">{t.templates.edit.noCondition}</SelectItem>
                                      {getAllFields()
                                        .filter((f) => f.id !== field.id)
                                        .map((f) => (
                                          <SelectItem key={f.id} value={f.id}>
                                            {f.label || f.id}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>

                                  {field.conditionalVisibility && (
                                    <>
                                      <Select
                                        value={field.conditionalVisibility.operator}
                                        onValueChange={(value) =>
                                          handleUpdateField(section.id, field.id, {
                                            conditionalVisibility: {
                                              ...field.conditionalVisibility!,
                                              operator: value as "equals" | "not_equals" | "contains",
                                            },
                                          })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="equals">{t.templates.edit.equals}</SelectItem>
                                          <SelectItem value="not_equals">{t.templates.edit.notEquals}</SelectItem>
                                          <SelectItem value="contains">{t.templates.edit.contains}</SelectItem>
                                        </SelectContent>
                                      </Select>

                                      <Input
                                        value={field.conditionalVisibility.value}
                                        onChange={(e) =>
                                          handleUpdateField(section.id, field.id, {
                                            conditionalVisibility: {
                                              ...field.conditionalVisibility!,
                                              value: e.target.value,
                                            },
                                          })
                                        }
                                        placeholder={t.templates.edit.valueToMatch}
                                      />
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleAddField(section.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {t.templates.edit.addField}
                        </Button>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={deletingItem?.type === "section" ? t.confirm.deleteSection : t.confirm.deleteField}
        description={deletingItem?.type === "section" ? t.confirm.deleteSectionMessage : t.confirm.deleteFieldMessage}
        confirmLabel={t.common.delete}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
