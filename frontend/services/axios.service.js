// Copied as-is from pan-verify
import axios from "axios";
import { getCompany } from "../utils/index.js";

axios.defaults.baseURL = window.location.origin || "";

const axiosInstance = axios.create({
  headers: {
    "x-company-id": undefined,
  },
});

axiosInstance.interceptors.request.use((config) => {
  if (config && config.headers) {
    config.headers["x-company-id"] = getCompany();
  }
  return config;
});

export default axiosInstance;
