import { useEffect, useState } from "react";
import { confirmarEliminar } from "../../utils/alerts";
import toast from "react-hot-toast";
import {
  obtenerMateriales,
  crearMaterial,
  actualizarMaterial,
  eliminarMaterial,
} from "../../services/inventarioService";
import "./AdminPages.css";

function Inventario() {
  const [materiales, setMateriales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [filtros, setFiltros] = useState({
    busqueda: "",
    stock: "",
  });

  const formularioInicial = {
    nombre: "",
    cantidad: "",
    unidad: "",
    stock_minimo: "",
  };

  const [formulario, setFormulario] = useState(formularioInicial);

  useEffect(() => {
    cargarMateriales();
  }, []);

  const cargarMateriales = async () => {
    try {
      setCargando(true);
      const datos = await obtenerMateriales();
      setMateriales(datos);
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
      stock: "",
    });
  };

  const limpiarFormulario = () => {
    setFormulario(formularioInicial);
    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const abrirNuevoMaterial = () => {
    setFormulario(formularioInicial);
    setEditandoId(null);
    setMostrarFormulario(true);
  };

  const guardarMaterial = async (e) => {
    e.preventDefault();

    try {
      const datosMaterial = {
        nombre: formulario.nombre,
        cantidad: Number(formulario.cantidad || 0),
        unidad: formulario.unidad,
        stock_minimo: Number(formulario.stock_minimo || 0),
      };

      if (editandoId) {
        await actualizarMaterial(editandoId, datosMaterial);
        toast.success("Material actualizado correctamente");
      } else {
        await crearMaterial(datosMaterial);
        toast.success("Material creado correctamente");
      }

      limpiarFormulario();
      cargarMateriales();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cargarParaEditar = (material) => {
    setEditandoId(material.id_material);
    setMostrarFormulario(true);

    setFormulario({
      nombre: material.nombre || "",
      cantidad: material.cantidad || "",
      unidad: material.unidad || "",
      stock_minimo: material.stock_minimo || "",
    });
  };

  const borrarMaterial = async (id) => {
    const confirmado = await confirmarEliminar(
      "¿Eliminar material?",
      "El material será desactivado del inventario."
    );

    if (!confirmado) return;

    try {
      await eliminarMaterial(id);
      toast.success("Material eliminado correctamente");
      cargarMateriales();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const claseStock = (material) => {
    if (Number(material.cantidad) <= Number(material.stock_minimo)) {
      return "estado-badge estado-cancelado";
    }

    return "estado-badge estado-terminado";
  };

  const materialesFiltrados = materiales.filter((material) => {
    const busqueda = filtros.busqueda.toLowerCase();

    const coincideBusqueda =
      material.nombre?.toLowerCase().includes(busqueda) ||
      material.unidad?.toLowerCase().includes(busqueda);

    const esStockBajo =
      Number(material.cantidad) <= Number(material.stock_minimo);

    const coincideStock =
      filtros.stock === "bajo"
        ? esStockBajo
        : filtros.stock === "disponible"
        ? !esStockBajo
        : true;

    return coincideBusqueda && coincideStock;
  });

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Inventario</h1>
          <p>Control de materiales e insumos del taller.</p>
        </div>

        <div className="action-buttons">
          <button onClick={() => setMostrarFiltros(!mostrarFiltros)}>
            {mostrarFiltros ? "Ocultar filtros" : "Buscar"}
          </button>

          <button
            onClick={mostrarFormulario ? limpiarFormulario : abrirNuevoMaterial}
          >
            {mostrarFormulario ? "Cancelar" : "Nuevo material"}
          </button>
        </div>
      </div>

      {mostrarFormulario && (
        <section className="page-card">
          <form className="admin-form-grid" onSubmit={guardarMaterial}>
            <input
              name="nombre"
              placeholder="Material"
              value={formulario.nombre}
              onChange={cambiarDato}
              required
            />

            <input
              name="cantidad"
              placeholder="Cantidad"
              type="number"
              step="0.01"
              value={formulario.cantidad}
              onChange={cambiarDato}
            />

            <input
              name="unidad"
              placeholder="Unidad: metros, piezas, kilos"
              value={formulario.unidad}
              onChange={cambiarDato}
              required
            />

            <input
              name="stock_minimo"
              placeholder="Stock mínimo"
              type="number"
              step="0.01"
              value={formulario.stock_minimo}
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
              placeholder="Buscar material o unidad"
              value={filtros.busqueda}
              onChange={cambiarFiltro}
            />

            <select name="stock" value={filtros.stock} onChange={cambiarFiltro}>
              <option value="">Todo el inventario</option>
              <option value="disponible">Disponible</option>
              <option value="bajo">Stock bajo</option>
            </select>

            <button type="button" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          </form>
        </section>
      )}

      <section className="page-card">
        {cargando ? (
          <p>Cargando inventario...</p>
        ) : (
          <table className="page-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Stock mínimo</th>
                <th>Estado stock</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {materialesFiltrados.map((material) => (
                <tr key={material.id_material}>
                  <td>{material.nombre}</td>
                  <td>{material.cantidad}</td>
                  <td>{material.unidad}</td>
                  <td>{material.stock_minimo}</td>
                  <td>
                    <span className={claseStock(material)}>
                      {Number(material.cantidad) <= Number(material.stock_minimo)
                        ? "Stock bajo"
                        : "Disponible"}
                    </span>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => cargarParaEditar(material)}
                      >
                        Editar
                      </button>

                      <button
                        className="btn-delete"
                        onClick={() => borrarMaterial(material.id_material)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {materialesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6">No hay materiales con esos filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Inventario;