import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { reservationService } from "@/services/reservationService";
import { useBooking } from "@/contexts/BookingContext";
import type { Hebergement, Reservation } from "@shared/types";
import type { BookingAccommodation } from "@shared/booking";

// Fonctions utilitaires (peuvent être importées d'un fichier utilitaire partagé si elles sont utilisées ailleurs)
const calculateNights = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

const calculatePrice = (hebergement: Hebergement, nights: number): number => {
  const basePrice = hebergement.priceRange;
  return basePrice * nights;
};

const formatDate = (date: Date): string => date.toISOString().split("T")[0];

/**
 * Hook personnalisé pour gérer l'ajout et la création de réservations d'hébergement.
 */
export const useAccommodationBooking = () => {
  const { state, addAccommodation } = useBooking();

  /**
   * Fonction interne pour créer une réservation générique.
   * Cette fonction pourrait être rendue plus générique pour d'autres types de réservation.
   */
  const createAndAddReservation = useCallback(
    async (
      hebergement: Hebergement,
      bookingDetails: {
        checkIn: string;
        checkOut: string;
        rooms: number;
        guests: number;
      },
    ) => {
      const nights = calculateNights(
        bookingDetails.checkIn,
        bookingDetails.checkOut,
      );
      if (nights <= 0) {
        toast({
          title: "Dates de séjour invalides",
          description: "Les dates de séjour ne sont pas valides.",
          variant: "destructive",
        });
        return { success: false, error: "Invalid dates" };
      }

      const price = calculatePrice(hebergement, nights);

      const reservationData = {
        id_client: state.client?.id || "",
        type: "hebergement",
        object_id: hebergement.idHebergement,
        date_debut: formatDate(new Date(bookingDetails.checkIn)),
        date_fin: formatDate(new Date(bookingDetails.checkOut)),
        montant: price,
        content_type: 1, // Assumer que 1 est l'ID de contenu pour les hébergements
        quantite: bookingDetails.rooms,
      };

      try {
        const reservationResponse = await reservationService.createReservation(
          reservationData as unknown as Partial<Reservation>,
        );

        if (reservationResponse.success && reservationResponse.data) {
          const bookingAccommodation: BookingAccommodation = {
            id: `${hebergement.idHebergement}-${Date.now()}`, // ID unique pour le contexte de booking
            checkIn: formatDate(new Date(bookingDetails.checkIn)),
            checkOut: formatDate(new Date(bookingDetails.checkOut)),
            rooms: bookingDetails.rooms,
            guests: bookingDetails.guests,
            price,
            nights,
            reservationId: reservationResponse.data.idReservation || "",
          };
          addAccommodation(bookingAccommodation);
          toast({
            title: "Réservation ajoutée",
            description: "L'hébergement a été réservé avec succès.",
          });
          return { success: true, data: bookingAccommodation };
        } else {
          console.error("RESERVATION ERROR :", reservationResponse.error);
          toast({
            title: "Erreur de réservation",
            description:
              reservationResponse.error || "Erreur lors de la réservation.",
            variant: "destructive",
          });
          return { success: false, error: reservationResponse.error };
        }
      } catch (error) {
        console.error("Error creating reservation:", error);
        toast({
          title: "Erreur",
          description:
            "Une erreur est survenue lors de l'ajout de la réservation.",
          variant: "destructive",
        });
        return { success: false, error: "Network or unexpected error" };
      }
    },
    [state.client, addAccommodation],
  );

  return { createAndAddReservation };
};