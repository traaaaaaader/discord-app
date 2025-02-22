import { AxiosResponse } from "axios";
import defaultApiClient from "@/api/default-api-client";
import authApiClient from "@/api/auth-api-client";

export const AuthService = {
  register: async (
    name: string,
    email: string,
    password: string,
    imageUrl: string
  ) => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("imageUrl", imageUrl);

    const response: AxiosResponse = await authApiClient.post(
      "/auth/register",
      formData
    );

    return response.data;
  },

  login: async (email: string, password: string) => {
    const response: AxiosResponse = await authApiClient.post("/auth/login", {
      email,
      password,
    });

    return response.data;
  },

  refresh: async () => {
    try {
      const response: AxiosResponse = await authApiClient.post("/auth/refresh");
      return response.data;
    } catch (error) {
      console.log("Error refresh token");
      return null;
    }
  },

  logout: async () => {
    await authApiClient.post("/auth/logout");
  },

  google: async () => {
    const response = await authApiClient.get("/auth/google");
    return response.data;
  },

  getUser: async () => {
    const response = await authApiClient.get("/auth/get");
    return response.data;
  },
};
