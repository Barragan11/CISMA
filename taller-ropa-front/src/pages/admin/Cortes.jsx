import { useEffect, useState } from "react";
import { confirmarEliminar } from "../../utils/alerts";
import toast from "react-hot-toast";
import {
  obtenerCortes,
  crearCorte,
  actualizarCorte,
  eliminarCorte,
} from "../../services/corteService";
import "./AdminPages.css";

function Cortes() {
  const [cortes, setCortes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [filtros, setFiltros] = useState({
    busqueda: "",
    estado: "",
    fecha_inicio: "",
    fecha_fin: "",
  });

  const formularioInicial = {
    folio: "",
    nombre_prenda: "",
    descripcion: "",
    cantidad_total: "",
    precio_cliente: "",
    costo_material: "",
    fecha_inicio: "",
    fecha_entrega: "",
    estado: "Pendiente",
  };

  const [formulario, setFormulario] = useState(formularioInicial);

  useEffect(() => {
    cargarCortes();
  }, []);

  const cargarCortes = async () => {
    try {
      setCargando(true);
      const datos = await obtenerCortes();
      setCortes(datos);
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

  const abrirNuevoCorte = () => {
    setFormulario(formularioInicial);
    setEditandoId(null);
    setMostrarFormulario(true);
  };

  const guardarCorte = async (e) => {
    e.preventDefault();

    try {
      const datosCorte = {
        ...formulario,
        cantidad_total: Number(formulario.cantidad_total),
        precio_cliente: Number(formulario.precio_cliente),
        costo_material: Number(formulario.costo_material || 0),
        fecha_entrega: formulario.fecha_entrega || null,
      };

      if (editandoId) {
        await actualizarCorte(editandoId, datosCorte);
        toast.success("Corte actualizado correctamente");
      } else {
        await crearCorte(datosCorte);
        toast.success("Corte creado correctamente");
      }

      limpiarFormulario();
      cargarCortes();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cargarParaEditar = (corte) => {
    setEditandoId(corte.id_corte);
    setMostrarFormulario(true);

    setFormulario({
      folio: corte.folio || "",
      nombre_prenda: corte.nombre_prenda || "",
      descripcion: corte.descripcion || "",
      cantidad_total: corte.cantidad_total || "",
      precio_cliente: corte.precio_cliente || "",
      costo_material: corte.costo_material || "",
      fecha_inicio: corte.fecha_inicio ? corte.fecha_inicio.slice(0, 10) : "",
      fecha_entrega: corte.fecha_entrega ? corte.fecha_entrega.slice(0, 10) : "",
      estado: corte.estado || "Pendiente",
    });
  };

  const cancelarCorte = async (id) => {
    const confirmado = await confirmarEliminar(
      "¿Cancelar corte?",
      "El corte cambiará a estado cancelado."
    );

    if (!confirmado) return;

    try {
      await eliminarCorte(id);
      toast.success("Corte cancelado correctamente");
      cargarCortes();
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

      case "Cancelado":
        return "estado-badge estado-cancelado";

      default:
        return "estado-badge";
    }
  };

  const cortesFiltrados = cortes.filter((corte) => {
    const busqueda = filtros.busqueda.toLowerCase();

    const coincideBusqueda =
      corte.folio?.toLowerCase().includes(busqueda) ||
      corte.nombre_prenda?.toLowerCase().includes(busqueda);

    const coincideEstado = filtros.estado
      ? corte.estado === filtros.estado
      : true;

    const fechaInicioCorte = corte.fecha_inicio?.slice(0, 10);

    const coincideFechaInicio = filtros.fecha_inicio
      ? fechaInicioCorte >= filtros.fecha_inicio
      : true;

    const coincideFechaFin = filtros.fecha_fin
      ? fechaInicioCorte <= filtros.fecha_fin
      : true;

    return (
      coincideBusqueda &&
      coincideEstado &&
      coincideFechaInicio &&
      coincideFechaFin
    );
  });

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Cortes</h1>
          <p>Control de cortes, cantidades y precios por prenda.</p>
        </div>

        <div className="action-buttons">
          <button onClick={() => setMostrarFiltros(!mostrarFiltros)}>
            {mostrarFiltros ? "Ocultar filtros" : "Buscar"}
          </button>

          <button onClick={mostrarFormulario ? limpiarFormulario : abrirNuevoCorte}>
            {mostrarFormulario ? "Cancelar" : "Nuevo corte"}
          </button>
        </div>
      </div>

      {mostrarFormulario && (
        <section className="page-card">
          <form className="admin-form-grid" onSubmit={guardarCorte}>
            <input
              name="folio"
              placeholder="Folio del corte. Ej. CORTE-0001"
              value={formulario.folio}
              onChange={cambiarDato}
              required
            />

            <input
              name="nombre_prenda"
              placeholder="Nombre de la prenda"
              value={formulario.nombre_prenda}
              onChange={cambiarDato}
              required
            />

            <input
              name="cantidad_total"
              placeholder="Cantidad"
              type="number"
              value={formulario.cantidad_total}
              onChange={cambiarDato}
              required
            />

            <input
              name="precio_cliente"
              placeholder="Precio cliente"
              type="number"
              step="0.01"
              value={formulario.precio_cliente}
              onChange={cambiarDato}
              required
            />

            <input
              name="costo_material"
              placeholder="Costo material"
              type="number"
              step="0.01"
              value={formulario.costo_material}
              onChange={cambiarDato}
            />

            <input
              name="fecha_inicio"
              type="date"
              value={formulario.fecha_inicio}
              onChange={cambiarDato}
              required
            />

            <input
              name="fecha_entrega"
              type="date"
              value={formulario.fecha_entrega}
              onChange={cambiarDato}
            />

            <select
              name="estado"
              value={formulario.estado}
              onChange={cambiarDato}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En proceso">En proceso</option>
              <option value="Terminado">Terminado</option>
              <option value="Cancelado">Cancelado</option>
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
            <input
              name="busqueda"
              placeholder="Buscar por folio o prenda"
              value={filtros.busqueda}
              onChange={cambiarFiltro}
            />

            <select name="estado" value={filtros.estado} onChange={cambiarFiltro}>
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En proceso">En proceso</option>
              <option value="Terminado">Terminado</option>
              <option value="Cancelado">Cancelado</option>
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
          <p>Cargando cortes...</p>
        ) : (
          <table className="page-table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Prenda</th>
                <th>Cantidad</th>
                <th>Precio cliente</th>
                <th>Costo material</th>
                <th>Inicio</th>
                <th>Entrega</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cortesFiltrados.map((corte) => (
                <tr key={corte.id_corte}>
                  <td>{corte.folio}</td>
                  <td>{corte.nombre_prenda}</td>
                  <td>{corte.cantidad_total}</td>
                  <td>${corte.precio_cliente}</td>
                  <td>${corte.costo_material}</td>
                  <td>{corte.fecha_inicio?.slice(0, 10)}</td>
                  <td>{corte.fecha_entrega?.slice(0, 10) || "Sin fecha"}</td>
                  <td>
                    <span className={obtenerClaseEstado(corte.estado)}>
                      {corte.estado}
                    </span>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => cargarParaEditar(corte)}
                      >
                        Editar
                      </button>

                      <button
                        className="btn-delete"
                        onClick={() => cancelarCorte(corte.id_corte)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {cortesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="9">No hay cortes con esos filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Cortes;