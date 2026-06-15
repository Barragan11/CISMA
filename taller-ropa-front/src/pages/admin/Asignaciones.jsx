import { useEffect, useState } from "react";
import { confirmarEliminar } from "../../utils/alerts";
import toast from "react-hot-toast";
import {
  obtenerAsignaciones,
  crearAsignacion,
  actualizarAsignacion,
  eliminarAsignacion,
} from "../../services/asignacionService";
import { obtenerEmpleados } from "../../services/empleadoService";
import { obtenerCortes } from "../../services/corteService";
import "./AdminPages.css";

function Asignaciones() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [cortes, setCortes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [filtros, setFiltros] = useState({
    id_empleado: "",
    id_corte: "",
    estado: "",
  });

  const formularioInicial = {
    id_corte: "",
    id_empleado: "",
    cantidad_asignada: "",
    pago_por_pieza: "",
    estado: "Pendiente",
  };

  const [formulario, setFormulario] = useState(formularioInicial);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [datosAsignaciones, datosEmpleados, datosCortes] =
        await Promise.all([
          obtenerAsignaciones(),
          obtenerEmpleados(),
          obtenerCortes(),
        ]);

      setAsignaciones(datosAsignaciones);
      setEmpleados(datosEmpleados);
      setCortes(datosCortes.filter((corte) => corte.estado !== "Cancelado"));
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
      id_empleado: "",
      id_corte: "",
      estado: "",
    });
  };

  const limpiarFormulario = () => {
    setFormulario(formularioInicial);
    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const abrirNuevaAsignacion = () => {
    setFormulario(formularioInicial);
    setEditandoId(null);
    setMostrarFormulario(true);
  };

  const guardarAsignacion = async (e) => {
    e.preventDefault();

    try {
      const datosAsignacion = {
        id_corte: Number(formulario.id_corte),
        id_empleado: Number(formulario.id_empleado),
        cantidad_asignada: Number(formulario.cantidad_asignada),
        cantidad_entregada: 0,
        pago_por_pieza: Number(formulario.pago_por_pieza),
        estado: formulario.estado,
      };

      if (editandoId) {
        const asignacionActual = asignaciones.find(
          (asignacion) => asignacion.id_asignacion === editandoId
        );

        datosAsignacion.cantidad_entregada =
          asignacionActual?.cantidad_entregada || 0;

        await actualizarAsignacion(editandoId, datosAsignacion);
        toast.success("Asignación actualizada correctamente");
      } else {
        await crearAsignacion(datosAsignacion);
        toast.success("Asignación creada correctamente");
      }

      limpiarFormulario();
      cargarDatos();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cargarParaEditar = (asignacion) => {
    setEditandoId(asignacion.id_asignacion);
    setMostrarFormulario(true);

    setFormulario({
      id_corte: asignacion.id_corte,
      id_empleado: asignacion.id_empleado,
      cantidad_asignada: asignacion.cantidad_asignada,
      pago_por_pieza: asignacion.pago_por_pieza,
      estado: asignacion.estado,
    });
  };

  const borrarAsignacion = async (id) => {
    const confirmado = await confirmarEliminar(
      "¿Eliminar asignación?",
      "Esta asignación será eliminada del sistema."
    );

    if (!confirmado) return;

    try {
      await eliminarAsignacion(id);
      toast.success("Asignación eliminada correctamente");
      cargarDatos();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const obtenerClaseEstado = (estado) => {
    switch (estado) {
      case "Pendiente":
        return "estado-badge estado-pendiente";
      case "En proceso":
        return "estado-badge estado-proceso";
      case "Terminado":
        return "estado-badge estado-terminado";
      default:
        return "estado-badge";
    }
  };

  const asignacionesFiltradas = asignaciones.filter((asignacion) => {
    const coincideEmpleado = filtros.id_empleado
      ? Number(asignacion.id_empleado) === Number(filtros.id_empleado)
      : true;

    const coincideCorte = filtros.id_corte
      ? Number(asignacion.id_corte) === Number(filtros.id_corte)
      : true;

    const coincideEstado = filtros.estado
      ? asignacion.estado === filtros.estado
      : true;

    return coincideEmpleado && coincideCorte && coincideEstado;
  });

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Asignaciones</h1>
          <p>Asignación de cortes a empleadas y pagos por pieza.</p>
        </div>

        <div className="action-buttons">
          <button onClick={() => setMostrarFiltros(!mostrarFiltros)}>
            {mostrarFiltros ? "Ocultar filtros" : "Buscar"}
          </button>

          <button
            onClick={mostrarFormulario ? limpiarFormulario : abrirNuevaAsignacion}
          >
            {mostrarFormulario ? "Cancelar" : "Nueva asignación"}
          </button>
        </div>
      </div>

      {mostrarFormulario && (
        <section className="page-card">
          <form className="admin-form-grid" onSubmit={guardarAsignacion}>
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

            <select
              name="id_corte"
              value={formulario.id_corte}
              onChange={cambiarDato}
              required
            >
              <option value="">Selecciona corte</option>
              {cortes.map((corte) => (
                <option key={corte.id_corte} value={corte.id_corte}>
                  {corte.folio} - {corte.nombre_prenda}
                </option>
              ))}
            </select>

            <input
              name="cantidad_asignada"
              placeholder="Cantidad asignada"
              type="number"
              value={formulario.cantidad_asignada}
              onChange={cambiarDato}
              required
            />

            <input
              name="pago_por_pieza"
              placeholder="Pago por pieza"
              type="number"
              step="0.01"
              value={formulario.pago_por_pieza}
              onChange={cambiarDato}
              required
            />

            <select
              name="estado"
              value={formulario.estado}
              onChange={cambiarDato}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En proceso">En proceso</option>
              <option value="Terminado">Terminado</option>
            </select>

            <button type="submit">
              {editandoId ? "Actualizar" : "Asignar"}
            </button>
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
              name="id_corte"
              value={filtros.id_corte}
              onChange={cambiarFiltro}
            >
              <option value="">Todos los cortes</option>
              {cortes.map((corte) => (
                <option key={corte.id_corte} value={corte.id_corte}>
                  {corte.folio} - {corte.nombre_prenda}
                </option>
              ))}
            </select>

            <select name="estado" value={filtros.estado} onChange={cambiarFiltro}>
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En proceso">En proceso</option>
              <option value="Terminado">Terminado</option>
            </select>

            <button type="button" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          </form>
        </section>
      )}

      <section className="page-card">
        {cargando ? (
          <p>Cargando asignaciones...</p>
        ) : (
          <table className="page-table">
            <thead>
              <tr>
                <th>Empleada</th>
                <th>Corte</th>
                <th>Asignada</th>
                <th>Entregada</th>
                <th>Pendiente</th>
                <th>Pago pieza</th>
                <th>Pago total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {asignacionesFiltradas.map((asignacion) => (
                <tr key={asignacion.id_asignacion}>
                  <td>{asignacion.empleado}</td>
                  <td>{asignacion.nombre_prenda}</td>
                  <td>{asignacion.cantidad_asignada}</td>
                  <td>{asignacion.cantidad_entregada}</td>
                  <td>
                    {Number(asignacion.cantidad_asignada) -
                      Number(asignacion.cantidad_entregada)}
                  </td>
                  <td>${asignacion.pago_por_pieza}</td>
                  <td>${asignacion.pago_total}</td>
                  <td>
                    <span className={obtenerClaseEstado(asignacion.estado)}>
                      {asignacion.estado}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => cargarParaEditar(asignacion)}
                      >
                        Editar
                      </button>

                      <button
                        className="btn-delete"
                        onClick={() =>
                          borrarAsignacion(asignacion.id_asignacion)
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {asignacionesFiltradas.length === 0 && (
                <tr>
                  <td colSpan="9">No hay asignaciones con esos filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Asignaciones;