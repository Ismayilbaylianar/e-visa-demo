"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { settingsService } from "@/services";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";
import { useTranslations } from "@/stores/languageStore";
import type { AppSettings } from "@/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const data = settingsService.getSettings();
    setSettings(data);
    setLoading(false);
  };

  const handleSave = () => {
    if (!settings) return;
    settingsService.updateSettings(settings);
    toast.success(t.toast.saved);
  };

  const handleReset = async () => {
    setResetting(true);
    await settingsService.resetAllData();
    toast.success(t.toast.resetComplete);
    setResetDialogOpen(false);
    setResetting(false);
    loadSettings();
  };

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t.settings.title}</h1>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(4)].map((_, i) => (
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
        <h1 className="text-2xl font-bold">{t.settings.title}</h1>
        <p className="text-muted-foreground">{t.settings.subtitle}</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.general}</CardTitle>
          <CardDescription>{t.settings.generalDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>{t.settings.siteName}</Label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.settings.supportEmail}</Label>
              <Input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.settings.defaultCurrency}</Label>
              <Select
                value={settings.defaultCurrency}
                onValueChange={(value) => setSettings({ ...settings, defaultCurrency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - ABŞ Dolları</SelectItem>
                  <SelectItem value="EUR">EUR - Avro</SelectItem>
                  <SelectItem value="GBP">GBP - Britaniya Funtu</SelectItem>
                  <SelectItem value="AZN">AZN - Azərbaycan Manatı</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.settings.paymentTimeout}</Label>
              <Input
                type="number"
                value={settings.paymentTimeoutHours}
                onChange={(e) =>
                  setSettings({ ...settings, paymentTimeoutHours: parseInt(e.target.value) || 3 })
                }
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>{t.settings.maintenanceMode}</Label>
              <p className="text-sm text-muted-foreground">
                {t.settings.maintenanceModeDesc}
              </p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>{t.settings.saveSettings}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Data */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {t.settings.demoData}
          </CardTitle>
          <CardDescription>{t.settings.demoDataDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t.settings.resetWarning}
          </p>
          <Button
            variant="destructive"
            onClick={() => setResetDialogOpen(true)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t.settings.resetAllData}
          </Button>
        </CardContent>
      </Card>

      {/* Reset Confirmation */}
      <ConfirmDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        title={t.confirm.resetData}
        description={t.confirm.resetDataMessage}
        confirmLabel={t.settings.resetAllData}
        onConfirm={handleReset}
        variant="destructive"
        loading={resetting}
      />
    </div>
  );
}
