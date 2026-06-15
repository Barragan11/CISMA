import { useEffect, useState } from "react";
import { confirmarEliminar } from "../../utils/alerts";
import toast from "react-hot-toast";
import { obtenerAsignaciones } from "../../services/asignacionService";
import {
  obtenerEntregas,
  crearEntrega,
  eliminarEntrega,
} from "../../services/entregaService";
import "./AdminPages.css";

function Entregas() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [filtros, setFiltros] = useState({
    busqueda: "",
    id_asignacion: "",
    fecha_inicio: "",
    fecha_fin: "",
  });

  const formularioInicial = {
    id_asignacion: "",
    cantidad_entregada: "",
    fecha_entrega: "",
    observaciones: "",
  };

  const [formulario, setFormulario] = useState(formularioInicial);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [datosAsignaciones, datosEntregas] = await Promise.all([
        obtenerAsignaciones(),
        obtenerEntregas(),
      ]);

      setAsignaciones(datosAsignaciones);
      setEntregas(datosEntregas);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCargando(false);
    }
  };

  const cambiarDato = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  const cambiarFiltro = (e) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      id_asignacion: "",
      fecha_inicio: "",
      fecha_fin: "",
    });
  };

  const limpiarFormulario = () => {
    setFormulario(formularioInicial);
    setMostrarFormulario(false);
  };

  const abrirNuevaEntrega = () => {
    setFormulario(formularioInicial);
    setMostrarFormulario(true);
  };

  const registrarEntrega = async (e) => {
    e.preventDefault();

    try {
      await crearEntrega({
        id_asignacion: Number(formulario.id_asignacion),
        cantidad_entregada: Number(formulario.cantidad_entregada),
        fecha_entrega: formulario.fecha_entrega,
        observaciones: formulario.observaciones,
      });

      toast.success("Entrega registrada correctamente");
      limpiarFormulario();
      cargarDatos();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const borrarEntrega = async (id) => {
    const confirmado = await confirmarEliminar(
      "¿Eliminar entrega?",
      "La entrega será eliminada y se actualizará el avance de la asignación."
    );

    if (!confirmado) return;

    try {
      await eliminarEntrega(id);
      toast.success("Entrega eliminada correctamente");
      cargarDatos();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const asignacionesDisponibles = asignaciones.filter(
    (asignacion) => asignacion.estado !== "Terminado"
  );

  const entregasFiltradas = entregas.filter((entrega) => {
    const busqueda = filtros.busqueda.toLowerCase();

    const coincideBusqueda =
      entrega.empleado?.toLowerCase().includes(busqueda) ||
      entrega.nombre_prenda?.toLowerCase().includes(busqueda) ||
      entrega.observaciones?.toLowerCase().includes(busqueda);

    const coincideAsignacion = filtros.id_asignacion
      ? Number(entrega.id_asignacion) === Number(filtros.id_asignacion)
      : true;

    const fechaEntrega = entrega.fecha_entrega?.slice(0, 10);

    const coincideFechaInicio = filtros.fecha_inicio
      ? fechaEntrega >= filtros.fecha_inicio
      : true;

    const coincideFechaFin = filtros.fecha_fin
      ? fechaEntrega <= filtros.fecha_fin
      : true;

    return (
      coincideBusqueda &&
      coincideAsignacion &&
      coincideFechaInicio &&
      coincideFechaFin
    );
  });

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Entregas</h1>
          <p>Registro de entregas parciales realizadas por las empleadas.</p>
        </div>

        <div className="action-buttons">
          <button onClick={() => setMostrarFiltros(!mostrarFiltros)}>
            {mostrarFiltros ? "Ocultar filtros" : "Buscar"}
          </button>

          <button
            onClick={mostrarFormulario ? limpiarFormulario : abrirNuevaEntrega}
          >
            {mostrarFormulario ? "Cancelar" : "Nueva entrega"}
          </button>
        </div>
      </div>

      {mostrarFormulario && (
        <section className="page-card">
          <form className="admin-form-grid" onSubmit={registrarEntrega}>
            <select
              name="id_asignacion"
              value={formulario.id_asignacion}
              onChange={cambiarDato}
              required
            >
              <option value="">Selecciona asignación</option>

              {asignacionesDisponibles.map((asignacion) => (
                <option
                  key={asignacion.id_asignacion}
                  value={asignacion.id_asignacion}
                >
                  {asignacion.empleado} - {asignacion.nombre_prenda} (
                  {asignacion.cantidad_entregada}/
                  {asignacion.cantidad_asignada})
                </option>
              ))}
            </select>

            <input
              name="cantidad_entregada"
              placeholder="Cantidad entregada"
              type="number"
              value={formulario.cantidad_entregada}
              onChange={cambiarDato}
              required
            />

            <input
              name="fecha_entrega"
              type="date"
              value={formulario.fecha_entrega}
              onChange={cambiarDato}
              required
            />

            <input
              name="observaciones"
              placeholder="Observaciones"
              value={formulario.observaciones}
              onChange={cambiarDato}
            />

            <button type="submit">Registrar entrega</button>
          </form>
        </section>
      )}

      {mostrarFiltros && (
        <section className="page-card">
          <form className="admin-form-grid">
            <input
              name="busqueda"
              placeholder="Buscar por empleada, prenda u observación"
              value={filtros.busqueda}
              onChange={cambiarFiltro}
            />

            <select
              name="id_asignacion"
              value={filtros.id_asignacion}
              onChange={cambiarFiltro}
            >
              <option value="">Todas las asignaciones</option>
              {asignaciones.map((asignacion) => (
                <option
                  key={asignacion.id_asignacion}
                  value={asignacion.id_asignacion}
                >
                  {asignacion.empleado} - {asignacion.nombre_prenda}
                </option>
              ))}
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

      <section className="page-card">
        {cargando ? (
          <p>Cargando entregas...</p>
        ) : (
          <table className="page-table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Prenda</th>
                <th>Cantidad</th>
                <th>Fecha entrega</th>
                <th>Pago entrega</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {entregasFiltradas.map((entrega) => (
                <tr key={entrega.id_entrega}>
                  <td>{entrega.empleado}</td>
                  <td>{entrega.nombre_prenda}</td>
                  <td>{entrega.cantidad_entregada}</td>
                  <td>{entrega.fecha_entrega?.slice(0, 10)}</td>
                  <td>${entrega.pago_entrega}</td>
                  <td>{entrega.observaciones || "Sin observaciones"}</td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => borrarEntrega(entrega.id_entrega)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}

              {entregasFiltradas.length === 0 && (
                <tr>
                  <td colSpan="7">No hay entregas con esos filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Entregas;