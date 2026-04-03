// Copied as-is from pan-verify src/routes/index.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SalesChannelListing from "./pages/SalesChannels";
import ApplicationConfiguration from "./pages/application-configuration";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/company/:company_id" replace />} />
    <Route path="/company/:company_id" element={<SalesChannelListing />} />
    <Route
      path="/company/:company_id/application/:application_id"
      element={<ApplicationConfiguration />}
    />
  </Routes>
);

export default AppRoutes;
