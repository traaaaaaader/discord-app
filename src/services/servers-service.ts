import { AxiosResponse } from "axios";
import apiClient from "@/api/api-client";
import {
  Server,
  ServerWithMembersAndChannels,
  ServerWithMembersWithUsersAndChannels,
} from "@/utils/types/servers";

export const ServersService = {
  get: async (
    serverId: string,
    accessToken: string
  ): Promise<ServerWithMembersWithUsersAndChannels> => {
    const response: AxiosResponse = await apiClient.get<Server>(
      `/servers/${serverId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  },

  getAll: async (
    accessToken: string
  ): Promise<ServerWithMembersAndChannels[]> => {
    const response = await apiClient.get<ServerWithMembersAndChannels[]>(
      "/servers",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  },

  create: async (
    name: string, 
    imageUrl: string,
    accessToken: string
  ): Promise<Server> => {
    const response: AxiosResponse = await apiClient.post(
      "/servers",
      {
        name,
        imageUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  },

  update: async (
    serverId: string,
    name: string,
    imageUrl: string,
    accessToken: string
  ): Promise<Server> => {
    const response: AxiosResponse = await apiClient.patch(
      `/servers/${serverId}`,
      {
        name,
        imageUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  },

  delete: async (
    serverId: string,
    accessToken: string
  ) => {
    await apiClient.delete(
      `/servers/${serverId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  },

  leave: async (
    serverId: string,
    accessToken: string
  ): Promise<void> => {
    await apiClient.patch(
      `/servers/${serverId}/leave`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  },
};
