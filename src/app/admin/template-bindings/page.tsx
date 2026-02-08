"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Link2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  bindingsService,
  templatesService,
  visaTypesService,
  countriesService,
} from "@/services";
import { CountrySelect } from "@/components/shared/CountrySelect";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { UN_COUNTRIES } from "@/data/un_countries";
import { toast } from "sonner";
import { useTranslations } from "@/stores/languageStore";
import type { TemplateBinding, NationalityBinding, ApplicationTemplate, VisaType } from "@/types";

export default function TemplateBindingsPage() {
  const [bindings, setBindings] = useState<TemplateBinding[]>([]);
  const t = useTranslations();
  const [templates, setTemplates] = useState<ApplicationTemplate[]>([]);
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [feesDialogOpen, setFeesDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingBinding, setEditingBinding] = useState<TemplateBinding | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    destinationCode: "",
    visaTypeId: "",
    templateId: "",
  });

  // Fees management
  const [selectedNationalities, setSelectedNationalities] = useState<Set<string>>(new Set());
  const [nationalityFees, setNationalityFees] = useState<Record<string, NationalityBinding>>({});
  const [defaultFees, setDefaultFees] = useState({
    governmentFee: 50,
    serviceFee: 25,
    currency: "USD",
    expeditedFee: 50,
    expeditedEnabled: false,
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setBindings(bindingsService.getAll());
    setTemplates(templatesService.getAll().filter((t) => t.isActive));
    setVisaTypes(visaTypesService.getAll().filter((v) => v.isActive));
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      destinationCode: "",
      visaTypeId: "",
      templateId: "",
    });
    setEditingBinding(null);
  };

  const handleOpenDialog = (binding?: TemplateBinding) => {
    if (binding) {
      setEditingBinding(binding);
      setFormData({
        destinationCode: binding.destinationCode,
        visaTypeId: binding.visaTypeId,
        templateId: binding.templateId,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleOpenFeesDialog = (binding: TemplateBinding) => {
    setEditingBinding(binding);
    
    // Initialize selected nationalities and fees
    const selected = new Set(binding.nationalities.map((n) => n.nationalityCode));
    setSelectedNationalities(selected);
    
    const fees: Record<string, NationalityBinding> = {};
    binding.nationalities.forEach((n) => {
      fees[n.nationalityCode] = n;
    });
    setNationalityFees(fees);
    
    setFeesDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.destinationCode || !formData.visaTypeId || !formData.templateId) {
      toast.error("Bütün sahələri doldurun");
      return;
    }

    if (editingBinding) {
      bindingsService.update(editingBinding.id, formData);
      toast.success(t.toast.updated);
    } else {
      bindingsService.create({
        ...formData,
        nationalities: [],
        isActive: true,
      });
      toast.success(t.toast.created);
    }

    setDialogOpen(false);
    resetForm();
    loadData();
  };

  const handleSaveFees = () => {
    if (!editingBinding) return;

    const nationalities: NationalityBinding[] = Array.from(selectedNationalities).map((code) => {
      const existing = nationalityFees[code];
      return existing || {
        nationalityCode: code,
        ...defaultFees,
      };
    });

    bindingsService.update(editingBinding.id, { nationalities });
    toast.success(t.toast.nationalitiesUpdated);
    setFeesDialogOpen(false);
    loadData();
  };

  const handleToggleNationality = (code: string) => {
    const newSelected = new Set(selectedNationalities);
    if (newSelected.has(code)) {
      newSelected.delete(code);
      const newFees = { ...nationalityFees };
      delete newFees[code];
      setNationalityFees(newFees);
    } else {
      newSelected.add(code);
      setNationalityFees({
        ...nationalityFees,
        [code]: {
          nationalityCode: code,
          ...defaultFees,
        },
      });
    }
    setSelectedNationalities(newSelected);
  };

  const handleUpdateNationalityFee = (code: string, updates: Partial<NationalityBinding>) => {
    setNationalityFees({
      ...nationalityFees,
      [code]: {
        ...nationalityFees[code],
        ...updates,
      },
    });
  };

  const handleApplyDefaultToAll = () => {
    const newFees: Record<string, NationalityBinding> = {};
    selectedNationalities.forEach((code) => {
      newFees[code] = {
        nationalityCode: code,
        ...defaultFees,
      };
    });
    setNationalityFees(newFees);
    toast.success(t.toast.feesApplied);
  };

  const handleDelete = () => {
    if (deletingId) {
      bindingsService.delete(deletingId);
      toast.success(t.toast.deleted);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      loadData();
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const getCountryName = (code: string) => {
    const country = countriesService.getByCode(code);
    return country ? `${country.flag} ${country.name}` : code;
  };

  const getVisaTypeName = (id: string) => {
    const type = visaTypes.find((v) => v.id === id);
    return type?.label || id;
  };

  const getTemplateName = (id: string) => {
    const template = templates.find((t) => t.id === id);
    return template?.name || id;
  };

  const filteredCountries = UN_COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.cca2.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t.bindings.title}</h1>
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
          <h1 className="text-2xl font-bold">{t.bindings.title}</h1>
          <p className="text-muted-foreground">{t.bindings.subtitle}</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          {t.bindings.createBinding}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {bindings.length === 0 ? (
            <EmptyState
              icon={Link2}
              title={t.bindings.noBindings}
              description={t.bindings.createFirst}
              action={{
                label: t.bindings.createBinding,
                onClick: () => handleOpenDialog(),
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.bindings.destination}</TableHead>
                  <TableHead>{t.bindings.visaType}</TableHead>
                  <TableHead>{t.bindings.template}</TableHead>
                  <TableHead>{t.bindings.nationalities}</TableHead>
                  <TableHead className="text-right">{t.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bindings.map((binding) => (
                  <TableRow key={binding.id}>
                    <TableCell>{getCountryName(binding.destinationCode)}</TableCell>
                    <TableCell>{getVisaTypeName(binding.visaTypeId)}</TableCell>
                    <TableCell>{getTemplateName(binding.templateId)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {binding.nationalities.length} {t.bindings.nationalities.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenFeesDialog(binding)}
                          title={t.bindings.manageNationalities}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(binding)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(binding.id)}
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

      {/* Create/Edit Binding Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBinding ? `${t.common.edit}` : t.bindings.createBinding}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.bindings.form.destinationCountry} *</Label>
              <CountrySelect
                value={formData.destinationCode}
                onChange={(code) => setFormData({ ...formData, destinationCode: code })}
                placeholder={t.bindings.form.selectDestination}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.bindings.visaType} *</Label>
              <Select
                value={formData.visaTypeId}
                onValueChange={(value) => setFormData({ ...formData, visaTypeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.bindings.form.selectVisaType} />
                </SelectTrigger>
                <SelectContent>
                  {visaTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.bindings.template} *</Label>
              <Select
                value={formData.templateId}
                onValueChange={(value) => setFormData({ ...formData, templateId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.bindings.form.selectTemplate} />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleSubmit}>
                {editingBinding ? t.common.update : t.common.create}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Nationalities & Fees Dialog */}
      <Dialog open={feesDialogOpen} onOpenChange={setFeesDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{t.bindings.fees.title}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="nationalities">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="nationalities">{t.bindings.fees.selectNationalities}</TabsTrigger>
              <TabsTrigger value="fees">{t.bindings.fees.setFees}</TabsTrigger>
            </TabsList>

            <TabsContent value="nationalities" className="space-y-4">
              <Input
                placeholder={t.bindings.fees.searchCountries}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <ScrollArea className="h-[400px] border rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {filteredCountries.map((country) => (
                    <div
                      key={country.cca2}
                      className="flex items-center space-x-2 p-2 rounded hover:bg-muted cursor-pointer"
                      onClick={() => handleToggleNationality(country.cca2)}
                    >
                      <Checkbox
                        checked={selectedNationalities.has(country.cca2)}
                        onCheckedChange={() => handleToggleNationality(country.cca2)}
                      />
                      <span className="text-sm">
                        {country.flag} {country.name}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <p className="text-sm text-muted-foreground">
                {selectedNationalities.size} {t.common.selected.toLowerCase()}
              </p>
            </TabsContent>

            <TabsContent value="fees" className="space-y-4">
              {/* Default Fees */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t.bindings.fees.defaultFees}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>{t.bindings.fees.governmentFee}</Label>
                      <Input
                        type="number"
                        value={defaultFees.governmentFee}
                        onChange={(e) =>
                          setDefaultFees({ ...defaultFees, governmentFee: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.bindings.fees.serviceFee}</Label>
                      <Input
                        type="number"
                        value={defaultFees.serviceFee}
                        onChange={(e) =>
                          setDefaultFees({ ...defaultFees, serviceFee: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.bindings.fees.currency}</Label>
                      <Select
                        value={defaultFees.currency}
                        onValueChange={(value) => setDefaultFees({ ...defaultFees, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="AZN">AZN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t.bindings.fees.expeditedFee}</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={defaultFees.expeditedFee}
                          onChange={(e) =>
                            setDefaultFees({ ...defaultFees, expeditedFee: parseFloat(e.target.value) || 0 })
                          }
                        />
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={defaultFees.expeditedEnabled}
                            onCheckedChange={(checked) =>
                              setDefaultFees({ ...defaultFees, expeditedEnabled: checked })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={handleApplyDefaultToAll}
                  >
                    {t.bindings.fees.applyToAll}
                  </Button>
                </CardContent>
              </Card>

              {/* Per-nationality fees */}
              <ScrollArea className="h-[300px]">
                {selectedNationalities.size === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t.bindings.fees.noNationalities}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {Array.from(selectedNationalities).map((code) => {
                      const country = countriesService.getByCode(code);
                      const fees = nationalityFees[code] || { ...defaultFees, nationalityCode: code };
                      return (
                        <div key={code} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="w-40 font-medium">
                            {country?.flag} {country?.name}
                          </div>
                          <div className="flex-1 grid grid-cols-4 gap-2">
                            <Input
                              type="number"
                              value={fees.governmentFee}
                              onChange={(e) =>
                                handleUpdateNationalityFee(code, {
                                  governmentFee: parseFloat(e.target.value) || 0,
                                })
                              }
                              placeholder="Gov"
                            />
                            <Input
                              type="number"
                              value={fees.serviceFee}
                              onChange={(e) =>
                                handleUpdateNationalityFee(code, {
                                  serviceFee: parseFloat(e.target.value) || 0,
                                })
                              }
                              placeholder="Service"
                            />
                            <Select
                              value={fees.currency}
                              onValueChange={(value) =>
                                handleUpdateNationalityFee(code, { currency: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="GBP">GBP</SelectItem>
                                <SelectItem value="AZN">AZN</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={fees.expeditedFee || 0}
                                onChange={(e) =>
                                  handleUpdateNationalityFee(code, {
                                    expeditedFee: parseFloat(e.target.value) || 0,
                                  })
                                }
                                placeholder="Exp"
                                className="w-20"
                              />
                              <Switch
                                checked={fees.expeditedEnabled || false}
                                onCheckedChange={(checked) =>
                                  handleUpdateNationalityFee(code, { expeditedEnabled: checked })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFeesDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSaveFees}>{t.common.save}</Button>
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
