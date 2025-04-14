import { AxiosResponse } from "axios";
import apiClient from "@/api/api-client";
import qs from "query-string";

export const MessagesService = {
  create: async (
    channelId: string,
    serverId: string,
    content: string,
    fileUrl: string | undefined,
    accessToken: string
  ) => {
    const response: AxiosResponse = await apiClient.post(
      `/messages?channelId=${channelId}&serverId=${serverId}`,
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
        url: "/messages",
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
    messageId: string,
    channelId: string,
    serverId: string,
    content: string,
    accessToken: string
  ) => {
    const response: AxiosResponse = await apiClient.patch(
      `/messages?messageId=${messageId}&channelId=${channelId}&serverId=${serverId}`,
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
    channelId: string,
    serverId: string,
    accessToken: string
  ) => {
    await apiClient.delete(
      `/messages?messageId=${messageId}&channelId=${channelId}&serverId=${serverId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  },
};
