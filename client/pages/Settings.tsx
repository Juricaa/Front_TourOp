import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Settings as SettingsIcon,
  User,
  Building,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  Eye,
  Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // Company Settings
    companyName: "Madagascar Tours & Travel",
    companyAddress: "Lot 123 Antananarivo 101, Madagascar",
    companyPhone: "+261 20 22 123 45",
    companyEmail: "contact@madagascar-tours.mg",
    companyWebsite: "www.madagascar-tours.mg",

    // User Preferences
    theme: "light",
    language: "fr",
    currency: "EUR",
    dateFormat: "dd/mm/yyyy",

    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    invoiceReminders: true,
    bookingAlerts: true,
  });

  const handleSave = () => {
    // In a real app, this would save to backend
    console.log("Settings saved:", settings);
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-slate-600" />
            Paramètres
          </h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Consultation des paramètres système"
              : "Configurez votre espace de travail"}
          </p>
        </div>
        <Badge
          variant={isAdmin ? "secondary" : "default"}
          className={isAdmin ? "bg-blue-100 text-blue-800" : ""}
        >
          {isAdmin ? (
            <>
              <Eye className="w-3 h-3 mr-1" />
              Lecture seule
            </>
          ) : (
            <>
              <Shield className="w-3 h-3 mr-1" />
              Gestion complète
            </>
          )}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Informations Entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nom de l'entreprise</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) =>
                  setSettings({ ...settings, companyName: e.target.value })
                }
                disabled={isAdmin}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyAddress">Adresse</Label>
              <Textarea
                id="companyAddress"
                value={settings.companyAddress}
                onChange={(e) =>
                  setSettings({ ...settings, companyAddress: e.target.value })
                }
                disabled={isAdmin}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyPhone">Téléphone</Label>
                <Input
                  id="companyPhone"
                  value={settings.companyPhone}
                  onChange={(e) =>
                    setSettings({ ...settings, companyPhone: e.target.value })
                  }
                  disabled={isAdmin}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyEmail">Email</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, companyEmail: e.target.value })
                  }
                  disabled={isAdmin}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyWebsite">Site web</Label>
              <Input
                id="companyWebsite"
                value={settings.companyWebsite}
                onChange={(e) =>
                  setSettings({ ...settings, companyWebsite: e.target.value })
                }
                disabled={isAdmin}
              />
            </div>
          </CardContent>
        </Card>

        {/* User Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Préférences Utilisateur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Thème</Label>
              <Select
                value={settings.theme}
                onValueChange={(value) =>
                  setSettings({ ...settings, theme: value })
                }
                disabled={isAdmin}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Clair</SelectItem>
                  <SelectItem value="dark">Sombre</SelectItem>
                  <SelectItem value="auto">Automatique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Langue</Label>
              <Select
                value={settings.language}
                onValueChange={(value) =>
                  setSettings({ ...settings, language: value })
                }
                disabled={isAdmin}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="mg">Malagasy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Devise par défaut</Label>
                <Select
                  value={settings.currency}
                  onValueChange={(value) =>
                    setSettings({ ...settings, currency: value })
                  }
                  disabled={isAdmin}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="USD">Dollar ($)</SelectItem>
                    <SelectItem value="Ar">Ariary (Ar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFormat">Format de date</Label>
                <Select
                  value={settings.dateFormat}
                  onValueChange={(value) =>
                    setSettings({ ...settings, dateFormat: value })
                  }
                  disabled={isAdmin}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications par email</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir les notifications importantes par email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
                disabled={isAdmin}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications SMS</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir les alertes urgentes par SMS
                </p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, smsNotifications: checked })
                }
                disabled={isAdmin}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Rappels de facturation</Label>
                <p className="text-sm text-muted-foreground">
                  Rappels automatiques pour les factures en retard
                </p>
              </div>
              <Switch
                checked={settings.invoiceReminders}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, invoiceReminders: checked })
                }
                disabled={isAdmin}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertes de réservation</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications pour les nouvelles réservations
                </p>
              </div>
              <Switch
                checked={settings.bookingAlerts}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, bookingAlerts: checked })
                }
                disabled={isAdmin}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Sécurité & Compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isAdmin ? "bg-blue-100" : "bg-green-100"
                  }`}
                >
                  <User
                    className={`w-5 h-5 ${isAdmin ? "text-blue-600" : "text-green-600"}`}
                  />
                </div>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Badge variant={isAdmin ? "secondary" : "default"}>
                {isAdmin ? "Administrateur" : "Secrétaire"}
              </Badge>
            </div>

            {!isAdmin && (
              <>
                <Button variant="outline" className="w-full">
                  <Lock className="w-4 h-4 mr-2" />
                  Changer le mot de passe
                </Button>

                <Button variant="outline" className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Sécurité avancée
                </Button>
              </>
            )}

            {isAdmin && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">Mode consultation</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Modifications limitées pour ce type de compte
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      {!isAdmin && (
        <div className="flex justify-end">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Sauvegarder les paramètres
          </Button>
        </div>
      )}
    </div>
  );
}
