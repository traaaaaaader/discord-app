import { AxiosResponse } from "axios";
import apiClient from "@/api/api-client";
import { Member, MemberRole, MembersWithUser } from "@/utils/types/servers";

export const MembersService = {
  getMember: async (
    memberId: string,
    accessToken: string
  ): Promise<Member> => {
    const response: AxiosResponse = await apiClient.get(
      `/members/${memberId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  },

  getMembers: async (
    serverId: string,
    accessToken: string
  ): Promise<MembersWithUser> => {
    const response: AxiosResponse = await apiClient.get(
      `/members`,
      {
        params: {
          serverId,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  },

  deleteMember: async (
    serverId: string, 
    memberId: string,
    accessToken: string
  ) => {
    return await apiClient.delete(
      `/members/${memberId}?serverId=${serverId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  },

  updateMember: async (
    serverId: string,
    memberId: string,
    role: MemberRole,
    accessToken: string
  ) => {
    const response: AxiosResponse = await apiClient.patch(
      `/members/${memberId}?serverId=${serverId}`,
      { role },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  },
};
