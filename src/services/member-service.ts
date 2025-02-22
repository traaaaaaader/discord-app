import { AxiosResponse } from "axios";
import AuthApiClient from "@/api/auth-api-client";
import { Member, MemberRole, MembersWithUser } from "@/types/servers";

export const MembersService = {
  getMember: async (memberId: string): Promise<Member> => {
    const response: AxiosResponse = await AuthApiClient.get(
      `/members/${memberId}`
    );
    return response.data;
  },

  getMembers: async (serverId: string): Promise<MembersWithUser> => {
    const response: AxiosResponse = await AuthApiClient.get(
      `/members`,{
        params: {
          serverId,
        }
      }
    );
    return response.data;
  },

  deleteMember: async (serverId: string, memberId: string) => {
    return await AuthApiClient.delete(`/members/${memberId}?serverId=${serverId}`);
  },

  updateMember: async (
    serverId: string,
    memberId: string,
    role: MemberRole
  ) => {
    const response: AxiosResponse = await AuthApiClient.patch(
      `/members/${memberId}?serverId=${serverId}`,
      role
    );
    return response.data;
  },
};
