// Copied as-is from pan-verify src/App.tsx
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Routes from "./router";

const App = () => (
  <>
    <Routes />
    <ToastContainer position="top-right" autoClose={3000} />
  </>
);

export default App;
