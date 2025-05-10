import { AxiosResponse } from "axios";
import apiClient from "@/api/api-client";
import qs from "query-string";

export const ConversationMessagesService = {
  create: async (
    conversationId: string, 
    content: string, 
    accessToken: string,
    fileUrl?: string,
  ) => {
    const response: AxiosResponse = await apiClient.post(
      `/conversation-messages?conversationId=${conversationId}`,
      { content, fileUrl },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  },

  get: async (
    cursor: string | undefined,
    paramKey: string,
    paramValue: string,
    accessToken: string
  ) => {
    const url = qs.stringifyUrl(
      {
        url: "/conversation-messages",
        query: {
          cursor,
          [paramKey]: paramValue,
        },
      },
      { skipNull: true }
    );

    const response: AxiosResponse = await apiClient.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  update: async (
    content: string,
    messageId: string,
    conversationId: string,
    accessToken: string
  ) => {
    const response: AxiosResponse = await apiClient.patch(
      `/conversation-messages?messageId=${messageId}&conversationId=${conversationId}`,
      { content },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  },

  delete: async (
    messageId: string, 
    conversationId: string,
    accessToken: string
  ) => {
    await apiClient.delete(
      `/conversation-messages?messageId=${messageId}&conversationId=${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  },
};
