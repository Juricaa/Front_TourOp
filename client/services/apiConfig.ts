// export const API_BASE_URL = "/api";
export const API_BASE_URL = "http://localhost:8000/api"

export const apiConfig = {
  baseUrl: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
};

export async function fetchApi(endpoint: string, options?: RequestInit) {
  try {
    const url = endpoint.startsWith("/")
      ? endpoint
      : `${API_BASE_URL}/${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}
