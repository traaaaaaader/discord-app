import { AxiosResponse } from "axios";
import AuthApiClient from "@/api/auth-api-client";
import { ChannelType } from "../types/servers";

export const ChannelsService = {
  getChannel: async (channelId: string, serverId?: string) => {
    const response: AxiosResponse = await AuthApiClient.get(
      `/channels?channelId=${channelId}`,
      {
        params: {
          ...(serverId && { serverId }),
        },
      }
    );
    return response.data;
  },

  getChannels: async (serverId: string) => {
    const response: AxiosResponse = await AuthApiClient.get("/channels", {
      params: {
        serverId,
      },
    });
    return response.data;
  },

  createChannel: async (serverId: string, name: string, type: ChannelType) => {
    const response: AxiosResponse = await AuthApiClient.post(
      `/channels?serverId=${serverId}`,
      { name, type }
    );
    return response.data;
  },

  updateChannel: async (
    channelId: string,
    serverId: string,
    name: string,
    type: ChannelType
  ) => {
    const response: AxiosResponse = await AuthApiClient.patch(
      `/channels/${channelId}?serverId=${serverId}`,
      { name, type }
    );
    return response.data;
  },

  deleteChannel: async (channelId: string, serverId: string) => {
    await AuthApiClient.delete(`/channels/${channelId}?serverId=${serverId}`);
  },
};
