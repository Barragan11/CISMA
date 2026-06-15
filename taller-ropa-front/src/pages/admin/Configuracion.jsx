import "./AdminPages.css";

function Configuracion() {
  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Configuración</h1>
          <p>Datos generales del sistema y usuarios.</p>
        </div>
        <button>Guardar cambios</button>
      </div>

      <section className="page-card">
        <div className="admin-form-grid">
          <input placeholder="Nombre del taller" />
          <input placeholder="Correo de contacto" />
          <input placeholder="Teléfono" />
          <button>Guardar</button>
        </div>
      </section>
    </div>
  );
}

export default Configuracion;
