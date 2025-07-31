import { BookingData } from "@shared/booking";
import { TravelPlan, TravelPlanDay } from "@shared/types";

export class TravelPlanGenerator {
  static generateFromBooking(bookingData: BookingData): TravelPlan {
    if (!bookingData.client) {
      throw new Error("Client information is required");
    }

    const planId = `TP-${Date.now()}`;
    const startDate = bookingData.travelDates.start;
    const endDate = bookingData.travelDates.end;
    const duration = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Créer les jours du plan de voyage
    const days: TravelPlanDay[] = [];

    // Trier les services par ordre chronologique
    const sortedFlights = [...bookingData.flights].sort((a, b) => {
      if (a.date && b.date) {
        return a.date.getTime() - b.date.getTime();
      }
      // Si pas de date, mettre les vols aller d'abord, puis retour
      const typeOrder = { outbound: 1, domestic: 2, return: 3 };
      return typeOrder[a.type] - typeOrder[b.type];
    });

    const sortedAccommodations = [...bookingData.accommodations].sort(
      (a, b) => a.checkIn.getTime() - b.checkIn.getTime(),
    );

    const sortedVehicles = [...bookingData.vehicles].sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime(),
    );

    const sortedActivities = [...bookingData.activities].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );

    // Générer les jours
    for (let dayNum = 1; dayNum <= duration; dayNum++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + (dayNum - 1));

      const dayPlan = this.generateDayPlan(
        dayNum,
        currentDate,
        sortedFlights,
        sortedAccommodations,
        sortedVehicles,
        sortedActivities,
        duration,
      );

      days.push(dayPlan);
    }

    // Créer le plan de voyage
    const travelPlan: TravelPlan = {
      id: planId,
      planNumber: `PLAN-${Date.now()}`,
      title: `Voyage à Madagascar - ${bookingData.client.name}`,
      clientId: bookingData.client.id || "new",
      clientName: bookingData.client.name,
      destination: "Madagascar",
      startDate,
      endDate,
      duration,
      participants: bookingData.client.nbpersonnes,
      travelStyle: "comfort", // Peut être calculé basé sur les services choisis
      days,
      pricePerPerson: Math.round(
        bookingData.totalPrice / bookingData.client.nbpersonnes,
      ),
      totalPrice: bookingData.totalPrice,
      currency: bookingData.currency,
      includes: this.generateIncludes(bookingData),
      excludes: [
        "Repas non mentionnés",
        "Boissons alcoolisées",
        "Dépenses personnelles",
        "Assurance voyage",
        "Visa (si nécessaire)",
        "Vaccinations",
      ],
      difficulty: "easy",
      bestSeason: ["Avril - Novembre"],
      groupSize: {
        min: 1,
        max: bookingData.client.nbpersonnes,
      },
      status: "proposal",
      template: false,
      category: "Découverte",
      tags: ["Madagascar", "Nature", "Culture"],
      notes: bookingData.notes,
      createdAt: new Date(),
    };

    return travelPlan;
  }

  private static generateDayPlan(
    dayNum: number,
    date: Date,
    flights: any[],
    accommodations: any[],
    vehicles: any[],
    activities: any[],
    totalDuration: number,
  ): TravelPlanDay {
    const dayActivities: any[] = [];
    let accommodation: any = null;
    let transport: any = null;
    let location = "Madagascar";

    // Premier jour - Vol d'arrivée
    if (dayNum === 1) {
      const arrivalFlight = flights.find((f) => f.type === "outbound");
      if (arrivalFlight) {
        dayActivities.push({
          time: "Selon horaires vol",
          activity: "Arrivée à l'aéroport",
          description: "Accueil à l'aéroport et transfert",
          duration: "2h",
          included: true,
        });
      }

      // Véhicule de transfert
      const transferVehicle = vehicles.find(
        (v) => v.startDate.toDateString() === date.toDateString(),
      );
      if (transferVehicle) {
        dayActivities.push({
          time: "Après arrivée",
          activity: "Transfert en véhicule",
          description: `Transport de ${transferVehicle.pickupLocation} vers ${transferVehicle.dropoffLocation}`,
          duration: "1-2h",
          included: true,
        });
        transport = {
          type: "Véhicule privé",
          description: `${transferVehicle.pickupLocation} → ${transferVehicle.dropoffLocation}`,
        };
      }

      dayActivities.push({
        time: "Fin d'après-midi",
        activity: "Installation et repos",
        description:
          "Installation à l'hébergement, premier contact avec Madagascar",
        duration: "Libre",
        included: true,
      });
    }

    // Dernier jour - Vol de départ
    else if (dayNum === totalDuration) {
      dayActivities.push({
        time: "Matinée",
        activity: "Préparatifs de départ",
        description: "Derniers achats, préparation des bagages",
        duration: "2h",
        included: false,
      });

      const departureFlight = flights.find((f) => f.type === "return");
      if (departureFlight) {
        dayActivities.push({
          time: "Selon horaires vol",
          activity: "Transfert aéroport et départ",
          description: "Transfert vers l'aéroport et vol de retour",
          duration: "3h+",
          included: true,
        });
      }
    }

    // Jours intermédiaires
    else {
      // Activités planifiées pour ce jour
      const dayActivity = activities.find(
        (a) => a.date.toDateString() === date.toDateString(),
      );

      if (dayActivity) {
        dayActivities.push({
          time: "09:00",
          activity: "Excursion organisée",
          description: "Activité selon programme détaillé",
          duration: "Journée complète",
          included: true,
        });
      } else {
        // Jour libre
        dayActivities.push({
          time: "Libre",
          activity: "Journée libre",
          description:
            "Découverte personnelle, repos, ou activités optionnelles",
          duration: "Toute la journée",
          included: false,
        });
      }

      // Transport si changement de lieu
      const vehicleForDay = vehicles.find(
        (v) => date >= v.startDate && date <= v.endDate,
      );
      if (vehicleForDay) {
        transport = {
          type: "Véhicule privé",
          description: `Transport local disponible`,
        };
      }
    }

    // Hébergement pour la nuit
    const accommodationForNight = accommodations.find(
      (acc) => date >= acc.checkIn && date < acc.checkOut,
    );

    if (accommodationForNight) {
      accommodation = {
        name: `Hébergement sélectionné`,
        type: "Hôtel/Lodge",
        location: "Selon programme",
      };
    }

    return {
      id: `day-${dayNum}`,
      day: dayNum,
      date,
      location,
      title:
        dayNum === 1
          ? "Arrivée à Madagascar"
          : dayNum === totalDuration
            ? "Départ de Madagascar"
            : `Jour ${dayNum} - Découverte`,
      description: this.generateDayDescription(dayNum, totalDuration),
      activities: dayActivities,
      accommodation,
      meals: {
        breakfast: dayNum > 1, // Petit-déjeuner à partir du 2ème jour
        lunch: true,
        dinner: dayNum < totalDuration, // Dîner sauf le dernier jour
      },
      transport,
      notes:
        dayNum === 1
          ? "Prévoir documents de voyage"
          : dayNum === totalDuration
            ? "Vérifier horaires de vol"
            : undefined,
    };
  }

  private static generateDayDescription(
    dayNum: number,
    totalDuration: number,
  ): string {
    if (dayNum === 1) {
      return "Arrivée à Madagascar, transfert et première découverte du pays.";
    } else if (dayNum === totalDuration) {
      return "Dernière matinée libre, transfert vers l'aéroport et vol de retour.";
    } else {
      return `Journée de découverte et d'activités selon le programme établi.`;
    }
  }

  private static generateIncludes(bookingData: BookingData): string[] {
    const includes: string[] = [];

    if (bookingData.flights.length > 0) {
      includes.push("Vols selon programme");
    }

    if (bookingData.accommodations.length > 0) {
      includes.push("Hébergement selon programme");
      includes.push("Petits-déjeuners");
    }

    if (bookingData.vehicles.length > 0) {
      includes.push("Transport en véhicule privé");
      includes.push("Chauffeur-guide");
    }

    if (bookingData.activities.length > 0) {
      includes.push("Activités et excursions mentionnées");
      includes.push("Guide local francophone");
    }

    includes.push("Accueil et assistance");
    includes.push("Transferts aéroport");

    return includes;
  }
}
