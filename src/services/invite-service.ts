import { AxiosResponse } from "axios";
import apiClient from "@/api/api-client";
import {
  ServerWithMembersAndChannels,
  ServerWithMembersWithUsersAndChannels,
} from "@/utils/types/servers";

export const InviteService = {
  invite: async (
    inviteCode: string
  ): Promise<ServerWithMembersWithUsersAndChannels> => {
    const response: AxiosResponse =
      await apiClient.patch<ServerWithMembersWithUsersAndChannels>(
        `/invite/${inviteCode}`
      );
    return response.data;
  },

  update: async (serverId: string): Promise<ServerWithMembersAndChannels> => {
    const response = await apiClient.patch<ServerWithMembersAndChannels>(
      "/invite/invite-code",
      { serverId }
    );
    return response.data;
  },
};
