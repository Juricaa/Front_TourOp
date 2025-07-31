import { apiConfig } from "./apiConfig";
import type { Reservation, ApiResponse } from "@shared/types";

export const reservationService = {
  // Obtenir toutes les réservations
  async getReservations(
    clientId?: string,
  ): Promise<ApiResponse<Reservation[]>> {
    try {
      const url = clientId
        ? `${apiConfig.baseUrl}/reservations?clientId=${clientId}`
        : `${apiConfig.baseUrl}/reservations/`;
      const response = await fetch(url, {
        headers: apiConfig.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("succes");
      return await response.json();
     
    } catch (error) {
      console.error("Error fetching reservations:", error);
      return {
        success: false,
        error: "Network error: Unable to fetch reservations",
      };
    }
  },

  // Obtenir une réservation par ID
  async getReservation(id: string): Promise<ApiResponse<Reservation>> {
    try {
      console.log("reservation details id:", id);
      const response = await fetch(`${apiConfig.baseUrl}/reservations/${id}`, {
        headers: apiConfig.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching reservation:", error);
      return {
        success: false,
        error: "Network error: Unable to fetch reservation",
      };
    }
  },

  // Créer une nouvelle réservation
  async createReservation(
    reservation: Partial<Reservation>,
  ): Promise<ApiResponse<Reservation>> {
    try {
      const response = await fetch(`${apiConfig.baseUrl}/reservations/`, {
        method: "POST",
        headers: apiConfig.headers,
        body: JSON.stringify(reservation),
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
      console.error("Error creating reservation:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Network error: Unable to create reservation",
      };
    }
  },

  // Mettre à jour une réservation
  async updateReservation(
    id: string,
    reservation: Partial<Reservation>,
  ): Promise<ApiResponse<Reservation>> {
    try {
     
      const response = await fetch(`${apiConfig.baseUrl}/reservations/${id}/`, {
        method: "PUT",
        headers: apiConfig.headers,
        body: JSON.stringify(reservation),
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
      console.error("Error updating reservation:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Network error: Unable to update reservation",
      };
    }
  },

  // Supprimer une réservation
  async deleteReservation(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${apiConfig.baseUrl}/reservations/${id}/`, {
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
      console.error("Error deleting reservation:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Network error: Unable to delete reservation",
      };
    }
  },

  // Générer une facture pour une réservation
  async generateInvoice(reservationId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(
        `${apiConfig.baseUrl}/reservations/${reservationId}/invoice`,
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
      console.error("Error generating invoice:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Network error: Unable to generate invoice",
      };
    }
  },
};
