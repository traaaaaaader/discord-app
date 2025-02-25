import { AxiosResponse } from "axios";
import apiClient from "@/api/api-client";
import { Member, MemberRole, MembersWithUser } from "@/types/servers";

export const MembersService = {
  getMember: async (memberId: string): Promise<Member> => {
    const response: AxiosResponse = await apiClient.get(
      `/members/${memberId}`
    );
    return response.data;
  },

  getMembers: async (serverId: string): Promise<MembersWithUser> => {
    const response: AxiosResponse = await apiClient.get(
      `/members`,{
        params: {
          serverId,
        }
      }
    );
    return response.data;
  },

  deleteMember: async (serverId: string, memberId: string) => {
    return await apiClient.delete(`/members/${memberId}?serverId=${serverId}`);
  },

  updateMember: async (
    serverId: string,
    memberId: string,
    role: MemberRole
  ) => {
    const response: AxiosResponse = await apiClient.patch(
      `/members/${memberId}?serverId=${serverId}`,
      role
    );
    return response.data;
  },
};
