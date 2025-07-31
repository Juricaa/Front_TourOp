// VehicleStep.tsx

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import VoitureForm from "../forms/VoitureForm";
import { voitureService } from "@/services/voitureService";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Car,
  Plus,
  Trash2,
  Star, // Fallback icon for features
  MapPin,
  Calendar,
  Users,
  Shield,
  Fuel,
  Settings,
  Search,
  Filter,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { useVehicleBooking } from "@/hooks/useVehicleBooking"; // Importez votre nouveau hook
import type { Voiture } from "@shared/types";
import type { BookingVehicle } from "@shared/booking";
import { reservationService } from "@/services/reservationService";

const featureIcons: Record<string, any> = {
  climatisation: Settings,
  gps: MapPin,
  "siège bébé": Shield,
  "coffre spacieux": Car,
  bluetooth: Settings,
  "4x4": Car,
  "boîte automatique": Settings,
  économique: Fuel,
  // Ajoutez d'autres icônes pour vos fonctionnalités si besoin
};

const vehicleTypes = [
  "Tous",
  "Berline",
  "SUV",
  "4x4",
  "Minibus",
  "Économique",
  "Luxe",
];

const locations = [
  "Tous",
  "Antananarivo",
  "Andasibe",
  "Nosy Be",
  "Morondava",
  "Diego Suarez",
  "Fianarantsoa",
  "Sainte-Marie",
];

export default function VehicleStep() {
  const { state, removeVehicle } = useBooking(); // Supprimez addVehicle d'ici, il est géré par useVehicleBooking
  const { creerEtAjouterReservationVehicule } = useVehicleBooking(); // Utilisez le nouveau hook

  const [availableVehicles, setAvailableVehicles] = useState<Voiture[]>([]);
  const [loading, setLoading] = useState(true);
  const [rentalForm, setRentalForm] = useState({
    startDate: "",
    endDate: "",
    pickupLocation: "Aéroport Antananarivo",
    dropoffLocation: "Aéroport Antananarivo",
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("Tous");
  const [locationFilter, setLocationFilter] = useState("Tous");
  const [availabilityFilter, setAvailabilityFilter] = useState("Tous");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [displayAllVehicles, setDisplayAllVehicles] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/voitures");
      if (!response.ok) {
        throw new Error(`Erreur HTTP ! statut: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.data) {
        setAvailableVehicles(data.data);
      } else {
        setAvailableVehicles([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des véhicules :", error);
      setAvailableVehicles([]);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les véhicules disponibles.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cette fonction est désormais obsolète car le calcul sera fait par useVehicleBooking
  // const calculateDays = (startDate: string, endDate: string) => {
  //   if (!startDate || !endDate) return 0;
  //   const start = new Date(startDate);
  //   const end = new Date(endDate);
  //   return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  // };

  // Cette fonction est également obsolète
  // const calculatePrice = (voiture: Voiture, days: number) => {
  //   return voiture.pricePerDay * days;
  // };

  // Note: La fonction `calculerJoursLocation` du hook `useVehicleBooking` ajoute +1 jour
  // Par conséquent, adaptons la fonction locale si elle est toujours utilisée pour l'affichage uniquement.
  const getDisplayDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1; // Inclut le jour de début et de fin
  };


  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case "available":
        return "Disponible";
      case "unavailable":
        return "Non disponible";
      case "maintenance":
        return "En maintenance";
      default:
        return "Statut inconnu";
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-forest-100 text-forest-800 border-forest-200";
      case "unavailable":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "maintenance":
        return "bg-sunset-100 text-sunset-800 border-sunset-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleAddVehicle = async (voiture: Voiture) => {
    if (!rentalForm.startDate || !rentalForm.endDate) {
      toast({
        title: "Dates manquantes",
        description: "Veuillez sélectionner les dates de début et de fin de location.",
        variant: "destructive",
      });
      return;
    }

    if (voiture.availability !== "available") {
      toast({
        title: "Véhicule non disponible",
        description: "Ce véhicule n'est pas disponible pour la réservation.",
        variant: "destructive",
      });
      return;
    }

    // Le contrôle de capacité est géré ici avant l'appel au service de réservation si vous voulez empêcher l'ajout au panier.
    if (state.client && state.client.nbpersonnes > voiture.capacity) {
      toast({
        title: "Capacité insuffisante",
        description: `Ce véhicule ne peut accueillir que ${voiture.capacity} personnes. Votre client a ${state.client.nbpersonnes} personnes.`,
        variant: "destructive",
      });
      return;
    }

    // Utilisez le hook pour créer la réservation et l'ajouter au contexte
    const result = await creerEtAjouterReservationVehicule(voiture, {
      startDate: rentalForm.startDate,
      endDate: rentalForm.endDate,
      pickupLocation: rentalForm.pickupLocation,
      dropoffLocation: rentalForm.dropoffLocation,
    });

    if (result.success) {
      // Le toast de succès est déjà géré dans le hook
      // Si la voiture était le dernier élément disponible, il faudrait re-fetch les véhicules
      fetchVehicles(); // Rafraîchir la liste des véhicules après la réservation
    } else {
      // Le toast d'erreur est déjà géré dans le hook
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleRemoveVehicle = useCallback(
    async (vehicleId: string, reservationIdToDelete: string) => {
      try {
        const reservationId = reservationIdToDelete; // Use the direct reservationId
        const response = await reservationService.deleteReservation(
          reservationId,
        );
        if (response.success) {
          removeVehicle(vehicleId);
          toast({
            title: "Réservation supprimée",
            description: "Le Vehicule a été supprimé avec succès.",
          });
        } else {
          toast({
            title: "Erreur",
            description:
              response.error || "Erreur lors de la suppression de la réservation.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting reservation:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la suppression de la réservation.",
          variant: "destructive",
        });
      }
    },
    [removeVehicle],
  );
  const handleCreateVehicle = async (data: any) => {
    setCreateLoading(true);
    try {
      const response = await voitureService.createVoiture(data);
      if (response.success && response.data) {
        // Après la création, le véhicule n'est pas directement "réservé" mais ajouté à la liste des disponibles.
        // Si vous voulez le réserver directement après création, vous devrez appeler creerEtAjouterReservationVehicule ici.
        // Pour l'instant, nous nous contentons de rafraîchir la liste.
        const newVehicle = response.data;

        const reservationResult = await creerEtAjouterReservationVehicule(newVehicle, {
          startDate: data.startDate,
          endDate: data.endDate,
          pickupLocation: data.pickupLocation,
          dropoffLocation: data.dropoffLocation,
        });

        if (reservationResult.success) {
          // Toast déjà géré par createAndAddReservation
          setIsCreateDialogOpen(false);
        } else {
          toast({
            title: "Erreur de création d'hébergement",
            description:
              reservationResult.error ||
              "Erreur lors de la réservation du nouvel hébergement.",
            variant: "destructive",
          });
        }

        await fetchVehicles();


      } else {
        toast({
          title: "Erreur",
          description: response.error || "Erreur lors de la création du véhicule.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la création du véhicule :", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du véhicule.",
        variant: "destructive",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  // Get unique features from available vehicles
  const getAvailableFeatures = () => {
    const allFeatures = availableVehicles.flatMap((v) => v.features || []);
    return [...new Set(allFeatures)].filter(Boolean);
  };

  // Toggle feature filter
  const toggleFeatureFilter = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature],
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setTypeFilter("Tous");
    setLocationFilter("Tous");
    setAvailabilityFilter("Tous");
    setSelectedFeatures([]);
  };

  // Filter vehicles based on all criteria
  const filteredVehicles = availableVehicles
    .filter((voiture) => {
      // Search filter - search in brand, model, description and location
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        voiture.brand.toLowerCase().includes(searchLower) ||
        voiture.model.toLowerCase().includes(searchLower) ||
        voiture.description.toLowerCase().includes(searchLower) ||
        voiture.location.toLowerCase().includes(searchLower) ||
        voiture.vehicleType.toLowerCase().includes(searchLower);

      // Type filter
      const matchesType =
        typeFilter === "Tous" || voiture.vehicleType === typeFilter;

      // Location filter
      const matchesLocation =
        locationFilter === "Tous" || voiture.location === locationFilter;

      // Availability filter
      const matchesAvailability =
        availabilityFilter === "Tous" ||
        voiture.availability === availabilityFilter;

      // Features filter
      const matchesFeatures =
        selectedFeatures.length === 0 ||
        selectedFeatures.every((feature) =>
          voiture.features?.includes(feature),
        );

      return (
        matchesSearch &&
        matchesType &&
        matchesLocation &&
        matchesAvailability &&
        matchesFeatures
      );
    })
    .sort((a, b) => {
      // Sort by availability first (available first), then by price
      if (a.availability === "available" && b.availability !== "available")
        return -1;
      if (a.availability !== "available" && b.availability === "available")
        return 1;
      return a.pricePerDay - b.pricePerDay;
    });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-40 bg-muted rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!state.client) {
    return (
      <div className="text-center py-8">
        <Car className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-2 text-lg font-medium text-foreground">
          Client requis
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Veuillez sélectionner un client avant de choisir un véhicule
        </p>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Formulaire de Location */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Détails de la location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début</Label>
              <Input
                id="startDate"
                type="date"
                value={rentalForm.startDate}
                onChange={(e) =>
                  setRentalForm({ ...rentalForm, startDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Date de fin</Label>
              <Input
                id="endDate"
                type="date"
                value={rentalForm.endDate}
                onChange={(e) =>
                  setRentalForm({ ...rentalForm, endDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickup">Lieu de prise en charge</Label>
              <Select
                value={rentalForm.pickupLocation}
                onValueChange={(value) =>
                  setRentalForm({ ...rentalForm, pickupLocation: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aéroport Antananarivo">
                    Aéroport Antananarivo
                  </SelectItem>
                  <SelectItem value="Centre-ville Antananarivo">
                    Centre-ville Antananarivo
                  </SelectItem>
                  <SelectItem value="Andasibe">Andasibe</SelectItem>
                  <SelectItem value="Nosy Be">Nosy Be</SelectItem>
                  <SelectItem value="Morondava">Morondava</SelectItem>
                  <SelectItem value="Diego Suarez">Diego Suarez</SelectItem>
                  <SelectItem value="Fianarantsoa">Fianarantsoa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropoff">Lieu de restitution</Label>
              <Select
                value={rentalForm.dropoffLocation}
                onValueChange={(value) =>
                  setRentalForm({ ...rentalForm, dropoffLocation: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aéroport Antananarivo">
                    Aéroport Antananarivo
                  </SelectItem>
                  <SelectItem value="Centre-ville Antananarivo">
                    Centre-ville Antananarivo
                  </SelectItem>
                  <SelectItem value="Andasibe">Andasibe</SelectItem>
                  <SelectItem value="Nosy Be">Nosy Be</SelectItem>
                  <SelectItem value="Morondava">Morondava</SelectItem>
                  <SelectItem value="Diego Suarez">Diego Suarez</SelectItem>
                  <SelectItem value="Fianarantsoa">Fianarantsoa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {rentalForm.startDate && rentalForm.endDate && (
            <div className="mt-4 p-3 bg-forest-50 rounded-lg border border-forest-200">
              <span className="text-sm text-forest-700">
                Durée de location:{" "}
                <span className="font-medium">
                  {getDisplayDays(rentalForm.startDate, rentalForm.endDate)}{" "}
                  jour(s)
                </span>
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Véhicules sélectionnés */}
      {state.vehicles.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-foreground mb-4">
            Véhicules sélectionnés
          </h3>
          <div className="space-y-3">
            {state.vehicles.map((vehicle) => {
              const voiture = availableVehicles.find((v) =>
                // Comparez l'ID de la voiture à l'ID du véhicule de booking.
                // Si l'ID de booking est l'ID de réservation, vous devrez peut-être stocker l'idVoiture aussi dans BookingVehicle.
                // Pour l'instant, je suppose que vehicle.id correspond à idVoiture pour la recherche visuelle.
                // Si vehicle.id est l'idReservation, il faut adapter cette logique.
                // J'ai mis à jour BookingVehicle pour avoir un reservationId et un id (qui peut être l'idVoiture ou un id temporaire)
                vehicle.id === v.idVoiture || vehicle.id.startsWith(v.idVoiture)
              );
              // Si la voiture n'est plus dans `availableVehicles` (ex: elle a été supprimée ou n'a jamais été chargée),
              // vous pourriez vouloir afficher un message ou une version simplifiée.
              // Ici, on renvoie `null` si la voiture n'est pas trouvée, mais un meilleur UX serait de gérer ce cas.
              if (!voiture) return (
                <Card key={vehicle.id} className="opacity-70">
                  <CardContent className="p-4 flex items-center justify-between">
                    <p className="text-muted-foreground italic">Véhicule supprimé ou introuvable (ID: {vehicle.id})</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVehicle(vehicle.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" /> Supprimer
                    </Button>
                  </CardContent>
                </Card>
              );

              const extractSimpleId = (objectId: string): string => objectId.split("-")[0];

              return (
                <Card key={vehicle.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-madagascar-500 to-ocean-500 flex items-center justify-center">
                          <Car className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">
                            {voiture.brand} {voiture.model}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(vehicle.startDate).toLocaleDateString(
                                "fr-FR",
                              )} - {new Date(vehicle.endDate).toLocaleDateString("fr-FR")}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {vehicle.pickupLocation}
                            </span>
                            <span>{vehicle.rentalDays} jour(s)</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-foreground">
                          {formatCurrency(vehicle.price)} Ar
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          // onClick={() => removeVehicle(vehicle.id)}
                          onClick={() =>
                            handleRemoveVehicle(
                              vehicle.id,
                              vehicle.reservationId || extractSimpleId(vehicle.id),
                            )
                          }
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Section Filtres Avancés */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Recherche et Filtres
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showAdvancedFilters ? "Masquer" : "Filtres avancés"}
              </Button>
              {(searchTerm ||
                typeFilter !== "Tous" ||
                locationFilter !== "Tous" ||
                availabilityFilter !== "Tous" ||
                selectedFeatures.length > 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-muted-foreground"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Effacer
                  </Button>
                )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtres de base */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un véhicule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type de véhicule" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Localisation" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={availabilityFilter}
              onValueChange={setAvailabilityFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Disponibilité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous">Tous</SelectItem>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="unavailable">Non disponible</SelectItem>
                <SelectItem value="maintenance">En maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtres avancés */}
          {showAdvancedFilters && (
            <div className="border-t pt-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Équipements
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableFeatures().map((feature) => (
                      <Button
                        key={feature}
                        variant={
                          selectedFeatures.includes(feature)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => toggleFeatureFilter(feature)}
                        className="text-xs"
                      >
                        {featureIcons[feature] && (
                          <span className="w-3 h-3 mr-1">
                            {React.createElement(featureIcons[feature], {
                              className: "w-3 h-3",
                            })}
                          </span>
                        )}
                        {feature}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="font-semibold text-lg">
                      {filteredVehicles.length}
                    </div>
                    <div className="text-muted-foreground">Résultats</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="font-semibold text-lg">
                      {
                        filteredVehicles.filter(
                          (v) => v.availability === "available",
                        ).length
                      }
                    </div>
                    <div className="text-muted-foreground">Disponibles</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="font-semibold text-lg">
                      {filteredVehicles.filter((v) => v.driverIncluded).length}
                    </div>
                    <div className="text-muted-foreground">Avec chauffeur</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Véhicules disponibles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-foreground">
            Véhicules disponibles ({filteredVehicles.length})
          </h3>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4" />
                Créer un véhicule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <VoitureForm onSubmit={handleCreateVehicle} loading={createLoading} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4 pr-2" style={{
          maxHeight: displayAllVehicles ? "none" : "600px", // Show all or limit height
          overflowY: displayAllVehicles ? "visible" : "auto", // Enable scroll if not showing all
        }}>
          {filteredVehicles.map((voiture) => {
            const displayDays = getDisplayDays(
              rentalForm.startDate,
              rentalForm.endDate,
            );
            // Calculer le prix total pour l'affichage seulement
            const totalPriceForDisplay = displayDays > 0 ? voiture.pricePerDay * displayDays : 0;

            return (
              <Card
                key={voiture.idVoiture}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-madagascar-500 to-ocean-500 flex items-center justify-center">
                        <Car className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-foreground">
                            {voiture.brand} {voiture.model}
                          </h4>
                          <Badge variant="outline">{voiture.vehicleType}</Badge>
                          <Badge
                            className={`text-xs ${getAvailabilityColor(
                              voiture.availability,
                            )}`}
                          >
                            {getAvailabilityText(voiture.availability)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>{voiture.location}</span>
                          <span>•</span>
                          <Users className="w-3 h-3" />
                          <span>Capacité: {voiture.capacity} personnes</span>
                          {voiture.driverIncluded && (
                            <>
                              <span>•</span>
                              <span>Avec chauffeur</span>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {voiture.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">
                        {formatCurrency(voiture.pricePerDay)} Ar/jour
                      </div>
                      {displayDays > 0 && (
                        <div className="text-lg font-bold text-foreground">
                          {formatCurrency(totalPriceForDisplay)} Ar
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {displayDays > 0 ? `pour ${displayDays} jour(s)` : "prix total"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {voiture.features.map((feature) => {
                      const Icon = featureIcons[feature] || Star;
                      return (
                        <Badge
                          key={feature}
                          variant="secondary"
                          className="text-xs flex items-center gap-1"
                        >
                          <Icon className="w-3 h-3" />
                          {feature}
                        </Badge>
                      );
                    })}
                  </div>

                  {voiture.driverIncluded && voiture.driverName && (
                    <div className="bg-muted/50 rounded-lg p-3 mb-4">
                      <div className="text-sm font-medium text-foreground mb-1">
                        Chauffeur inclus
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {voiture.driverName}
                        {voiture.driverPhone && ` • ${voiture.driverPhone}`}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => handleAddVehicle(voiture)}
                    disabled={
                      !rentalForm.startDate ||
                      !rentalForm.endDate ||
                      !rentalForm.pickupLocation ||
                      !rentalForm.dropoffLocation ||
                      voiture.availability !== "available" || // Désactiver si non disponible
                      (state.client && state.client.nbpersonnes > voiture.capacity)
                    }
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {
                      !rentalForm.startDate ||
                        !rentalForm.endDate ||
                        !rentalForm.pickupLocation ||
                        !rentalForm.dropoffLocation
                        ? "Compléter les informations"
                        : voiture.availability !== "available"
                          ? `${getAvailabilityText(voiture.availability)}`
                          : state.client && state.client.nbpersonnes > voiture.capacity
                            ? "Capacité insuffisante"
                            : `Ajouter (${formatCurrency(totalPriceForDisplay)} Ar)`
                    }
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredVehicles.length > 3 && (
          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={() => setDisplayAllVehicles(!displayAllVehicles)}
            >
              {displayAllVehicles ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Afficher moins
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Afficher plus ({filteredVehicles.length - 3} de plus)
                </>
              )}
            </Button>
          </div>
        )}

      </div>
      {filteredVehicles.length === 0 && availableVehicles.length > 0 && (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-2 text-sm font-medium text-foreground">
            Aucun véhicule trouvé
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Essayez de modifier vos critères de recherche
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="mt-3"
          >
            <X className="w-4 h-4 mr-2" />
            Effacer tous les filtres
          </Button>
        </div>
      )}



      {state.vehicles.length === 0 && (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <Car className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-2 text-sm font-medium text-foreground">
            Aucun véhicule sélectionné
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajoutez un véhicule pour continuer
          </p>
        </div>
      )}
    </div>
  );
}