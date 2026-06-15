import { Link } from "react-router-dom";
import useProductos from "../../hooks/useProductos";
import { obtenerUrlImagen } from "../../services/imagenService";
import "./Home.css";

function Home() {
  const { productos, cargando, error } = useProductos();

  return (
    <main className="public-home">
      <nav className="public-navbar">
        <div className="navbar-brand">
          <img src={obtenerUrlImagen("/logo-cisma.png")} alt="Logo CISMA" />

          <div>
            <h2>CISMA</h2>
            <span>Cooperativa Integral San Miguel El Alto</span>
          </div>
        </div>

        <div>
          <Link to="/">Inicio</Link>
          <Link to="/login">Iniciar sesión</Link>
        </div>
      </nav>

      <section className="public-hero">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-tag">
              Ropa infantil confeccionada con calidad
            </span>

            <h1>Moda infantil hecha con dedicación y experiencia</h1>

            <p>
              En CISMA elaboramos prendas infantiles cuidando cada detalle del
              proceso de confección. Nuestro catálogo muestra algunos de los
              modelos disponibles para niñas y niños.
            </p>

            <div className="hero-buttons">
              <Link className="hero-button" to="/login">
                Iniciar sesión
              </Link>

              <a href="#productos" className="hero-secondary">
                Ver catálogo
              </a>
            </div>
          </div>

          <div className="hero-image">
            <img src="/logo-cisma.png" alt="CISMA" />
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-card">
          <h2>Quiénes Somos</h2>

          <p>
            CISMA es una cooperativa dedicada a la confección de ropa infantil.
            Nuestro trabajo combina experiencia, organización y dedicación para
            entregar prendas de calidad a nuestros clientes.
          </p>
        </div>
      </section>

      <section className="public-products" id="productos">
        <div className="section-title">
          <h2>Nuestro Catálogo</h2>
          <p>Modelos infantiles disponibles actualmente.</p>
        </div>

        {cargando && <p className="loading-text">Cargando productos...</p>}
        {error && <p className="error-text">{error}</p>}

        {!cargando && !error && (
          <div className="product-grid">
            {productos.slice(0, 8).map((producto) => (
              <article className="public-product-card" key={producto.id}>
                <img src={producto.imagen} alt={producto.nombre} />

                <div>
                  <span>{producto.categoria}</span>
                  <h3>{producto.nombre}</h3>
                  <p>${producto.precio}</p>

                  <Link to="/login" className="login-to-view">
                    Inicia sesión para ver más
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="public-footer">
        <h3>CISMA</h3>
        <p>Cooperativa Integral San Miguel El Alto</p>
        <p>© 2026 CISMA. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}

export default Home;