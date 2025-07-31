import { Activite, ApiResponse } from "@shared/types";
import { API_BASE_URL } from "./apiConfig";

class ActiviteService {
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

  async getActivites(params?: {
    name?: string;
    location?: string;
    category?: string;
    difficulty?: string;
  }): Promise<ApiResponse<Activite[]>> {
    try {
      const url = new URL(`${API_BASE_URL}/activites/`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) url.searchParams.append(key, value);
        });
      }

      const response = await fetch(url.toString());
      return this.handleResponse<Activite[]>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }

  async createActivite(
    data: Omit<Activite, "idActivite">,
  ): Promise<ApiResponse<Activite>> {
    const now = new Date();
  
      const dataWithTimestamps = {
        ...data,
        groupSizeMax: data.groupSizeMax,
        groupSizeMin: data.groupSizeMin,
        createdAt: now.toISOString(),
        
      };
  
     
    try {
      const response = await fetch(`${API_BASE_URL}/activites/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return this.handleResponse<Activite>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }

  async updateActivite(
    id: string,
    activite: Partial<Activite>,
    signal?: AbortSignal,
  ): Promise<ApiResponse<Activite>> {
    try {
      const now = new Date();
      const url = `${API_BASE_URL}/activites/${id}/`;

      const requestData = {
        name: activite?.name || "",
        category: activite?.category,
        location: activite?.location,
        duration: activite?.duration || "",
        difficulty: activite?.difficulty || "facile",
        priceAdult: activite?.priceAdult || 50000,
        priceChild: activite?.priceChild || 0,
        groupSizeMin: activite?.groupSizeMin,
        groupSizeMax: activite?.groupSizeMax,
        description: activite?.description || "",
        includes: activite?.includes || [],
        requirements: activite?.requirements || [],
        guideRequired: activite?.guideRequired || false,
        guideName: activite?.guideName || "",
        guidePhone: activite?.guidePhone || "",
        rating: activite?.rating || 2,
        reviews: activite?.reviews || 0,
        seasons: activite?.seasons || [],
        favorite: activite?.favorite || false,
        popularity: activite?.popularity || 0,
        updatedAt: now.toISOString(),
      }
            const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
        signal,
      });
      return this.handleResponse<Activite>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }

  async deleteActivite(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/activites/${id}/`, {
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

export const activiteService = new ActiviteService();
