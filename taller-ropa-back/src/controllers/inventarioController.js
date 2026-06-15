const pool = require("../config/db");

const obtenerMateriales = async (req, res) => {
  try {
    const [materiales] = await pool.query(
      "SELECT * FROM inventario WHERE estado = 1 ORDER BY id_material DESC"
    );

    res.json(materiales);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener inventario",
      error: error.message,
    });
  }
};

const crearMaterial = async (req, res) => {
  try {
    const { nombre, cantidad, unidad, stock_minimo } = req.body;

    if (!nombre || !unidad) {
      return res.status(400).json({
        mensaje: "Nombre y unidad son obligatorios",
      });
    }

    const [resultado] = await pool.query(
      `INSERT INTO inventario (nombre, cantidad, unidad, stock_minimo)
       VALUES (?, ?, ?, ?)`,
      [nombre, cantidad || 0, unidad, stock_minimo || 0]
    );

    res.status(201).json({
      mensaje: "Material creado correctamente",
      id_material: resultado.insertId,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear material",
      error: error.message,
    });
  }
};

const actualizarMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cantidad, unidad, stock_minimo } = req.body;

    if (!nombre || !unidad) {
      return res.status(400).json({
        mensaje: "Nombre y unidad son obligatorios",
      });
    }

    const [resultado] = await pool.query(
      `UPDATE inventario
       SET nombre = ?, cantidad = ?, unidad = ?, stock_minimo = ?
       WHERE id_material = ? AND estado = 1`,
      [nombre, cantidad || 0, unidad, stock_minimo || 0, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Material no encontrado",
      });
    }

    res.json({
      mensaje: "Material actualizado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar material",
      error: error.message,
    });
  }
};

const eliminarMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      "UPDATE inventario SET estado = 0 WHERE id_material = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Material no encontrado",
      });
    }

    res.json({
      mensaje: "Material eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar material",
      error: error.message,
    });
  }
};

const registrarMovimiento = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id_material, tipo_movimiento, cantidad, descripcion } = req.body;

    if (!id_material || !tipo_movimiento || !cantidad) {
      return res.status(400).json({
        mensaje: "Material, tipo de movimiento y cantidad son obligatorios",
      });
    }

    await connection.beginTransaction();

    const [materiales] = await connection.query(
      "SELECT cantidad FROM inventario WHERE id_material = ? AND estado = 1",
      [id_material]
    );

    if (materiales.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        mensaje: "Material no encontrado",
      });
    }

    const cantidadActual = Number(materiales[0].cantidad);
    const cantidadMovimiento = Number(cantidad);

    let nuevaCantidad = cantidadActual;

    if (tipo_movimiento === "entrada") {
      nuevaCantidad = cantidadActual + cantidadMovimiento;
    } else if (tipo_movimiento === "salida") {
      if (cantidadMovimiento > cantidadActual) {
        await connection.rollback();
        return res.status(400).json({
          mensaje: "No hay suficiente material en inventario",
        });
      }

      nuevaCantidad = cantidadActual - cantidadMovimiento;
    } else {
      await connection.rollback();
      return res.status(400).json({
        mensaje: "Tipo de movimiento inválido",
      });
    }

    await connection.query(
      `INSERT INTO movimientos_inventario
       (id_material, tipo_movimiento, cantidad, descripcion)
       VALUES (?, ?, ?, ?)`,
      [id_material, tipo_movimiento, cantidadMovimiento, descripcion || null]
    );

    await connection.query(
      "UPDATE inventario SET cantidad = ? WHERE id_material = ?",
      [nuevaCantidad, id_material]
    );

    await connection.commit();

    res.status(201).json({
      mensaje: "Movimiento registrado correctamente",
      nuevaCantidad,
    });
  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      mensaje: "Error al registrar movimiento",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

const obtenerMovimientos = async (req, res) => {
  try {
    const [movimientos] = await pool.query(`
      SELECT 
        m.id_movimiento,
        m.id_material,
        i.nombre AS material,
        m.tipo_movimiento,
        m.cantidad,
        m.descripcion,
        m.fecha_movimiento
      FROM movimientos_inventario m
      INNER JOIN inventario i ON m.id_material = i.id_material
      ORDER BY m.id_movimiento DESC
    `);

    res.json(movimientos);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener movimientos",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerMateriales,
  crearMaterial,
  actualizarMaterial,
  eliminarMaterial,
  registrarMovimiento,
  obtenerMovimientos,
};