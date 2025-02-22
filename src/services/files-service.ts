import { AxiosResponse } from "axios";
import defaultApiClient from "../api/default-api-client";

export const FilesService = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response: AxiosResponse = await defaultApiClient.post(
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
    await defaultApiClient.delete(`/files/${fileName}`);
  },
};
