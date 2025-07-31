import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  ArrowLeft,
  Save,
  Calendar,
  Users,
  MapPin,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Reservation } from "@shared/types";

const statusOptions = [
  {
    value: "pending",
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "confirmed",
    label: "Confirmée",
    color: "bg-green-100 text-green-800",
  },
  { value: "cancelled", label: "Annulée", color: "bg-red-100 text-red-800" },
  { value: "completed", label: "Terminée", color: "bg-blue-100 text-blue-800" },
];

const paymentStatusOptions = [
  {
    value: "pending",
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "partial",
    label: "Partiel",
    color: "bg-orange-100 text-orange-800",
  },
  { value: "paid", label: "Payé", color: "bg-green-100 text-green-800" },
  { value: "refunded", label: "Remboursé", color: "bg-gray-100 text-gray-800" },
];

export default function EditReservation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    status: "",
    notes: "",
    totalPrice: 0,
  });

  useEffect(() => {
    if (id) {
      fetchReservation(id);
    }
  }, [id]);

  const fetchReservation = async (reservationId: string) => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setReservation(data.data);
        setFormData({
          status: data.data.status,
          notes: data.data.notes || "",
          totalPrice: data.data.totalPrice,
        });
      } else {
        setError("Réservation non trouvée");
      }
    } catch (error) {
      console.error("Error fetching reservation:", error);
      setError("Erreur lors du chargement de la réservation");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!reservation || !id) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        navigate(`/reservations/${id}`);
      } else {
        setError("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Error saving reservation:", error);
      setError("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string, options: typeof statusOptions) => {
    const option = options.find((opt) => opt.value === status);
    return option ? (
      <Badge className={option.color}>{option.label}</Badge>
    ) : (
      <Badge variant="outline">{status}</Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold text-foreground">
          {error || "Réservation non trouvée"}
        </h2>
        <Button onClick={() => navigate("/reservations")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux réservations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/reservations/${id}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Modifier la réservation {reservation.id}
            </h1>
            <p className="text-muted-foreground">
              Client ID: {reservation.clientId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(reservation.status, statusOptions)}
        </div>
      </div>

      {/* Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Informations de la r��servation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Statut de la réservation</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Select value={reservation.currency} disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ar">Ariary (Ar)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="USD">Dollar ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalPrice">
                  Prix total ({reservation.currency})
                </Label>
                <Input
                  id="totalPrice"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.totalPrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      totalPrice: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Notes additionnelles sur la réservation..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/reservations/${id}`)}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reservation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Résumé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>
                  Départ:{" "}
                  {new Date(reservation.dateTravel).toLocaleDateString("fr-FR")}
                  {reservation.dateReturn && (
                    <>
                      {" "}
                      - Retour:{" "}
                      {new Date(reservation.dateReturn).toLocaleDateString(
                        "fr-FR",
                      )}
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>Client ID: {reservation.clientId}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span>Prix total:</span>
                  <span className="font-medium">
                    {formatCurrency(formData.totalPrice)} {reservation.currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Créé le:</span>
                  <span className="font-medium">
                    {new Date(reservation.dateCreated).toLocaleDateString(
                      "fr-FR",
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, status: "confirmed" }))
                }
              >
                Confirmer la réservation
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, status: "completed" }))
                }
              >
                Marquer comme terminé
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-destructive"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, status: "cancelled" }))
                }
              >
                Annuler la réservation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
