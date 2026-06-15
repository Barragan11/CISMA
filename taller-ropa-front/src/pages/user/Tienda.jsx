import { useState } from "react";
import { useCarrito } from "../../context/CarritoContext";
import { Link } from "react-router-dom";
import { ShoppingCart, LogOut } from "lucide-react";
import useProductos from "../../hooks/useProductos";
import { useAuth } from "../../context/AuthContext";
import { obtenerUrlImagen } from "../../services/imagenService";
import "./Tienda.css";

function Tienda() {
  const { productos, cargando, error } = useProductos();
  const { carrito, agregarCarrito, total } = useCarrito();
  const { logout } = useAuth();

  const [categoriaActiva, setCategoriaActiva] = useState("Todas");

  const productosFiltrados =
    categoriaActiva === "Todas"
      ? productos
      : productos.filter((producto) => producto.categoria === categoriaActiva);

  return (
    <main className="shop-page">
      <nav className="shop-navbar">
        <h2>CISMA</h2>

        <div className="shop-actions">
          <Link to="/carrito">
            <ShoppingCart size={18} />
            {carrito.length} productos
          </Link>

          <Link to="/" onClick={logout}>
            <LogOut size={18} />
            Salir
          </Link>
        </div>
      </nav>

      <section className="shop-header">
        <div>
          <h1>Catálogo</h1>
          <p>
            Lo mejor de nuestra ropa infantil. Para agregar productos al carrito, haz clic en "Agregar" en cada producto. 
          </p>

          <div className="shop-filters">
            {["Todas", "Niña", "Niño", "Batita", "Conjunto", "Fiesta"].map(
              (categoria) => (
                <button
                  key={categoria}
                  className={categoriaActiva === categoria ? "active" : ""}
                  onClick={() => setCategoriaActiva(categoria)}
                >
                  {categoria}
                </button>
              )
            )}
          </div>
        </div>

        <div className="cart-box">
          <h3>Carrito</h3>
          <p>Total: ${total}</p>
        </div>
      </section>

      {cargando && <p className="shop-message">Cargando productos...</p>}
      {error && <p className="shop-message error">{error}</p>}

      {!cargando && (
        <section className="shop-grid">
          {productosFiltrados.map((producto) => (
            <article className="shop-card" key={producto.id}>
              <img src={obtenerUrlImagen(producto.imagen)} alt={producto.nombre} />

              <div className="shop-card-body">
                <span>{producto.categoria}</span>

                <h3>{producto.nombre}</h3>

                <p>{producto.descripcion}</p>

                <small>Disponibles: {producto.stock}</small>

                <div className="shop-card-footer">
                  <strong>${producto.precio}</strong>

                  <div className="shop-card-buttons">
                    <Link to={`/producto/${producto.id}`}>Ver detalle</Link>

                    <button onClick={() => agregarCarrito(producto)}>
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}

          {productosFiltrados.length === 0 && (
            <p className="shop-message">No hay productos en esta categoría.</p>
          )}
        </section>
      )}
    </main>
  );
}

export default Tienda;