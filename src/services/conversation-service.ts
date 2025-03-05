import { AxiosResponse } from "axios";
import apiClient from "@/api/api-client";

export const ConversationService = {
  create: async (name: string) => {
    const response: AxiosResponse = await apiClient.post(`/conversations`, {
      name,
    });
    return response.data;
  },

  get: async () => {
    const response: AxiosResponse = await apiClient.get(`/conversations`);
    return response.data;
  },
};
