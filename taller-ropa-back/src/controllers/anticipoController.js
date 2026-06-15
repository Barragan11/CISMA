const pool = require("../config/db");

const obtenerAnticipos = async (req, res) => {
  try {
    const [anticipos] = await pool.query(`
      SELECT 
        a.id_anticipo,
        a.id_empleado,
        e.nombre AS empleado,
        a.monto,
        a.descripcion,
        a.fecha_anticipo,
        a.estado
      FROM anticipos a
      INNER JOIN empleados e ON a.id_empleado = e.id_empleado
      ORDER BY a.id_anticipo DESC
    `);

    res.json(anticipos);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener anticipos",
      error: error.message,
    });
  }
};

const obtenerAnticipoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [anticipos] = await pool.query(
      `
      SELECT 
        a.id_anticipo,
        a.id_empleado,
        e.nombre AS empleado,
        a.monto,
        a.descripcion,
        a.fecha_anticipo,
        a.estado
      FROM anticipos a
      INNER JOIN empleados e ON a.id_empleado = e.id_empleado
      WHERE a.id_anticipo = ?
      `,
      [id]
    );

    if (anticipos.length === 0) {
      return res.status(404).json({
        mensaje: "Anticipo no encontrado",
      });
    }

    res.json(anticipos[0]);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener anticipo",
      error: error.message,
    });
  }
};

const crearAnticipo = async (req, res) => {
  try {
    const { id_empleado, monto, descripcion, fecha_anticipo } = req.body;

    if (!id_empleado || !monto || !fecha_anticipo) {
      return res.status(400).json({
        mensaje: "Empleado, monto y fecha son obligatorios",
      });
    }

    const [empleados] = await pool.query(
      "SELECT id_empleado FROM empleados WHERE id_empleado = ? AND estado = 1",
      [id_empleado]
    );

    if (empleados.length === 0) {
      return res.status(404).json({
        mensaje: "Empleado no encontrado",
      });
    }

    const [resultado] = await pool.query(
      `INSERT INTO anticipos
       (id_empleado, monto, descripcion, fecha_anticipo, estado)
       VALUES (?, ?, ?, ?, 'Pendiente')`,
      [id_empleado, monto, descripcion || null, fecha_anticipo]
    );

    res.status(201).json({
      mensaje: "Anticipo registrado correctamente",
      id_anticipo: resultado.insertId,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al registrar anticipo",
      error: error.message,
    });
  }
};

const actualizarAnticipo = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_empleado, monto, descripcion, fecha_anticipo, estado } = req.body;

    if (!id_empleado || !monto || !fecha_anticipo || !estado) {
      return res.status(400).json({
        mensaje: "Empleado, monto, fecha y estado son obligatorios",
      });
    }

    const [resultado] = await pool.query(
      `UPDATE anticipos
       SET id_empleado = ?, monto = ?, descripcion = ?, fecha_anticipo = ?, estado = ?
       WHERE id_anticipo = ?`,
      [id_empleado, monto, descripcion || null, fecha_anticipo, estado, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Anticipo no encontrado",
      });
    }

    res.json({
      mensaje: "Anticipo actualizado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar anticipo",
      error: error.message,
    });
  }
};

const eliminarAnticipo = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      "UPDATE anticipos SET estado = 'Descontado' WHERE id_anticipo = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Anticipo no encontrado",
      });
    }

    res.json({
      mensaje: "Anticipo marcado como descontado",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar anticipo",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerAnticipos,
  obtenerAnticipoPorId,
  crearAnticipo,
  actualizarAnticipo,
  eliminarAnticipo,
};