import { API_BASE_URL } from "./apiConfig";

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'secretary';
  is_verified: boolean;
  phone?: string;
  is_staff?: boolean;
  is_active?: boolean;
  is_superuser?: boolean;
  last_login?: string;
}

interface LoginResponse {
  refresh: string;
  access: string;
  user: {
    email: string;
    name: string;
    role: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

class UserService {
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP Error: ${response.status}`,
        errors: errorData.errors,
      };
    }
    const data = await response.json();
    return { success: true, data };
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password }),
      });

      const result = await this.handleResponse<LoginResponse>(response);
      if (result.success && result.data) {
        localStorage.setItem('access_token', result.data.access);
        localStorage.setItem('refresh_token', result.data.refresh);
        localStorage.setItem('currentUser', JSON.stringify(result.data.user));
      }
      return result;
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
  }

  async registerSecretaire(userData: Omit<User, 'id' | 'is_verified' | 'role'> & { password: string }): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ ...userData, role: 'secretaire' }),
      });
      return this.handleResponse<User>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/`, {
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/${id}/`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse<User>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }

  async updateUser(id: number, userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/${id}/`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(userData),
      });
      return this.handleResponse<User>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/${id}/`, {
        method: "DELETE",
        headers: this.getHeaders(),
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

  async verifyUser(id: number): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/${id}/verify/`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify({}),
      });
      return this.handleResponse<User>(response);
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }

  async refreshToken(): Promise<ApiResponse<{ access: string }>> {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        return { success: false, error: "No refresh token available" };
      }

      const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ refresh }),
      });

      const result = await this.handleResponse<{ access: string }>(response);
      if (result.success && result.data) {
        localStorage.setItem('access_token', result.data.access);
      }
      return result;
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }
}

export const userService = new UserService();