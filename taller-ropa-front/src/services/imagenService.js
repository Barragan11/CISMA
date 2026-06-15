import API_URL from "./api";

const BACKEND_URL = API_URL.replace("/api", "");

export const obtenerUrlImagen = (imagen) => {
  if (!imagen) return "";

  if (imagen.startsWith("http")) {
    return imagen;
  }

  const rutaLimpia = imagen.replace(/^\/+/, "");

  if (rutaLimpia.startsWith("uploads/")) {
    return `${BACKEND_URL}/${rutaLimpia}`;
  }

  if (rutaLimpia.startsWith("productos/")) {
    return `/${rutaLimpia}`;
  }

  return `${BACKEND_URL}/uploads/${rutaLimpia}`;
};