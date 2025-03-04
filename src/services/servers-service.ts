import { AxiosResponse } from "axios";
import apiClient from "@/api/api-client";
import {
  Server,
  ServerWithMembersAndChannels,
  ServerWithMembersWithUsersAndChannels,
} from "@/utils/types/servers";

export const ServersService = {
  getServer: async (
    serverId: string
  ): Promise<ServerWithMembersWithUsersAndChannels> => {
    const response: AxiosResponse = await apiClient.get<Server>(
      `/servers/${serverId}`
    );
    return response.data;
  },

  getServers: async (): Promise<ServerWithMembersAndChannels[]> => {
    const response = await apiClient.get<ServerWithMembersAndChannels[]>(
      "/servers"
    );
    return response.data;
  },

  createServer: async (name: string, imageUrl: string): Promise<Server> => {
    const response: AxiosResponse = await apiClient.post("/servers", {
      name,
      imageUrl,
    });
    return response.data;
  },

  updateServer: async (
    serverId: string,
    name: string,
    imageUrl: string
  ): Promise<Server> => {
    console.group(serverId, name, imageUrl);
    const response: AxiosResponse = await apiClient.patch(
      `/servers/${serverId}`,
      {
        name,
        imageUrl,
      }
    );
    return response.data;
  },

  deleteServer: async (serverId: string) => {
    await apiClient.delete(`/servers/${serverId}`);
  },
};
