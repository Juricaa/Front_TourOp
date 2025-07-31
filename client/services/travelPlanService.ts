import { apiConfig } from "./apiConfig";
import type { TravelPlan, ApiResponse } from "@shared/types";

export const travelPlanService = {
  // Obtenir tous les plans de voyage
  async getTravelPlans(): Promise<ApiResponse<TravelPlan[]>> {
    try {
      const response = await fetch(`${apiConfig.baseUrl}/plans-voyage`, {
        headers: apiConfig.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching travel plans:", error);
      return {
        success: false,
        error: "Network error: Unable to fetch travel plans",
      };
    }
  },

  // Obtenir un plan de voyage par ID
  async getTravelPlan(id: string): Promise<ApiResponse<TravelPlan>> {
    try {
      const response = await fetch(`${apiConfig.baseUrl}/plans-voyage/${id}`, {
        headers: apiConfig.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching travel plan:", error);
      return {
        success: false,
        error: "Network error: Unable to fetch travel plan",
      };
    }
  },

  // Créer un nouveau plan de voyage
  async createTravelPlan(
    travelPlan: Partial<TravelPlan>,
  ): Promise<ApiResponse<TravelPlan>> {
    try {
      const response = await fetch(`${apiConfig.baseUrl}/plans-voyage`, {
        method: "POST",
        headers: apiConfig.headers,
        body: JSON.stringify(travelPlan),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${responseText}`,
        );
      }

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
    } catch (error) {
      console.error("Error creating travel plan:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Network error: Unable to create travel plan",
      };
    }
  },

  // Mettre à jour un plan de voyage
  async updateTravelPlan(
    id: string,
    travelPlan: Partial<TravelPlan>,
  ): Promise<ApiResponse<TravelPlan>> {
    try {
      const response = await fetch(`${apiConfig.baseUrl}/plans-voyage/${id}`, {
        method: "PUT",
        headers: apiConfig.headers,
        body: JSON.stringify(travelPlan),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating travel plan:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Network error: Unable to update travel plan",
      };
    }
  },

  // Supprimer un plan de voyage
  async deleteTravelPlan(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${apiConfig.baseUrl}/plans-voyage/${id}`, {
        method: "DELETE",
        headers: apiConfig.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`,
        );
      }

      // Delete might return empty body
      const text = await response.text();
      return text ? JSON.parse(text) : { success: true };
    } catch (error) {
      console.error("Error deleting travel plan:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Network error: Unable to delete travel plan",
      };
    }
  },

  // Générer un plan de voyage à partir d'une réservation
  async generateFromReservation(
    reservationId: string,
  ): Promise<ApiResponse<TravelPlan>> {
    try {
      const response = await fetch(
        `${apiConfig.baseUrl}/plans-voyage/generate/${reservationId}`,
        {
          method: "POST",
          headers: apiConfig.headers,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating travel plan from reservation:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Network error: Unable to generate travel plan",
      };
    }
  },
};
