import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
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

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  return config;
});

export default apiClient;
