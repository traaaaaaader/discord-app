import { AxiosResponse } from "axios";
import apiClient from "@/api/api-client";
import {
  ServerWithMembersAndChannels,
  ServerWithMembersWithUsersAndChannels,
} from "@/utils/types/servers";

export const InviteService = {
  invite: async (
    inviteCode: string,
    accessToken: string
  ): Promise<ServerWithMembersWithUsersAndChannels> => {
    const response: AxiosResponse =
      await apiClient.patch<ServerWithMembersWithUsersAndChannels>(
        `/invite/${inviteCode}`,
        {},
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
    accessToken: string
  ): Promise<ServerWithMembersAndChannels> => {
    const response = await apiClient.patch<ServerWithMembersAndChannels>(
      "/invite/invite-code",
      { serverId },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  },
};
