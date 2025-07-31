import { TravelPlan, TravelPlanDay, ApiResponse } from "@/../../shared/types";
import { fetchApi } from "./apiConfig";

export interface CreateTravelPlanData {
  title: string;
  clientId: string;
  clientName: string;
  reservationId?: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  participants: number;
  travelStyle: "budget" | "comfort" | "luxury" | "adventure" | "cultural";
  pricePerPerson: number;
  currency: "Ar" | "EUR" | "USD";
  includes: string[];
  excludes: string[];
  difficulty: "easy" | "moderate" | "challenging";
  bestSeason: string[];
  groupSize: {
    min: number;
    max: number;
  };
  guide?: {
    name: string;
    phone: string;
    languages: string[];
  };
  category: string;
  tags: string[];
  notes?: string;
}

export interface UpdateTravelPlanData extends Partial<CreateTravelPlanData> {
  status?:
    | "draft"
    | "proposal"
    | "confirmed"
    | "active"
    | "completed"
    | "cancelled";
  days?: TravelPlanDay[];
  rating?: number;
}

class PlanVoyageService {
  async getPlansVoyage(): Promise<TravelPlan[]> {
    try {
      const response = await fetchApi("/api/plans-voyage");
      if (!response.success || !response.data) {
        throw new Error(
          response.error ||
            "Erreur lors de la récupération des plans de voyage",
        );
      }
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des plans de voyage:",
        error,
      );
      throw error;
    }
  }

  async getPlanVoyage(id: string): Promise<TravelPlan> {
    try {
      const response = await fetchApi(`/api/plans-voyage/${id}`);
      if (!response.success || !response.data) {
        throw new Error(
          response.error || "Erreur lors de la récupération du plan de voyage",
        );
      }
      return response.data;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du plan de voyage ${id}:`,
        error,
      );
      throw error;
    }
  }

  async createPlanVoyage(planData: CreateTravelPlanData): Promise<TravelPlan> {
    try {
      const response = await fetchApi("/api/plans-voyage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planData),
      });

      if (!response.success || !response.data) {
        throw new Error(
          response.error || "Erreur lors de la création du plan de voyage",
        );
      }

      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du plan de voyage:", error);
      throw error;
    }
  }

  async updatePlanVoyage(
    id: string,
    planData: UpdateTravelPlanData,
  ): Promise<TravelPlan> {
    try {
      const response = await fetchApi(`/api/plans-voyage/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planData),
      });

      if (!response.success || !response.data) {
        throw new Error(
          response.error || "Erreur lors de la modification du plan de voyage",
        );
      }

      return response.data;
    } catch (error) {
      console.error(
        `Erreur lors de la modification du plan de voyage ${id}:`,
        error,
      );
      throw error;
    }
  }

  async deletePlanVoyage(id: string): Promise<boolean> {
    try {
      const response = await fetchApi(`/api/plans-voyage/${id}`, {
        method: "DELETE",
      });

      if (!response.success) {
        throw new Error(
          response.error || "Erreur lors de la suppression du plan de voyage",
        );
      }

      return true;
    } catch (error) {
      console.error(
        `Erreur lors de la suppression du plan de voyage ${id}:`,
        error,
      );
      throw error;
    }
  }

  async duplicatePlan(id: string, newTitle?: string): Promise<TravelPlan> {
    try {
      const response = await fetchApi(`/api/plans-voyage/${id}/duplicate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newTitle }),
      });

      if (!response.success || !response.data) {
        throw new Error(
          response.error || "Erreur lors de la duplication du plan de voyage",
        );
      }

      return response.data;
    } catch (error) {
      console.error(
        `Erreur lors de la duplication du plan de voyage ${id}:`,
        error,
      );
      throw error;
    }
  }

  async createFromTemplate(
    templateId: string,
    clientData: {
      clientId: string;
      clientName: string;
      participants: number;
      startDate: Date;
    },
  ): Promise<TravelPlan> {
    try {
      const response = await fetchApi(
        `/api/plans-voyage/template/${templateId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(clientData),
        },
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.error || "Erreur lors de la création depuis le template",
        );
      }

      return response.data;
    } catch (error) {
      console.error(
        `Erreur lors de la création depuis le template ${templateId}:`,
        error,
      );
      throw error;
    }
  }

  async exportToPdf(id: string): Promise<Blob> {
    try {
      const response = await fetch(`/api/plans-voyage/${id}/pdf`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'export PDF");
      }

      return await response.blob();
    } catch (error) {
      console.error(`Erreur lors de l'export PDF du plan ${id}:`, error);
      throw error;
    }
  }

  async sharePlan(id: string, email: string): Promise<boolean> {
    try {
      const response = await fetchApi(`/api/plans-voyage/${id}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.success) {
        throw new Error(
          response.error || "Erreur lors du partage du plan de voyage",
        );
      }

      return true;
    } catch (error) {
      console.error(`Erreur lors du partage du plan ${id}:`, error);
      throw error;
    }
  }

  // Utility functions
  calculateDuration(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  generatePlanNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const timestamp = now.getTime().toString().slice(-4);

    return `PLAN-${year}${month}${day}-${timestamp}`;
  }

  formatCurrency(amount: number, currency: string): string {
    switch (currency) {
      case "Ar":
        return `${amount.toLocaleString()} Ar`;
      case "EUR":
        return `€${amount.toLocaleString()}`;
      case "USD":
        return `$${amount.toLocaleString()}`;
      default:
        return `${amount.toLocaleString()} ${currency}`;
    }
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "challenging":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "proposal":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  getTravelStyleIcon(style: string): string {
    switch (style) {
      case "budget":
        return "💰";
      case "comfort":
        return "🛏️";
      case "luxury":
        return "✨";
      case "adventure":
        return "🏔️";
      case "cultural":
        return "🏛️";
      default:
        return "🌍";
    }
  }
}

export const planVoyageService = new PlanVoyageService();
