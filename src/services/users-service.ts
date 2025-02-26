import { AxiosResponse } from "axios";
import apiClient from "@/api/api-client";

export const UsersService = {
  get: async () => {
    const response = await apiClient.get("/users/get");
    return response.data;
  },

	edit: async (name: string, imageUrl: string) => {
		console.log(name, imageUrl)
    const response: AxiosResponse = await apiClient.post("/users/edit", {
      name,
      imageUrl,
    });
		console.log(response)
    return response.data;
  },
}