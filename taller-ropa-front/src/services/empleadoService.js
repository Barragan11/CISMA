import API_URL from "./api";

const obtenerToken = () => localStorage.getItem("token");

export const obtenerEmpleados = async () => {
  const respuesta = await fetch(`${API_URL}/empleados`, {
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Error al obtener empleados");
  }

  return datos;
};

export const crearEmpleado = async (empleado) => {
  const respuesta = await fetch(`${API_URL}/empleados`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: JSON.stringify(empleado),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Error al crear empleado");
  }

  return datos;
};

export const actualizarEmpleado = async (id, empleado) => {
  const respuesta = await fetch(`${API_URL}/empleados/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: JSON.stringify(empleado),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Error al actualizar empleado");
  }

  return datos;
};

export const eliminarEmpleado = async (id) => {
  const respuesta = await fetch(`${API_URL}/empleados/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Error al eliminar empleado");
  }

  return datos;
};