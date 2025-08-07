import React, { useState, useEffect, useMemo, useCallback } from "react"; // Added useCallback
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import HebergementForm from "../forms/HebergementForm";
import { hebergementService } from "@/services/hebergementService";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building,
  Plus,
  Trash2,
  Star,
  MapPin,
  Calendar,
  Users,
  Wifi,
  Car,
  Coffee,
  TreePine,
  Search,
  Filter,
  X,
  Utensils,
  Waves,
  ChevronDown, // Added for "Show More"
  ChevronUp,   // Added for "Show Less"
  AlertTriangle,
  Info,
} from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { reservationService } from "@/services/reservationService";
import type { Hebergement, Reservation } from "@shared/types";
import type { BookingAccommodation } from "@shared/booking";
import { useAccommodationBooking } from "@/hooks/useAccommodationBooking"; // Importez le nouveau hook
import { validateAccommodationDatesAgainstFlight } from "@/lib/enhancedDateValidation";

// --- Constants and Utility Functions (restent en dehors) ---

const AMENITY_ICONS: Record<string, React.ElementType> = {
  wifi: Wifi,
  restaurant: Utensils,
  parking: Car,
  jardin: TreePine,
  piscine: Waves,
  spa: Star,
  "plage privée": Waves,
  bar: Coffee,
};

const ACCOMMODATION_TYPES = [
  "Tous",
  "Bungalow",
  "Lodge",
  "Hôtel",
  "Resort",
  "Guesthouse",
];

const LOCATIONS = [
  "Tous",
  "Andasibe",
  "Mantadia",
  "Nosy Be",
  "Sainte-Marie",
  "Isalo",
  "Tsingy",
  "Morondava",
  "Diego Suarez",
];

const calculateNights = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: Date): string => date.toISOString().split("T")[0];

const extractSimpleId = (objectId: string): string => objectId.split("-")[0];

// --- AccommodationStep Component ---

export default function AccommodationStep() {
  const { state, removeAccommodation } = useBooking();
  const { createAndAddReservation } = useAccommodationBooking();

  const [availableAccommodations, setAvailableAccommodations] = useState<
    Hebergement[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({
    checkIn: "",
    checkOut: "",
    rooms: 1,
    guests: state.client?.nbpersonnes || 2,
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [dateValidationErrors, setDateValidationErrors] = useState<string[]>([]);
  const [dateValidationWarnings, setDateValidationWarnings] = useState<string[]>([]);

  // Validate accommodation dates against flight dates on bookingForm change
  useEffect(() => {
    if (!bookingForm.checkIn || !bookingForm.checkOut) {
      setDateValidationErrors([]);
      setDateValidationWarnings([]);
      return;
    }
    if (state.flights.length === 0) {
      setDateValidationErrors(["Veuillez d'abord sélectionner un vol avec des dates valides."]);
      setDateValidationWarnings([]);
      return;
    }
    
    // Use client travel dates as fallback if no flights have specific dates
    const clientDepartureDate = state.client?.dateTravel?.toString();
    const clientReturnDate = state.client?.dateReturn?.toString();
    
    if (!clientDepartureDate || !clientReturnDate) {
      setDateValidationErrors(["Les dates de voyage client ne sont pas définies."]);
      setDateValidationWarnings([]);
      return;
    }

    const validation = validateAccommodationDatesAgainstFlight(
      bookingForm.checkIn,
      bookingForm.checkOut,
      clientDepartureDate as string,
      clientReturnDate as string
    );
    setDateValidationErrors(validation.errors);
    setDateValidationWarnings(validation.warnings);
  }, [bookingForm.checkIn, bookingForm.checkOut, state.client]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("Tous");
  const [locationFilter, setLocationFilter] = useState("Tous");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // New state to manage display of all accommodations
  const [showAllAccommodations, setShowAllAccommodations] = useState(false);

  // Effect to fetch accommodations on component mount
  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/hebergements/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.data) {
          setAvailableAccommodations(data.data);
        } else {
          setAvailableAccommodations([]);
        }
      } catch (error) {
        console.error("Error fetching accommodations:", error);
        setAvailableAccommodations([]);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les hébergements disponibles.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAccommodations();
  }, []);

  // Effect to update guests count when client changes
  useEffect(() => {
    if (state.client) {
      setBookingForm((prev) => ({
        ...prev,
        guests: state.client!.nbpersonnes,
      }));
    }
  }, [state.client]);

  /**
   * Appelle le hook pour ajouter un hébergement à la réservation.
   */
  const handleAddAccommodation = useCallback(
    async (hebergement: Hebergement) => {
      await createAndAddReservation(hebergement, bookingForm);
    },
    [createAndAddReservation, bookingForm],
  );

  /**
   * Crée un nouvel hébergement et l'ajoute à la réservation via le hook.
   */
  const handleCreateAccommodation = useCallback(
    async (data: any) => {
      setCreateLoading(true);
      try {
        const accommodationResponse = await hebergementService.createHebergement(
          data,
        );

        if (accommodationResponse.success && accommodationResponse.data) {
          const newHebergement = accommodationResponse.data;

          // Rafraîchir la liste des hébergements disponibles après la création
          const response = await fetch("http://localhost:8081/api/hebergements/");
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              setAvailableAccommodations(data.data);
            }
          }

          // Utiliser le hook pour créer et ajouter la réservation
          const reservationResult = await createAndAddReservation(newHebergement, {
            checkIn: data.checkIn,
            checkOut: data.checkOut,
            rooms: data.rooms || 1,
            guests: data.capacity || 2,
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
        } else {
          toast({
            title: "Erreur de création d'hébergement",
            description:
              accommodationResponse.error ||
              "Erreur lors de la création de l'hébergement.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error creating accommodation:", error);
        toast({
          title: "Erreur",
          description:
            "Une erreur est survenue lors de la création de l'hébergement.",
          variant: "destructive",
        });
      } finally {
        setCreateLoading(false);
      }
    },
    [createAndAddReservation],
  );

  // Render stars function (mémoïsé via useCallback si vous le souhaitez)
  const renderStars = useCallback((rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating)
          ? "text-yellow-400 fill-current"
          : "text-gray-300"
          }`}
      />
    ));
  }, []);

  // Get unique amenities from available accommodations (mémoïsé)
  const getAvailableAmenities = useMemo(() => {
    const allAmenities = availableAccommodations.flatMap(
      (h) => h.amenities || [],
    );
    return [...new Set(allAmenities)].filter(Boolean);
  }, [availableAccommodations]);

  // Toggle amenity filter (mémoïsé via useCallback)
  const toggleAmenityFilter = useCallback((amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity],
    );
  }, []);

  // Clear all filters (mémoïsé via useCallback)
  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setTypeFilter("Tous");
    setLocationFilter("Tous");
    setSelectedAmenities([]);
  }, []);

  // Filter accommodations based on all criteria (mémoïsé)
  const filteredAccommodations = useMemo(() => {
    return availableAccommodations
      .filter((hebergement) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          searchTerm === "" ||
          hebergement.name.toLowerCase().includes(searchLower) ||
          hebergement.location.toLowerCase().includes(searchLower) ||
          hebergement.address.toLowerCase().includes(searchLower) ||
          hebergement.type.toLowerCase().includes(searchLower) ||
          hebergement.description.toLowerCase().includes(searchLower);

        const matchesType =
          typeFilter === "Tous" || hebergement.type === typeFilter;

        const matchesLocation =
          locationFilter === "Tous" || hebergement.location === locationFilter;

        const matchesAmenities =
          selectedAmenities.length === 0 ||
          selectedAmenities.every((amenity) =>
            hebergement.amenities?.includes(amenity),
          );

        return (
          matchesSearch && matchesType && matchesLocation && matchesAmenities
        );
      })
      .sort((a, b) => b.rating - a.rating); // Sort by rating by default
  }, [
    availableAccommodations,
    searchTerm,
    typeFilter,
    locationFilter,
    selectedAmenities,
  ]);

  // Determine which accommodations to display based on `showAllAccommodations` state
  const displayedAccommodations = useMemo(() => {
    return showAllAccommodations
      ? filteredAccommodations
      : filteredAccommodations.slice(0, 3);
  }, [showAllAccommodations, filteredAccommodations]);

  // Handler for removing an accommodation (remains the same)
  const handleRemoveAccommodation = useCallback(
    async (accommodationId: string, reservationIdToDelete: string) => {
      try {
        const reservationId = reservationIdToDelete; // Use the direct reservationId
        const response = await reservationService.deleteReservation(
          reservationId,
        );
        if (response.success) {
          removeAccommodation(accommodationId);
          toast({
            title: "Réservation supprimée",
            description: "L'hébergement a été supprimé avec succès.",
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
    [removeAccommodation],
  );

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
        <Building className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-2 text-lg font-medium text-foreground">
          Client requis
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Veuillez sélectionner un client avant de choisir l'hébergement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end mb-4">

      </div>

      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Détails du séjour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Date d'arrivée</Label>
              <Input
                id="checkIn"
                type="date"
                value={bookingForm.checkIn}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, checkIn: e.target.value })
                }
                min={state.client?.dateTravel?.toString()}
                max={state.client?.dateReturn?.toString()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut">Date de départ</Label>
              <Input
                id="checkOut"
                type="date"
                value={bookingForm.checkOut}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, checkOut: e.target.value })
                }
                min={state.client?.dateTravel?.toString()}
                max={state.client?.dateReturn?.toString()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rooms">Nombre de chambres</Label>
              <Select
                value={bookingForm.rooms.toString()}
                onValueChange={(value) =>
                  setBookingForm({ ...bookingForm, rooms: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={`room-${num}`} value={num.toString()}>
                      {num} chambre{num > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="guests">Nombre d'invités</Label>
              <Select
                value={bookingForm.guests.toString()}
                onValueChange={(value) =>
                  setBookingForm({ ...bookingForm, guests: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={`guest-${num}`} value={num.toString()}>
                      {num} personne{num > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {bookingForm.checkIn && bookingForm.checkOut && (
            <div className="mt-4 p-3 bg-forest-50 rounded-lg border border-forest-200">
              <span className="text-sm text-forest-700">
                Durée du séjour:{" "}
                <span className="font-medium">
                  {calculateNights(bookingForm.checkIn, bookingForm.checkOut)}{" "}
                  nuit(s)
                </span>
              </span>
            </div>
          )}

          {dateValidationErrors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">Erreurs de dates</span>
              </div>
              <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                {dateValidationErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {dateValidationWarnings.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">Avertissements</span>
              </div>
              <ul className="list-disc list-inside text-sm text-yellow-600 mt-1">
                {dateValidationWarnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Accommodations */}
      {state.accommodations.length > 0 && (
        <section>
          <h3 className="text-lg font-medium text-foreground mb-4">
            Hébergements sélectionnés
          </h3>
          <div className="space-y-3">
            {state.accommodations.map((accommodation) => {
              const hebergement = availableAccommodations.find((h) =>
                accommodation.id.startsWith(h.idHebergement || ""),
              );

              return (
                <Card key={accommodation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-madagascar-500 to-forest-500 flex items-center justify-center">
                          <Building className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">
                            {hebergement?.name || "Hébergement inconnu"}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {accommodation.checkIn && accommodation.checkOut ? (
                              <>
                                {new Date(
                                  accommodation.checkIn.toString(),
                                ).toLocaleDateString("fr-FR")}{" "}
                                -{" "}
                                {new Date(
                                  accommodation.checkOut.toString(),
                                ).toLocaleDateString("fr-FR")}
                              </>
                            ) : (
                              "Dates non définies"
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {accommodation.rooms} chambre(s),{" "}
                              {accommodation.guests} personne(s)
                            </span>
                            <span>{accommodation.nights} nuit(s)</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-foreground">
                          {formatCurrency(accommodation.price)} Ar
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveAccommodation(
                              accommodation.id,
                              accommodation.reservationId || extractSimpleId(accommodation.id),
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
        </section>
      )}

      {/* Advanced Filters Section */}
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
                selectedAmenities.length > 0) && (
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
          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un hébergement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type d'hébergement" />
              </SelectTrigger>
              <SelectContent>
                {ACCOMMODATION_TYPES.map((type) => (
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
                {LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t pt-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Équipements
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableAmenities.map((amenity) => (
                      <Button
                        key={amenity}
                        variant={
                          selectedAmenities.includes(amenity)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => toggleAmenityFilter(amenity)}
                        className="text-xs"
                      >
                        {AMENITY_ICONS[amenity] && (
                          <span className="w-3 h-3 mr-1">
                            {React.createElement(AMENITY_ICONS[amenity], {
                              className: "w-3 h-3",
                            })}
                          </span>
                        )}
                        {amenity}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="font-semibold text-lg">
                      {filteredAccommodations.length}
                    </div>
                    <div className="text-muted-foreground">Résultats</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="font-semibold text-lg">
                      {filteredAccommodations.length > 0
                        ? Math.round(
                          (filteredAccommodations.reduce(
                            (acc, h) => acc + h.rating,
                            0,
                          ) /
                            filteredAccommodations.length) *
                          10,
                        ) / 10
                        : 0}
                    </div>
                    <div className="text-muted-foreground">Note moy.</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="font-semibold text-lg">
                      {
                        filteredAccommodations.filter(
                          (h) => h.amenities?.length > 0,
                        ).length
                      }
                    </div>
                    <div className="text-muted-foreground">
                      Avec équipements
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Accommodations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-foreground">
            Hébergements disponibles ({filteredAccommodations.length})
          </h3>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4" />
                Créer un hébergement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <HebergementForm
                onSubmit={handleCreateAccommodation}
                loading={createLoading}
              />
            </DialogContent>
          </Dialog>

        </div>
        <div
          className="space-y-4 pr-2" // Added pr-2 for padding-right for scrollbar
          style={{
            maxHeight: showAllAccommodations ? "none" : "600px", // Adjust max-height as needed for initial view
            overflowY: showAllAccommodations ? "visible" : "auto",
          }}
        >
          {filteredAccommodations.map((hebergement) => {
            const nights = calculateNights(
              bookingForm.checkIn,
              bookingForm.checkOut,
            );
            const totalPrice =
              nights > 0
                ? hebergement.priceRange * nights
                : hebergement.priceRange;

            return (
              <Card
                key={hebergement.idHebergement}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-madagascar-500 to-forest-500 flex items-center justify-center">
                        <Building className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-foreground">
                            {hebergement.name}
                          </h4>
                          <Badge variant="outline">{hebergement.type}</Badge>
                          <div className="flex items-center gap-1">
                            {renderStars(hebergement.rating)}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({hebergement.rating})
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>{hebergement.location}</span>
                          <span>•</span>
                          <span>
                            Capacité: {hebergement.capacity} personnes
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {hebergement.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">
                        {hebergement.priceRange}
                      </div>
                      {nights > 0 && (
                        <div className="text-lg font-bold text-foreground">
                          {formatCurrency(totalPrice)} Ar
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {nights > 0 ? `pour ${nights} nuit(s)` : "prix par nuit"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {hebergement.amenities?.map((amenity, index) => {
                      const Icon = AMENITY_ICONS[amenity] || Star;
                      return (
                        <Badge
                          key={`${hebergement.idHebergement}-${amenity}-${index}`}
                          variant="secondary"
                          className="text-xs flex items-center gap-1"
                        >
                          <Icon className="w-3 h-3" />
                          {amenity}
                        </Badge>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Adresse
                      </div>
                      <div className="font-medium">{hebergement.address}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Téléphone
                      </div>
                      <div className="font-medium">{hebergement.phone}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Email</div>
                      <div className="font-medium">{hebergement.email}</div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleAddAccommodation(hebergement)}
                    disabled={
                      !bookingForm.checkIn ||
                      !bookingForm.checkOut ||
                      bookingForm.guests > hebergement.capacity ||
                      dateValidationErrors.length > 0
                    } className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {bookingForm.guests > hebergement.capacity
                      ? "Capacité insuffisante"
                      : dateValidationErrors.length > 0
                        ? "Dates invalides"
                        : !bookingForm.checkIn || !bookingForm.checkOut
                          ? "Sélectionner les dates"
                          : `Ajouter (${formatCurrency(totalPrice)} Ar)`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          {dateValidationErrors.length > 0 && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md mt-2">
              <ul className="list-disc list-inside text-sm">
                {dateValidationErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {dateValidationWarnings.length > 0 && (
            <div className="p-3 bg-yellow-100 text-yellow-700 rounded-md mt-2">
              <ul className="list-disc list-inside text-sm">
                {dateValidationWarnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
        

        {filteredAccommodations.length > 3 && (
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              onClick={() => setShowAllAccommodations(!showAllAccommodations)}
            >
              {showAllAccommodations ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Afficher moins
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Afficher plus ({filteredAccommodations.length - 3} de plus)
                </>
              )}
            </Button>
          </div>
        )}
      </div>
      {filteredAccommodations.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            Aucun hébergement ne correspond à vos critères de recherche.

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

         {state.flights.length === 0 && (
                <div className="text-center py-8 bg-muted/30 rounded-lg">
                  <Building className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-2 text-sm font-medium text-foreground">
                    Aucun vehicule sélectionné
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ajoutez des vehicule pour continuer
                  </p>
                </div>
              )}
    </div>

    
  );
}