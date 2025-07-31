import { useState, useEffect } from "react";
import { reservationService } from "@/services/reservationService";

export interface TravelPlanDay {
  id: string;
  day: number;
  date: Date;
  location: string;
  title: string;
  description: string;
  activities: {
    time: string;
    activity: string;
    description: string;
    duration: string;
    included: boolean;
  }[];
  accommodation?: {
    name: string;
    type: string;
    location: string;
  };
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  transport?: {
    type: string;
    description: string;
  };
  notes?: string;
}

export interface TravelPlan {
  id: string;
  planNumber: string;
  title: string;
  clientId: string;
  clientName: string;
  reservationId?: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  participants: number;
  travelStyle: "budget" | "comfort" | "luxury" | "adventure" | "cultural";
  days: TravelPlanDay[];
  pricePerPerson: number;
  totalPrice: number;
  currency: "Ar" | "EUR" | "USD";
  includes: string[];
  excludes: string[];
  difficulty: "easy" | "moderate" | "challenging";
  bestSeason: string[];
  status:
    | "draft"
    | "proposal"
    | "confirmed"
    | "active"
    | "completed"
    | "cancelled";
  guide?: {
    name: string;
    phone: string;
    languages: string[];
  };
  notes?: string;
  createdAt: Date;
}

export interface TravelPlanStats {
  totalPlans: number;
  activePlans: number;
  completedPlans: number;
  totalRevenue: number;
}

export const useTravelPlans = () => {
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const generateMockTravelPlans = (): TravelPlan[] => {
    return [
      {
        id: "plan-001",
        planNumber: "PLAN-2024-001",
        title: "Découverte de Madagascar - Circuit Classique",
        clientId: "CLIENT-001",
        clientName: "Jean Dupont",
        reservationId: "RES-001",
        destination: "Madagascar",
        startDate: new Date("2024-03-15"),
        endDate: new Date("2024-03-22"),
        duration: 7,
        participants: 2,
        travelStyle: "comfort",
        pricePerPerson: 1200,
        totalPrice: 2400,
        currency: "EUR",
        difficulty: "easy",
        bestSeason: ["Mars", "Avril", "Mai", "Septembre", "Octobre"],
        status: "confirmed",
        includes: [
          "Hébergement en hôtels 3-4 étoiles",
          "Tous les petits-déjeuners",
          "Transport en véhicule climatisé",
          "Guide francophone expérimenté",
          "Entrées dans les parcs nationaux",
          "Transferts aéroport",
        ],
        excludes: [
          "Vols internationaux",
          "Déjeuners et dîners (sauf mention contraire)",
          "Boissons",
          "Pourboires",
          "Assurance voyage",
          "Dépenses personnelles",
        ],
        guide: {
          name: "Rakoto Andry",
          phone: "+261 34 12 345 67",
          languages: ["Français", "Anglais", "Malgache"],
        },
        days: [
          {
            id: "day-1",
            day: 1,
            date: new Date("2024-03-15"),
            location: "Antananarivo",
            title: "Arrivée à Antananarivo",
            description:
              "Accueil à l'aéroport et installation à l'hôtel. Première découverte de la capitale malgache.",
            activities: [
              {
                time: "14h00",
                activity: "Accueil à l'aéroport",
                description: "Transfert vers l'hôtel et installation",
                duration: "2h",
                included: true,
              },
              {
                time: "16h30",
                activity: "Visite du Palais de la Reine",
                description:
                  "Découverte du patrimoine historique d'Antananarivo",
                duration: "2h",
                included: true,
              },
              {
                time: "19h00",
                activity: "Dîner de bienvenue",
                description:
                  "Repas traditionnel malgache dans un restaurant local",
                duration: "2h",
                included: true,
              },
            ],
            accommodation: {
              name: "Hôtel Colbert",
              type: "Hôtel 4 étoiles",
              location: "Centre-ville Antananarivo",
            },
            meals: {
              breakfast: false,
              lunch: false,
              dinner: true,
            },
            transport: {
              type: "Véhicule privé",
              description: "Transfert aéroport-hôtel",
            },
            notes: "Arrivée recommandée avant 14h pour profiter du programme",
          },
          {
            id: "day-2",
            day: 2,
            date: new Date("2024-03-16"),
            location: "Andasibe",
            title: "Route vers Andasibe - Parc National",
            description:
              "Départ pour Andasibe et première rencontre avec les lémuriens indri-indri.",
            activities: [
              {
                time: "08h00",
                activity: "Départ pour Andasibe",
                description: "Route panoramique à travers les hauts plateaux",
                duration: "3h",
                included: true,
              },
              {
                time: "14h00",
                activity: "Visite du Parc National Andasibe-Mantadia",
                description:
                  "Observation des lémuriens indri-indri et découverte de la forêt primaire",
                duration: "3h",
                included: true,
              },
              {
                time: "17h30",
                activity: "Installation au lodge",
                description: "Check-in et temps libre",
                duration: "1h",
                included: true,
              },
            ],
            accommodation: {
              name: "Vakona Forest Lodge",
              type: "Lodge écologique",
              location: "Andasibe",
            },
            meals: {
              breakfast: true,
              lunch: true,
              dinner: true,
            },
            transport: {
              type: "Véhicule 4x4",
              description: "Transport vers Andasibe avec arrêts photos",
            },
          },
        ],
        notes:
          "Circuit adapté aux familles. Possibilité d'extension balnéaire.",
        createdAt: new Date("2024-01-15"),
      },
      {
        id: "plan-002",
        planNumber: "PLAN-2024-002",
        title: "Aventure dans le Sud - Isalo et Ifaty",
        clientId: "CLIENT-002",
        clientName: "Marie Martin",
        reservationId: "RES-002",
        destination: "Sud de Madagascar",
        startDate: new Date("2024-04-10"),
        endDate: new Date("2024-04-20"),
        duration: 10,
        participants: 4,
        travelStyle: "adventure",
        pricePerPerson: 1800,
        totalPrice: 7200,
        currency: "EUR",
        difficulty: "moderate",
        bestSeason: ["Avril", "Mai", "Septembre", "Octobre", "Novembre"],
        status: "proposal",
        includes: [
          "Hébergement varié (hôtels, campements)",
          "Tous les repas",
          "Transport en véhicule 4x4",
          "Guide spécialisé trekking",
          "Équipement de camping",
          "Entrées dans tous les sites",
        ],
        excludes: [
          "Vols domestiques",
          "Équipement personnel de trekking",
          "Assurance voyage",
          "Médicaments personnels",
        ],
        guide: {
          name: "Hery Razafy",
          phone: "+261 34 98 765 43",
          languages: ["Français", "Anglais"],
        },
        days: [
          {
            id: "day-2-1",
            day: 1,
            date: new Date("2024-04-10"),
            location: "Antananarivo - Fianarantsoa",
            title: "Vol vers Fianarantsoa",
            description: "Départ d'Antananarivo vers le sud de l'île.",
            activities: [
              {
                time: "09h00",
                activity: "Vol Antananarivo-Fianarantsoa",
                description: "Vol domestique vers le sud",
                duration: "1h30",
                included: false,
              },
              {
                time: "14h00",
                activity: "Visite de Fianarantsoa",
                description:
                  "Découverte de la ville universitaire et de ses vignobles",
                duration: "3h",
                included: true,
              },
            ],
            accommodation: {
              name: "Hôtel Tsara Guest House",
              type: "Hôtel local",
              location: "Fianarantsoa",
            },
            meals: {
              breakfast: true,
              lunch: true,
              dinner: true,
            },
          },
        ],
        notes:
          "Circuit pour aventuriers. Bonne condition physique recommandée.",
        createdAt: new Date("2024-01-20"),
      },
    ];
  };

  const loadTravelPlans = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTravelPlans(generateMockTravelPlans());
    } catch (error) {
      console.error("Error loading travel plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTravelPlan = async (data: any) => {
    setLoading(true);
    try {
      const newPlan: TravelPlan = {
        id: `plan-${Date.now()}`,
        planNumber: `PLAN-2024-${String(travelPlans.length + 1).padStart(3, "0")}`,
        title: data.title,
        clientId: data.clientId,
        clientName: data.clientName,
        reservationId: data.reservationId,
        destination: data.destination,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        duration: data.duration,
        participants: data.participants,
        travelStyle: data.travelStyle,
        pricePerPerson: data.pricePerPerson,
        totalPrice: data.totalPrice,
        currency: data.currency,
        includes: data.includes || [],
        excludes: data.excludes || [],
        difficulty: data.difficulty,
        bestSeason: data.bestSeason || [],
        status: "draft",
        days: data.days || [],
        notes: data.notes,
        createdAt: new Date(),
      };

      setTravelPlans((prev) => [newPlan, ...prev]);
      return { success: true, data: newPlan };
    } finally {
      setLoading(false);
    }
  };

  const updateTravelPlan = async (id: string, data: Partial<TravelPlan>) => {
    setTravelPlans((prev) =>
      prev.map((plan) => (plan.id === id ? { ...plan, ...data } : plan)),
    );
  };

  const deleteTravelPlan = async (id: string) => {
    setTravelPlans((prev) => prev.filter((plan) => plan.id !== id));
  };

  const getTravelPlanStats = (): TravelPlanStats => {
    return {
      totalPlans: travelPlans.length,
      activePlans: travelPlans.filter((plan) =>
        ["confirmed", "active"].includes(plan.status),
      ).length,
      completedPlans: travelPlans.filter((plan) => plan.status === "completed")
        .length,
      totalRevenue: travelPlans
        .filter((plan) => ["confirmed", "completed"].includes(plan.status))
        .reduce((sum, plan) => sum + plan.totalPrice, 0),
    };
  };

  const filterTravelPlans = (searchTerm: string, status: string) => {
    return travelPlans.filter((plan) => {
      const matchesSearch =
        plan.planNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.destination.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = status === "all" || plan.status === status;

      return matchesSearch && matchesStatus;
    });
  };

  const generateTravelPlanFromReservation = async (reservationId: string) => {
    setLoading(true);
    try {
      const response = await reservationService.getReservation(reservationId);
      if (response.success && response.data) {
        const reservation = response.data;

        // Générer les jours du voyage basés sur la réservation
        const startDate = new Date(reservation.dateTravel);
        const endDate = reservation.dateReturn
          ? new Date(reservation.dateReturn)
          : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const duration = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000),
        );

        const days: TravelPlanDay[] = [];
        for (let i = 0; i < duration; i++) {
          const currentDate = new Date(
            startDate.getTime() + i * 24 * 60 * 60 * 1000,
          );
          days.push({
            id: `day-${i + 1}`,
            day: i + 1,
            date: currentDate,
            location: "Madagascar",
            title: `Jour ${i + 1}`,
            description: `Programme du jour ${i + 1}`,
            activities: [
              {
                time: "09h00",
                activity: "Activité matinale",
                description: "Programme à définir selon les services réservés",
                duration: "3h",
                included: true,
              },
            ],
            meals: {
              breakfast: true,
              lunch: i > 0,
              dinner: i < duration - 1,
            },
          });
        }

        const planData = {
          title: `Voyage à Madagascar - ${reservation.clientId}`,
          clientId: reservation.clientId,
          clientName: reservation.clientId,
          reservationId: reservation.id,
          destination: "Madagascar",
          startDate: startDate,
          endDate: endDate,
          duration: duration,
          participants: 2, // Par défaut
          travelStyle: "comfort" as const,
          pricePerPerson: reservation.totalPrice / 2,
          totalPrice: reservation.totalPrice,
          currency: reservation.currency,
          difficulty: "easy" as const,
          bestSeason: ["Avril", "Mai", "Septembre", "Octobre"],
          includes: [
            "Hébergement selon réservation",
            "Transport selon réservation",
            "Activités réservées",
          ],
          excludes: [
            "Vols internationaux",
            "Assurance voyage",
            "Dépenses personnelles",
          ],
          days: days,
          notes: reservation.notes,
        };

        return await createTravelPlan(planData);
      }
      return { success: false, error: "Réservation non trouvée" };
    } catch (error) {
      console.error("Error generating travel plan:", error);
      return { success: false, error: "Erreur lors de la génération" };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTravelPlans();
  }, []);

  return {
    travelPlans,
    loading,
    createTravelPlan,
    updateTravelPlan,
    deleteTravelPlan,
    getTravelPlanStats,
    filterTravelPlans,
    generateTravelPlanFromReservation,
  };
};
