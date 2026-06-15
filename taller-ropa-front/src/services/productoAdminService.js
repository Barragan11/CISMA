import API_URL from "./api";

const obtenerToken = () => localStorage.getItem("token");

const manejarRespuesta = async (respuesta, mensajeError) => {
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || mensajeError);
  }

  return datos;
};

export const obtenerProductosAdmin = async () => {
  const respuesta = await fetch(`${API_URL}/productos`);

  return manejarRespuesta(respuesta, "Error al obtener productos");
};

export const crearProducto = async (producto) => {
  const formData = new FormData();

  formData.append("nombre", producto.nombre);
  formData.append("categoria", producto.categoria);
  formData.append("descripcion", producto.descripcion);
  formData.append("precio", producto.precio);
  formData.append("stock", producto.stock);

  if (producto.imagen) {
    formData.append("imagen", producto.imagen);
  }

  const respuesta = await fetch(`${API_URL}/productos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: formData,
  });

  return manejarRespuesta(respuesta, "Error al crear producto");
};

export const actualizarProducto = async (id, producto) => {
  const formData = new FormData();

  formData.append("nombre", producto.nombre);
  formData.append("categoria", producto.categoria);
  formData.append("descripcion", producto.descripcion);
  formData.append("precio", producto.precio);
  formData.append("stock", producto.stock);
  formData.append("imagenActual", producto.imagenActual || "");

  if (producto.imagen) {
    formData.append("imagen", producto.imagen);
  }

  const respuesta = await fetch(`${API_URL}/productos/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: formData,
  });

  return manejarRespuesta(respuesta, "Error al actualizar producto");
};

export const eliminarProducto = async (id) => {
  const respuesta = await fetch(`${API_URL}/productos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  return manejarRespuesta(respuesta, "Error al eliminar producto");
};