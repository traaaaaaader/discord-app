import { AxiosResponse } from "axios";
import AuthApiClient from "@/api/auth-api-client";

export const MessagesService = {
  sendMessage: async (
    channelId: string,
    serverId: string,
    content: string,
    fileUrl?: File
  ) => {
    const formData = new FormData();
    formData.append("content", content);
    if (fileUrl) formData.append("fileUrl", fileUrl);

    const response: AxiosResponse = await AuthApiClient.post(
      `/messages?channelId=${channelId}&serverId=${serverId}`,
      formData
    );
    return response.data;
  },

  updateMessage: async (
    messageId: string,
    channelId: string,
    serverId: string,
    content: string
  ) => {
    const response: AxiosResponse = await AuthApiClient.patch(
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
    await AuthApiClient.delete(
      `/messages?messageId=${messageId}&channelId=${channelId}&serverId=${serverId}`
    );
  },
};
