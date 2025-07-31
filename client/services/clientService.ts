import { Client, ApiResponse } from "@shared/types";

import { API_BASE_URL } from "./apiConfig";

class ClientService {
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP Error: ${response.status}`,
      };
    }
    return response.json();
  }

  async getClients(): Promise<ApiResponse<Client[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/`);
      return this.handleResponse<Client[]>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error: Unable to fetch clients",
      };
    }
  }

  async getClient(id: string): Promise<ApiResponse<Client>> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}/`);
      return this.handleResponse<Client>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error: Unable to fetch client",
      };
    }
  }

  async createClient(
    clientData: Omit<Client, "idClient">,
  ): Promise<ApiResponse<Client>> {
    try {
      console.log("Creating client with data:", clientData);
      const response = await fetch(`${API_BASE_URL}/clients/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData),
      });
      return this.handleResponse<Client>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error: Unable to create client",
      };
    }
  }

  async updateClient(
    id: string,
    clientData: Partial<Client>,
  ): Promise<ApiResponse<Client>> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData),
      });
      return this.handleResponse<Client>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error: Unable to update client",
      };
    }
  }

  async deleteClient(id: string): Promise<ApiResponse<Client>> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}/`, {
        method: "DELETE",
      });
      console.log("Client delet:  ", response);
      return this.handleResponse<Client>(response);
      
    } catch (error) {
      return {
        success: false,
        error: "Network error: Unable to delete client",
      };
    }
  }

  async searchClients(query: string): Promise<ApiResponse<Client[]>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/clients/search?q=${encodeURIComponent(query)}`,
      );
      return this.handleResponse<Client[]>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error: Unable to search clients",
      };
    }
  }
}

export const clientService = new ClientService();
