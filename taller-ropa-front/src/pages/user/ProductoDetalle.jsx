import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import useProductos from "../../hooks/useProductos";
import { useCarrito } from "../../context/CarritoContext";
import { obtenerUrlImagen } from "../../services/imagenService";
import "./ProductoDetalle.css";

function ProductoDetalle() {
  const { id } = useParams();
  const { agregarCarrito } = useCarrito();
  const { productos, cargando, error } = useProductos();

  if (cargando) {
    return (
      <main className="product-detail-page">
        <p className="loading-text">Cargando producto...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="product-detail-page">
        <p className="error-text">{error}</p>
      </main>
    );
  }

  const producto = productos.find((item) => item.id === Number(id));

  if (!producto) {
    return (
      <main className="product-detail-page">
        <section className="product-not-found">
          <h1>Producto no encontrado</h1>
          <p>El producto que buscas no existe.</p>
          <Link to="/tienda">Volver a la tienda</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="product-detail-page">
      <section className="product-detail-container">
        <Link to="/tienda" className="back-link">
          <ArrowLeft size={18} />
          Volver a la tienda
        </Link>

        <div className="product-detail-card">
            <img src={obtenerUrlImagen(producto.imagen)} alt={producto.nombre} />

          <div className="product-detail-info">
            <span>{producto.categoria}</span>
            <h1>{producto.nombre}</h1>
            <p>{producto.descripcion}</p>

            <div className="product-extra-info">
              <div>
                <strong>Material</strong>
                <p>Algodón / tela suave</p>
              </div>

              <div>
                <strong>Disponibilidad</strong>
                <p>Disponible</p>
              </div>

              <div>
                <strong>Tallas</strong>
                <p>2, 4, 6, 8</p>
              </div>
            </div>

            <h2>${producto.precio}</h2>

            <button onClick={() => agregarCarrito(producto)}>
              <ShoppingCart size={19} />
              Agregar al carrito
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProductoDetalle;