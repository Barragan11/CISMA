import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CarritoProvider } from "./context/CarritoContext.jsx";
import "./styles/global.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CarritoProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,

              style: {
                background: "#102235",
                color: "#fff",
                borderRadius: "12px",
                padding: "16px",
              },

              success: {
                style: {
                  background: "#16a34a",
                },
              },

              error: {
                style: {
                  background: "#dc2626",
                },
              },
            }}
          />
        </CarritoProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);