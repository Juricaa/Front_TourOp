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
  serviceDates: {
    flights: { [serviceId: string]: string };
    accommodations: { [serviceId: string]: { checkIn: string; checkOut: string } };
    vehicles: { [serviceId: string]: { startDate: string; endDate: string } };
    activities: { [serviceId: string]: string };
  };
  onServiceToggle: (serviceType: 'flights' | 'accommodations' | 'vehicles' | 'activities', serviceId: string) => void;
  onServiceDateChange: (serviceType: string, serviceId: string, dateData: any) => void;
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
  serviceDates,
  onServiceToggle,
  onServiceDateChange,
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
      {/* <Card>
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

          </div>
        </CardContent>
      </Card> */}

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
                  key={vol.idVol}
                  className="border rounded-lg p-3 space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={(selectedServices?.flights || []).includes(vol.idVol)}
                      onCheckedChange={() => onServiceToggle('flights', vol.idVol)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        {vol.airline || 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {vol.flightNumber || 'N/A'} • {formatCurrency((vol.price || 0) * (formData.participants || 1))} {reservation.currency}
                      </div>
                    </div>
                  </div>

                  {/* Date du vol si sélectionné */}
                  {(selectedServices?.flights || []).includes(vol.idVol) && (
                    <div className="ml-6 pl-3 border-l border-blue-200 bg-blue-50 p-3 rounded">
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium text-blue-900">Date du vol</Label>
                            <Input
                              type="date"
                              value={serviceDates?.flights?.[vol.date_debut] || formData.dateTravel || ''}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={(e) =>
                                onServiceDateChange('flights', vol.idVol, e.target.value)
                              }
                              className="w-full"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-blue-900">Date de retour</Label>
                            <Input
                              type="date"
                              value={serviceDates?.flights?.[vol.date_fin] || formData.dateTravel || ''}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={(e) =>
                                onServiceDateChange('flights', vol.idVol, e.target.value)
                              }
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                  className="border rounded-lg p-3 space-y-3"
                >
                  <div className="flex items-center space-x-3">
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

                  {/* Dates d'hébergement si sélectionné */}
                  {(selectedServices?.accommodations || []).includes(hebergement.idHebergement) && (
                    <div className="ml-6 pl-3 border-l border-green-200 bg-green-50 p-3 rounded">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-green-900">Dates d'hébergement</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Check-in</Label>
                            <Input
                              type="date"
                              value={serviceDates?.accommodations?.[hebergement.idHebergement]?.checkIn || formData.dateTravel || ''}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={(e) =>
                                onServiceDateChange('accommodations', hebergement.idHebergement, {
                                  ...serviceDates?.accommodations?.[hebergement.idHebergement],
                                  checkIn: e.target.value
                                })
                              }
                              className="w-full"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Check-out</Label>
                            <Input
                              type="date"
                              value={serviceDates?.accommodations?.[hebergement.idHebergement]?.checkOut || formData.dateReturn || ''}
                              min={serviceDates?.accommodations?.[hebergement.idHebergement]?.checkIn || new Date().toISOString().split('T')[0]}
                              onChange={(e) =>
                                onServiceDateChange('accommodations', hebergement.idHebergement, {
                                  ...serviceDates?.accommodations?.[hebergement.idHebergement],
                                  checkOut: e.target.value
                                })
                              }
                              className="w-full"
                            />
                          </div>
                        </div>
                        {/* Calcul du nombre de nuits */}
                        {serviceDates?.accommodations?.[hebergement.idHebergement]?.checkIn &&
                          serviceDates?.accommodations?.[hebergement.idHebergement]?.checkOut && (
                            <div className="text-xs text-green-700">
                              Nombre de nuits: {(() => {
                                const checkIn = new Date(serviceDates.accommodations[hebergement.idHebergement].checkIn);
                                const checkOut = new Date(serviceDates.accommodations[hebergement.idHebergement].checkOut);
                                const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                return diffDays;
                              })()}
                            </div>
                          )}
                      </div>
                    </div>
                  )}
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
                  key={voiture.idVoiture}
                  className="border rounded-lg p-3 space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={(selectedServices?.vehicles || []).includes(voiture.idVoiture)}
                      onCheckedChange={() => onServiceToggle('vehicles', voiture.idVoiture)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        {voiture.brand || 'N/A'} {voiture.model || ''}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {voiture.location || 'N/A'} • {voiture.brand || 'N/A'} • {formatCurrency((voiture.pricePerDay || 0) * 7)} {reservation.currency}/semaine
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Capacité: {voiture.capacity || 'N/A'} •
                      </div>
                    </div>
                  </div>

                  {/* Dates de location si sélectionné */}
                  {(selectedServices?.vehicles || []).includes(voiture.idVoiture) && (
                    <div className="ml-6 pl-3 border-l border-purple-200 bg-purple-50 p-3 rounded">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-purple-900">Dates de location</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Début</Label>
                            <Input
                              type="date"
                              value={serviceDates?.vehicles?.[voiture.idVoiture]?.startDate || formData.dateTravel || ''}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={(e) =>
                                onServiceDateChange('vehicles', voiture.idVoiture, {
                                  ...serviceDates?.vehicles?.[voiture.idVoiture],
                                  startDate: e.target.value
                                })
                              }
                              className="w-full"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Fin</Label>
                            <Input
                              type="date"
                              value={serviceDates?.vehicles?.[voiture.idVoiture]?.endDate || formData.dateReturn || ''}
                              min={serviceDates?.vehicles?.[voiture.idVoiture]?.startDate || new Date().toISOString().split('T')[0]}
                              onChange={(e) =>
                                onServiceDateChange('vehicles', voiture.idVoiture, {
                                  ...serviceDates?.vehicles?.[voiture.idVoiture],
                                  endDate: e.target.value
                                })
                              }
                              className="w-full"
                            />
                          </div>
                        </div>
                        {/* Calcul du nombre de jours */}
                        {serviceDates?.vehicles?.[voiture.idVoiture]?.startDate &&
                          serviceDates?.vehicles?.[voiture.idVoiture]?.endDate && (
                            <div className="text-xs text-purple-700">
                              Nombre de jours: {(() => {
                                const startDate = new Date(serviceDates.vehicles[voiture.idVoiture].startDate);
                                const endDate = new Date(serviceDates.vehicles[voiture.idVoiture].endDate);
                                const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                return diffDays;
                              })()}
                            </div>
                          )}
                      </div>
                    </div>
                  )}
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
                  key={activite.idActivite}
                  className="border rounded-lg p-3 space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={(selectedServices?.activities || []).includes(activite.idActivite)}
                      onCheckedChange={() => onServiceToggle('activities', activite.idActivite)}
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

                  {/* Date de l'activité si sélectionnée */}
                  {(selectedServices?.activities || []).includes(activite.idActivite) && (
                    <div className="ml-6 pl-3 border-l border-orange-200 bg-orange-50 p-3 rounded">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-orange-900">Date de l'activité</Label>
                        <Input
                          type="date"
                          value={serviceDates?.activities?.[activite.idActivite] || formData.dateTravel || ''}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) =>
                            onServiceDateChange('activities', activite.idActivite, e.target.value)
                          }
                          className="w-full"
                        />
                        <div className="text-xs text-orange-700">
                          Durée prévue: {activite.duration || 'N/A'}
                        </div>
                      </div>
                    </div>
                  )}
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
                      const vol = (vols || []).find(v => v.idVol === id);
                      return total + (vol ? (vol.price || 0) * (formData.participants || 1) : 0);
                    }, 0)
                  )} {reservation.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hébergements:</span>
                  <span>{formatCurrency(
                    (selectedServices.accommodations || []).reduce((total, id) => {
                      const hebergement = (hebergements || []).find(h => h.idHebergement === id);
                      return total + (hebergement ? (hebergement.priceRange || 0) * 7 : 0);
                    }, 0)
                  )} {reservation.currency}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Véhicules:</span>
                  <span>{formatCurrency(
                    (selectedServices.vehicles || []).reduce((total, id) => {
                      const voiture = (voitures || []).find(v => v.idVoiture === id);
                      return total + (voiture ? (voiture.pricePerDay || 0) * 7 : 0);
                    }, 0)
                  )} {reservation.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Activités:</span>
                  <span>{formatCurrency(
                    (selectedServices.activities || []).reduce((total, id) => {
                      const activite = (activites || []).find(a => a.idActivite === id);
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
