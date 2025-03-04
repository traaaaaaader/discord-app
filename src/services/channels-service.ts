import { AxiosResponse } from "axios";
import apiClient from "@/api/api-client";
import {
  Channel,
  ChannelType,
  ServerWithMembersWithUsersAndChannels,
} from "@/utils/types/servers";

export const ChannelsService = {
  getChannel: async (
    channelId: string,
    serverId?: string
  ): Promise<Channel> => {
    const response: AxiosResponse = await apiClient.get(
      `/channels?channelId=${channelId}`,
      {
        params: {
          ...(serverId && { serverId }),
        },
      }
    );
    return response.data;
  },

  getChannels: async (serverId: string): Promise<Channel[]> => {
    const response: AxiosResponse = await apiClient.get("/channels", {
      params: {
        serverId,
      },
    });
    return response.data;
  },

  createChannel: async (
    serverId: string,
    name: string,
    type: ChannelType
  ): Promise<ServerWithMembersWithUsersAndChannels> => {
    const response: AxiosResponse = await apiClient.post(
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
  ): Promise<ServerWithMembersWithUsersAndChannels> => {
    const response: AxiosResponse = await apiClient.patch(
      `/channels/${channelId}?serverId=${serverId}`,
      { name, type }
    );
    return response.data;
  },

  deleteChannel: async (channelId: string, serverId: string) => {
    await apiClient.delete(`/channels/${channelId}?serverId=${serverId}`);
  },
};
