import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { reservationService } from "@/services/reservationService";
import { useBooking } from "@/contexts/BookingContext";
import type { Activite, Reservation } from "@shared/types";
import type { BookingActivity } from "@shared/booking"; // You'll need to define BookingActivite in @shared/booking

// Fonctions utilitaires (peuvent être importées d'un fichier utilitaire partagé si elles sont utilisées ailleurs)
const calculateActivitePrice = (activite: Activite, quantity: number): number => {
  return activite.priceAdult * quantity;
};

const formatDate = (date: Date): string => date.toISOString().split("T")[0];

/**
 * Hook personnalisé pour gérer l'ajout et la création de réservations d'activités.
 */
export const useActiviteBooking = () => {
  const { state, addActivity } = useBooking(); // You'll need to add addActivite to your BookingContext

  /**
   * Fonction interne pour créer une réservation d'activité.
   */
  const createAndAddActiviteReservation = useCallback(
    async (
      activite: Activite,
      bookingDetails: {
        date: string;
        participants: number;
      },
    ) => {
      if (!bookingDetails.date) {
        toast({
          title: "Date d'activité invalide",
          description: "Veuillez sélectionner une date pour l'activité.",
          variant: "destructive",
        });
        return { success: false, error: "Invalid activity date" };
      }

      if (bookingDetails.participants <= 0) {
        toast({
          title: "Nombre de participants invalide",
          description: "Le nombre de participants doit être supérieur à zéro.",
          variant: "destructive",
        });
        return { success: false, error: "Invalid number of participants" };
      }

      const price = calculateActivitePrice(activite, bookingDetails.participants);

      const reservationData = {
        id_client: state.client?.id || "",
        type: "activité",
        object_id: activite.idActivite,
        date_debut: formatDate(new Date(bookingDetails.date)),
        date_fin: formatDate(new Date(bookingDetails.date)), // For activities, start and end date can be the same
        montant: price,
        content_type: 3,  
        quantite: bookingDetails.participants,
      };

      try {
       
        const reservationResponse = await reservationService.createReservation(
          reservationData as unknown as Partial<Reservation>,
        );

        if (reservationResponse.success && reservationResponse.data) {
          console.log("RESERVATION RESPONSE  ato e:", reservationResponse.data);
            const bookingActivity: BookingActivity = {
            id: activite.idActivite, // ID unique pour le contexte de booking
            date: formatDate(new Date(bookingDetails.date)),
            participants: bookingDetails.participants,
            price,
            reservationId: reservationResponse.data.idReservation || "",
          };
          addActivity(bookingActivity);
          toast({
            title: "Réservation d'activité ajoutée",
            description: "L'activité a été réservée avec succès.",
          });
          return { success: true, data: bookingActivity };
        } else {
          console.error("RESERVATION ERROR :", reservationResponse.error);
          toast({
            title: "Erreur de réservation d'activité",
            description: reservationResponse.error || "Erreur lors de la réservation de l'activité.",
            variant: "destructive",
          });
          return { success: false, error: reservationResponse.error };
        }
      } catch (error) {
        console.error("Error creating activity reservation:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de l'ajout de la réservation d'activité.",
          variant: "destructive",
        });
        return { success: false, error: "Network or unexpected error" };
      }
    },
    [state.client, addActivity],
  );

  return { createAndAddActiviteReservation };
};