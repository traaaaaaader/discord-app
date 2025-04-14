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
    serverId: string | undefined,
    accessToken: string
  ): Promise<Channel> => {
    const response: AxiosResponse = await apiClient.get(
      `/channels?channelId=${channelId}`,
      {
        params: {
          ...(serverId && { serverId }),
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  },

  getChannels: async (
    serverId: string,
    accessToken: string
  ): Promise<Channel[]> => {
    const response: AxiosResponse = await apiClient.get("/channels", {
      params: {
        serverId,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },

  createChannel: async (
    serverId: string,
    name: string,
    type: ChannelType,
    accessToken: string
  ): Promise<ServerWithMembersWithUsersAndChannels> => {
    const response: AxiosResponse = await apiClient.post(
      `/channels?serverId=${serverId}`,
      { name, type },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  },

  updateChannel: async (
    channelId: string,
    serverId: string,
    name: string,
    type: ChannelType,
    accessToken: string
  ): Promise<ServerWithMembersWithUsersAndChannels> => {
    const response: AxiosResponse = await apiClient.patch(
      `/channels/${channelId}?serverId=${serverId}`,
      { name, type },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  },

  deleteChannel: async (
    channelId: string, 
    serverId: string,
    accessToken: string
  ) => {
    await apiClient.delete(
      `/channels/${channelId}?serverId=${serverId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  },
};
