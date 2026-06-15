import { useEffect, useState } from "react";
import { confirmarEliminar } from "../../utils/alerts";
import toast from "react-hot-toast";
import {
  obtenerEmpleados,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
} from "../../services/empleadoService";
import "./AdminPages.css";

function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [filtros, setFiltros] = useState({
    busqueda: "",
    puesto: "",
    estado: "",
  });

  const [formulario, setFormulario] = useState({
    nombre: "",
    telefono: "",
    puesto: "Costurera",
  });

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    try {
      setCargando(true);
      const datos = await obtenerEmpleados();
      setEmpleados(datos);
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
      busqueda: "",
      puesto: "",
      estado: "",
    });
  };

  const limpiarFormulario = () => {
    setFormulario({
      nombre: "",
      telefono: "",
      puesto: "Costurera",
    });

    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const abrirNuevoEmpleado = () => {
    setFormulario({
      nombre: "",
      telefono: "",
      puesto: "Costurera",
    });

    setEditandoId(null);
    setMostrarFormulario(true);
  };

  const guardarEmpleado = async (e) => {
    e.preventDefault();

    try {
      if (editandoId) {
        await actualizarEmpleado(editandoId, formulario);
        toast.success("Empleado actualizado correctamente");
      } else {
        await crearEmpleado(formulario);
        toast.success("Empleado creado correctamente");
      }

      limpiarFormulario();
      cargarEmpleados();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cargarParaEditar = (empleado) => {
    setEditandoId(empleado.id_empleado);
    setMostrarFormulario(true);

    setFormulario({
      nombre: empleado.nombre,
      telefono: empleado.telefono || "",
      puesto: empleado.puesto,
    });
  };

  const borrarEmpleado = async (id) => {
    const confirmado = await confirmarEliminar(
      "¿Eliminar empleado?",
      "El empleado será desactivado del sistema."
    );

    if (!confirmado) return;

    try {
      await eliminarEmpleado(id);
      toast.success("Empleado eliminado correctamente");
      cargarEmpleados();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const empleadosFiltrados = empleados.filter((empleado) => {
    const busqueda = filtros.busqueda.toLowerCase();

    const coincideBusqueda =
      empleado.nombre?.toLowerCase().includes(busqueda) ||
      empleado.telefono?.toLowerCase().includes(busqueda);

    const coincidePuesto = filtros.puesto
      ? empleado.puesto === filtros.puesto
      : true;

    const coincideEstado = filtros.estado
      ? String(empleado.estado) === filtros.estado
      : true;

    return coincideBusqueda && coincidePuesto && coincideEstado;
  });

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Empleados</h1>
          <p>Registro y administración de empleadas del taller.</p>
        </div>

        <div className="action-buttons">
          <button
            onClick={() => {
              setMostrarFiltros(!mostrarFiltros);
            }}
          >
            {mostrarFiltros ? "Ocultar filtros" : "Buscar"}
          </button>

          <button
            onClick={mostrarFormulario ? limpiarFormulario : abrirNuevoEmpleado}
          >
            {mostrarFormulario ? "Cancelar" : "Nuevo empleado"}
          </button>
        </div>
      </div>

      {mostrarFormulario && (
        <section className="page-card">
          <form className="admin-form-grid" onSubmit={guardarEmpleado}>
            <input
              name="nombre"
              placeholder="Nombre"
              value={formulario.nombre}
              onChange={cambiarDato}
              required
            />

            <input
              name="telefono"
              placeholder="Teléfono"
              value={formulario.telefono}
              onChange={cambiarDato}
            />

            <select
              name="puesto"
              value={formulario.puesto}
              onChange={cambiarDato}
            >
              <option value="Costurera">Costurera</option>
              <option value="Corte">Corte</option>
              <option value="Terminados">Terminados</option>
              <option value="Empaque">Empaque</option>
            </select>

            <button type="submit">
              {editandoId ? "Actualizar" : "Guardar"}
            </button>
          </form>
        </section>
      )}

      {mostrarFiltros && (
        <section className="page-card">
          <form className="admin-form-grid">
            <input
              name="busqueda"
              placeholder="Buscar por nombre o teléfono"
              value={filtros.busqueda}
              onChange={cambiarFiltro}
            />

            <select
              name="puesto"
              value={filtros.puesto}
              onChange={cambiarFiltro}
            >
              <option value="">Todos los puestos</option>
              <option value="Costurera">Costurera</option>
              <option value="Corte">Corte</option>
              <option value="Terminados">Terminados</option>
              <option value="Empaque">Empaque</option>
            </select>

            <select
              name="estado"
              value={filtros.estado}
              onChange={cambiarFiltro}
            >
              <option value="">Todos los estados</option>
              <option value="1">Activos</option>
              <option value="0">Inactivos</option>
            </select>

            <button type="button" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          </form>
        </section>
      )}

      <section className="page-card">
        {cargando ? (
          <p>Cargando empleados...</p>
        ) : (
          <table className="page-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Puesto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {empleadosFiltrados.map((empleado) => (
                <tr key={empleado.id_empleado}>
                  <td>{empleado.nombre}</td>
                  <td>{empleado.telefono}</td>
                  <td>{empleado.puesto}</td>
                  <td>{empleado.estado === 1 ? "Activo" : "Inactivo"}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => cargarParaEditar(empleado)}
                      >
                        Editar
                      </button>

                      <button
                        className="btn-delete"
                        onClick={() => borrarEmpleado(empleado.id_empleado)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {empleadosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="5">No hay empleados con esos filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Empleados;