import { Invoice, InvoiceItem, ApiResponse, Reservation } from "@/../../shared/types";
import { fetchApi } from "./apiConfig";
import { API_BASE_URL } from "./apiConfig";

export interface CreateInvoiceData {
  reservationId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientPhone: string;
  travelDate: Date;
  returnDate?: Date;
  currency: "Ar" | "EUR" | "USD";
  items: Omit<InvoiceItem, "id" | "total">[];
  discountAmount?: number;
  notes?: string;
  terms?: string;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  status?: "payé" | "en_attente" | "partial" | "overdue" | "cancelled";
  paymentMethod?: "cash" | "card" | "transfer" | "mobile";
  paymentDate?: Date;
  paidAmount?: number;
}

class FactureService {
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
  async getFactures(params?:{
    idClient?: string;
    status?: string;
    dateTravel?: string;
    dateReturn?: string;
  }): Promise<ApiResponse<Invoice[]>> {
    try {
        const url = new URL(`${API_BASE_URL}/factures/`);
            if (params) {
              Object.entries(params).forEach(([key, value]) => {
                if (value) url.searchParams.append(key, value);
              });
            }
      
            const response = await fetch(url.toString());
            return this.handleResponse<Invoice[]>(response);
          } catch (error) {
            return {
              success: false,
              error: "Network error",
            };
          }
        }

  async getFacture(id: string): Promise<ApiResponse<Invoice>> {
    try {
      const response = await fetch(`${API_BASE_URL}/factures/${id}/`);
      return this.handleResponse<Invoice>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }

  async createFacture(data: Partial<Reservation>): Promise<ApiResponse<Reservation>> {
    try {
      const response = await fetch(`${API_BASE_URL}/factures/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return this.handleResponse<Reservation>(response);
         } catch (error) {
           return {
             success: false,
             error: "Network error",
           };
         }
       }

  // async createFacture(factureData: CreateInvoiceData): Promise<Invoice> {
  //   try {
  //     const response = await fetchApi("/api/factures/", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(factureData),
  //     });

  //     if (!response.success || !response.data) {
  //       throw new Error(
  //         response.error || "Erreur lors de la création de la facture",
  //       );
  //     }

  //     return response.data;
  //   } catch (error) {
  //     console.error("Erreur lors de la création de la facture:", error);
  //     throw error;
  //   }
  // }

  async updateFacture(
    id: string,
    factureData: UpdateInvoiceData,
  ): Promise<ApiResponse<Invoice>> {
    try {
      const response = await fetch(`${API_BASE_URL}/factures/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(factureData),
      });
      console.log(factureData);

      return this.handleResponse<Invoice>(response);
          } catch (error) {
            return {
              success: false,
              error: "Network error: Unable to update client",
            };
          }
        }

  async deleteFacture(id: string, params?: { date_debut?: Date; date_fin?: Date ; factureId? : string}): Promise<{ success: boolean; message?: string; deleted_count?: number }> {
    try {
        let url = `${API_BASE_URL}/reservations/client/${id}/reservations/?date_debut=${params.date_debut}&date_fin=${params.date_fin}`;
        
        let url2 = `${API_BASE_URL}/factures/${params.factureId}/`;

        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                // Ajoutez ici vos headers d'authentification si nécessaire
            },
        });

        const data = await response.json();
        
        const response2 = await fetch(url2, {
          method: "DELETE",
          headers: {
              'Content-Type': 'application/json',
              // Ajoutez ici vos headers d'authentification si nécessaire
          },
      });

        if (!response.ok && !response2.ok) {
            throw new Error(data.message || "Erreur lors de la suppression");
        }

        return data;
    } catch (error) {
        console.error(`Erreur lors de la suppression:`, error);
        throw error;
    }
}

  async markAsPaid(
    id: string,
    paymentMethod: string,
    paidAmount: number,
  ): Promise<Invoice> {
    try {
      const response = await fetchApi(`${API_BASE_URL}/api/factures/${id}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod,
          paidAmount,
          paymentDate: new Date(),
        }),
      });

      if (!response.success || !response.data) {
        throw new Error(
          response.error || "Erreur lors du marquage comme payée",
        );
      }

      return response.data;
    } catch (error) {
      console.error(`Erreur lors du marquage comme payée ${id}:`, error);
      throw error;
    }
  }

  async sendInvoice(id: string, email?: string): Promise<boolean> {
    try {
      const response = await fetchApi(`/api/factures/${id}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.success) {
        throw new Error(
          response.error || "Erreur lors de l'envoi de la facture",
        );
      }

      return true;
    } catch (error) {
      console.error(`Erreur lors de l'envoi de la facture ${id}:`, error);
      throw error;
    }
  }

  async generateFromReservation(reservationId: string): Promise<Invoice> {
    try {
      const response = await fetchApi(
        `/api/factures/generate/${reservationId}`,
        {
          method: "POST",
        },
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.error || "Erreur lors de la génération de la facture",
        );
      }

      return response.data;
    } catch (error) {
      console.error(
        `Erreur lors de la génération de la facture pour ${reservationId}:`,
        error,
      );
      throw error;
    }
  }

  // Utility functions
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

  calculateTotals(
    items: InvoiceItem[],
    taxRate: number,
    discountAmount: number = 0,
  ) {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = (discountedSubtotal * taxRate) / 100;
    const totalAmount = discountedSubtotal + taxAmount;

    return {
      subtotal,
      discountedSubtotal,
      taxAmount,
      totalAmount,
    };
  }

  generateInvoiceNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const timestamp = now.getTime().toString().slice(-4);

    return `INV-${year}${month}${day}-${timestamp}`;
  }
}

export const factureService = new FactureService();
