const pool = require("../config/db");

const obtenerAsignaciones = async (req, res) => {
  try {
    const [asignaciones] = await pool.query(`
      SELECT 
        a.id_asignacion,
        a.id_corte,
        c.nombre_prenda,
        a.id_empleado,
        e.nombre AS empleado,
        a.cantidad_asignada,
        a.cantidad_entregada,
        a.pago_por_pieza,
        (a.cantidad_entregada * a.pago_por_pieza) AS pago_total,
        a.estado,
        a.fecha_asignacion
      FROM asignaciones a
      INNER JOIN cortes c ON a.id_corte = c.id_corte
      INNER JOIN empleados e ON a.id_empleado = e.id_empleado
      ORDER BY a.id_asignacion DESC
    `);

    res.json(asignaciones);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener asignaciones",
      error: error.message,
    });
  }
};

const obtenerAsignacionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [asignaciones] = await pool.query(
      `
      SELECT 
        a.id_asignacion,
        a.id_corte,
        c.nombre_prenda,
        a.id_empleado,
        e.nombre AS empleado,
        a.cantidad_asignada,
        a.cantidad_entregada,
        a.pago_por_pieza,
        (a.cantidad_entregada * a.pago_por_pieza) AS pago_total,
        a.estado,
        a.fecha_asignacion
      FROM asignaciones a
      INNER JOIN cortes c ON a.id_corte = c.id_corte
      INNER JOIN empleados e ON a.id_empleado = e.id_empleado
      WHERE a.id_asignacion = ?
      `,
      [id]
    );

    if (asignaciones.length === 0) {
      return res.status(404).json({
        mensaje: "Asignación no encontrada",
      });
    }

    res.json(asignaciones[0]);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener asignación",
      error: error.message,
    });
  }
};

const crearAsignacion = async (req, res) => {
  try {
    const {
      id_corte,
      id_empleado,
      cantidad_asignada,
      cantidad_entregada,
      pago_por_pieza,
      estado,
    } = req.body;

    if (!id_corte || !id_empleado || !cantidad_asignada || !pago_por_pieza) {
      return res.status(400).json({
        mensaje: "Corte, empleado, cantidad asignada y pago por pieza son obligatorios",
      });
    }

    const [[corte]] = await pool.query(
      `SELECT cantidad_total FROM cortes WHERE id_corte = ?`,
      [id_corte]
    );

    if (!corte) {
      return res.status(404).json({
        mensaje: "Corte no encontrado",
      });
    }

    const [[asignado]] = await pool.query(
      `
      SELECT IFNULL(SUM(cantidad_asignada), 0) AS total_asignado
      FROM asignaciones
      WHERE id_corte = ?
      `,
      [id_corte]
    );

    const totalDisponible =
      Number(corte.cantidad_total) - Number(asignado.total_asignado);

    if (Number(cantidad_asignada) > totalDisponible) {
      return res.status(400).json({
        mensaje: `No puedes asignar ${cantidad_asignada} piezas. Solo quedan disponibles ${totalDisponible} piezas de este corte.`,
      });
    }

    const [resultado] = await pool.query(
      `
      INSERT INTO asignaciones
      (id_corte, id_empleado, cantidad_asignada, cantidad_entregada, pago_por_pieza, estado)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        id_corte,
        id_empleado,
        cantidad_asignada,
        cantidad_entregada || 0,
        pago_por_pieza,
        estado || "Pendiente",
      ]
    );

    res.status(201).json({
      mensaje: "Asignación creada correctamente",
      id_asignacion: resultado.insertId,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear asignación",
      error: error.message,
    });
  }
};
const actualizarAsignacion = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      id_corte,
      id_empleado,
      cantidad_asignada,
      cantidad_entregada,
      pago_por_pieza,
      estado,
    } = req.body;

    const [[asignacionActual]] = await pool.query(
      `SELECT * FROM asignaciones WHERE id_asignacion = ?`,
      [id]
    );

    if (!asignacionActual) {
      return res.status(404).json({
        mensaje: "Asignación no encontrada",
      });
    }

    const [[corte]] = await pool.query(
      `SELECT cantidad_total FROM cortes WHERE id_corte = ?`,
      [id_corte]
    );

    if (!corte) {
      return res.status(404).json({
        mensaje: "Corte no encontrado",
      });
    }

    const [[asignado]] = await pool.query(
      `
      SELECT IFNULL(SUM(cantidad_asignada), 0) AS total_asignado
      FROM asignaciones
      WHERE id_corte = ?
        AND id_asignacion <> ?
      `,
      [id_corte, id]
    );

    const totalDisponible =
      Number(corte.cantidad_total) - Number(asignado.total_asignado);

    if (Number(cantidad_asignada) > totalDisponible) {
      return res.status(400).json({
        mensaje: `No puedes asignar ${cantidad_asignada} piezas. Solo quedan disponibles ${totalDisponible} piezas de este corte.`,
      });
    }

    if (Number(cantidad_entregada) > Number(cantidad_asignada)) {
      return res.status(400).json({
        mensaje: "La cantidad entregada no puede ser mayor que la cantidad asignada.",
      });
    }

    const [resultado] = await pool.query(
      `
      UPDATE asignaciones
      SET id_corte = ?, id_empleado = ?, cantidad_asignada = ?, cantidad_entregada = ?, pago_por_pieza = ?, estado = ?
      WHERE id_asignacion = ?
      `,
      [
        id_corte,
        id_empleado,
        cantidad_asignada,
        cantidad_entregada || 0,
        pago_por_pieza,
        estado || "Pendiente",
        id,
      ]
    );

    res.json({
      mensaje: "Asignación actualizada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar asignación",
      error: error.message,
    });
  }
};

const eliminarAsignacion = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      "DELETE FROM asignaciones WHERE id_asignacion = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Asignación no encontrada",
      });
    }

    res.json({
      mensaje: "Asignación eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar asignación",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerAsignaciones,
  obtenerAsignacionPorId,
  crearAsignacion,
  actualizarAsignacion,
  eliminarAsignacion,
};