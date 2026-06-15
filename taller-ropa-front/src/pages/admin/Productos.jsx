import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  obtenerProductosAdmin,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../../services/productoAdminService";
import { confirmarEliminar } from "../../utils/alerts";
import "./AdminPages.css";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState(null);

  const [formulario, setFormulario] = useState({
    nombre: "",
    categoria: "Niña",
    descripcion: "",
    precio: "",
    imagen: null,
    imagenActual: "",
    stock: "",
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const datos = await obtenerProductosAdmin();
      setProductos(datos);
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

  const cambiarImagen = (e) => {
    setFormulario({
      ...formulario,
      imagen: e.target.files[0],
    });
  };

  const limpiarFormulario = () => {
    setFormulario({
      nombre: "",
      categoria: "Niña",
      descripcion: "",
      precio: "",
      imagen: null,
      imagenActual: "",
      stock: "",
    });

    setEditandoId(null);
  };

  const guardarProducto = async (e) => {
    e.preventDefault();

    try {
      const datosProducto = {
        nombre: formulario.nombre,
        categoria: formulario.categoria,
        descripcion: formulario.descripcion,
        precio: Number(formulario.precio),
        stock: Number(formulario.stock || 0),
        imagen: formulario.imagen,
        imagenActual: formulario.imagenActual,
      };

      if (editandoId) {
        await actualizarProducto(editandoId, datosProducto);
        toast.success("Producto actualizado correctamente");
      } else {
        await crearProducto(datosProducto);
        toast.success("Producto creado correctamente");
      }

      limpiarFormulario();
      cargarProductos();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cargarParaEditar = (producto) => {
    setEditandoId(producto.id_producto);

    setFormulario({
      nombre: producto.nombre || "",
      categoria: producto.categoria || "Niña",
      descripcion: producto.descripcion || "",
      precio: producto.precio || "",
      imagen: null,
      imagenActual: producto.imagen || "",
      stock: producto.stock || "",
    });
  };

  const borrarProducto = async (id) => {
    const confirmado = await confirmarEliminar(
      "¿Eliminar producto?",
      "El producto será desactivado de la tienda."
    );

    if (!confirmado) return;

    try {
      await eliminarProducto(id);
      toast.success("Producto eliminado correctamente");
      cargarProductos();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const obtenerImagen = (imagen) => {
    if (!imagen) return "";
    if (imagen.startsWith("http")) return imagen;
    if (imagen.startsWith("/productos/")) return imagen;

    return `http://localhost:3000/uploads/${imagen}`;
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Productos</h1>
          <p>Administra los productos que aparecen en la tienda.</p>
        </div>

        <button onClick={limpiarFormulario}>
          {editandoId ? "Cancelar edición" : "Nuevo producto"}
        </button>
      </div>

      <section className="page-card">
        <form className="admin-form-grid" onSubmit={guardarProducto}>
          <input
            name="nombre"
            placeholder="Nombre del producto"
            value={formulario.nombre}
            onChange={cambiarDato}
            required
          />

          <select
            name="categoria"
            value={formulario.categoria}
            onChange={cambiarDato}
            required
          >
            <option value="Niña">Niña</option>
            <option value="Niño">Niño</option>
            <option value="Batita">Batita</option>
            <option value="Conjunto">Conjunto</option>
            <option value="Fiesta">Fiesta</option>
          </select>

          <input
            name="precio"
            placeholder="Precio"
            type="number"
            step="0.01"
            value={formulario.precio}
            onChange={cambiarDato}
            required
          />

          <input
            name="stock"
            placeholder="Stock"
            type="number"
            value={formulario.stock}
            onChange={cambiarDato}
            required
          />

          <input type="file" accept="image/*" onChange={cambiarImagen} />

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

        {editandoId && formulario.imagenActual && (
          <div style={{ marginTop: "16px" }}>
            <p style={{ marginBottom: "8px", color: "#64748b" }}>
              Imagen actual:
            </p>

            <img
              src={obtenerImagen(formulario.imagenActual)}
              alt="Imagen actual"
              style={{
                width: "90px",
                height: "100px",
                objectFit: "cover",
                borderRadius: "12px",
              }}
            />
          </div>
        )}
      </section>

      <section className="page-card">
        {cargando ? (
          <p>Cargando productos...</p>
        ) : (
          <table className="page-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id_producto}>
                  <td>
                    {producto.imagen ? (
                      <img
                        src={obtenerImagen(producto.imagen)}
                        alt={producto.nombre}
                        style={{
                          width: "70px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "12px",
                        }}
                      />
                    ) : (
                      "Sin imagen"
                    )}
                  </td>

                  <td>
                    <strong>{producto.nombre}</strong>
                    <br />
                    <small>{producto.descripcion}</small>
                  </td>

                  <td>{producto.categoria}</td>
                  <td>${producto.precio}</td>
                  <td>{producto.stock}</td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => cargarParaEditar(producto)}
                      >
                        Editar
                      </button>

                      <button
                        className="btn-delete"
                        onClick={() => borrarProducto(producto.id_producto)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {productos.length === 0 && (
                <tr>
                  <td colSpan="6">No hay productos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Productos;