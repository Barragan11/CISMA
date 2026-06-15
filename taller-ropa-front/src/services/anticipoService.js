import API_URL from "./api";

const obtenerToken = () => localStorage.getItem("token");

const crearHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${obtenerToken()}`,
});

const manejarRespuesta = async (respuesta, mensajeError) => {
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || mensajeError);
  }

  return datos;
};

export const obtenerAnticipos = async () => {
  const respuesta = await fetch(`${API_URL}/anticipos`, {
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  return manejarRespuesta(respuesta, "Error al obtener anticipos");
};

export const crearAnticipo = async (anticipo) => {
  const respuesta = await fetch(`${API_URL}/anticipos`, {
    method: "POST",
    headers: crearHeaders(),
    body: JSON.stringify(anticipo),
  });

  return manejarRespuesta(respuesta, "Error al crear anticipo");
};

export const actualizarAnticipo = async (id, anticipo) => {
  const respuesta = await fetch(`${API_URL}/anticipos/${id}`, {
    method: "PUT",
    headers: crearHeaders(),
    body: JSON.stringify(anticipo),
  });

  return manejarRespuesta(respuesta, "Error al actualizar anticipo");
};

export const eliminarAnticipo = async (id) => {
  const respuesta = await fetch(`${API_URL}/anticipos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  return manejarRespuesta(respuesta, "Error al descontar anticipo");
};