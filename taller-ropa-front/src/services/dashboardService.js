import API_URL from "./api";

const obtenerToken = () => localStorage.getItem("token");

export const obtenerDashboard = async () => {
  const respuesta = await fetch(`${API_URL}/dashboard`, {
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Error al obtener dashboard");
  }

  return datos;
};