import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";

const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState([]);

  const agregarCarrito = (producto) => {
  setCarrito([...carrito, producto]);
  toast.success(`${producto.nombre} agregado al carrito`);
};

  const eliminarDelCarrito = (id) => {
  const index = carrito.findIndex((producto) => producto.id === id);

  if (index !== -1) {
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    setCarrito(nuevoCarrito);
    toast.error("Producto eliminado del carrito");
  }
};

  const vaciarCarrito = () => {
  setCarrito([]);
  toast("Carrito vaciado");
};

  const total = carrito.reduce((suma, producto) => suma + producto.precio, 0);

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        agregarCarrito,
        eliminarDelCarrito,
        vaciarCarrito,
        total,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

CarritoProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useCarrito() {
  return useContext(CarritoContext);
}