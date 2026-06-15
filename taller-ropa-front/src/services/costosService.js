import API_URL from "./api";

const obtenerToken = () => localStorage.getItem("token");

export const obtenerCostosGanancia = async () => {
  const respuesta = await fetch(`${API_URL}/costos-ganancia`, {
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Error al obtener costos y ganancia");
  }

  return datos;
};