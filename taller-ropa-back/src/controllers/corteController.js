const pool = require("../config/db");

const obtenerCortes = async (req, res) => {
  try {
    const [cortes] = await pool.query(
      "SELECT * FROM cortes ORDER BY id_corte DESC"
    );

    res.json(cortes);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener cortes",
      error: error.message,
    });
  }
};

const obtenerCortePorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [cortes] = await pool.query(
      "SELECT * FROM cortes WHERE id_corte = ?",
      [id]
    );

    if (cortes.length === 0) {
      return res.status(404).json({
        mensaje: "Corte no encontrado",
      });
    }

    res.json(cortes[0]);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener corte",
      error: error.message,
    });
  }
};

const crearCorte = async (req, res) => {
  try {
    const {
      folio,
      nombre_prenda,
      descripcion,
      cantidad_total,
      precio_cliente,
      costo_material,
      fecha_inicio,
      fecha_entrega,
      estado,
    } = req.body;

  if (!folio || !nombre_prenda || !cantidad_total || !precio_cliente || !fecha_inicio) {
  return res.status(400).json({
    mensaje:
      "Folio, nombre de prenda, cantidad total, precio del cliente y fecha de inicio son obligatorios",
  });
}

const [resultado] = await pool.query(
  `INSERT INTO cortes
   (folio, nombre_prenda, descripcion, cantidad_total, precio_cliente, costo_material, fecha_inicio, fecha_entrega, estado)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    folio,
    nombre_prenda,
    descripcion || null,
    cantidad_total,
    precio_cliente,
    costo_material || 0,
    fecha_inicio,
    fecha_entrega || null,
    estado || "Pendiente",
  ]
);

    res.status(201).json({
      mensaje: "Corte creado correctamente",
      id_corte: resultado.insertId,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear corte",
      error: error.message,
    });
  }
};

const actualizarCorte = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      folio,
      nombre_prenda,
      descripcion,
      cantidad_total,
      precio_cliente,
      costo_material,
      fecha_inicio,
      fecha_entrega,
      estado,
    } = req.body;

    if (!folio || !nombre_prenda || !cantidad_total || !precio_cliente || !fecha_inicio) {
  return res.status(400).json({
    mensaje:
      "Folio, nombre de prenda, cantidad total, precio del cliente y fecha de inicio son obligatorios",
  });
}

  const [resultado] = await pool.query(
  `UPDATE cortes
   SET folio = ?, nombre_prenda = ?, descripcion = ?, cantidad_total = ?, precio_cliente = ?,
       costo_material = ?, fecha_inicio = ?, fecha_entrega = ?, estado = ?
   WHERE id_corte = ?`,
  [
    folio,
    nombre_prenda,
    descripcion || null,
    cantidad_total,
    precio_cliente,
    costo_material || 0,
    fecha_inicio,
    fecha_entrega || null,
    estado || "Pendiente",
    id,
  ]
);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Corte no encontrado",
      });
    }

    res.json({
      mensaje: "Corte actualizado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar corte",
      error: error.message,
    });
  }
};

const eliminarCorte = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      "UPDATE cortes SET estado = 'Cancelado' WHERE id_corte = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Corte no encontrado",
      });
    }

    res.json({
      mensaje: "Corte cancelado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al cancelar corte",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerCortes,
  obtenerCortePorId,
  crearCorte,
  actualizarCorte,
  eliminarCorte,
};