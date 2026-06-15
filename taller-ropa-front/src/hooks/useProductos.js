import { useEffect, useState } from "react";
import { obtenerProductos } from "../services/productoService";

function useProductos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setCargando(true);
        setError("");

        const datos = await obtenerProductos();
        setProductos(datos);
      } catch (error) {
        setError("Error al obtener productos");
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  return {
    productos,
    cargando,
    error,
  };
}

export default useProductos;