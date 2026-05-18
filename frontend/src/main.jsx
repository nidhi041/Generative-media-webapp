import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#1a1a24",
          color: "#f4f4f8",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "0.75rem",
          fontSize: "0.875rem",
        },
        success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
        error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
      }}
    />
  </React.StrictMode>
);
