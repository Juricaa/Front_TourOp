import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  Send,
  CheckCircle,
  Users,
  Plane,
  Building,
  Car,
  MapPin,
  Calendar,
  CreditCard,
  Printer,
  Mail,
} from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { usePreview } from "@/contexts/PreviewContext";
import { useNavigate, useLocation } from "react-router-dom";
import { TravelPlanGenerator } from "./TravelPlanGenerator";
import type { Reservation, TravelPlan, ApiResponse } from "@shared/types";
import { reservationService } from "@/services/reservationService";
import { travelPlanService } from "@/services/travelPlanService";
import { clientService } from "@/services/clientService";
import { factureService } from "@/services/factureService";
import { toast } from "@/hooks/use-toast";

export default function SummaryStep() {
  const { state, setNotes, resetBooking, formatCurrency } = useBooking();
  const { setInvoicePreview, setTravelPlanPreview, setBookingData } =
    usePreview();
  const [loading, setLoading] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const formatDate = (date: Date | string): string => {
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    if (isNaN(parsedDate.getTime())) throw new Error("Date invalide");
    return parsedDate.toISOString().split("T")[0];
  };
  // Check if we're in edit mode
  const isEditMode =
    new URLSearchParams(location.search).get("mode") === "edit";

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      // 1. Créer ou obtenir l'ID client
      let clientId = state.client?.id;
      if (!clientId) {
        // Créer le client d'abord
        const clientData = await clientService.createClient({
          name: state.client?.name || "",
          email: state.client?.email || "",
          phone: state.client?.phone || "",
          nationality: state.client?.nationality || "",
          address: state.client?.address || "",
          nbpersonnes: state.client?.nbpersonnes || 1,
          notes: state.client?.notes,
          destinations: ["Madagascar"],
        });

        if (clientData.success && clientData.data) {
          clientId = clientData.data.idClient;
        } else {
          throw new Error(
            clientData.error || "Erreur lors de la création du client",
          );
        }
      }

      // 2. Créer la réservation sous form facture
      const reservationData: Partial<Reservation> = {
        clientId: clientId!,
        status: "en_attente",
        totalPrice: state.totalPrice.toString(),
        destination: state.client.destination,
        dateCreated: formatDate(new Date()),
        dateTravel: formatDate(state.client.dateTravel),
        dateReturn: formatDate(state.client.dateReturn),
        
        // Convertir les données booking vers le format Reservation
        
      };

      console.log("data envoyer:", reservationData)
      const reservationResult =   await factureService.createFacture(reservationData);
      console.log("Reservation result:", reservationResult);

      if (!reservationResult.success || !reservationResult.data) {
        throw new Error(
          reservationResult.error ||
            "Erreur lors de la création de la réservation",
        );
      }

      // 3. Générer et sauvegarder le plan de voyage
      // const travelPlan = TravelPlanGenerator.generateFromBooking(state);
      // travelPlan.reservationId = reservationResult.data.id;
      // travelPlan.clientId = clientId!;

      // const travelPlanResult =
      //   await travelPlanService.createTravelPlan(travelPlan);

        
      // if (!travelPlanResult.success) {
      //   console.warn(
      //     "Erreur lors de la création du plan de voyage:",
      //     travelPlanResult.error,
      //   );
      // }

      setBookingConfirmed(true);
      toast({
        title: "Réservation confirmée",
        description: "Votre réservation a été confirmée avec succès !",
      });
    } catch (error) {
      console.error("Error confirming booking:", error);
      alert(
        `Erreur lors de la confirmation: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      );
    } finally {
      setLoading(false);
    }
  };


  const handleNewBooking = () => {
    resetBooking();
    navigate("/reservations/new");
  };

  if (bookingConfirmed) {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-forest-100 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-forest-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Réservation Confirmée !
          </h2>
          <p className="text-muted-foreground">
            Votre réservation a été enregistrée avec succès.
          </p>
        </div>

      

        <div className="flex items-center justify-center gap-4">
          <Button onClick={() => navigate("/reservations")} variant="outline">
            Voir les Réservations
          </Button>
          <Button onClick={handleNewBooking}>Nouvelle Réservation</Button>
        </div>
      </div>
    );
  }

  if (!state.client) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-2 text-lg font-medium text-foreground">
          Informations manquantes
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Veuillez compléter les étapes précédentes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Client Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Informations Client
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-foreground">
                {state.client.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {state.client.email}
              </p>
              <p className="text-sm text-muted-foreground">
                {state.client.phone}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Nationalité:</span>{" "}
                {state.client.nationality}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Participants:</span>{" "}
                {state.client.nbpersonnes} personne(s)
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Période:</span>{" "}
                {state.travelDates.start.toLocaleDateString("fr-FR")} -{" "}
                {state.travelDates.end.toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Flights */}
        {state.flights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plane className="w-5 h-5" />
                Vols ({state.flights.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {state.flights.map((flight, index) => (
                <div
                  key={flight.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <Badge variant="outline" className="mb-1">
                      {flight.type === "outbound"
                        ? "Aller"
                        : flight.type === "return"
                          ? "Retour"
                          : "Domestique"}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {flight.passengers} passager(s), classe {flight.class}
                    </p>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(flight.price)} Ar
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Sous-total:</span>
                <span>{formatCurrency(state.subtotals.flights)} Ar</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accommodations */}
        {state.accommodations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="w-5 h-5" />
                Hébergements ({state.accommodations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {state.accommodations.map((acc, index) => (
                <div key={acc.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">
                      {acc.checkIn} ➡️ {acc.checkOut}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {acc.rooms} chambre(s), {acc.guests} personne(s),{" "}
                      {acc.nights} nuit(s)
                    </p>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(acc.price)} Ar
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Sous-total:</span>
                <span>{formatCurrency(state.subtotals.accommodations)} Ar</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vehicles */}
        {state.vehicles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="w-5 h-5" />
                Véhicules ({state.vehicles.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {state.vehicles.map((vehicle, index) => (
                <div
                  key={vehicle.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {vehicle.startDate} ➡️ {vehicle.endDate}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.pickupLocation} → {vehicle.dropoffLocation} (
            
            {vehicle.rentalDays} jour(s))
                    </p>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(vehicle.price)} Ar
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Sous-total:</span>
                <span>{formatCurrency(state.subtotals.vehicles)} Ar</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activities */}
        {state.activities.length > 0 && (
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5" />
                Activités ({state.activities.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {state.activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {activity.date}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.participants} participant(s)
                    </p>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(activity.price)} Ar
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Sous-total:</span>
                <span>{formatCurrency(state.subtotals.activities)} Ar</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Total and Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Total et Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-madagascar-50 to-ocean-50 border border-madagascar-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-foreground">
                TOTAL GÉNÉRAL
              </span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(state.totalPrice)} Ar
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes et instructions spéciales</Label>
            <Textarea
              id="notes"
              value={state.notes || ""}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajoutez des notes, préférences alimentaires, demandes spéciales..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        
        <Button
          onClick={handleConfirmBooking}
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            isEditMode ? (
              "Modification en cours..."
            ) : (
              "Confirmation en cours..."
            )
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              {isEditMode
                ? "Sauvegarder les Modifications"
                : "Confirmer la Réservation"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
