import API_URL from "./api";

const obtenerToken = () => localStorage.getItem("token");

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${obtenerToken()}`,
});

const manejarRespuesta = async (respuesta, mensaje) => {
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || mensaje);
  }

  return datos;
};

export const obtenerEntregas = async () => {
  const respuesta = await fetch(`${API_URL}/entregas`, {
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  return manejarRespuesta(respuesta, "Error al obtener entregas");
};

export const crearEntrega = async (entrega) => {
  const respuesta = await fetch(`${API_URL}/entregas`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(entrega),
  });

  return manejarRespuesta(respuesta, "Error al registrar entrega");
};

export const eliminarEntrega = async (id) => {
  const respuesta = await fetch(`${API_URL}/entregas/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  return manejarRespuesta(respuesta, "Error al eliminar entrega");
};