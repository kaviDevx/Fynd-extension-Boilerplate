// Copied from pan-verify — URL adapted to boilerplate route, extension_active → is_active
import axios from "./axios.service.js";

export const toggleExtensionActive = async (applicationId, toggleValue, company_id) => {
  await axios.get(`/api/v1/sales-channels/${applicationId}`);
  return axios.post(`/api/v1/sales-channels/${applicationId}`, {
    application_id: applicationId,
    is_active: toggleValue,
    company_id: company_id,
  });
};

export const getApplicationById = async (applicationId) => {
  return axios.get(`/api/v1/sales-channels/${applicationId}`);
};
