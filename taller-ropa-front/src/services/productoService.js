import API_URL from "./api";

const API_BASE = API_URL.replace("/api", "");

const obtenerRutaImagen = (imagen) => {
  if (!imagen) return "";
  if (imagen.startsWith("http")) return imagen;
  if (imagen.startsWith("/productos/")) return imagen;
  return `${API_BASE}/uploads/${imagen}`;
};

export const obtenerProductos = async () => {
  const respuesta = await fetch(`${API_URL}/productos`);

  if (!respuesta.ok) {
    throw new Error("Error al obtener productos");
  }

  const datos = await respuesta.json();

  return datos.map((producto) => ({
    id: producto.id_producto,
    nombre: producto.nombre,
    categoria: producto.categoria,
    descripcion: producto.descripcion,
    precio: Number(producto.precio),
    imagen: obtenerRutaImagen(producto.imagen),
    stock: producto.stock,
  }));
};