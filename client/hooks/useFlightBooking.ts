// hooks/useFlightBooking.tsx

import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { reservationService } from "@/services/reservationService";
import { useBooking } from "@/contexts/BookingContext";
import type { Vol, Reservation } from "@shared/types";
import type { BookingFlight } from "@shared/booking";
import { volService } from "@/services/volService";

// Fonctions utilitaires
const calculerPrixTotalVol = (vol: Vol, nombrePassagers: number): number => {
  return vol.price * nombrePassagers;
};

const formaterDate = (date: Date): string => date.toISOString().split("T")[0];

/**
 * Hook personnalisé pour gérer l'ajout et la création de réservations de vol.
 */
export const useFlightBooking = () => {
  const { state, addFlight } = useBooking();

  /**
   * Fonction pour créer et ajouter une réservation de vol
   */
  const creerEtAjouterReservationVol = useCallback(
    async (
      vol: Vol,
      detailsReservation: {
        departureDate: string;
        returnDate?: string;
        departureCity: string;
        arrivalCity: string;
        passengers: number;
      }
    ) => {
      if (!detailsReservation.departureDate) {
        toast({
          title: "Date de départ manquante",
          description: "Veuillez sélectionner une date de départ.",
          variant: "destructive",
        });
        return { success: false, error: "Date de départ manquante" };
      }

      if (vol.availability === "full") {
        toast({
          title: "Vol complet",
          description: "Ce vol n'a plus de places disponibles.",
          variant: "destructive",
        });
        return { success: false, error: "Vol complet" };
      }

      if (detailsReservation.passengers <= 0) {
        toast({
          title: "Nombre de passagers invalide",
          description: "Le nombre de passagers doit être supérieur à 0.",
          variant: "destructive",
        });
        return { success: false, error: "Nombre de passagers invalide" };
      }
      const Nbpassage = state.client?.nbpersonnes;
      const prixTotal = calculerPrixTotalVol(vol, Nbpassage);

      const donneesReservation = {
        id_client: state.client?.id || "",
        type: "vol",
        object_id: vol.idVol,
        date_debut: formaterDate(new Date(detailsReservation.departureDate)),
        date_fin: detailsReservation.returnDate 
          ? formaterDate(new Date(detailsReservation.returnDate)) 
          : null,
        montant: prixTotal,
        content_type: 3, // Assumons que 3 est l'ID de contenu pour les vols
        quantite: Nbpassage,
        lieu_depart: detailsReservation.departureCity,
        lieu_arrivee: detailsReservation.arrivalCity,
        classe: vol.class,
      };

      try {
        const reponseReservation = await reservationService.createReservation(
          donneesReservation as unknown as Partial<Reservation>,
        );

        if (reponseReservation.success && reponseReservation.data) {
          const bookingFlight: BookingFlight = {
            id: vol.idVol,
            type: vol.type === "international" ? "international" : "domestic",
            passengers: Nbpassage,
            class: vol.class as "economy" | "business" | "first",
            price: prixTotal,
            departureDate: formaterDate(new Date(detailsReservation.departureDate)),
            returnDate: detailsReservation.returnDate 
              ? formaterDate(new Date(detailsReservation.returnDate)) 
              : undefined,
            departureCity: detailsReservation.departureCity,
            arrivalCity: detailsReservation.arrivalCity,
            reservationId: reponseReservation.data.idReservation || "",
          };

          addFlight(bookingFlight);
          
          toast({
            title: "Réservation de vol ajoutée",
            description: "Le vol a été réservé avec succès.",
          });
          return { success: true, data: bookingFlight };
        } else {
          console.error("ERREUR DE RÉSERVATION DE VOL :", reponseReservation.error);
          toast({
            title: "Erreur de réservation de vol",
            description:
              reponseReservation.error || "Erreur lors de la réservation du vol.",
            variant: "destructive",
          });
          return { success: false, error: reponseReservation.error };
        }
      } catch (error) {
        console.error("Erreur lors de la création de la réservation de vol :", error);
        toast({
          title: "Erreur",
          description:
            "Une erreur est survenue lors de l'ajout de la réservation de vol.",
          variant: "destructive",
        });
        return { success: false, error: "Erreur réseau ou inattendue" };
      }
    },
    [state.client, addFlight],
  );
// Ajoutez cette fonction dans le hook useFlightBooking
const mettreAJourReservationVol = useCallback(
  async (
    reservationId: string,
    nouvellesDonnees: {
      passengers?: number;
      // departureDate?: string;
      // returnDate?: string;
    }
  ) => {
    try {
      // Récupérer d'abord la réservation existante
      const reservationExistante = await reservationService.getReservation(reservationId);
      
      if (!reservationExistante.success) {
        throw new Error(reservationExistante.error);
      }

      // Préparer les données mises à jour
      const donneesMisesAJour = {
        ...reservationExistante.data,
        quantite: nouvellesDonnees.passengers ?? reservationExistante.data.quantite,
        // date_debut: nouvellesDonnees.departureDate 
        //   ? formaterDate(new Date(nouvellesDonnees.departureDate)) 
        //   : reservationExistante.data.date_debut,
        // date_fin: nouvellesDonnees.returnDate
        //   ? formaterDate(new Date(nouvellesDonnees.returnDate))
        //   : reservationExistante.data.date_fin,
      };

      // Calculer le nouveau prix si le nombre de passagers change
      if (nouvellesDonnees.passengers) {
        
        const volResponse = await volService.getVolbyId(reservationExistante.data.object_id);
        if (volResponse.success) {
          
          donneesMisesAJour.montant = volResponse.data.price * nouvellesDonnees.passengers;
  
        }
      }

      // Envoyer la mise à jour
      const reponse = await reservationService.updateReservation(
        reservationId,
        donneesMisesAJour
      );

      if (reponse.success) {
        toast({
          title: "Réservation mise à jour",
          description: "Le nombre de passagers a été modifié avec succès.",
        });
        return { 
          success: true, 
          data: {
            newPassengers: nouvellesDonnees.passengers,
            newPrice: donneesMisesAJour.montant
          } 
        };
      } else {
        throw new Error(reponse.error);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la réservation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de la réservation.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  },
  []
);

// N'oubliez pas d'ajouter cette fonction au retour du hook :
return { creerEtAjouterReservationVol, mettreAJourReservationVol }
};