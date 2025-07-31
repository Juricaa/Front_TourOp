import { Voiture, ApiResponse } from "@shared/types";
import { API_BASE_URL } from "./apiConfig";

class VoitureService {
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP Error: ${response.status}`,
      };
    }
    return response.json();
  }

  async getVoitures(params?: {
    brand?: string;
    location?: string;
    vehicleType?: string;
    availability?: string;
  }): Promise<ApiResponse<Voiture[]>> {
    try {
      const url = new URL(`${API_BASE_URL}/voitures/`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) url.searchParams.append(key, value);
        });
      }

      const response = await fetch(url.toString());
      return this.handleResponse<Voiture[]>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }

  async createVoiture(
    data: Omit<Voiture, "idVoiture">
  ): Promise<ApiResponse<Voiture>> {
    try {
      const now = new Date();
  
      const dataWithTimestamps = {
        ...data,
        createdAt: now.toISOString(),
        
      };
  
      console.log("Data sent:", dataWithTimestamps);
  
      const response = await fetch(`${API_BASE_URL}/voitures/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataWithTimestamps),
      });
  
      return this.handleResponse<Voiture>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }
  

  async updateVoiture(
    id: string,
    voitureData: Partial<Voiture>,
    signal?: AbortSignal,
  ): Promise<ApiResponse<Voiture>> {
    try {
      // 1. Construire l'URL
      const now = new Date();
      const url = `${API_BASE_URL}/voitures/${id}/`;
  console.log("data envoyé:", voitureData);
      // 2. Préparer les données au format attendu par le backend Django
      const requestData = {
        idVoiture: id, // Clé primaire
        vehicleType: voitureData.vehicleType,
        brand: voitureData.brand,
        model: voitureData.model,
        capacity: voitureData.capacity,
        pricePerDay: voitureData.pricePerDay,
        availability: voitureData.availability,
        driverIncluded: voitureData.driverIncluded,
        driverName: voitureData.driverName || "",
        driverPhone: voitureData.driverPhone || "",
        features: voitureData.features || [],
        location: voitureData.location,
        description: voitureData.description || "",
        lastUsed: voitureData.lastUsed || null,
        images: voitureData.images || [],
        updatedAt: now.toISOString(),
        
      };
  
  
      // 3. Envoi de la requête PUT
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
        signal,
      });
  
      // 4. Gestion des erreurs HTTP explicites
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Détails de l'erreur:", {
          status: response.status,
          errorData,
        });
        return {
          success: false,
          error: errorData.message || `Erreur HTTP: ${response.status}`,
        };
      }
  
      // 5. Réponse JSON si tout va bien
      return await response.json();
    } catch (error) {
      console.error("Erreur réseau:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur réseau",
      };
    }
  }
  

  async deleteVoiture(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/voitures/${id}/`, {
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

export const voitureService = new VoitureService();
