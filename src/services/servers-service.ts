import { AxiosResponse } from "axios";
import authApiClient from "@/api/auth-api-client";
import { Server, ServerWithMembersWithUsersAndChannels } from "@/types/servers";

export const ServersService = {
  getServer: async (serverId: string): Promise<ServerWithMembersWithUsersAndChannels> => {
    const response: AxiosResponse = await authApiClient.get<Server>(
      `/servers/${serverId}`
    );
    return response.data;
  },

  getServers: async (): Promise<Server[]> => {
    const response = await authApiClient.get<Server[]>("/servers");
    return response.data;
  },

  createServer: async (name: string, imageUrl: string): Promise<Server> => {
    const response: AxiosResponse = await authApiClient.post("/servers", {
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
    console.group(serverId, name, imageUrl)
    const response: AxiosResponse = await authApiClient.patch(
      `/servers/${serverId}`,
      {
        name,
        imageUrl
      }
    );
    return response.data;
  },

  deleteServer: async (serverId: string) => {
    await authApiClient.delete(`/servers/${serverId}`);
  },
};
