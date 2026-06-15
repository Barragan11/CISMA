import API_URL from "./api";

const BACKEND_URL = API_URL.replace("/api", "");

export const obtenerUrlImagen = (imagen) => {
  if (!imagen) return "";

  // Limpia espacios
  const imagenLimpia = imagen.trim();

  // Si viene guardada con localhost, la convertimos a Render
  if (
    imagenLimpia.startsWith("http://localhost:3000/uploads/") ||
    imagenLimpia.startsWith("https://localhost:3000/uploads/")
  ) {
    const nombreArchivo = imagenLimpia.split("/uploads/")[1];
    return `${BACKEND_URL}/uploads/${nombreArchivo}`;
  }

  // Si viene con 127.0.0.1 también lo corregimos
  if (
    imagenLimpia.startsWith("http://127.0.0.1:3000/uploads/") ||
    imagenLimpia.startsWith("https://127.0.0.1:3000/uploads/")
  ) {
    const nombreArchivo = imagenLimpia.split("/uploads/")[1];
    return `${BACKEND_URL}/uploads/${nombreArchivo}`;
  }

  // Si ya es una URL válida de producción, se queda igual
  if (imagenLimpia.startsWith("http")) {
    return imagenLimpia;
  }

  // Quita diagonales iniciales
  const rutaLimpia = imagenLimpia.replace(/^\/+/, "");

  // Si ya trae uploads/
  if (rutaLimpia.startsWith("uploads/")) {
    return `${BACKEND_URL}/${rutaLimpia}`;
  }

  // Si solo viene el nombre del archivo
  return `${BACKEND_URL}/uploads/${rutaLimpia}`;
};