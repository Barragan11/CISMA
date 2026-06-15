import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f4f7fb",
        textAlign: "center",
        padding: "30px",
      }}
    >
      <section>
        <h1 style={{ fontSize: "70px", color: "#1677e8" }}>404</h1>
        <h2 style={{ color: "#102235", marginBottom: "10px" }}>
          Página no encontrada
        </h2>
        <p style={{ color: "#6b7280", marginBottom: "25px" }}>
          La ruta que intentaste abrir no existe en el sistema.
        </p>

        <Link
          to="/"
          style={{
            background: "#1677e8",
            color: "white",
            padding: "12px 18px",
            borderRadius: "12px",
            fontWeight: "bold",
          }}
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}

export default NotFound;