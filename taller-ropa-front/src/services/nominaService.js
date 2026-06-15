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

export const obtenerNominas = async () => {
  const respuesta = await fetch(`${API_URL}/nominas`, {
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  return manejarRespuesta(respuesta, "Error al obtener nóminas");
};

export const generarNomina = async (nomina) => {
  const respuesta = await fetch(`${API_URL}/nominas/generar`, {
    method: "POST",
    headers: crearHeaders(),
    body: JSON.stringify(nomina),
  });

  return manejarRespuesta(respuesta, "Error al generar nómina");
};

export const pagarNomina = async (id) => {
  const respuesta = await fetch(`${API_URL}/nominas/${id}/pagar`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  return manejarRespuesta(respuesta, "Error al pagar nómina");
};