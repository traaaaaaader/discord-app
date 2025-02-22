import { AxiosResponse } from "axios";
import AuthApiClient from "@/api/auth-api-client";

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

    const response: AxiosResponse = await AuthApiClient.post(
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
    const response: AxiosResponse = await AuthApiClient.patch(
      `/direct-messages?directMessageId=${directMessageId}&conversationId=${conversationId}`,
      { content }
    );
    return response.data;
  },

  deleteMessage: async (directMessageId: string, conversationId: string) => {
    await AuthApiClient.delete(
      `/direct-messages?directMessageId=${directMessageId}&conversationId=${conversationId}`
    );
  },
};
