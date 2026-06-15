import { Link } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { useCarrito } from "../../context/CarritoContext";
import { crearVenta } from "../../services/ventaService";
import "./Carrito.css";

function Carrito() {
  const { carrito, eliminarDelCarrito, vaciarCarrito, total } = useCarrito();

  const finalizarPedido = async () => {
    if (carrito.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    try {
      const productosVenta = carrito.map((producto) => ({
        id_producto: producto.id,
        cantidad: 1,
      }));

      await crearVenta(productosVenta);

      toast.success("Pedido registrado correctamente");
      vaciarCarrito();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <main className="cart-page">
      <section className="cart-container">
        <div className="cart-header">
          <div>
            <h1>Carrito de compras</h1>
            <p>Productos agregados por el usuario logueado.</p>
          </div>

          <Link to="/tienda">Seguir comprando</Link>
        </div>

        {carrito.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={52} />
            <h2>Tu carrito está vacío</h2>
            <p>Agrega productos desde la tienda.</p>
            <Link to="/tienda">Ir a la tienda</Link>
          </div>
        ) : (
          <div className="cart-grid">
            <section className="cart-list">
              {carrito.map((producto, index) => (
                <article className="cart-item" key={`${producto.id}-${index}`}>
                  <img src={producto.imagen} alt={producto.nombre} />

                  <div>
                    <span>{producto.categoria}</span>
                    <h3>{producto.nombre}</h3>
                    <p>${producto.precio}</p>
                  </div>

                  <button onClick={() => eliminarDelCarrito(producto.id)}>
                    <Trash2 size={18} />
                  </button>
                </article>
              ))}
            </section>

            <aside className="cart-summary">
              <h2>Resumen</h2>

              <div>
                <span>Productos</span>
                <strong>{carrito.length}</strong>
              </div>

              <div>
                <span>Total</span>
                <strong>${total}</strong>
              </div>

              <button onClick={finalizarPedido}>Finalizar pedido</button>

              <button className="clear-cart" onClick={vaciarCarrito}>
                Vaciar carrito
              </button>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

export default Carrito;