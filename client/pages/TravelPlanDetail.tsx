import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Edit,
  Download,
  MapPin,
  Calendar,
  Users,
  Clock,
  Star,
  CheckCircle,
  Plane,
  Car,
  Building,
  Utensils,
} from "lucide-react";
import type { TravelPlan, ApiResponse } from "@shared/types";
import { travelPlanService } from "@/services/travelPlanService";

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

const difficultyLabels = {
  easy: "Facile",
  moderate: "Modéré",
  challenging: "Difficile",
};

export default function TravelPlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [travelPlan, setTravelPlan] = useState<TravelPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTravelPlan(id);
    }
  }, [id]);

  const fetchTravelPlan = async (planId: string) => {
    try {
      const response: ApiResponse<TravelPlan> =
        await travelPlanService.getTravelPlan(planId);
      if (response.success && response.data) {
        // Convert dates from strings to Date objects
        const planWithDates = {
          ...response.data,
          startDate: new Date(response.data.startDate),
          endDate: new Date(response.data.endDate),
          createdAt: response.data.createdAt
            ? new Date(response.data.createdAt)
            : new Date(),
          updatedAt: response.data.updatedAt
            ? new Date(response.data.updatedAt)
            : undefined,
          days:
            response.data.days?.map((day) => ({
              ...day,
              date: new Date(day.date),
            })) || [],
        };
        setTravelPlan(planWithDates);
      } else {
        setError(response.error || "Plan de voyage non trouvé");
      }
    } catch (error) {
      console.error("Error fetching travel plan:", error);
      setError("Erreur réseau: Impossible de charger le plan de voyage");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols = { EUR: "€", USD: "$", Ar: "Ar" };
    return `${symbols[currency as keyof typeof symbols] || currency}${amount.toLocaleString()}`;
  };

  const downloadPlan = () => {
    if (!travelPlan) return;

    const planContent = `
PLAN DE VOYAGE DÉTAILLÉ - TOUROP MADAGASCAR
==========================================

INFORMATIONS GÉNÉRALES:
Client: ${travelPlan.clientName}
Titre: ${travelPlan.title}
Destination: ${travelPlan.destination}
Période: ${travelPlan.startDate.toLocaleDateString("fr-FR")} - ${travelPlan.endDate.toLocaleDateString("fr-FR")}
Durée: ${travelPlan.duration} jour(s)
Participants: ${travelPlan.participants} personne(s)
Style: ${travelPlan.travelStyle}
Difficulté: ${difficultyLabels[travelPlan.difficulty]}
Prix total: ${formatCurrency(travelPlan.totalPrice, travelPlan.currency)}
Prix par personne: ${formatCurrency(travelPlan.pricePerPerson, travelPlan.currency)}

PROGRAMME JOUR PAR JOUR:
${travelPlan.days
  .map(
    (day) => `
📅 JOUR ${day.day} - ${day.date.toLocaleDateString("fr-FR")}
${day.title}
${day.description}

Activités prévues:
${day.activities.map((activity) => `• ${activity.time}: ${activity.activity}\n  ${activity.description} (${activity.duration})`).join("\n")}

${day.accommodation ? `🏨 Hébergement: ${day.accommodation.name} (${day.accommodation.type})` : ""}
${day.transport ? `🚗 Transport: ${day.transport.description}` : ""}
${
  day.meals.breakfast || day.meals.lunch || day.meals.dinner
    ? `🍽️ Repas inclus: ${[day.meals.breakfast && "Petit-déjeuner", day.meals.lunch && "Déjeuner", day.meals.dinner && "Dîner"].filter(Boolean).join(", ")}`
    : ""
}
${day.notes ? `📝 Notes: ${day.notes}` : ""}
`,
  )
  .join("\n")}

SERVICES INCLUS:
${travelPlan.includes.map((item) => `✓ ${item}`).join("\n")}

SERVICES NON INCLUS:
${travelPlan.excludes.map((item) => `✗ ${item}`).join("\n")}

📝 NOTES SPÉCIALES:
${travelPlan.notes || "Aucune note particulière"}

MEILLEURE SAISON:
${travelPlan.bestSeason.join(", ")}

CONTACTS D'URGENCE:
TourOp Madagascar: +261 XX XX XXX XX
Email: contact@tourop-madagascar.mg

Bon voyage avec TourOp Madagascar !
==========================================
    `;

    const blob = new Blob([planContent], { type: "text/plain; charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plan-voyage-${travelPlan.clientName?.replace(/\s+/g, "-")}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !travelPlan) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error || "Plan de voyage non trouvé"}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link to="/plans-voyage">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux plans de voyage
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-6 w-6 text-green-600" />
            {travelPlan.title}
          </h1>
          <p className="text-muted-foreground">
            Plan de voyage pour {travelPlan.clientName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/plans-voyage">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/plans-voyage/${travelPlan.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
          <Button onClick={downloadPlan}>
            <Download className="mr-2 h-4 w-4" />
            Télécharger
          </Button>
        </div>
      </div>

      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-green-600">
                {travelPlan.destination}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={statusColors[travelPlan.status]}>
                  {statusLabels[travelPlan.status]}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-green-200 text-green-700"
                >
                  {travelStyleIcons[travelPlan.travelStyle]}{" "}
                  {travelPlan.travelStyle}
                </Badge>
                <Badge className={difficultyColors[travelPlan.difficulty]}>
                  {difficultyLabels[travelPlan.difficulty]}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(travelPlan.totalPrice, travelPlan.currency)}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatCurrency(travelPlan.pricePerPerson, travelPlan.currency)}{" "}
                par personne
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Calendar className="w-6 h-6 mx-auto text-green-600 mb-1" />
              <div className="font-semibold text-sm">
                {travelPlan.startDate.toLocaleDateString("fr-FR")}
              </div>
              <div className="text-xs text-muted-foreground">Départ</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Clock className="w-6 h-6 mx-auto text-green-600 mb-1" />
              <div className="font-semibold text-sm">
                {travelPlan.duration} jours
              </div>
              <div className="text-xs text-muted-foreground">Durée</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Users className="w-6 h-6 mx-auto text-green-600 mb-1" />
              <div className="font-semibold text-sm">
                {travelPlan.participants}
              </div>
              <div className="text-xs text-muted-foreground">Voyageurs</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Star className="w-6 h-6 mx-auto text-green-600 mb-1" />
              <div className="font-semibold text-sm">
                {travelPlan.rating || "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">Note</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Program */}
      <Card>
        <CardHeader>
          <CardTitle>Programme Jour par Jour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {travelPlan.days.map((day) => (
              <div key={day.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-green-600">
                      Jour {day.day} - {day.date.toLocaleDateString("fr-FR")}
                    </h3>
                    <h4 className="font-medium">{day.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {day.description}
                    </p>
                  </div>
                  <Badge variant="outline">{day.location}</Badge>
                </div>

                <div className="space-y-4">
                  {/* Activities */}
                  <div>
                    <h5 className="font-medium mb-2">Activités prévues</h5>
                    <div className="space-y-2">
                      {day.activities.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-2 bg-gray-50 rounded"
                        >
                          <div className="text-sm font-medium text-green-600 min-w-0 flex-shrink-0">
                            {activity.time}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">
                              {activity.activity}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {activity.description} ({activity.duration})
                            </div>
                          </div>
                          {activity.included && (
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Services for the day */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {day.accommodation && (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                        <Building className="h-4 w-4 text-blue-600" />
                        <div className="text-sm">
                          <div className="font-medium">
                            {day.accommodation.name}
                          </div>
                          <div className="text-muted-foreground">
                            {day.accommodation.type}
                          </div>
                        </div>
                      </div>
                    )}

                    {day.transport && (
                      <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                        <Car className="h-4 w-4 text-purple-600" />
                        <div className="text-sm">
                          <div className="font-medium">
                            {day.transport.type}
                          </div>
                          <div className="text-muted-foreground">
                            {day.transport.description}
                          </div>
                        </div>
                      </div>
                    )}

                    {(day.meals.breakfast ||
                      day.meals.lunch ||
                      day.meals.dinner) && (
                      <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                        <Utensils className="h-4 w-4 text-orange-600" />
                        <div className="text-sm">
                          <div className="font-medium">Repas inclus</div>
                          <div className="text-muted-foreground">
                            {[
                              day.meals.breakfast && "Petit-déj",
                              day.meals.lunch && "Déjeuner",
                              day.meals.dinner && "Dîner",
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {day.notes && (
                    <div className="p-2 bg-yellow-50 rounded border-l-4 border-yellow-200">
                      <div className="text-sm text-yellow-800">{day.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Includes/Excludes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Services inclus</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {travelPlan.includes.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Services non inclus</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {travelPlan.excludes.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-red-600 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations pratiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Meilleure saison:</span>
              <span className="ml-2 text-muted-foreground">
                {travelPlan.bestSeason.join(", ")}
              </span>
            </div>
            <div>
              <span className="font-medium">Taille du groupe:</span>
              <span className="ml-2 text-muted-foreground">
                {travelPlan.groupSize.min} - {travelPlan.groupSize.max}{" "}
                personnes
              </span>
            </div>
            <div>
              <span className="font-medium">Catégorie:</span>
              <span className="ml-2 text-muted-foreground">
                {travelPlan.category}
              </span>
            </div>
            {travelPlan.tags.length > 0 && (
              <div>
                <span className="font-medium">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {travelPlan.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {travelPlan.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes importantes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{travelPlan.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
