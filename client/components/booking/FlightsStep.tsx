import { useState, useEffect, useCallback, useRef } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plane,
  Plus,
  Trash2,
  Clock,
  Star,
  Users,
  ArrowRightLeft,
  Edit3,
  Search,
  Filter,
  X,
  ChevronUp,
  ChevronDown,
  MapPin,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { normalizeVol, type Vol } from "@shared/types";
import type { BookingFlight } from "@shared/booking";
import VolForm from "../forms/VolForm";
import { volService } from "@/services/volService";
import { toast } from "@/hooks/use-toast";
import { useFlightBooking } from "@/hooks/useFlightBooking";
import { reservationService } from "@/services/reservationService";
import { validateFlightDatesAgainstTravel, isDateWithinTravelPeriod, getDateValidationMessage } from "@/lib/enhancedDateValidation";
import { Calendar } from "../ui/calendar";

const serviceIcons: Record<string, any> = {
  "repas": Star,
  "bagage": Users,
  "wifi": Star,
  "divertissement": Star,
  "prise électrique": Star,
};

const flightTypes = [
  "Tous",
  "Domestique",
  "International",
  "Affaires",
  "Première classe"
];

const airlines = [
  "Tous",
  "Air Madagascar",
  "Tsaradia",
  "Air France",
  "Emirates",
  "Turkish Airlines"
];

export default function FlightsStep() {
  const { state, removeFlight, updateFlight } = useBooking();
  const { creerEtAjouterReservationVol, mettreAJourReservationVol } = useFlightBooking();

  const [availableFlights, setAvailableFlights] = useState<Vol[]>([]);
  const [loading, setLoading] = useState(true);
  const [flightForm, setFlightForm] = useState({
    departureDate: "",
    returnDate: "",
    departureCity: "Antananarivo",
    arrivalCity: "Nosy Be",
    passengers: state.client?.nbpersonnes || 1,
  });

  // Helper to format date as YYYY-MM-DD in local time to avoid timezone shift
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("Tous");
  const [airlineFilter, setAirlineFilter] = useState("Tous");
  const [availabilityFilter, setAvailabilityFilter] = useState("Tous");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Close create flight dialog after adding a flight
  useEffect(() => {
    if (!createLoading && isCreateDialogOpen) {
      setIsCreateDialogOpen(true  );
    }
  }, [createLoading, isCreateDialogOpen]);
  const [displayAllFlights, setDisplayAllFlights] = useState(false);
  const [editingFlightId, setEditingFlightId] = useState<string | null>(null);
  const [tempPassengers, setTempPassengers] = useState(1);

  const departureDateRef = useRef<HTMLDivElement>(null);
  const returnDateRef = useRef<HTMLDivElement>(null);
  const [showDepartureCalendar, setShowDepartureCalendar] = useState(false);
  const [showReturnCalendar, setShowReturnCalendar] = useState(false);

  // Close calendar on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        departureDateRef.current &&
        !departureDateRef.current.contains(event.target as Node)
      ) {
        setShowDepartureCalendar(false);
      }
      if (
        returnDateRef.current &&
        !returnDateRef.current.contains(event.target as Node)
      ) {
        setShowReturnCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/vols");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.data) {
        const vols: Vol[] = data.data.map(normalizeVol);
        setAvailableFlights(vols);
      } else {
        setAvailableFlights([]);
      }
    } catch (error) {
      console.error("Error fetching flights:", error);
      setAvailableFlights([]);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les vols disponibles.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFlight = async (vol: Vol) => {
    if (!flightForm.departureDate || !flightForm.returnDate) {
      toast({
        title: "Dates manquantes",
        description: "Veuillez sélectionner les dates de départ et de retour.",
        variant: "destructive",
      });
      return;
    }

    // Validate flight dates against travel dates
    const validation = validateFlightDatesAgainstTravel(
      flightForm.departureDate,
      flightForm.returnDate,
      {
        dateTravel: state.client?.dateTravel || new Date(),
        dateReturn: state.client?.dateReturn || new Date()
      }
    );

    if (!validation.isValid) {
      toast({
        title: "Date invalide",
        description: validation.errors.join('. '),
        variant: "destructive",
      });
      return;
    }

    const result = await creerEtAjouterReservationVol(vol, {
      ...flightForm,
      passengers: flightForm.passengers,
    });

    if (result.success) {
      fetchFlights();
    }
  };

  const handleRemoveFlight = useCallback(
    async (flightId: string, reservationIdToDelete?: string) => {
      try {
        if (reservationIdToDelete) {
          const response = await reservationService.deleteReservation(reservationIdToDelete);
          if (response.success) {
            removeFlight(flightId);
            toast({
              title: "Réservation supprimée",
              description: "Le vol a été supprimé avec succès.",
            });
          } else {
            toast({
              title: "Erreur",
              description: response.error || "Erreur lors de la suppression de la réservation.",
              variant: "destructive",
            });
          }
        } else {
          removeFlight(flightId);
          toast({
            title: "Vol supprimé",
            description: "Le vol a été retiré de la sélection.",
          });
        }
      } catch (error) {
        console.error("Error deleting reservation:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la suppression.",
          variant: "destructive",
        });
      }
    },
    [removeFlight],
  );

  const handleUpdatePassengers = async (flightId: string) => {
    const flight = state.flights.find(f => f.id === flightId);
    if (!flight || !flight.reservationId) return;

    const result = await mettreAJourReservationVol(
      flight.reservationId,
      { passengers: tempPassengers }
    );

    if (result.success) {
      updateFlight(flightId, tempPassengers, result.data?.newPrice || 0);
      setEditingFlightId(null);
    }
  };

  const handleCreateFlight = async (data: any) => {
    setCreateLoading(true);
    try {
      const response = await volService.createVol(data);
      if (response.success && response.data) {
        const newFlight = normalizeVol(response.data);

        const reservationResult = await creerEtAjouterReservationVol(newFlight, {
          departureDate: data.departureDate,
          returnDate: data.returnDate,
          departureCity: data.departureCity,
          arrivalCity: data.arrivalCity,
          passengers: data.passengers,
        });

        if (reservationResult.success) {
          setIsCreateDialogOpen(false);
        } else {
          toast({
            title: "Erreur de création de vol",
            description:
              reservationResult.error ||
              "Erreur lors de la réservation du nouveau vol.",
            variant: "destructive",
          });
        }

        await fetchFlights();
      } else {
        toast({
          title: "Erreur",
          description: response.error || "Erreur lors de la création du vol.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la création du vol :", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du vol.",
        variant: "destructive",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const getAvailableServices = () => {
    const allServices = availableFlights.flatMap((v) => v.services || []);
    return [...new Set(allServices)].filter(Boolean);
  };

  const toggleServiceFilter = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((f) => f !== service)
        : [...prev, service],
    );
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setTypeFilter("Tous");
    setAirlineFilter("Tous");
    setAvailabilityFilter("Tous");
    setSelectedServices([]);
  };

  const filteredFlights = availableFlights
    .filter((vol) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        vol.airline.toLowerCase().includes(searchLower) ||
        vol.flightNumber.toLowerCase().includes(searchLower) ||
        vol.route.from.toLowerCase().includes(searchLower) ||
        vol.route.to.toLowerCase().includes(searchLower);

      const matchesType =
        typeFilter === "Tous" ||
        (typeFilter === "Domestique" && vol.type === "domestic") ||
        (typeFilter === "International" && vol.type === "international");

      const matchesAirline =
        airlineFilter === "Tous" || vol.airline === airlineFilter;

      const matchesAvailability =
        availabilityFilter === "Tous" ||
        (availabilityFilter === "Disponible" && vol.availability === "available") ||
        (availabilityFilter === "Limité" && vol.availability === "limited") ||
        (availabilityFilter === "Complet" && vol.availability === "full");

      const matchesServices =
        selectedServices.length === 0 ||
        selectedServices.every((service) =>
          vol.services?.includes(service),
        );

      return (
        matchesSearch &&
        matchesType &&
        matchesAirline &&
        matchesAvailability &&
        matchesServices
      );
    })
    .sort((a, b) => {
      if (a.availability === "available" && b.availability !== "available")
        return -1;
      if (a.availability !== "available" && b.availability === "available")
        return 1;
      return a.price - b.price;
    });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-muted rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!state.client) {
    return (
      <div className="text-center py-8">
        <Plane className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-2 text-lg font-medium text-foreground">
          Client requis
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Veuillez sélectionner un client avant de choisir les vols
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Flight Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recherche de vols</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departureDate">Date de départ</Label>
              <Input
                id="departureDate"
                type="date"
                value={flightForm.departureDate}
                onChange={(e) =>
                  setFlightForm({ ...flightForm, departureDate: e.target.value })
                }
                min={state.client?.dateTravel ? new Date(state.client.dateTravel).toISOString().split("T")[0] : undefined}
                max={flightForm.returnDate || (state.client?.dateReturn ? new Date(state.client.dateReturn).toISOString().split("T")[0] : undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="returnDate">Date de retour</Label>
              <Input
                id="returnDate"
                type="date"
                value={flightForm.returnDate}
                onChange={(e) =>
                  setFlightForm({ ...flightForm, returnDate: e.target.value })
                }
                min={flightForm.departureDate || (state.client?.dateTravel ? new Date(state.client.dateTravel).toISOString().split("T")[0] : undefined)}
                max={state.client?.dateReturn ? new Date(state.client.dateReturn).toISOString().split("T")[0] : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departureCity">Aéroport de départ</Label>
              <Select
                value={flightForm.departureCity}
                onValueChange={(value) =>
                  setFlightForm({ ...flightForm, departureCity: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Antananarivo">Antananarivo</SelectItem>
                  <SelectItem value="Nosy Be">Nosy Be</SelectItem>
                  <SelectItem value="Diego Suarez">Diego Suarez</SelectItem>
                  <SelectItem value="Toamasina">Toamasina</SelectItem>
                  <SelectItem value="Toliara">Toliara</SelectItem>
                  <SelectItem value="Paris">Paris</SelectItem>
                  <SelectItem value="Lyon">Lyon</SelectItem>
                  <SelectItem value="Marseille">Marseille</SelectItem>
                  <SelectItem value="Toulouse">Toulouse</SelectItem>
                  <SelectItem value="Nice">Nice</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                  <SelectItem value="London">London</SelectItem>
                  <SelectItem value="Tokyo">Tokyo</SelectItem>
                  <SelectItem value="Sydney">Sydney</SelectItem>
                  <SelectItem value="Berlin">Berlin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrivalCity">Aéroport d’arrivée</Label>
              <Select
                value={flightForm.arrivalCity}
                onValueChange={(value) =>
                  setFlightForm({ ...flightForm, arrivalCity: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nosy Be">Nosy Be</SelectItem>
                  <SelectItem value="Antananarivo">Antananarivo</SelectItem>
                  <SelectItem value="Diego Suarez">Diego Suarez</SelectItem>
                  <SelectItem value="Toamasina">Toamasina</SelectItem>
                  <SelectItem value="Toliara">Toliara</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Flights */}
      {state.flights.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-foreground mb-4">
            Vols sélectionnés ({state.flights.length})
          </h3>
          <div className="space-y-3">
            {state.flights.map((flight) => {
              const vol = availableFlights.find((v) =>
                flight.id.startsWith(v.idVol),
              );

              if (!vol) return (
                <Card key={flight.id} className="opacity-70">
                  <CardContent className="p-4 flex items-center justify-between">
                    <p className="text-muted-foreground italic">Vol supprimé ou introuvable (ID: {flight.id})</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFlight(flight.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" /> Supprimer
                    </Button>
                  </CardContent>
                </Card>
              );

              const extractSimpleId = (objectId: string): string => objectId.split("-")[0];

              return (
                <Card key={flight.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-ocean-500 to-madagascar-500 flex items-center justify-center">
                          <Plane className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">
                            {vol.airline} {vol.flightNumber}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <div className="w-3 h-3" />
                              {new Date(flight.departureDate).toLocaleDateString("fr-FR")}
                              {flight.returnDate && (
                                <>
                                  {" - "}
                                  {new Date(flight.returnDate).toLocaleDateString("fr-FR")}
                                </>
                              )}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {flight.departureCity} → {flight.arrivalCity}
                            </span>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {editingFlightId === flight.id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={tempPassengers}
                                    onChange={(e) =>
                                      setTempPassengers(Math.max(1, parseInt(e.target.value) || 1))
                                    }
                                    className="w-16 h-6 text-xs"
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleUpdatePassengers(flight.id)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    ✓
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingFlightId(null)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    ✕
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setTempPassengers(flight.passengers);
                                    setEditingFlightId(flight.id);
                                  }}
                                  className="flex items-center gap-1 hover:text-primary"
                                >
                                  {flight.passengers} passager(s)
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-foreground">
                          {formatCurrency(flight.price)} Ar
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveFlight(
                              flight.id,
                              flight.reservationId || extractSimpleId(flight.id),
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

      {/* Filters Section */}
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
                airlineFilter !== "Tous" ||
                availabilityFilter !== "Tous" ||
                selectedServices.length > 0) && (
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un vol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type de vol" />
              </SelectTrigger>
              <SelectContent>
                {flightTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={airlineFilter} onValueChange={setAirlineFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Compagnie" />
              </SelectTrigger>
              <SelectContent>
                {airlines.map((airline) => (
                  <SelectItem key={airline} value={airline}>
                    {airline}
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
                <SelectItem value="Disponible">Disponible</SelectItem>
                <SelectItem value="Limité">Limité</SelectItem>
                <SelectItem value="Complet">Complet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t pt-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Services
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableServices().map((service) => (
                      <Button
                        key={service}
                        variant={
                          selectedServices.includes(service)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => toggleServiceFilter(service)}
                        className="text-xs"
                      >
                        {serviceIcons[service] && (
                          <span className="w-3 h-3 mr-1">
                            {React.createElement(serviceIcons[service], {
                              className: "w-3 h-3",
                            })}
                          </span>
                        )}
                        {service}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="font-semibold text-lg">
                      {filteredFlights.length}
                    </div>
                    <div className="text-muted-foreground">Résultats</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="font-semibold text-lg">
                      {
                        filteredFlights.filter(
                          (v) => v.availability === "available",
                        ).length
                      }
                    </div>
                    <div className="text-muted-foreground">Disponibles</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="font-semibold text-lg">
                      {filteredFlights.filter((v) => v.class === "business").length}
                    </div>
                    <div className="text-muted-foreground">Classe affaires</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Flights */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-foreground">
            Vols disponibles ({filteredFlights.length})
          </h3>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-sky-600 hover:bg-sky-700">
                <Plus className="h-4 w-4" />
                Créer un vol
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <VolForm onSubmit={handleCreateFlight} loading={createLoading} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4 pr-2" style={{
          maxHeight: displayAllFlights ? "none" : "600px",
          overflowY: displayAllFlights ? "visible" : "auto",
        }}>
          {filteredFlights.map((vol) => {
            const totalPrice = vol.price * flightForm.passengers;

            return (
              <Card
                key={vol.idVol}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-ocean-500 to-madagascar-500 flex items-center justify-center">
                        <Plane className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-foreground">
                            {vol.airline} {vol.flightNumber}
                          </h4>
                          <Badge variant="outline">{vol.aircraft}</Badge>
                          <Badge
                            variant={
                              vol.availability === "available"
                                ? "default"
                                : vol.availability === "limited"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {vol.availability === "available"
                              ? "Disponible"
                              : vol.availability === "limited"
                                ? "Limité"
                                : "Complet"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <span className="font-medium">
                            {vol.route.fromCode}
                          </span>
                          <ArrowRightLeft className="w-3 h-3" />
                          <span className="font-medium">
                            {vol.route.toCode}
                          </span>
                          <span>•</span>
                          <span>{vol.schedule.duration}</span>
                          <span>•</span>
                          <span className="capitalize">{vol.class}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Départ: {vol.schedule.departure} - Arrivée: {vol.schedule.arrival}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">
                        {formatCurrency(vol.price)} Ar/pers
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {formatCurrency(totalPrice)} Ar
                      </div>
                      <div className="text-xs text-muted-foreground">
                        pour {flightForm.passengers} passager(s)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {vol.services.slice(0, 6).map((service) => {
                      const Icon = serviceIcons[service] || Star;
                      return (
                        <Badge
                          key={service}
                          variant="secondary"
                          className="text-xs flex items-center gap-1"
                        >
                          <Icon className="w-3 h-3" />
                          {service}
                        </Badge>
                      );
                    })}
                    {vol.services.length > 6 && (
                      <Badge variant="secondary" className="text-xs">
                        +{vol.services.length - 6} autres
                      </Badge>
                    )}
                  </div>

                  <Button
                    onClick={() => handleAddFlight(vol)}
                    disabled={
                      !flightForm.departureDate ||
                      !flightForm.returnDate ||
                      vol.availability === "full" ||
                      flightForm.passengers <= 0
                    }
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {
                      !flightForm.departureDate ? "Sélectionnez une date"
                        : !flightForm.returnDate
                          ? "Sélectionnez date retour"
                          : `Ajouter (${formatCurrency(totalPrice)} Ar)`
                    }
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredFlights.length > 3 && (
          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={() => setDisplayAllFlights(!displayAllFlights)}
            >
              {displayAllFlights ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Afficher moins
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Afficher plus ({filteredFlights.length - 3} de plus)
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {filteredFlights.length === 0 && availableFlights.length > 0 && (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-2 text-sm font-medium text-foreground">
            Aucun vol trouvé
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

      {state.flights.length === 0 && (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <Plane className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-2 text-sm font-medium text-foreground">
            Aucun vol sélectionné
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajoutez des vols pour continuer
          </p>
        </div>
      )}
    </div>
  );
}