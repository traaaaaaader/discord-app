import { AxiosResponse } from "axios";
import apiClient from "@/api/api-client";

export const UsersService = {
  get: async (accessToken: string) => {
    const response = await apiClient.get(
      "/users/get",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  },

	edit: async (
    name: string, 
    imageUrl: string,
    accessToken: string
  ) => {
		console.log(name, imageUrl)
    const response: AxiosResponse = await apiClient.post(
      "/users/edit",
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
		console.log(response)
    return response.data;
  },
}