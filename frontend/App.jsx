import React from "react";
import { useParams } from "react-router-dom";
import Home from "./pages/Home";

/**
 * Root application component.
 * Reads company_id and application_id from route params.
 * Pass these down to child components that need to make API calls.
 */
function App() {
  const { company_id, application_id } = useParams();

  return (
    <div className="app">
      <Home company_id={company_id} application_id={application_id} />
    </div>
  );
}

export default App;
