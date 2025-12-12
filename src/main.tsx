import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { storage } from "./services/storage";

// Initialize mock data if storage is empty
storage.initializeData();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
