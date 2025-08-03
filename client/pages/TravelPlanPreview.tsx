import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Download,
  Printer,
  Send,
  MapPin,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  Building,
  Car,
  Utensils,
} from "lucide-react";
import { Link } from "react-router-dom";
import { usePreview } from "@/contexts/PreviewContext";

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

export default function TravelPlanPreview() {
  const { previewData, hasTravelPlanPreview } = usePreview();

  const downloadPlan = () => {
    if (!previewData.travelPlan) return;

    const plan = previewData.travelPlan;
    const planContent = `
PLAN DE VOYAGE DÉTAILLÉ - TOUROP MADAGASCAR
==========================================

INFORMATIONS GÉNÉRALES:
Client: ${plan.clientName}
Titre: ${plan.title}
Destination: ${plan.destination}
Période: ${plan.startDate.toLocaleDateString("fr-FR")} - ${plan.endDate.toLocaleDateString("fr-FR")}
Durée: ${plan.duration} jour(s)
Participants: ${plan.participants} personne(s)
Style: ${plan.travelStyle}
Difficulté: ${difficultyLabels[plan.difficulty]}

PROGRAMME JOUR PAR JOUR:
${plan.days
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
${plan.includes.map((item) => `✓ ${item}`).join("\n")}

SERVICES NON INCLUS:
${plan.excludes.map((item) => `✗ ${item}`).join("\n")}

📝 NOTES SPÉCIALES:
${plan.notes || "Aucune note particulière"}

MEILLEURE SAISON:
${plan.bestSeason.join(", ")}

Bon voyage avec TourOp Madagascar !
==========================================
    `;

    const blob = new Blob([planContent], {
      type: "text/plain; charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plan-voyage-${plan.clientName?.replace(/\s+/g, "-")}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printPlan = () => {
    if (!previewData.travelPlan) return;

    const plan = previewData.travelPlan;
    const printContent = `
      <html>
        <head>
          <title>Plan de Voyage - ${plan.clientName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            h1 { color: #2563eb; border-bottom: 2px solid #2563eb; }
            h2 { color: #059669; margin-top: 30px; }
            .day { margin: 20px 0; padding: 15px; border-left: 4px solid #10b981; background: #f0fdf4; }
            .activity { margin: 10px 0; padding: 8px; background: white; border-radius: 4px; }
            .service { display: inline-block; margin: 5px; padding: 5px 10px; background: #dbeafe; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h1>${plan.title}</h1>
          <p><strong>Client:</strong> ${plan.clientName}</p>
          <p><strong>Destination:</strong> ${plan.destination}</p>
          <p><strong>Période:</strong> ${plan.startDate.toLocaleDateString("fr-FR")} - ${plan.endDate.toLocaleDateString("fr-FR")}</p>
          
          <h2>Programme jour par jour</h2>
          ${plan.days
            .map(
              (day) => `
            <div class="day">
              <h3>Jour ${day.day} - ${day.date.toLocaleDateString("fr-FR")}</h3>
              <h4>${day.title}</h4>
              <p>${day.description}</p>
              ${day.activities
                .map(
                  (activity) => `
                <div class="activity">
                  <strong>${activity.time}:</strong> ${activity.activity}<br>
                  <em>${activity.description} (${activity.duration})</em>
                </div>
              `,
                )
                .join("")}
            </div>
          `,
            )
            .join("")}
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!hasTravelPlanPreview || !previewData.travelPlan) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>
            Aucun aperçu de plan de voyage disponible. Veuillez d'abord générer
            un aperçu depuis une réservation en cours.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link to="/reservations/new">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Créer une réservation
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const plan = previewData.travelPlan;
  const currencySymbols = { EUR: "€", USD: "$", Ar: "Ar" };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Aperçu du Plan de Voyage
          </h1>
          <p className="text-muted-foreground">
            {plan.title} - {plan.clientName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={printPlan}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
          <Button variant="outline" onClick={downloadPlan}>
            <Download className="mr-2 h-4 w-4" />
            Télécharger 
          </Button> 
          <Button>
            <Send className="mr-2 h-4 w-4" />
            Envoyer
          </Button>
        </div>
      </div>

      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-green-600">
                {plan.destination}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-blue-100 text-blue-800">Aperçu</Badge>
                <Badge className={difficultyColors[plan.difficulty]}>
                  {difficultyLabels[plan.difficulty]}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {currencySymbols[plan.currency as keyof typeof currencySymbols]}
                {plan.totalPrice.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {currencySymbols[plan.currency as keyof typeof currencySymbols]}
                {plan.pricePerPerson.toLocaleString()} par personne
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Calendar className="w-6 h-6 mx-auto text-green-600 mb-1" />
              <div className="font-semibold text-sm">
                {plan.startDate.toLocaleDateString("fr-FR")}
              </div>
              <div className="text-xs text-muted-foreground">Départ</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Clock className="w-6 h-6 mx-auto text-green-600 mb-1" />
              <div className="font-semibold text-sm">{plan.duration} jours</div>
              <div className="text-xs text-muted-foreground">Durée</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Users className="w-6 h-6 mx-auto text-green-600 mb-1" />
              <div className="font-semibold text-sm">{plan.participants}</div>
              <div className="text-xs text-muted-foreground">Voyageurs</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <MapPin className="w-6 h-6 mx-auto text-green-600 mb-1" />
              <div className="font-semibold text-sm">{plan.travelStyle}</div>
              <div className="text-xs text-muted-foreground">Style</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Program Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Programme Jour par Jour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plan.days.slice(0, 3).map((day) => (
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

                <div className="space-y-2">
                  {day.activities.slice(0, 2).map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-2 bg-gray-50 rounded text-sm"
                    >
                      <div className="font-medium text-green-600 min-w-0 flex-shrink-0">
                        {activity.time}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{activity.activity}</div>
                        <div className="text-muted-foreground">
                          {activity.description}
                        </div>
                      </div>
                      {activity.included && (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                  {day.activities.length > 2 && (
                    <div className="text-sm text-muted-foreground text-center">
                      ... et {day.activities.length - 2} autres activités
                    </div>
                  )}
                </div>
              </div>
            ))}
            {plan.days.length > 3 && (
              <div className="text-center py-4">
                <Badge variant="outline">
                  ... et {plan.days.length - 3} autres jours
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Services Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Services inclus</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.includes.map((item, index) => (
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
              {plan.excludes.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-red-600 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link to="/reservations/new">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la réservation
          </Link>
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/plans-voyage">Voir tous les plans</Link>
          </Button>
          <Button onClick={downloadPlan}>
            <Download className="mr-2 h-4 w-4" />
            Télécharger Plan
          </Button>
        </div>
      </div>
    </div>
  );
}
