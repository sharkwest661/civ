// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// React 19+ rendering
const container = document.getElementById("root");
const root = createRoot(container);

// Error handling for initial render
try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Error rendering application:", error);

  // Render fallback error message if App fails to render
  root.render(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        padding: "20px",
        backgroundColor: "#1a2634",
        color: "#e1e1e1",
        textAlign: "center",
      }}
    >
      <h1 style={{ color: "#e6c570", marginBottom: "20px" }}>
        Application Error
      </h1>
      <p style={{ maxWidth: "600px", marginBottom: "20px" }}>
        There was an error loading the application. Please try refreshing the
        page.
      </p>
      <pre
        style={{
          backgroundColor: "#131e2d",
          padding: "15px",
          borderRadius: "4px",
          overflowX: "auto",
          maxWidth: "100%",
          textAlign: "left",
        }}
      >
        {error.toString()}
      </pre>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: "20px",
          backgroundColor: "#e6c570",
          color: "#131e2d",
          border: "none",
          borderRadius: "4px",
          padding: "10px 20px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Reload Application
      </button>
    </div>
  );
}
