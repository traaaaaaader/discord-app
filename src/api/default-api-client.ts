import axios, {
  AxiosInstance,
} from "axios";
import qs from "query-string";

const API_BASE_URL = "http://localhost:3000";

const defaultApiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => qs.stringify(params),
  withCredentials: true
});

defaultApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default defaultApiClient;
