// Copied from pan-verify — URL adapted to boilerplate route
import axios from "./axios.service.js";

export const getApplications = async (queryParams) => {
  return axios.get("/api/v1/sales-channels", {
    params: queryParams,
  });
};
