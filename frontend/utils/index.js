// Copied as-is from pan-verify
let company_id = null,
  config = null,
  application_id = null;

export const setCompany = (companyId) => (company_id = companyId);
export const getCompany = () => company_id;

export const setApplication = (applicationId) => (application_id = applicationId);
export const getApplication = () => application_id;

export const setConfig = (conf) => (config = conf);
export const getConfig = () => config;

export const DEBOUNCE_DELAY = 500;

export const debounce = (func, delay) => {
  let timerId;
  return function (e) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      func(e);
    }, delay);
  };
};
