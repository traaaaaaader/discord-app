import { AxiosResponse } from "axios";
import apiClient from "@/api/api-client";
import qs from "query-string";

export const MessagesService = {
  sendMessage: async (
    channelId: string,
    serverId: string,
    content: string,
    fileUrl?: string
  ) => {
    const response: AxiosResponse = await apiClient.post(
      `/messages?channelId=${channelId}&serverId=${serverId}`,
      { content, fileUrl }
    );
    return response.data;
  },

  getMessages: async (
    cursor: string | undefined,
    paramKey: string,
    paramValue: string
  ) => {
    const url = qs.stringifyUrl(
      {
        url: "/messages",
        query: {
          cursor,
          [paramKey]: paramValue,
        },
      },
      { skipNull: true }
    );

    const response: AxiosResponse = await apiClient.get(url);
    return response.data;
  },

  updateMessage: async (
    messageId: string,
    channelId: string,
    serverId: string,
    content: string
  ) => {
    const response: AxiosResponse = await apiClient.patch(
      `/messages?messageId=${messageId}&channelId=${channelId}&serverId=${serverId}`,
      { content }
    );
    return response.data;
  },

  deleteMessage: async (
    messageId: string,
    channelId: string,
    serverId: string
  ) => {
    await apiClient.delete(
      `/messages?messageId=${messageId}&channelId=${channelId}&serverId=${serverId}`
    );
  },
};
