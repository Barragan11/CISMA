import API_URL from "./api";

const obtenerToken = () => localStorage.getItem("token");

const manejarRespuesta = async (respuesta, mensajeError) => {
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || mensajeError);
  }

  return datos;
};

export const crearVenta = async (productos) => {
  const respuesta = await fetch(`${API_URL}/ventas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: JSON.stringify({ productos }),
  });

  return manejarRespuesta(respuesta, "Error al crear venta");
};

export const obtenerMisCompras = async () => {
  const respuesta = await fetch(`${API_URL}/ventas/mis-compras`, {
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  return manejarRespuesta(respuesta, "Error al obtener tus compras");
};

export const obtenerVentas = async () => {
  const respuesta = await fetch(`${API_URL}/ventas`, {
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  return manejarRespuesta(respuesta, "Error al obtener ventas");
};

export const obtenerDetalleVenta = async (idVenta) => {
  const respuesta = await fetch(`${API_URL}/ventas/${idVenta}/detalle`, {
    headers: {
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  return manejarRespuesta(respuesta, "Error al obtener detalle de venta");
};