import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import qs from "query-string";

const API_BASE_URL = "http://localhost:3000";

const authApiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => qs.stringify(params),
  withCredentials: true,
});

authApiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  return config;
});

export default authApiClient;
