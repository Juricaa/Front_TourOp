import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ActiviteForm from "../forms/ActiviteForm";
import { activiteService } from "@/services/activiteService";
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
  MapPin,
  Plus,
  Trash2,
  Star,
  Clock,
  Users,
  Calendar,
  Search,
  Filter,
  X,
  Heart,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useBooking } from "@/contexts/BookingContext"; // Assuming useBooking provides addActivite and removeActivite
import { useActiviteBooking } from "@/hooks/useActiviteBooking"; // Import the new hook
import type { Activite } from "@shared/types";
import type { BookingActivite } from "@shared/booking"; // Use the correct type name
import { reservationService } from "@/services/reservationService";

const categories = [
  "Tous",
  "Nature",
  "Aventure",
  "Culture",
  "Détente",
  "Observation",
  "Sport",
];

const locations = [
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

const difficulties = ["Tous", "facile", "modéré", "difficile"];

export default function ActivitiesStep() {
  const { state, removeActivity } = useBooking(); // Renamed removeActivity to removeActivite
  const { createAndAddActiviteReservation } = useActiviteBooking(); // Import the function from the new hook

  const [availableActivities, setAvailableActivities] = useState<Activite[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [activityForm, setActivityForm] = useState({
    date: "",
    participants: state.client?.nbpersonnes || 2,
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tous");
  const [locationFilter, setLocationFilter] = useState("Tous");
  const [difficultyFilter, setDifficultyFilter] = useState("Tous");
  const [guideFilter, setGuideFilter] = useState("Tous");
  const [favoriteFilter, setFavoriteFilter] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [displayAllActivity, setDisplayAllActivity] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    if (state.client) {
      setActivityForm((prev) => ({
        ...prev,
        participants: state.client!.nbpersonnes,
      }));
    }
  }, [state.client]);

  const fetchActivities = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/activites/");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.data) {
        setAvailableActivities(data.data);
      } else {
        setAvailableActivities([]);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      setAvailableActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // This calculatePrice function is now local and used only for display purposes
  // The actual price calculation for booking is handled by useActiviteBooking
  const calculateDisplayPrice = (activite: Activite, participants: number) => {
    // Assuming priceAdult is the price per participant
    return activite.priceAdult * participants;
  };

  const handleAddActiviteToBooking = async (activite: Activite) => {
    if (!activityForm.date) {
      toast({
        title: "Date d'activité manquante",
        description: "Veuillez sélectionner une date pour l'activité.",
        variant: "destructive",
      });
      return;
    }

    if (
      activityForm.participants < activite.groupSizeMin ||
      activityForm.participants > activite.groupSizeMax
    ) {
      toast({
        title: "Nombre de participants invalide",
        description: `Cette activité nécessite entre ${activite.groupSizeMin} et ${activite.groupSizeMax} participants.`,
        variant: "destructive",
      });
      return;
    }

    // Call the booking logic from the hook
    const result = await createAndAddActiviteReservation(activite, {
      date: activityForm.date,
      participants: activityForm.participants,
    });

    if (result.success) {
      // You can add additional logic here if needed after successful booking
      console.log("Activity successfully booked via hook:", result.data);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "facile":
        return "bg-forest-100 text-forest-800 border-forest-200";
      case "modéré":
        return "bg-sunset-100 text-sunset-800 border-sunset-200";
      case "difficile":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreateActivity = async (data: any) => {
    setCreateLoading(true);
    try {
      console.log("Creating activity with data:", data);
      const response = await activiteService.createActivite(data);
      if (response.success && response.data) {
        // After creating the activity in the backend, we now want to add it to the current booking.
        // We can use the same hook function for this.
        // Note: The 'date' for a newly created activity might need to be selected by the user,
        // or you can use the current date/default date from activityForm.
        const defaultDate = activityForm.date || formatDate(new Date()); // Using a default if not set
        const defaultParticipants = activityForm.participants || 1;


        const result = await createAndAddActiviteReservation(
          response.data, // Pass the newly created activity data
          {
            date: defaultDate,
            participants: defaultParticipants,
          },
        );

        if (result.success) {
          setIsCreateDialogOpen(false);
          await fetchActivities(); // Refresh available activities list

          toast({
            title: "Activité créée et ajoutée",
            description: "L'activité a été créée et ajoutée à votre réservation.",
          });
        } else {
          // Error already toasted by createAndAddActiviteReservation
        }
      } else {
        toast({
          title: "Erreur",
          description: response.error || "Erreur lors de la création de l'activité.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'activité.",
        variant: "destructive",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRemoveActivite = useCallback(
    async (activiteId: string, reservationIdToDelete: string) => {
      try {
        const reservationId = reservationIdToDelete; // Use the direct reservationId
        const response = await reservationService.deleteReservation(
          reservationId,
        );
        if (response.success) {
          removeActivity(activiteId);
          toast({
            title: "Réservation supprimée",
            description: "Le Activité a été supprimé avec succès.",
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
          description: "Une erreur est survenue lors de la suppression de l'activité'.",
          variant: "destructive",
        });
      }
    },
    [removeActivity],);

  // Utility to format date (copied from useActiviteBooking for consistency)
  const formatDate = (date: Date): string => date.toISOString().split("T")[0];

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setCategoryFilter("Tous");
    setLocationFilter("Tous");
    setDifficultyFilter("Tous");
    setGuideFilter("Tous");
    setFavoriteFilter(false);
  }, []);

  // Ensure the filtering logic matches the fetched data structure
  const filteredActivities = availableActivities
    .filter((activite) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        activite.name?.toLowerCase().includes(searchLower) ||
        activite.description?.toLowerCase().includes(searchLower) ||
        activite.location?.toLowerCase().includes(searchLower) ||
        activite.category?.toLowerCase().includes(searchLower);

      const matchesCategory =
        categoryFilter === "Tous" || activite.category === categoryFilter;

      const matchesLocation =
        locationFilter === "Tous" || activite.location === locationFilter;

      const matchesDifficulty =
        difficultyFilter === "Tous" || activite.difficulty === difficultyFilter;

      const matchesGuide =
        guideFilter === "Tous" ||
        (guideFilter === "Avec guide" && activite.guideRequired) ||
        (guideFilter === "Sans guide" && !activite.guideRequired);

      const matchesFavorite = !favoriteFilter || activite.favorite;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation &&
        matchesDifficulty &&
        matchesGuide &&
        matchesFavorite
      );
    })
    .sort((a, b) => b.rating - a.rating);

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
        <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-2 text-lg font-medium text-foreground">
          Client requis
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Veuillez sélectionner un client avant de choisir les activités
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Activity Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Détails de l'activité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activityDate">Date de l'activité</Label>
              <Input
                id="activityDate"
                type="date"
                value={activityForm.date}
                onChange={(e) =>
                  setActivityForm({ ...activityForm, date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="participants">Nombre de participants</Label>
              <Select
                value={activityForm.participants.toString()}
                onValueChange={(value) =>
                  setActivityForm({
                    ...activityForm,
                    participants: parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 participant</SelectItem>
                  <SelectItem value="2">2 participants</SelectItem>
                  <SelectItem value="3">3 participants</SelectItem>
                  <SelectItem value="4">4 participants</SelectItem>
                  <SelectItem value="5">5 participants</SelectItem>
                  <SelectItem value="6">6 participants</SelectItem>
                  <SelectItem value="7">7 participants</SelectItem>
                  <SelectItem value="8">8 participants</SelectItem>
                  <SelectItem value="10">10 participants</SelectItem>
                  <SelectItem value="12">12 participants</SelectItem>
                  <SelectItem value="15">15 participants</SelectItem>
                  <SelectItem value="20">20 participants</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Activities */}
      {state.activities.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-foreground mb-4">
            Activités sélectionnées
          </h3>
          <div className="space-y-3">
            {state.activities.map((activity) => {
              {/* Changed state.activities to state.activites */ }
              // Find the original activite details from availableActivities
              const activiteDetails = availableActivities.find(
                (a) => a.idActivite === activity.id.split('-')[0] // Assuming the ID format is "idActivite-timestamp"
              );
              if (!activiteDetails) return null;

              return (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-forest-500 to-madagascar-500 flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">
                            {activiteDetails.name} {/* Use activiteDetails.name */}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(activity.date).toLocaleDateString("fr-FR")} {/* Ensure date is formatted correctly */}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {activity.participants} participant(s)
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {activiteDetails.duration} {/* Use activiteDetails.duration */}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-foreground">
                          {formatCurrency(activity.price)} Ar
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveActivite(activity.id, activity.reservationId)}
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
                categoryFilter !== "Tous" ||
                locationFilter !== "Tous" ||
                difficultyFilter !== "Tous" ||
                guideFilter !== "Tous" ||
                favoriteFilter) && (
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
                placeholder="Rechercher une activité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
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
              value={difficultyFilter}
              onValueChange={setDifficultyFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Difficulté" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((difficulty) => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={guideFilter} onValueChange={setGuideFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Guide" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tous">Tous</SelectItem>
                      <SelectItem value="Avec guide">Avec guide</SelectItem>
                      <SelectItem value="Sans guide">Sans guide</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="favorites"
                      checked={favoriteFilter}
                      onChange={(e) => setFavoriteFilter(e.target.checked)}
                      className="w-4 h-4 text-forest-600 bg-gray-100 border-gray-300 rounded focus:ring-forest-500"
                    />
                    <Label htmlFor="favorites" className="text-sm">
                      Favoris seulement
                    </Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="font-semibold text-lg">
                      {filteredActivities.length}
                    </div>
                    <div className="text-muted-foreground">Résultats</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="font-semibold text-lg">
                      {filteredActivities.length > 0
                        ? Math.round(
                          (filteredActivities.reduce(
                            (acc, a) => acc + a.rating,
                            0,
                          ) /
                            filteredActivities.length) *
                          10,
                        ) / 10
                        : 0}
                    </div>
                    <div className="text-muted-foreground">Note moy.</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="font-semibold text-lg">
                      {filteredActivities.filter((a) => a.favorite).length}
                    </div>
                    <div className="text-muted-foreground">Favoris</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="font-semibold text-lg">
                      {filteredActivities.filter((a) => a.guideRequired).length}
                    </div>
                    <div className="text-muted-foreground">Avec guide</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Activities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-foreground">
            Activités disponibles ({filteredActivities.length})
          </h3>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4" />
                Créer une activité
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <ActiviteForm onSubmit={handleCreateActivity} loading={createLoading} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4 pr-2" style={{
          maxHeight: displayAllActivity ? "none" : "600px", // Show all or limit height
          overflowY: displayAllActivity ? "visible" : "auto", // Enable scroll if not showing all
        }}>
          {filteredActivities.map((activite) => {
            const totalPrice = calculateDisplayPrice(
              activite,
              activityForm.participants,
            );

            return (
              <Card
                key={activite.idActivite}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-forest-500 to-madagascar-500 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-foreground">
                            {activite.name}
                          </h4>
                          <Badge variant="outline">{activite.category}</Badge>
                          <Badge
                            className={`text-xs ${getDifficultyColor(
                              activite.difficulty,
                            )}`}
                          >
                            {activite.difficulty}
                          </Badge>
                          {activite.favorite && (
                            <Heart className="w-4 h-4 text-red-500 fill-current" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>{activite.location}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>{activite.duration}</span>
                          <span>•</span>
                          <Users className="w-3 h-3" />
                          <span>
                            {activite.groupSizeMin}-{activite.groupSizeMax}{" "}
                            personnes
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {activite.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <Star className="w-3 h-3 text-sunset-500" />
                          <span className="text-muted-foreground">
                            {activite.rating} ({activite.reviews} avis)
                          </span>
                          {activite.guideRequired && (
                            <>
                              <span>•</span>
                              <span className="text-muted-foreground">
                                Guide requis
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">
                        {formatCurrency(activite.priceAdult)} Ar/personne
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {formatCurrency(totalPrice)} Ar
                      </div>
                      <div className="text-xs text-muted-foreground">
                        pour {activityForm.participants} participant(s)
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium text-foreground mb-2">
                      Inclus:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {activite.includes.map((item) => (
                        <Badge
                          key={item}
                          variant="secondary"
                          className="text-xs"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {activite.guideRequired && activite.guideName && (
                    <div className="bg-muted/50 rounded-lg p-3 mb-4">
                      <div className="text-sm font-medium text-foreground mb-1">
                        Guide inclus
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {activite.guideName}
                        {activite.guidePhone && ` • ${activite.guidePhone}`}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => handleAddActiviteToBooking(activite)}
                    disabled={
                      !activityForm.date ||
                      activityForm.participants < activite.groupSizeMin ||
                      activityForm.participants > activite.groupSizeMax
                    }
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {!activityForm.date
                      ? "Sélectionner une date"
                      : activityForm.participants < activite.groupSizeMin ||
                        activityForm.participants > activite.groupSizeMax
                        ? `Groupe de ${activite.groupSizeMin}-${activite.groupSizeMax} personnes requis`
                        : `Ajouter (${formatCurrency(totalPrice)} Ar)`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {filteredActivities.length > 3 && (
          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={() => setDisplayAllActivity(!displayAllActivity)}
            >
              {displayAllActivity ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Afficher moins
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Afficher plus ({filteredActivities.length - 3} de plus)
                </>
              )}
            </Button>
          </div>
        )}


        {filteredActivities.length === 0 && availableActivities.length > 0 && (
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-2 text-sm font-medium text-foreground">
              Aucune activité trouvée
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
      </div>

      {state.activities.length === 0 && (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-2 text-sm font-medium text-foreground">
            Aucune activité sélectionnée
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajoutez une activité pour continuer
          </p>
        </div>
      )}
    </div>
  );
}