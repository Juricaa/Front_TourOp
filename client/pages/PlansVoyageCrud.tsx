import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MapPin,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  Clock,
  Star,
  Route,
  Globe,
  Download,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { travelPlanService } from "@/services/travelPlanService";
import { reservationService } from "@/services/reservationService";
import type {
  TravelPlan as SharedTravelPlan,
  ApiResponse,
  Reservation,
} from "@shared/types";

// Use the shared TravelPlan type
type TravelPlan = SharedTravelPlan;

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  proposal: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  active: "bg-purple-100 text-purple-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels = {
  draft: "Brouillon",
  proposal: "Proposition",
  confirmed: "Confirmé",
  active: "En cours",
  completed: "Terminé",
  cancelled: "Annulé",
};

const travelStyleIcons = {
  budget: "💰",
  comfort: "🛏️",
  luxury: "✨",
  adventure: "🏔️",
  cultural: "🏛️",
};

const difficultyColors = {
  easy: "bg-green-100 text-green-800",
  moderate: "bg-yellow-100 text-yellow-800",
  challenging: "bg-red-100 text-red-800",
};

const currencySymbols = {
  EUR: "€",
  USD: "$",
  Ar: "Ar",
};

export default function PlansVoyageCrud() {
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterStyle, setFilterStyle] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TravelPlan | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
    destination: "",
    startDate: "",
    endDate: "",
    participants: 2,
    travelStyle: "comfort" as
      | "budget"
      | "comfort"
      | "luxury"
      | "adventure"
      | "cultural",
    pricePerPerson: 0,
    currency: "EUR" as "Ar" | "EUR" | "USD",
    difficulty: "easy" as "easy" | "moderate" | "challenging",
    category: "",
    notes: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<TravelPlan[]> =
        await travelPlanService.getTravelPlans();

      if (response.success && response.data) {
        // Convert dates from strings to Date objects
        const plansWithDates = response.data.map((plan) => ({
          ...plan,
          startDate: new Date(plan.startDate),
          endDate: new Date(plan.endDate),
          createdAt: plan.createdAt ? new Date(plan.createdAt) : new Date(),
          updatedAt: plan.updatedAt ? new Date(plan.updatedAt) : undefined,
          // Process days array if it exists
          days:
            plan.days?.map((day) => ({
              ...day,
              date: new Date(day.date),
            })) || [],
        }));
        setPlans(plansWithDates);
      } else {
        // Fallback to some mock data if API fails
        console.warn("Aucun plan trouvé ou erreur API:", response.error);
        const mockPlans: TravelPlan[] = [
          {
            id: "PLAN001",
            planNumber: "PLAN-2024-001",
            title: "Circuit Découverte Madagascar - 7 jours",
            clientId: "C001",
            clientName: "Jean Dupont",
            reservationId: "RES001",
            destination: "Madagascar - Antananarivo et Andasibe",
            startDate: new Date("2024-03-15"),
            endDate: new Date("2024-03-22"),
            duration: 7,
            participants: 2,
            travelStyle: "comfort",
            pricePerPerson: 1680,
            totalPrice: 3360,
            currency: "EUR",
            status: "proposal",
            difficulty: "easy",
            category: "Circuit découverte",
            tags: ["Nature", "Culture", "Famille"],
            notes: "Circuit parfait pour une première découverte de Madagascar",
            rating: 4.8,
            days: [],
            includes: ["Hébergement", "Transport", "Guide"],
            excludes: ["Vols internationaux", "Repas non mentionnés"],
            bestSeason: ["Avril-Novembre"],
            groupSize: { min: 1, max: 8 },
            template: false,
            createdAt: new Date(),
          },
        ];
        setPlans(mockPlans);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des plans:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les plans de voyage",
        variant: "destructive",
      });
      // Fallback to empty array
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.destination.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || plan.status === filterStatus;
    const matchesStyle =
      filterStyle === "all" || plan.travelStyle === filterStyle;

    return matchesSearch && matchesStatus && matchesStyle;
  });

  const openDialog = (plan?: TravelPlan) => {
    if (plan) {
      setSelectedPlan(plan);
      setFormData({
        title: plan.title,
        clientName: plan.clientName,
        destination: plan.destination,
        startDate: plan.startDate.toISOString().split("T")[0],
        endDate: plan.endDate.toISOString().split("T")[0],
        participants: plan.participants,
        travelStyle: plan.travelStyle,
        pricePerPerson: plan.pricePerPerson,
        currency: plan.currency,
        difficulty: plan.difficulty,
        category: plan.category,
        notes: plan.notes || "",
      });
    } else {
      setSelectedPlan(null);
      setFormData({
        title: "",
        clientName: "",
        destination: "",
        startDate: "",
        endDate: "",
        participants: 2,
        travelStyle: "comfort",
        pricePerPerson: 0,
        currency: "EUR",
        difficulty: "easy",
        category: "",
        notes: "",
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const duration = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      const planData: Partial<TravelPlan> = {
        title: formData.title,  
        clientName: formData.clientName,
        clientId: "manual", // For manually created plans
        destination: formData.destination,
        startDate,
        endDate,
        duration,
        participants: formData.participants,
        travelStyle: formData.travelStyle,
        pricePerPerson: formData.pricePerPerson,
        totalPrice: formData.pricePerPerson * formData.participants,
        currency: formData.currency,
        status: selectedPlan?.status || "draft",
        difficulty: formData.difficulty,
        category: formData.category,
        tags: selectedPlan?.tags || [],
        notes: formData.notes,
        days: selectedPlan?.days || [],
        includes: selectedPlan?.includes || [],
        excludes: selectedPlan?.excludes || [],
        bestSeason: selectedPlan?.bestSeason || ["Toute l'année"],
        groupSize: selectedPlan?.groupSize || {
          min: 1,
          max: formData.participants,
        },
        template: false,
      };

      let response: ApiResponse<TravelPlan>;

      if (selectedPlan) {
        // Update existing plan
        response = await travelPlanService.updateTravelPlan(
          selectedPlan.id,
          planData,
        );
      } else {
        // Create new plan
        response = await travelPlanService.createTravelPlan(planData);
      }

      if (response.success) {
        toast({
          title: "Succès",
          description: selectedPlan
            ? "Plan de voyage modifié avec succès"
            : "Plan de voyage créé avec succès",
        });
        setShowDialog(false);
        // Reload plans to get updated data
        await loadPlans();
      } else {
        throw new Error(response.error || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: `Impossible de sauvegarder le plan de voyage: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await travelPlanService.deleteTravelPlan(id);
      if (response.success) {
        toast({
          title: "Succès",
          description: "Plan de voyage supprimé avec succès",
        });
        // Reload plans to get updated data
        await loadPlans();
      } else {
        throw new Error(response.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: `Impossible de supprimer le plan de voyage: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currencySymbols[currency as keyof typeof currencySymbols]}${amount.toLocaleString()}`;
  };

  // Function to update reservation status from "en_attente" to "confirmé"
  const updateReservationStatus = async (reservationId: string) => {
    try {
      // First, get the current reservation to check its status
      const reservationResponse = await reservationService.getReservation(reservationId);
      
      if (reservationResponse.success && reservationResponse.data) {
        // Update reservation status from "en_attente" to "confirmed"
        const updatedReservation: Partial<Reservation> = {
          status: "confirmed",
        };

        const response = await reservationService.updateReservation(
          reservationId,
          updatedReservation
        );

        if (response.success) {
          toast({
            title: "Succès",
            description: "Réservation confirmée avec succès",
          });
          // Reload plans to get updated data
          await loadPlans();
        } else {
          throw new Error(response.error || "Erreur lors de la confirmation");
        }
      } else {
        // If reservation doesn't exist, we might need to create it
        toast({
          title: "Erreur",
          description: "Réservation non trouvée",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la confirmation de la réservation:", error);
      toast({
        title: "Erreur",
        description: `Impossible de confirmer la réservation: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Route className="w-8 h-8 text-green-600" />
            Plans de Voyage
          </h1>
          <p className="text-muted-foreground">
            Création et gestion des itinéraires personnalisés
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-700 border-green-200">
            {filteredPlans.length} plans
          </Badge>
          <Badge className="bg-purple-100 text-purple-800">
            {plans.filter((p) => p.status === "active").length} en cours
          </Badge>
        </div>
      </div>

      {/* Actions */}
      <Card className="border-green-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recherche et Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="proposal">Proposition</SelectItem>
                <SelectItem value="confirmed">Confirmé</SelectItem>
                <SelectItem value="active">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStyle} onValueChange={setFilterStyle}>
              <SelectTrigger>
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les styles</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="comfort">Confort</SelectItem>
                <SelectItem value="luxury">Luxe</SelectItem>
                <SelectItem value="adventure">Aventure</SelectItem>
                <SelectItem value="cultural">Culturel</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => openDialog()}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Plan
            </Button>

            <Button variant="outline" className="border-green-200">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Plans ({filteredPlans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{plan.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {plan.planNumber}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{plan.clientName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {plan.destination}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{plan.startDate.toLocaleDateString()}</div>
                      <div className="text-muted-foreground">
                        {plan.duration} jours
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {plan.participants}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {formatCurrency(plan.totalPrice, plan.currency)}
                      </div>
                      <div className="text-muted-foreground">
                        {formatCurrency(plan.pricePerPerson, plan.currency)}
                        /pers
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[plan.status]}>
                      {statusLabels[plan.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/plans-voyage/${plan.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      {plan.reservationId && plan.status === "proposal" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateReservationStatus(plan.reservationId!)}
                          className="text-green-600"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(plan)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(plan.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? "Modifier le plan" : "Nouveau plan de voyage"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du plan *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientName">Nom du client *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      destination: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="Circuit découverte, Safari, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="participants">Participants</Label>
                <Input
                  id="participants"
                  type="number"
                  min="1"
                  value={formData.participants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      participants: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="travelStyle">Style de voyage</Label>
                <Select
                  value={formData.travelStyle}
                  onValueChange={(
                    value:
                      | "budget"
                      | "comfort"
                      | "luxury"
                      | "adventure"
                      | "cultural",
                  ) => setFormData({ ...formData, travelStyle: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">💰 Budget</SelectItem>
                    <SelectItem value="comfort">🛏️ Confort</SelectItem>
                    <SelectItem value="luxury">✨ Luxe</SelectItem>
                    <SelectItem value="adventure">🏔️ Aventure</SelectItem>
                    <SelectItem value="cultural">🏛️ Culturel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerPerson">Prix par personne</Label>
                <Input
                  id="pricePerPerson"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pricePerPerson}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricePerPerson: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value: "Ar" | "EUR" | "USD") =>
                    setFormData({ ...formData, currency: value })
                  }
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
                <Label htmlFor="difficulty">Difficulté</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: "easy" | "moderate" | "challenging") =>
                    setFormData({ ...formData, difficulty: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Facile</SelectItem>
                    <SelectItem value="moderate">Modéré</SelectItem>
                    <SelectItem value="challenging">Difficile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                placeholder="Notes additionnelles sur le voyage..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Annuler
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {selectedPlan ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Plan Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aperçu du plan de voyage</DialogTitle>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4">
              {/* Header */}
              <div className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-green-600">
                      {selectedPlan.title}
                    </h1>
                    <p className="text-lg text-gray-600 mt-1">
                      {selectedPlan.destination}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={statusColors[selectedPlan.status]}>
                        {statusLabels[selectedPlan.status]}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-green-200 text-green-700"
                      >
                        {travelStyleIcons[selectedPlan.travelStyle]}{" "}
                        {selectedPlan.travelStyle}
                      </Badge>
                      <Badge
                        className={difficultyColors[selectedPlan.difficulty]}
                      >
                        {selectedPlan.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        selectedPlan.totalPrice,
                        selectedPlan.currency,
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(
                        selectedPlan.pricePerPerson,
                        selectedPlan.currency,
                      )}{" "}
                      par personne
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Calendar className="w-6 h-6 mx-auto text-green-600 mb-1" />
                  <div className="font-semibold text-sm">
                    {selectedPlan.startDate.toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-600">Départ</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Clock className="w-6 h-6 mx-auto text-green-600 mb-1" />
                  <div className="font-semibold text-sm">
                    {selectedPlan.duration} jours
                  </div>
                  <div className="text-xs text-gray-600">Durée</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Users className="w-6 h-6 mx-auto text-green-600 mb-1" />
                  <div className="font-semibold text-sm">
                    {selectedPlan.participants}
                  </div>
                  <div className="text-xs text-gray-600">Voyageurs</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Star className="w-6 h-6 mx-auto text-green-600 mb-1" />
                  <div className="font-semibold text-sm">
                    {selectedPlan.rating || "N/A"}
                  </div>
                  <div className="text-xs text-gray-600">Note</div>
                </div>
              </div>

              {/* Notes */}
              {selectedPlan.notes && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <h3 className="font-semibold text-yellow-600 mb-1">
                    Notes importantes
                  </h3>
                  <p className="text-sm text-gray-600">{selectedPlan.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Fermer
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
