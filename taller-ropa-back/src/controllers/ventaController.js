const pool = require("../config/db");

const obtenerVentas = async (req, res) => {
  try {
    const [ventas] = await pool.query(`
      SELECT 
        v.id_venta,
        v.id_usuario,
        u.nombre AS cliente,
        u.correo,
        v.fecha_venta,
        v.total,
        v.estado
      FROM ventas v
      INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
      ORDER BY v.id_venta DESC
    `);

    res.json(ventas);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener ventas",
      error: error.message,
    });
  }
};

const obtenerMisCompras = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;

    const [compras] = await pool.query(
      `
      SELECT 
        id_venta,
        fecha_venta,
        total,
        estado
      FROM ventas
      WHERE id_usuario = ?
      ORDER BY id_venta DESC
      `,
      [id_usuario]
    );

    res.json(compras);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener compras",
      error: error.message,
    });
  }
};

const obtenerDetalleVenta = async (req, res) => {
  try {
    const { id } = req.params;

    const [detalle] = await pool.query(
      `
      SELECT 
        dv.id_detalle,
        dv.id_venta,
        dv.id_producto,
        p.nombre AS producto,
        p.imagen,
        dv.cantidad,
        dv.precio_unitario,
        dv.subtotal
      FROM detalle_venta dv
      INNER JOIN productos p ON dv.id_producto = p.id_producto
      WHERE dv.id_venta = ?
      `,
      [id]
    );

    res.json(detalle);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener detalle de venta",
      error: error.message,
    });
  }
};

const crearVenta = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const id_usuario = req.usuario.id_usuario;
    const { productos } = req.body;

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        mensaje: "La venta debe incluir productos",
      });
    }

    await connection.beginTransaction();

    let total = 0;
    const detalleCalculado = [];

    for (const item of productos) {
      const { id_producto, cantidad } = item;

      if (!id_producto || !cantidad || cantidad <= 0) {
        await connection.rollback();
        return res.status(400).json({
          mensaje: "Producto y cantidad son obligatorios",
        });
      }

      const [productosBD] = await connection.query(
        "SELECT id_producto, nombre, precio, stock FROM productos WHERE id_producto = ? AND estado = 1",
        [id_producto]
      );

      if (productosBD.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          mensaje: `Producto con ID ${id_producto} no encontrado`,
        });
      }

      const productoBD = productosBD[0];

      if (cantidad > productoBD.stock) {
        await connection.rollback();
        return res.status(400).json({
          mensaje: `Stock insuficiente para ${productoBD.nombre}`,
        });
      }

      const precioUnitario = Number(productoBD.precio);
      const subtotal = precioUnitario * Number(cantidad);

      total += subtotal;

      detalleCalculado.push({
        id_producto,
        cantidad,
        precio_unitario: precioUnitario,
        subtotal,
      });
    }

    const [ventaResultado] = await connection.query(
      "INSERT INTO ventas (id_usuario, total, estado) VALUES (?, ?, 'Pagada')",
      [id_usuario, total]
    );

    const id_venta = ventaResultado.insertId;

    for (const item of detalleCalculado) {
      await connection.query(
        `INSERT INTO detalle_venta 
         (id_venta, id_producto, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [
          id_venta,
          item.id_producto,
          item.cantidad,
          item.precio_unitario,
          item.subtotal,
        ]
      );

      await connection.query(
        "UPDATE productos SET stock = stock - ? WHERE id_producto = ?",
        [item.cantidad, item.id_producto]
      );
    }

    await connection.commit();

    res.status(201).json({
      mensaje: "Venta registrada correctamente",
      id_venta,
      total,
      productos: detalleCalculado,
    });
  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      mensaje: "Error al registrar venta",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  obtenerVentas,
  obtenerMisCompras,
  obtenerDetalleVenta,
  crearVenta,
};