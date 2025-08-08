import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plane,
  Building,
  Car,
  MapPin,
  Users,
  CreditCard,
  Calendar,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Reservation, Client, Vol, Hebergement, Voiture, Activite } from "@shared/types";

interface FullReservationEditorProps {
  reservation: Reservation;
  formData: any;
  setFormData: (data: any) => void;
  clients: Client[];
  vols: Vol[];
  hebergements: Hebergement[];
  voitures: Voiture[];
  activites: Activite[];
  selectedServices: {
    flights: string[];
    accommodations: string[];
    vehicles: string[];
    activities: string[];
  };
  onServiceToggle: (serviceType: 'flights' | 'accommodations' | 'vehicles' | 'activities', serviceId: string) => void;
  onCalculateTotal: () => number;
}

export default function FullReservationEditor({
  reservation,
  formData,
  setFormData,
  clients,
  vols,
  hebergements,
  voitures,
  activites,
  selectedServices,
  onServiceToggle,
  onCalculateTotal,
}: FullReservationEditorProps) {
  const [searchTerms, setSearchTerms] = useState({
    flights: "",
    accommodations: "",
    vehicles: "",
    activities: "",
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredVols = (vols || []).filter(vol =>
    vol?.departure?.toLowerCase().includes(searchTerms.flights.toLowerCase()) ||
    vol?.arrival?.toLowerCase().includes(searchTerms.flights.toLowerCase()) ||
    vol?.airline?.toLowerCase().includes(searchTerms.flights.toLowerCase())
  );

  const filteredHebergements = (hebergements || []).filter(h =>
    h?.name?.toLowerCase().includes(searchTerms.accommodations.toLowerCase()) ||
    h?.location?.toLowerCase().includes(searchTerms.accommodations.toLowerCase())
  );

  const filteredVoitures = (voitures || []).filter(v =>
    v?.brand?.toLowerCase().includes(searchTerms.vehicles.toLowerCase()) ||
    v?.model?.toLowerCase().includes(searchTerms.vehicles.toLowerCase()) ||
    v?.location?.toLowerCase().includes(searchTerms.vehicles.toLowerCase())
  );

  const filteredActivites = (activites || []).filter(a =>
    a?.name?.toLowerCase().includes(searchTerms.activities.toLowerCase()) ||
    a?.location?.toLowerCase().includes(searchTerms.activities.toLowerCase())
  );

  useEffect(() => {
    // Auto-calculate total when services change
    try {
      const newTotal = onCalculateTotal();
      if (typeof newTotal === 'number' && !isNaN(newTotal)) {
        setFormData((prev: any) => ({ ...prev, totalPrice: newTotal }));
      }
    } catch (error) {
      console.error('Error calculating total:', error);
    }
  }, [selectedServices, formData.participants, onCalculateTotal, setFormData]);

  return (
    <div className="space-y-6">
      {/* Client Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Sélection du client
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) =>
                  setFormData((prev: any) => ({ ...prev, clientId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.idClient} value={client.idClient}>
                      {client.name} - {client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="participants">Nombre de participants</Label>
                <Input
                  id="participants"
                  type="number"
                  min="1"
                  value={formData.participants}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      participants: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTravel">Date de départ</Label>
                <Input
                  id="dateTravel"
                  type="date"
                  value={formData.dateTravel}
                  onChange={(e) =>
                    setFormData((prev: any) => ({ ...prev, dateTravel: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flights Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="w-5 h-5" />
            Vols ({(selectedServices?.flights || []).length} sélectionné(s))
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Rechercher des vols..."
              value={searchTerms.flights}
              onChange={(e) => setSearchTerms(prev => ({ ...prev, flights: e.target.value }))}
            />
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredVols.map((vol) => (
                <div
                  key={vol.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg"
                >
                  <Checkbox
                    checked={(selectedServices?.flights || []).includes(vol.id)}
                    onCheckedChange={() => onServiceToggle('flights', vol.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      {vol.airline || 'N/A'} - {vol.departure || 'N/A'} → {vol.arrival || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {vol.flightNumber || 'N/A'} • {formatCurrency((vol.price || 0) * (formData.participants || 1))} {reservation.currency}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accommodations Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Hébergements ({(selectedServices?.accommodations || []).length} sélectionné(s))
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Rechercher des hébergements..."
              value={searchTerms.accommodations}
              onChange={(e) => setSearchTerms(prev => ({ ...prev, accommodations: e.target.value }))}
            />
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredHebergements.map((hebergement) => (
                <div
                  key={hebergement.idHebergement}
                  className="flex items-center space-x-3 p-3 border rounded-lg"
                >
                  <Checkbox
                    checked={(selectedServices?.accommodations || []).includes(hebergement.idHebergement)}
                    onCheckedChange={() => onServiceToggle('accommodations', hebergement.idHebergement)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{hebergement.name || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">
                      {hebergement.location || 'N/A'} • {hebergement.type || 'N/A'} • {formatCurrency((hebergement.pricePerNight || 0) * 7)} {reservation.currency}/semaine
                    </div>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: Math.max(0, Math.min(5, hebergement.rating || 0)) }).map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Véhicules ({(selectedServices?.vehicles || []).length} sélectionné(s))
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Rechercher des véhicules..."
              value={searchTerms.vehicles}
              onChange={(e) => setSearchTerms(prev => ({ ...prev, vehicles: e.target.value }))}
            />
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredVoitures.map((voiture) => (
                <div
                  key={voiture.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg"
                >
                  <Checkbox
                    checked={(selectedServices?.vehicles || []).includes(voiture.id)}
                    onCheckedChange={() => onServiceToggle('vehicles', voiture.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      {voiture.brand || 'N/A'} {voiture.model || ''}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {voiture.location || 'N/A'} • {voiture.type || 'N/A'} • {formatCurrency((voiture.pricePerDay || 0) * 7)} {reservation.currency}/semaine
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Capacité: {voiture.capacity || 'N/A'} • Carburant: {voiture.fuel || 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Activités ({(selectedServices?.activities || []).length} sélectionné(s))
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Rechercher des activités..."
              value={searchTerms.activities}
              onChange={(e) => setSearchTerms(prev => ({ ...prev, activities: e.target.value }))}
            />
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredActivites.map((activite) => (
                <div
                  key={activite.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg"
                >
                  <Checkbox
                    checked={(selectedServices?.activities || []).includes(activite.id)}
                    onCheckedChange={() => onServiceToggle('activities', activite.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{activite.name || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">
                      {activite.location || 'N/A'} • {activite.category || 'N/A'} • {formatCurrency((activite.priceAdult || 0) * (formData.participants || 1))} {reservation.currency}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Durée: {activite.duration || 'N/A'} • Difficulté: {activite.difficulty || 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Calculation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Calcul automatique du total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Vols:</span>
                  <span>{formatCurrency(
                    (selectedServices.flights || []).reduce((total, id) => {
                      const vol = (vols || []).find(v => v.id === id);
                      return total + (vol ? (vol.price || 0) * (formData.participants || 1) : 0);
                    }, 0)
                  )} {reservation.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hébergements:</span>
                  <span>{formatCurrency(
                    (selectedServices.accommodations || []).reduce((total, id) => {
                      const hebergement = (hebergements || []).find(h => h.idHebergement === id);
                      return total + (hebergement ? (hebergement.pricePerNight || 0) * 7 : 0);
                    }, 0)
                  )} {reservation.currency}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Véhicules:</span>
                  <span>{formatCurrency(
                    (selectedServices.vehicles || []).reduce((total, id) => {
                      const voiture = (voitures || []).find(v => v.id === id);
                      return total + (voiture ? (voiture.pricePerDay || 0) * 7 : 0);
                    }, 0)
                  )} {reservation.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Activités:</span>
                  <span>{formatCurrency(
                    (selectedServices.activities || []).reduce((total, id) => {
                      const activite = (activites || []).find(a => a.id === id);
                      return total + (activite ? (activite.priceAdult || 0) * (formData.participants || 1) : 0);
                    }, 0)
                  )} {reservation.currency}</span>
                </div>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total calculé:</span>
                <span className="text-green-600">
                  {formatCurrency(onCalculateTotal())} {reservation.currency}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes de la réservation</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev: any) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Notes additionnelles sur la réservation..."
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
}
