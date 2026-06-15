const pool = require("../config/db");

const obtenerProductos = async (req, res) => {
  try {
    const [productos] = await pool.query(
      "SELECT * FROM productos WHERE estado = 1 ORDER BY id_producto DESC"
    );

    res.json(productos);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener productos",
      error: error.message,
    });
  }
};

const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [productos] = await pool.query(
      "SELECT * FROM productos WHERE id_producto = ? AND estado = 1",
      [id]
    );

    if (productos.length === 0) {
      return res.status(404).json({
        mensaje: "Producto no encontrado",
      });
    }

    res.json(productos[0]);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener producto",
      error: error.message,
    });
  }
};

const crearProducto = async (req, res) => {
  try {
    const { nombre, categoria, descripcion, precio, stock } = req.body;

    if (!nombre || !categoria || !precio) {
      return res.status(400).json({
        mensaje: "Nombre, categoría y precio son obligatorios",
      });
    }

    const imagen = req.file ? req.file.filename : null;

    const [resultado] = await pool.query(
      `INSERT INTO productos
       (nombre, categoria, descripcion, precio, imagen, stock, estado)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [
        nombre,
        categoria,
        descripcion || null,
        precio,
        imagen,
        stock || 0,
      ]
    );

    res.status(201).json({
      mensaje: "Producto creado correctamente",
      id_producto: resultado.insertId,
      imagen,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear producto",
      error: error.message,
    });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria, descripcion, precio, stock, imagenActual } = req.body;

    if (!nombre || !categoria || !precio) {
      return res.status(400).json({
        mensaje: "Nombre, categoría y precio son obligatorios",
      });
    }

    const imagen = req.file ? req.file.filename : imagenActual;

    const [resultado] = await pool.query(
      `UPDATE productos
       SET nombre = ?, categoria = ?, descripcion = ?, precio = ?, imagen = ?, stock = ?
       WHERE id_producto = ? AND estado = 1`,
      [
        nombre,
        categoria,
        descripcion || null,
        precio,
        imagen || null,
        stock || 0,
        id,
      ]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Producto no encontrado",
      });
    }

    res.json({
      mensaje: "Producto actualizado correctamente",
      imagen,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar producto",
      error: error.message,
    });
  }
};

const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      "UPDATE productos SET estado = 0 WHERE id_producto = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Producto no encontrado",
      });
    }

    res.json({
      mensaje: "Producto eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar producto",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};