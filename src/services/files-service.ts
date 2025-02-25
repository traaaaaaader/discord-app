import { AxiosResponse } from "axios";
import apiClient from "@/api/api-client";

export const FilesService = {
  uploadFile: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response: AxiosResponse = await apiClient.post(
      "/files",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  deleteFile: async (fileName: string) => {
    await apiClient.delete(`/files/${fileName}`);
  },
};
