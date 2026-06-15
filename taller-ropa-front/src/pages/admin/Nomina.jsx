import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  obtenerNominas,
  generarNomina,
  pagarNomina,
} from "../../services/nominaService";
import { obtenerEmpleados } from "../../services/empleadoService";
import { confirmarEliminar } from "../../utils/alerts";
import "./AdminPages.css";

function Nomina() {
  const [nominas, setNominas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [detalleGenerado, setDetalleGenerado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [filtros, setFiltros] = useState({
    id_empleado: "",
    estado: "",
    fecha_inicio: "",
    fecha_fin: "",
  });

  const [formulario, setFormulario] = useState({
    id_empleado: "",
    fecha_inicio: "",
    fecha_fin: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [datosNominas, datosEmpleados] = await Promise.all([
        obtenerNominas(),
        obtenerEmpleados(),
      ]);

      setNominas(datosNominas);
      setEmpleados(datosEmpleados);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCargando(false);
    }
  };

  const cambiarDato = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  const cambiarFiltro = (e) => {
    const { name, value } = e.target;

    setFiltros({
      ...filtros,
      [name]: value,
    });
  };

  const limpiarFiltros = () => {
    setFiltros({
      id_empleado: "",
      estado: "",
      fecha_inicio: "",
      fecha_fin: "",
    });
  };

  const limpiarFormulario = () => {
    setFormulario({
      id_empleado: "",
      fecha_inicio: "",
      fecha_fin: "",
    });

    setMostrarFormulario(false);
  };

  const abrirGenerarNomina = () => {
    setFormulario({
      id_empleado: "",
      fecha_inicio: "",
      fecha_fin: "",
    });

    setMostrarFormulario(true);
  };

  const generar = async (e) => {
    e.preventDefault();

    try {
      const resultado = await generarNomina({
        id_empleado: Number(formulario.id_empleado),
        fecha_inicio: formulario.fecha_inicio,
        fecha_fin: formulario.fecha_fin,
      });

      setDetalleGenerado(resultado);

      toast.success("Nómina generada correctamente");
      limpiarFormulario();
      cargarDatos();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const pagar = async (id) => {
    const confirmado = await confirmarEliminar(
      "¿Pagar nómina?",
      "La nómina cambiará a estado pagada."
    );

    if (!confirmado) return;

    try {
      await pagarNomina(id);
      toast.success("Nómina pagada correctamente");
      cargarDatos();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const claseEstado = (estado) => {
    if (estado === "Pendiente") {
      return "estado-badge estado-pendiente";
    }

    return "estado-badge estado-terminado";
  };

  const nominasFiltradas = nominas.filter((nomina) => {
    const coincideEmpleado = filtros.id_empleado
      ? Number(nomina.id_empleado) === Number(filtros.id_empleado)
      : true;

    const coincideEstado = filtros.estado
      ? nomina.estado === filtros.estado
      : true;

    const fechaInicioNomina = nomina.fecha_inicio?.slice(0, 10);
    const fechaFinNomina = nomina.fecha_fin?.slice(0, 10);

    const coincideFechaInicio = filtros.fecha_inicio
      ? fechaFinNomina >= filtros.fecha_inicio
      : true;

    const coincideFechaFin = filtros.fecha_fin
      ? fechaInicioNomina <= filtros.fecha_fin
      : true;

    return (
      coincideEmpleado &&
      coincideEstado &&
      coincideFechaInicio &&
      coincideFechaFin
    );
  });

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Nómina</h1>
          <p>Cálculo de pagos por empleada, anticipos y entregas realizadas.</p>
        </div>

        <div className="action-buttons">
          <button onClick={() => setMostrarFiltros(!mostrarFiltros)}>
            {mostrarFiltros ? "Ocultar filtros" : "Buscar"}
          </button>

          <button
            onClick={mostrarFormulario ? limpiarFormulario : abrirGenerarNomina}
          >
            {mostrarFormulario ? "Cancelar" : "Generar nómina"}
          </button>
        </div>
      </div>

      {mostrarFormulario && (
        <section className="page-card">
          <h2 style={{ color: "#102235", marginBottom: "14px" }}>
            Generar nómina
          </h2>

          <form className="admin-form-grid" onSubmit={generar}>
            <select
              name="id_empleado"
              value={formulario.id_empleado}
              onChange={cambiarDato}
              required
            >
              <option value="">Selecciona empleada</option>

              {empleados.map((empleado) => (
                <option key={empleado.id_empleado} value={empleado.id_empleado}>
                  {empleado.nombre}
                </option>
              ))}
            </select>

            <input
              type="date"
              name="fecha_inicio"
              value={formulario.fecha_inicio}
              onChange={cambiarDato}
              required
            />

            <input
              type="date"
              name="fecha_fin"
              value={formulario.fecha_fin}
              onChange={cambiarDato}
              required
            />

            <button type="submit">Generar</button>
          </form>
        </section>
      )}

      {mostrarFiltros && (
        <section className="page-card">
          <form className="admin-form-grid">
            <select
              name="id_empleado"
              value={filtros.id_empleado}
              onChange={cambiarFiltro}
            >
              <option value="">Todas las empleadas</option>

              {empleados.map((empleado) => (
                <option key={empleado.id_empleado} value={empleado.id_empleado}>
                  {empleado.nombre}
                </option>
              ))}
            </select>

            <select
              name="estado"
              value={filtros.estado}
              onChange={cambiarFiltro}
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Pagada">Pagada</option>
            </select>

            <input
              type="date"
              name="fecha_inicio"
              value={filtros.fecha_inicio}
              onChange={cambiarFiltro}
            />

            <input
              type="date"
              name="fecha_fin"
              value={filtros.fecha_fin}
              onChange={cambiarFiltro}
            />

            <button type="button" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          </form>
        </section>
      )}

      {detalleGenerado && (
        <section className="page-card">
          <h2 style={{ color: "#102235", marginBottom: "14px" }}>
            Detalle de nómina generada
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "14px",
              marginBottom: "20px",
            }}
          >
            <div className="page-card" style={{ boxShadow: "none" }}>
              <p style={{ color: "#6b7280" }}>Total producido</p>
              <h2 style={{ color: "#102235" }}>
                ${detalleGenerado.total_producido}
              </h2>
            </div>

            <div className="page-card" style={{ boxShadow: "none" }}>
              <p style={{ color: "#6b7280" }}>Anticipos descontados</p>
              <h2 style={{ color: "#b42318" }}>
                ${detalleGenerado.total_anticipos}
              </h2>
            </div>

            <div className="page-card" style={{ boxShadow: "none" }}>
              <p style={{ color: "#6b7280" }}>Total a pagar</p>
              <h2 style={{ color: "#1677e8" }}>
                ${detalleGenerado.total_pagar}
              </h2>
            </div>
          </div>

          <h3 style={{ color: "#102235", marginBottom: "12px" }}>
            Entregas pagadas
          </h3>

          {detalleGenerado.detalle_entregas?.length > 0 ? (
            <table className="page-table">
              <thead>
                <tr>
                  <th>Prenda</th>
                  <th>Fecha entrega</th>
                  <th>Cantidad entregada</th>
                  <th>Pago por pieza</th>
                  <th>Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {detalleGenerado.detalle_entregas.map((entrega, index) => (
                  <tr key={index}>
                    <td>{entrega.nombre_prenda}</td>
                    <td>{entrega.fecha_entrega?.slice(0, 10)}</td>
                    <td>{entrega.cantidad_entregada}</td>
                    <td>${entrega.pago_por_pieza}</td>
                    <td>${entrega.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay entregas registradas en este periodo.</p>
          )}

          <button
            className="btn-delete"
            style={{ marginTop: "18px" }}
            onClick={() => setDetalleGenerado(null)}
          >
            Cerrar detalle
          </button>
        </section>
      )}

      <section className="page-card">
        <h2 style={{ color: "#102235", marginBottom: "14px" }}>
          Nóminas generadas
        </h2>

        {cargando ? (
          <p>Cargando nóminas...</p>
        ) : (
          <table className="page-table">
            <thead>
              <tr>
                <th>Empleada</th>
                <th>Fecha inicio</th>
                <th>Fecha fin</th>
                <th>Producción</th>
                <th>Anticipos</th>
                <th>Total a pagar</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {nominasFiltradas.map((nomina) => (
                <tr key={nomina.id_nomina}>
                  <td>{nomina.empleado}</td>
                  <td>{nomina.fecha_inicio?.slice(0, 10)}</td>
                  <td>{nomina.fecha_fin?.slice(0, 10)}</td>
                  <td>${nomina.total_producido}</td>
                  <td>${nomina.total_anticipos}</td>
                  <td>${nomina.total_pagar}</td>
                  <td>
                    <span className={claseEstado(nomina.estado)}>
                      {nomina.estado}
                    </span>
                  </td>
                  <td>
                    {nomina.estado === "Pendiente" ? (
                      <button
                        className="btn-edit"
                        onClick={() => pagar(nomina.id_nomina)}
                      >
                        Pagar
                      </button>
                    ) : (
                      <span>Sin acciones</span>
                    )}
                  </td>
                </tr>
              ))}

              {nominasFiltradas.length === 0 && (
                <tr>
                  <td colSpan="8">No hay nóminas con esos filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Nomina;