"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Stamp } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { visaTypesService } from "@/services";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";
import { useTranslations } from "@/stores/languageStore";
import type { VisaType } from "@/types";

export default function VisaTypesPage() {
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<VisaType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    purpose: "",
    validityDays: 90,
    maxStay: 30,
    entries: "single" as "single" | "double" | "multiple",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    loadVisaTypes();
  }, []);

  const loadVisaTypes = () => {
    const types = visaTypesService.getAll();
    setVisaTypes(types);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      purpose: "",
      validityDays: 90,
      maxStay: 30,
      entries: "single",
      description: "",
      isActive: true,
    });
    setEditingType(null);
  };

  const handleOpenDialog = (type?: VisaType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        purpose: type.purpose,
        validityDays: type.validityDays,
        maxStay: type.maxStay,
        entries: type.entries,
        description: type.description || "",
        isActive: type.isActive,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.purpose) {
      toast.error(`${t.visaTypes.form.purpose} ${t.common.required.toLowerCase()}`);
      return;
    }

    const entriesLabel = formData.entries === "single" 
      ? t.visaTypes.single
      : formData.entries === "double" 
        ? t.visaTypes.double
        : t.visaTypes.multiple;
    const label = `${formData.purpose} - ${entriesLabel} - ${formData.maxStay} gün`;

    if (editingType) {
      visaTypesService.update(editingType.id, { ...formData, label });
      toast.success(t.toast.updated);
    } else {
      visaTypesService.create({ ...formData, label });
      toast.success(t.toast.created);
    }

    setDialogOpen(false);
    resetForm();
    loadVisaTypes();
  };

  const handleDelete = () => {
    if (deletingId) {
      visaTypesService.delete(deletingId);
      toast.success(t.toast.deleted);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      loadVisaTypes();
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t.visaTypes.title}</h1>
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
          <h1 className="text-2xl font-bold">{t.visaTypes.title}</h1>
          <p className="text-muted-foreground">{t.visaTypes.subtitle}</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          {t.visaTypes.addType}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {visaTypes.length === 0 ? (
            <EmptyState
              icon={Stamp}
              title={t.visaTypes.noTypes}
              description={t.visaTypes.createFirst}
              action={{
                label: t.visaTypes.addType,
                onClick: () => handleOpenDialog(),
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.visaTypes.purpose}</TableHead>
                  <TableHead>{t.visaTypes.validity}</TableHead>
                  <TableHead>{t.visaTypes.maxStay}</TableHead>
                  <TableHead>{t.visaTypes.entries}</TableHead>
                  <TableHead>{t.common.status}</TableHead>
                  <TableHead className="text-right">{t.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visaTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{type.purpose}</p>
                        {type.description && (
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{type.validityDays} gün</TableCell>
                    <TableCell>{type.maxStay} gün</TableCell>
                    <TableCell className="capitalize">
                      {type.entries === "single" ? t.visaTypes.single : 
                       type.entries === "double" ? t.visaTypes.double : 
                       t.visaTypes.multiple}
                    </TableCell>
                    <TableCell>
                      <Badge variant={type.isActive ? "default" : "secondary"}>
                        {type.isActive ? t.common.active : t.common.inactive}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(type)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(type.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingType ? `${t.common.edit} ${t.visaTypes.title}` : t.visaTypes.addType}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.visaTypes.form.purpose} *</Label>
              <Input
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder={t.visaTypes.form.purposePlaceholder}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.visaTypes.form.validityDays}</Label>
                <Input
                  type="number"
                  value={formData.validityDays}
                  onChange={(e) =>
                    setFormData({ ...formData, validityDays: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t.visaTypes.form.maxStayDays}</Label>
                <Input
                  type="number"
                  value={formData.maxStay}
                  onChange={(e) =>
                    setFormData({ ...formData, maxStay: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.visaTypes.form.entryType}</Label>
              <Select
                value={formData.entries}
                onValueChange={(value: "single" | "double" | "multiple") =>
                  setFormData({ ...formData, entries: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">{t.visaTypes.single}</SelectItem>
                  <SelectItem value="double">{t.visaTypes.double}</SelectItem>
                  <SelectItem value="multiple">{t.visaTypes.multiple}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.visaTypes.form.description}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t.visaTypes.form.descriptionPlaceholder}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>{t.common.active}</Label>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleSubmit}>
                {editingType ? t.common.update : t.common.create}
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
