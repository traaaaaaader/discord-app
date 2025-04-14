import { AxiosResponse } from "axios";
import apiClient from "@/api/api-client";

export const ConversationService = {
  create: async (name: string, accessToken: string) => {
    const response: AxiosResponse = await apiClient.post(
      `/conversations`, 
      { name },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  },

  get: async (accessToken: string) => {
    const response: AxiosResponse = await apiClient.get(
      `/conversations`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  },
};
