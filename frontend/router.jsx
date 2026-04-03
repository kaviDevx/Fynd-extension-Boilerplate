import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import NotFound from "./pages/NotFound";

/**
 * Route structure follows Fynd's standard extension URL pattern:
 *   /company/:company_id          — company-level launch
 *   /company/:company_id/application/:application_id — app-level launch
 *
 * Both map to the same App component; use useParams() to distinguish context.
 */
const router = createBrowserRouter([
  {
    path: "/company/:company_id",
    element: <App />,
  },
  {
    path: "/company/:company_id/application/:application_id",
    element: <App />,
  },
  {
    path: "/*",
    element: <NotFound />,
  },
]);

export default router;
