import axios from "axios";
import urlJoin from "url-join";

// HOST_MAIN_URL is injected via /env.js endpoint served by the backend
// Falls back to window.location.origin for local Vite dev server
const BASE_URL =
  (typeof window !== "undefined" && window.env?.HOST_MAIN_URL) ||
  window.location.origin;

/**
 * Fetch company-level products.
 * Sends x-company-id header so the FDK auth middleware can resolve the session.
 */
export async function fetchProducts(company_id) {
  const { data } = await axios.get(urlJoin(BASE_URL, "/api/v1/products"), {
    headers: { "x-company-id": company_id },
  });
  return data;
}

/**
 * Fetch application-scoped products.
 */
export async function fetchApplicationProducts(application_id, company_id) {
  const { data } = await axios.get(
    urlJoin(BASE_URL, `/api/v1/products/application/${application_id}`),
    { headers: { "x-company-id": company_id } }
  );
  return data;
}
