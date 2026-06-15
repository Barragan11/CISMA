import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  obtenerAnticipos,
  crearAnticipo,
  actualizarAnticipo,
  eliminarAnticipo,
} from "../../services/anticipoService";
import { obtenerEmpleados } from "../../services/empleadoService";
import { confirmarEliminar } from "../../utils/alerts";
import "./AdminPages.css";

function Anticipos() {
  const [anticipos, setAnticipos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [filtros, setFiltros] = useState({
    id_empleado: "",
    estado: "",
    fecha_inicio: "",
    fecha_fin: "",
  });

  const formularioInicial = {
    id_empleado: "",
    monto: "",
    descripcion: "",
    fecha_anticipo: "",
    estado: "Pendiente",
  };

  const [formulario, setFormulario] = useState(formularioInicial);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [datosAnticipos, datosEmpleados] = await Promise.all([
        obtenerAnticipos(),
        obtenerEmpleados(),
      ]);

      setAnticipos(datosAnticipos);
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
    setFormulario(formularioInicial);
    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const abrirNuevoAnticipo = () => {
    setFormulario(formularioInicial);
    setEditandoId(null);
    setMostrarFormulario(true);
  };

  const guardarAnticipo = async (e) => {
    e.preventDefault();

    try {
      const datosAnticipo = {
        id_empleado: Number(formulario.id_empleado),
        monto: Number(formulario.monto),
        descripcion: formulario.descripcion,
        fecha_anticipo: formulario.fecha_anticipo,
        estado: formulario.estado,
      };

      if (editandoId) {
        await actualizarAnticipo(editandoId, datosAnticipo);
        toast.success("Anticipo actualizado correctamente");
      } else {
        await crearAnticipo(datosAnticipo);
        toast.success("Anticipo registrado correctamente");
      }

      limpiarFormulario();
      cargarDatos();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cargarParaEditar = (anticipo) => {
    setEditandoId(anticipo.id_anticipo);
    setMostrarFormulario(true);

    setFormulario({
      id_empleado: anticipo.id_empleado,
      monto: anticipo.monto,
      descripcion: anticipo.descripcion || "",
      fecha_anticipo: anticipo.fecha_anticipo
        ? anticipo.fecha_anticipo.slice(0, 10)
        : "",
      estado: anticipo.estado,
    });
  };

  const descontarAnticipo = async (id) => {
    const confirmado = await confirmarEliminar(
      "¿Descontar anticipo?",
      "El anticipo cambiará a estado descontado."
    );

    if (!confirmado) return;

    try {
      await eliminarAnticipo(id);
      toast.success("Anticipo descontado correctamente");
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

  const anticiposFiltrados = anticipos.filter((anticipo) => {
    const coincideEmpleado = filtros.id_empleado
      ? Number(anticipo.id_empleado) === Number(filtros.id_empleado)
      : true;

    const coincideEstado = filtros.estado
      ? anticipo.estado === filtros.estado
      : true;

    const fechaAnticipo = anticipo.fecha_anticipo?.slice(0, 10);

    const coincideFechaInicio = filtros.fecha_inicio
      ? fechaAnticipo >= filtros.fecha_inicio
      : true;

    const coincideFechaFin = filtros.fecha_fin
      ? fechaAnticipo <= filtros.fecha_fin
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
          <h1>Anticipos</h1>
          <p>Control de anticipos y préstamos de empleadas.</p>
        </div>

        <div className="action-buttons">
          <button onClick={() => setMostrarFiltros(!mostrarFiltros)}>
            {mostrarFiltros ? "Ocultar filtros" : "Buscar"}
          </button>

          <button
            onClick={mostrarFormulario ? limpiarFormulario : abrirNuevoAnticipo}
          >
            {mostrarFormulario ? "Cancelar" : "Nuevo anticipo"}
          </button>
        </div>
      </div>

      {mostrarFormulario && (
        <section className="page-card">
          <form className="admin-form-grid" onSubmit={guardarAnticipo}>
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
              name="monto"
              placeholder="Monto"
              type="number"
              step="0.01"
              value={formulario.monto}
              onChange={cambiarDato}
              required
            />

            <input
              name="fecha_anticipo"
              type="date"
              value={formulario.fecha_anticipo}
              onChange={cambiarDato}
              required
            />

            <select
              name="estado"
              value={formulario.estado}
              onChange={cambiarDato}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Descontado">Descontado</option>
            </select>

            <input
              name="descripcion"
              placeholder="Descripción"
              value={formulario.descripcion}
              onChange={cambiarDato}
            />

            <button type="submit">
              {editandoId ? "Actualizar" : "Guardar"}
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
              name="estado"
              value={filtros.estado}
              onChange={cambiarFiltro}
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Descontado">Descontado</option>
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
          <p>Cargando anticipos...</p>
        ) : (
          <table className="page-table">
            <thead>
              <tr>
                <th>Empleada</th>
                <th>Monto</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {anticiposFiltrados.map((anticipo) => (
                <tr key={anticipo.id_anticipo}>
                  <td>{anticipo.empleado}</td>
                  <td>${anticipo.monto}</td>
                  <td>{anticipo.descripcion || "Sin descripción"}</td>
                  <td>{anticipo.fecha_anticipo?.slice(0, 10)}</td>
                  <td>
                    <span className={claseEstado(anticipo.estado)}>
                      {anticipo.estado}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => cargarParaEditar(anticipo)}
                      >
                        Editar
                      </button>

                      <button
                        className="btn-delete"
                        onClick={() => descontarAnticipo(anticipo.id_anticipo)}
                      >
                        Descontar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {anticiposFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6">No hay anticipos con esos filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Anticipos;