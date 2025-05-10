import axios, { AxiosInstance, AxiosResponse } from "axios";
import qs from "query-string";

const API_BASE_URL = "http://localhost:3000";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => qs.stringify(params),
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error)) {
      if (error.status === 401) {
        const response: AxiosResponse<{ accessToken: string }> =
          await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );

        if (response.data.accessToken) {
          localStorage.setItem("accessToken", response.data.accessToken);
        } else {
          localStorage.removeItem("accessToken");
        }
      }
    }
  }
);

export default apiClient;
