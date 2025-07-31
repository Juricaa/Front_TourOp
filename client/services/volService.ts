import { Vol, ApiResponse } from "@shared/types";
import { API_BASE_URL } from "./apiConfig";

class VolService {
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

  async getVols(params?: {
    departure?: string;
    destination?: string;
    airline?: string;
    flightType?: string;
  }): Promise<ApiResponse<Vol[]>> {
    try {
      const url = new URL(`${API_BASE_URL}/vols/`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) url.searchParams.append(key, value);
        });
      }

      const response = await fetch(url.toString());
      return this.handleResponse<Vol[]>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }

  async getVolbyId(id: string): Promise<ApiResponse<Vol>> {
    try {
      const response = await fetch(`${API_BASE_URL}/vols/${id}/`);
      return this.handleResponse<Vol>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }

  async createVol(data: Omit<Vol, "idVol">): Promise<ApiResponse<Vol>> {
    try {

      const now = new Date();
      const flatData = {
        airline: data.airline,
        flightNumber: data.flightNumber,
        route_from: data.route?.from,
        route_to: data.route?.to,
        route_fromCode: data.route?.fromCode,
        route_toCode: data.route?.toCode,
        schedule_departure: "2025-07-22T07:46:33.146Z",
        schedule_arrival: "2025-07-22T07:46:33.146Z",
        schedule_duration: data.schedule?.duration,
        aircraft: data.aircraft,
        flight_class: data.class,
        price: data.price?.toString() || "0",
        availability: data.availability,
        seats_total: data.seats?.total,
        seats_available: data.seats?.available,
        services: data.services || {},
        baggage_carry: data.baggage?.carry,
        baggage_checked: data.baggage?.checked,
        cancellation_flexible: data.cancellation?.flexible,
        cancellation_fee: "0",
        contact_phone: data.contact?.phone,
        contact_email: data.contact?.email,
        contact_website: data.contact?.website,
        rating: data.rating,
        reviews: data.reviews,
        // lastUsed: data.lastUsed || new Date().toISOString(),
        popularity: data.popularity,
        images: data.images || {},
        createdAt: now.toISOString(),
      };

      console.log("Creating vol with data:", flatData);

      const response = await fetch(`${API_BASE_URL}/vols/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(flatData),

      });

      return this.handleResponse<Vol>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }


  async updateVol(id: string, data: Partial<Vol>): Promise<ApiResponse<Vol>> {
    try {
      const now = new Date();

      const payload = {
        airline: data.airline,                                // string
        flightNumber: data.flightNumber,                      // string
        aircraft: data.aircraft,                              // string
        flight_class: data.class,                             // string ("economy", "business", etc.)
        price: data.price?.toString(),                        // string attendu en backend
        availability: data.availability,                      // "available" ou autre

        seats_total: data.seats?.total ?? 0,                  // number (int)
        seats_available: data.seats?.available ?? 0,          // number (int)

        services: data.services || {},                        // objet vide si null
        baggage_carry: data.baggage?.carry || "",             // string
        baggage_checked: data.baggage?.checked || "",         // string

        cancellation_flexible: data.cancellation?.flexible ?? false, // boolean
        cancellation_fee: data.cancellation?.fee?.toString() || "0", // string

        contact_phone: data.contact?.phone || "",             // string
        contact_email: data.contact?.email || "",             // string
        contact_website: data.contact?.website || "",         // string

        rating: data.rating ?? 0,                             // number
        reviews: data.reviews ?? 0,                           // number

        lastUsed: data.lastUsed || now.toISOString(),         // date string
        popularity: data.popularity ?? 0,                     // number

        images: data.images || {},                            // objet vide si non fourni
        updatedAt: now.toISOString(),                         // pas requis mais utile

        // 🔽 Champs "route" aplatit
        route_from: data.route?.from || "",
        route_to: data.route?.to || "",
        route_fromCode: data.route?.fromCode || "",
        route_toCode: data.route?.toCode || "",

        // 🔽 Champs "schedule" aplatit
        schedule_departure: data.schedule?.departure || now.toISOString(),
        schedule_arrival: data.schedule?.arrival || now.toISOString(),
        schedule_duration: data.schedule?.duration || "",

        // Autres champs si nécessaires...
      };

      console.log("Updating vol with ID:", id, "Data:", payload);
      const response = await fetch(`${API_BASE_URL}/vols/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      return this.handleResponse<Vol>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }

  async deleteVol(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/vols/${id}/`, {
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




export const volService = new VolService();
