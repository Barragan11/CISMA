import API_URL from "./api";

const obtenerToken = () => localStorage.getItem("token");

const crearHeaders = () => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${obtenerToken()}`,
  };
};

const manejarRespuesta = async (respuesta, mensajeError) => {
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || mensajeError);
  }

  return datos;
};

export const obtenerMateriales = async () => {
  const respuesta = await fetch(`${API_URL}/inventario`, {
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  return manejarRespuesta(respuesta, "Error al obtener inventario");
};

export const crearMaterial = async (material) => {
  const respuesta = await fetch(`${API_URL}/inventario`, {
    method: "POST",
    headers: crearHeaders(),
    body: JSON.stringify(material),
  });

  return manejarRespuesta(respuesta, "Error al crear material");
};

export const actualizarMaterial = async (id, material) => {
  const respuesta = await fetch(`${API_URL}/inventario/${id}`, {
    method: "PUT",
    headers: crearHeaders(),
    body: JSON.stringify(material),
  });

  return manejarRespuesta(respuesta, "Error al actualizar material");
};

export const eliminarMaterial = async (id) => {
  const respuesta = await fetch(`${API_URL}/inventario/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  return manejarRespuesta(respuesta, "Error al eliminar material");
};

export const obtenerMovimientos = async () => {
  const respuesta = await fetch(`${API_URL}/inventario/movimientos/lista`, {
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  return manejarRespuesta(respuesta, "Error al obtener movimientos");
};

export const registrarMovimiento = async (movimiento) => {
  const respuesta = await fetch(`${API_URL}/inventario/movimientos`, {
    method: "POST",
    headers: crearHeaders(),
    body: JSON.stringify(movimiento),
  });

  return manejarRespuesta(respuesta, "Error al registrar movimiento");
};