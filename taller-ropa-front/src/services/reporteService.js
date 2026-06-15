import API_URL from "./api";

const obtenerToken = () => localStorage.getItem("token");

const manejarRespuesta = async (respuesta, mensajeError) => {
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || mensajeError);
  }

  return datos;
};

export const obtenerReporteEmpleado = async ({
  id_empleado,
  fecha_inicio,
  fecha_fin,
}) => {
  const params = new URLSearchParams({
    id_empleado,
    fecha_inicio,
    fecha_fin,
  });

  const respuesta = await fetch(`${API_URL}/reportes/empleado?${params}`, {
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  return manejarRespuesta(respuesta, "Error al generar reporte por empleado");
};

export const obtenerReporteProduccion = async ({ fecha_inicio, fecha_fin }) => {
  const params = new URLSearchParams({
    fecha_inicio,
    fecha_fin,
  });

  const respuesta = await fetch(`${API_URL}/reportes/produccion?${params}`, {
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  return manejarRespuesta(respuesta, "Error al generar reporte de producción");
};

export const obtenerReporteInventarioBajo = async () => {
  const respuesta = await fetch(`${API_URL}/reportes/inventario-bajo`, {
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  return manejarRespuesta(respuesta, "Error al obtener inventario bajo");
};

export const obtenerReporteVentas = async ({ fecha_inicio, fecha_fin }) => {
  const params = new URLSearchParams({
    fecha_inicio,
    fecha_fin,
  });

  const respuesta = await fetch(`${API_URL}/reportes/ventas?${params}`, {
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  return manejarRespuesta(respuesta, "Error al generar reporte de ventas");
};

export const obtenerReporteCorte = async ({ id_corte }) => {
  const params = new URLSearchParams({
    id_corte,
  });

  const respuesta = await fetch(`${API_URL}/reportes/corte?${params}`, {
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  return manejarRespuesta(respuesta, "Error al generar reporte por corte");
};