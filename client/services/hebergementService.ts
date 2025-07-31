import { Hebergement, ApiResponse } from "@shared/types";
import { API_BASE_URL } from "./apiConfig";

class HebergementService {
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP Error: ${response.status}`,
        // errors: errorData.errors, // Pour les erreurs de validation
      };
    }
    return response.json();
  }

  async getHebergements(params?: {
    name?: string;
    location?: string;
    type?: string;
  }): Promise<ApiResponse<Hebergement[]>> {
    try {
      const url = new URL(
        `${API_BASE_URL}/hebergements/`,
      );
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) url.searchParams.append(key, value);
        });
      }

      const response = await fetch(url.toString());
      return this.handleResponse<Hebergement[]>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }

  async createHebergement(
    data: Omit<Hebergement, "idHebergement">,
  ): Promise<ApiResponse<Hebergement>> {
    try {
      const response = await fetch(`${API_BASE_URL}/hebergements/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      console.log(data);
      return this.handleResponse<Hebergement>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }

  async updateHebergement(
    id: string,
    hebergementData: Partial<Hebergement>,
    signal?: AbortSignal,
  ): Promise<ApiResponse<Hebergement>> {
    try {
      // 1. URL correcte
      const url = `${API_BASE_URL}/hebergements/${id}/`;

      // 2. Formatage des données pour correspondre EXACTEMENT au modèle Django
      const requestData = {
        idHebergement: id, // Champ clé primaire
        name: hebergementData.name,
        type: hebergementData.type,
        location: hebergementData.location,
        address: hebergementData.address,
        priceRange: hebergementData.priceRange, // Exactement comme dans le modèle
        rating: hebergementData.rating,
        amenities: hebergementData.amenities || [],
        capacity: hebergementData.capacity,
        description: hebergementData.description || "",
        phone: hebergementData.phone,
        email: hebergementData.email || "",

        // Les champs datetime sont gérés automatiquement côté serveur
      };

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
        signal,
      });

      // 3. Gestion améliorée des erreurs
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Détails de l'erreur:", {
          status: response.status,
          errorData,
        });
        return {
          success: false,
          error: errorData.message || `Erreur HTTP: ${response.status}`,
          // errors: errorData,
        };
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur réseau:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur réseau",
      };
    }
  }

  async deleteHebergement(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/hebergements/${id}/`, {
        method: "DELETE",
      });
      if (response.status === 204) {
        return { success: true };
      }
      return this.handleResponse<void>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }
}

export const hebergementService = new HebergementService();
