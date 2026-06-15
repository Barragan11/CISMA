import API_URL from "./api";

const BACKEND_URL = API_URL.replace("/api", "");

export const obtenerUrlImagen = (imagen) => {
  if (!imagen) return "";

  if (imagen.startsWith("http")) {
    return imagen;
  }

  if (imagen.startsWith("/uploads/")) {
    return `${BACKEND_URL}${imagen}`;
  }

  if (imagen.startsWith("/productos/")) {
    return imagen;
  }

  return `${BACKEND_URL}/uploads/${imagen}`;
};