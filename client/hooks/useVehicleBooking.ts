// hooks/useVehicleBooking.tsx

import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { reservationService } from "@/services/reservationService";
import { useBooking } from "@/contexts/BookingContext";
import type { Vehicule, Reservation } from "@shared/types";
import type { BookingVehicle } from "@shared/booking";

// Fonctions utilitaires
const calculerJoursLocation = (dateDebut: string, dateFin: string): number => {
  if (!dateDebut || !dateFin) return 0;
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  // Ajoute un jour pour inclure à la fois la date de début et la date de fin dans le calcul
  return Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

const calculerPrixVehicule = (vehicule: Vehicule, joursLocation: number): number => {
  const prixJournalier = vehicule.pricePerDay; // Assumons que 'pricePerDay' est le prix de location journalier
  return prixJournalier * joursLocation;
};

const formaterDate = (date: Date): string => date.toISOString().split("T")[0];

/**
 * Hook personnalisé pour gérer l'ajout et la création de réservations de véhicule.
 */
export const useVehicleBooking = () => {
  const { state, addVehicle } = useBooking();

  /**
   * Fonction interne pour créer une réservation générique pour un véhicule.
   */
  const creerEtAjouterReservationVehicule = useCallback(
    async (
      vehicule: Vehicule,
      detailsReservation: {
        startDate: string;
        endDate: string;
        pickupLocation: string;
        dropoffLocation: string;
      },
    ) => {
      const joursLocation = calculerJoursLocation(
        detailsReservation.startDate,
        detailsReservation.endDate,
      );

      if (joursLocation <= 0) {
        toast({
          title: "Dates de location invalides",
          description: "Les dates de location ne sont pas valides.",
          variant: "destructive",
        });
        return { success: false, error: "Dates invalides" };
      }

      if (vehicule.availability !== "available") {
        toast({
          title: "Véhicule non disponible",
          description: "Ce véhicule n'est pas disponible pour les dates sélectionnées.",
          variant: "destructive",
        });
        return { success: false, error: "Véhicule non disponible" };
      }

      const prix = calculerPrixVehicule(vehicule, joursLocation);

      const donneesReservation = {
        id_client: state.client?.id || "",
        type: "voiture",
        object_id: vehicule.idVoiture,
        date_debut: formaterDate(new Date(detailsReservation.startDate)),
        date_fin: formaterDate(new Date(detailsReservation.endDate)),
        montant: prix,
        content_type: 2, // Assumons que 2 est l'ID de contenu pour les véhicules
        quantite: 1, // Assumons un véhicule par réservation
        lieu_depart: detailsReservation.pickupLocation,
        lieu_arrivee: detailsReservation.dropoffLocation,
      };

      try {
      
        const reponseReservation = await reservationService.createReservation(
          donneesReservation as unknown as Partial<Reservation>,
        );

        if (reponseReservation.success && reponseReservation.data) {
          const bookingVehicle: BookingVehicle = {
            id: vehicule.idVoiture, // Utiliser l'ID de réservation ou un ID unique
            startDate: formaterDate(new Date(detailsReservation.startDate)),
            endDate: formaterDate(new Date(detailsReservation.endDate)),
            pickupLocation: detailsReservation.pickupLocation,
            dropoffLocation: detailsReservation.dropoffLocation,
            price: prix,
            rentalDays: joursLocation,
            reservationId: reponseReservation.data.idReservation || "",
          };
         
          addVehicle(bookingVehicle);
          toast({
            title: "Réservation de véhicule ajoutée",
            description: "Le véhicule a été réservé avec succès.",
          });
          return { success: true, data: bookingVehicle };
        } else {
          console.error("ERREUR DE RÉSERVATION DE VÉHICULE :", reponseReservation.error);
          toast({
            title: "Erreur de réservation de véhicule",
            description:
              reponseReservation.error || "Erreur lors de la réservation du véhicule.",
            variant: "destructive",
          });
          return { success: false, error: reponseReservation.error };
        }
      } catch (error) {
        console.error("Erreur lors de la création de la réservation de véhicule :", error);
        toast({
          title: "Erreur",
          description:
            "Une erreur est survenue lors de l'ajout de la réservation de véhicule.",
          variant: "destructive",
        });
        return { success: false, error: "Erreur réseau ou inattendue" };
      }
    },
    [state.client, addVehicle],
  );

  return { creerEtAjouterReservationVehicule };
};