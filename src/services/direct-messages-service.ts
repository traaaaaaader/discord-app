import { AxiosResponse } from "axios";
import apiClient from "@/api/api-client";

export const DirectMessagesService = {
  sendMessage: async (
    conversationId: string,
    content: string,
    fileUrl?: string
  ) => {
    const formData = new FormData();
    formData.append("content", content);
    if (fileUrl) {
      formData.append("fileUrl", fileUrl);
    }

    const response: AxiosResponse = await apiClient.post(
      `/direct-messages?conversationId=${conversationId}`,
      formData
    );
    return response.data;
  },

  updateMessage: async (
    directMessageId: string,
    conversationId: string,
    content: string
  ) => {
    const response: AxiosResponse = await apiClient.patch(
      `/direct-messages?directMessageId=${directMessageId}&conversationId=${conversationId}`,
      { content }
    );
    return response.data;
  },

  deleteMessage: async (directMessageId: string, conversationId: string) => {
    await apiClient.delete(
      `/direct-messages?directMessageId=${directMessageId}&conversationId=${conversationId}`
    );
  },
};
