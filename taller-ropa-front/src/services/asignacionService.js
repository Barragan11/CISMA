import API_URL from "./api";

const obtenerToken = () => localStorage.getItem("token");

export const obtenerAsignaciones = async () => {
  const respuesta = await fetch(`${API_URL}/asignaciones`, {
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Error al obtener asignaciones");
  }

  return datos;
};

export const crearAsignacion = async (asignacion) => {
  const respuesta = await fetch(`${API_URL}/asignaciones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: JSON.stringify(asignacion),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Error al crear asignación");
  }

  return datos;
};

export const actualizarAsignacion = async (id, asignacion) => {
  const respuesta = await fetch(`${API_URL}/asignaciones/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: JSON.stringify(asignacion),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Error al actualizar asignación");
  }

  return datos;
};

export const eliminarAsignacion = async (id) => {
  const respuesta = await fetch(`${API_URL}/asignaciones/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Error al eliminar asignación");
  }

  return datos;
};