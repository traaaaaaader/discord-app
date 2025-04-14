import { AxiosResponse } from "axios";
import apiClient from "@/api/api-client";

interface AuthResponse {
  accessToken: string;
}

export const AuthService = {
  register: async (
    name: string,
    email: string,
    password: string,
    imageUrl: string
  ): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("imageUrl", imageUrl);

    const response: AxiosResponse<AuthResponse> = await apiClient.post(
      "/auth/register",
      formData
    );

    return response.data;
  },

  login: async (
    email: string, 
    password: string
  ): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await apiClient.post(
      "/auth/login",
      {
        email,
        password,
      }
    );

    return response.data;
  },

  refresh: async (
    accessToken: string
  ): Promise<AuthResponse | null> => {
    try {
      const response: AxiosResponse<AuthResponse> = await apiClient.post(
        "/auth/refresh",
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log("Error refresh token");
      return null;
    }
  },

  logout: async () => {
    await apiClient.post("/auth/logout");
  },

  google: async (): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await apiClient.get("/auth/google");
    return response.data;
  },
};
