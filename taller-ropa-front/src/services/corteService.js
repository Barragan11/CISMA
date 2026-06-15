import API_URL from "./api";

const obtenerToken = () => localStorage.getItem("token");

export const obtenerCortes = async () => {
  const respuesta = await fetch(`${API_URL}/cortes`, {
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Error al obtener cortes");
  }

  return datos;
};

export const crearCorte = async (corte) => {
  const respuesta = await fetch(`${API_URL}/cortes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: JSON.stringify(corte),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Error al crear corte");
  }

  return datos;
};

export const actualizarCorte = async (id, corte) => {
  const respuesta = await fetch(`${API_URL}/cortes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: JSON.stringify(corte),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Error al actualizar corte");
  }

  return datos;
};

export const eliminarCorte = async (id) => {
  const respuesta = await fetch(`${API_URL}/cortes/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Error al cancelar corte");
  }

  return datos;
};