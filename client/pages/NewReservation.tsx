import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plane,
  Building,
  Car,
  MapPin,
  FileText,
  Check,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { BookingProvider, useBooking } from "@/contexts/BookingContext";
import { BOOKING_STEPS } from "@shared/booking";
import { useLocation } from "react-router-dom";

// Step Components (we'll create these)
import ClientStep from "@/components/booking/ClientStep";
import FlightsStep from "@/components/booking/FlightsStep";
import AccommodationStep from "@/components/booking/AccommodationStep";
import VehicleStep from "@/components/booking/VehicleStep";
import ActivitiesStep from "@/components/booking/ActivitiesStep";
import SummaryStep from "@/components/booking/SummaryStep";

const iconMap = {
  Users,
  Plane,
  Building,
  Car,
  MapPin,
  FileText,
};

const stepComponents = {
  ClientStep,
  FlightsStep,
  AccommodationStep,
  VehicleStep,
  ActivitiesStep,
  SummaryStep,
};

function BookingStepper() {
  try {
    const {
      state,
      nextStep,
      prevStep,
      goToStep,
      formatCurrency,
      loadReservation,
    } = useBooking();
    const location = useLocation();
    const [isEditMode, setIsEditMode] = useState(false);
    const [reservationId, setReservationId] = useState<string | null>(null);
    const [hasLoadedData, setHasLoadedData] = useState(false);

    // Early return if state is not available
    if (!state) {
      return (
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Chargement...</h1>
            <p className="text-muted-foreground">
              Initialisation de la réservation en cours...
            </p>
          </div>
        </div>
      );
    }

    // Defensive check for currentStep
    const currentStepIndex = Math.max(
      0,
      Math.min(BOOKING_STEPS.length - 1, (state?.currentStep || 1) - 1),
    );
    const currentStepConfig = BOOKING_STEPS[currentStepIndex];

    useEffect(() => {
      // Check if we're in edit mode
      const urlParams = new URLSearchParams(location.search);
      const mode = urlParams.get("mode");

      if (mode === "edit" && !hasLoadedData) {
        setIsEditMode(true);

        // Load reservation data from localStorage
        const editData = localStorage.getItem("editReservation");
        if (editData) {
          try {
            const reservationData = JSON.parse(editData);
            if (reservationData && typeof reservationData === "object") {
              setReservationId(reservationData.reservationId);
              loadReservation(reservationData);
              setHasLoadedData(true);

              // Clear the localStorage after loading
              localStorage.removeItem("editReservation");
            } else {
              console.error(
                "Invalid reservation data format:",
                reservationData,
              );
              // Clean up invalid data
              localStorage.removeItem("editReservation");
            }
          } catch (error) {
            console.error("Error loading reservation data:", error);
            // Clean up corrupted data
            localStorage.removeItem("editReservation");
          }
        }
      } else if (mode !== "edit") {
        // Reset if we're not in edit mode
        setIsEditMode(false);
        setReservationId(null);
        setHasLoadedData(false);
      }
    }, [location.search, loadReservation, hasLoadedData]); // loadReservation is now stable with useCallback

    const StepComponent =
      stepComponents[
        currentStepConfig?.component as keyof typeof stepComponents
      ];

      
    // Guard against invalid step component
    if (!StepComponent) {
      return (
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Erreur de configuration
            </h1>
            <p className="text-muted-foreground mb-4">
              Le composant pour l'étape courante n'est pas disponible.
            </p>
            <Button onClick={() => window.location.reload()}>
              Recharger la page
            </Button>
          </div>
        </div>
      );
    }

    const progress = ((state?.currentStep || 1) / BOOKING_STEPS.length) * 100;

    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isEditMode
              ? `Modifier la Réservation ${reservationId}`
              : "Nouvelle Réservation"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? "Modifiez les détails de cette réservation"
              : "Créez une réservation complète pour vos clients"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">
              Étape {state?.currentStep || 1} sur {BOOKING_STEPS.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% terminé
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="grid grid-cols-6 gap-2 mb-8">
          {BOOKING_STEPS.map((step, index) => {
            const Icon = iconMap[step.icon as keyof typeof iconMap];
            const isActive = (state?.currentStep || 1) === step.step;
            const isVisited = state?.visitedSteps?.has(step.step) || false;
            const isCompleted =
              (state?.currentStep || 1) > step.step && isVisited;
            const isAccessible =
              isVisited || step.step <= (state?.maxVisitedStep || 1) + 1;

            return (
              <button
                key={step.step}
                onClick={() => isAccessible && goToStep(step.step)}
                disabled={!isAccessible}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCompleted
                      ? "border-forest-500 bg-forest-50 text-forest-700"
                      : isAccessible
                        ? "border-muted hover:border-primary/50 bg-background text-foreground"
                        : "border-muted bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {isCompleted && (
                      <Check className="w-3 h-3 absolute -top-1 -right-1 text-forest-600" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">{step.title}</div>
                    <div className="text-xs opacity-70 hidden lg:block">
                      {step.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const Icon =
                      iconMap[currentStepConfig.icon as keyof typeof iconMap];
                    return <Icon className="w-5 h-5 text-primary" />;
                  })()}
                  {currentStepConfig.title}
                </CardTitle>
                <p className="text-muted-foreground">
                  {currentStepConfig.description}
                </p>
              </CardHeader>
              <CardContent>
                <StepComponent />
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={(state?.currentStep || 1) === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>

              <Button
                onClick={nextStep}
                disabled={(state?.currentStep || 1) === BOOKING_STEPS.length}
              >
                {(state?.currentStep || 1) === BOOKING_STEPS.length
                  ? "Terminer"
                  : "Suivant"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Client Info */}
                {state?.client && (
                  <div>
                    <h4 className="font-medium text-sm text-foreground mb-2">
                      Client
                    </h4>
                    <div className="text-sm text-muted-foreground">
                      <div>{state.client.name}</div>
                      <div>{state.client.nbpersonnes} personne(s)</div>
                    </div>
                  </div>
                )}

                {/* Travel Dates */}
                <div>
                  <h4 className="font-medium text-sm text-foreground mb-2">
                    Dates de voyage
                  </h4>
                  <div className="text-sm text-muted-foreground">
                    <div>
                      Du{" "}
                      {new Date(state.client?.dateTravel).toLocaleDateString('fr-FR') }
                    </div>
                    <div>
                      Au{" "}
                      {new Date(state.client?.dateReturn).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-foreground">
                    Détail des prix
                  </h4>

                  {(state?.subtotals?.flights || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Vols</span>
                      <span>{formatCurrency(state.subtotals.flights)} Ar</span>
                    </div>
                  )}

                  {(state?.subtotals?.accommodations || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Hébergement</span>
                      <span>
                        {formatCurrency(state.subtotals.accommodations)} Ar
                      </span>
                    </div>
                  )}

                  {(state?.subtotals?.vehicles || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Véhicules</span>
                      <span>{formatCurrency(state.subtotals.vehicles)} Ar</span>
                    </div>
                  )}

                  {(state?.subtotals?.activities || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Activités</span>
                      <span>
                        {formatCurrency(state.subtotals.activities)} Ar
                      </span>
                    </div>
                  )}

                  <div className="border-t pt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span className="text-primary">
                        {formatCurrency(state?.totalPrice || 0)} Ar
                      </span>
                    </div>
                  </div>
                </div>

                {/* Service Count */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-foreground">
                    Services sélectionnés
                  </h4>
                  {(state?.flights?.length || 0) > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {state.flights.length} vol(s)
                      </Badge>
                    </div>
                  )}
                  {(state?.accommodations?.length || 0) > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {state.accommodations.length} hébergement(s)
                      </Badge>
                    </div>
                  )}
                  {(state?.vehicles?.length || 0) > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {state.vehicles.length} véhicule(s)
                      </Badge>
                    </div>
                  )}
                  {(state?.activities?.length || 0) > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {state.activities.length} activité(s)
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in BookingStepper:", error);
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Erreur de chargement
          </h1>
          <p className="text-muted-foreground mb-4">
            Une erreur s'est produite lors du chargement de la page de
            réservation.
          </p>
          <Button onClick={() => window.location.reload()}>
            Recharger la page
          </Button>
        </div>
      </div>
    );
  }
}

export default function NewReservation() {
  return (
    <BookingProvider>
      <BookingStepper />
    </BookingProvider>
  );
}
