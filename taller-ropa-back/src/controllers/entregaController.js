const pool = require("../config/db");

const obtenerEntregas = async (req, res) => {
  try {
    const [entregas] = await pool.query(`
      SELECT
        en.id_entrega,
        en.id_asignacion,
        en.cantidad_entregada,
        en.fecha_entrega,
        en.observaciones,
        en.fecha_registro,
        a.id_empleado,
        e.nombre AS empleado,
        a.id_corte,
        c.nombre_prenda,
        a.cantidad_asignada,
        a.pago_por_pieza,
        (en.cantidad_entregada * a.pago_por_pieza) AS pago_entrega
      FROM entregas en
      INNER JOIN asignaciones a ON en.id_asignacion = a.id_asignacion
      INNER JOIN empleados e ON a.id_empleado = e.id_empleado
      INNER JOIN cortes c ON a.id_corte = c.id_corte
      ORDER BY en.fecha_entrega DESC, en.id_entrega DESC
    `);

    res.json(entregas);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener entregas",
      error: error.message,
    });
  }
};

const obtenerEntregasPorAsignacion = async (req, res) => {
  try {
    const { id_asignacion } = req.params;

    const [entregas] = await pool.query(
      `
      SELECT *
      FROM entregas
      WHERE id_asignacion = ?
      ORDER BY fecha_entrega DESC
      `,
      [id_asignacion]
    );

    res.json(entregas);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener entregas de la asignación",
      error: error.message,
    });
  }
};

const crearEntrega = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id_asignacion, cantidad_entregada, fecha_entrega, observaciones } =
      req.body;

    if (!id_asignacion || !cantidad_entregada || !fecha_entrega) {
      return res.status(400).json({
        mensaje: "Asignación, cantidad entregada y fecha son obligatorias",
      });
    }

    await connection.beginTransaction();

    const [asignaciones] = await connection.query(
      `
      SELECT 
        id_asignacion,
        cantidad_asignada
      FROM asignaciones
      WHERE id_asignacion = ?
      `,
      [id_asignacion]
    );

    if (asignaciones.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        mensaje: "Asignación no encontrada",
      });
    }

    const cantidadAsignada = Number(asignaciones[0].cantidad_asignada);

    const [[totales]] = await connection.query(
      `
      SELECT IFNULL(SUM(cantidad_entregada), 0) AS total_entregado
      FROM entregas
      WHERE id_asignacion = ?
      `,
      [id_asignacion]
    );

    const totalActual = Number(totales.total_entregado);
    const nuevaEntrega = Number(cantidad_entregada);
    const totalNuevo = totalActual + nuevaEntrega;

    if (totalNuevo > cantidadAsignada) {
      await connection.rollback();
      return res.status(400).json({
        mensaje: `La entrega excede la cantidad asignada. Asignado: ${cantidadAsignada}, entregado actual: ${totalActual}`,
      });
    }

    const [resultado] = await connection.query(
      `
      INSERT INTO entregas
      (id_asignacion, cantidad_entregada, fecha_entrega, observaciones)
      VALUES (?, ?, ?, ?)
      `,
      [id_asignacion, nuevaEntrega, fecha_entrega, observaciones || null]
    );

    let estado = "En proceso";

    if (totalNuevo === cantidadAsignada) {
      estado = "Terminado";
    }

    await connection.query(
      `
      UPDATE asignaciones
      SET cantidad_entregada = ?, estado = ?
      WHERE id_asignacion = ?
      `,
      [totalNuevo, estado, id_asignacion]
    );

    await connection.commit();

    res.status(201).json({
      mensaje: "Entrega registrada correctamente",
      id_entrega: resultado.insertId,
      total_entregado: totalNuevo,
      estado_asignacion: estado,
    });
  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      mensaje: "Error al registrar entrega",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

const actualizarEntrega = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { cantidad_entregada, fecha_entrega, observaciones } = req.body;

    if (!cantidad_entregada || !fecha_entrega) {
      return res.status(400).json({
        mensaje: "Cantidad entregada y fecha son obligatorias",
      });
    }

    await connection.beginTransaction();

    const [entregas] = await connection.query(
      "SELECT id_asignacion FROM entregas WHERE id_entrega = ?",
      [id]
    );

    if (entregas.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        mensaje: "Entrega no encontrada",
      });
    }

    const idAsignacion = entregas[0].id_asignacion;

    await connection.query(
      `
      UPDATE entregas
      SET cantidad_entregada = ?, fecha_entrega = ?, observaciones = ?
      WHERE id_entrega = ?
      `,
      [cantidad_entregada, fecha_entrega, observaciones || null, id]
    );

    const [[asignacion]] = await connection.query(
      "SELECT cantidad_asignada FROM asignaciones WHERE id_asignacion = ?",
      [idAsignacion]
    );

    const [[totales]] = await connection.query(
      `
      SELECT IFNULL(SUM(cantidad_entregada), 0) AS total_entregado
      FROM entregas
      WHERE id_asignacion = ?
      `,
      [idAsignacion]
    );

    const totalEntregado = Number(totales.total_entregado);
    const cantidadAsignada = Number(asignacion.cantidad_asignada);

    if (totalEntregado > cantidadAsignada) {
      await connection.rollback();
      return res.status(400).json({
        mensaje: "La suma de entregas excede la cantidad asignada",
      });
    }

    const estado =
      totalEntregado === cantidadAsignada ? "Terminado" : "En proceso";

    await connection.query(
      `
      UPDATE asignaciones
      SET cantidad_entregada = ?, estado = ?
      WHERE id_asignacion = ?
      `,
      [totalEntregado, estado, idAsignacion]
    );

    await connection.commit();

    res.json({
      mensaje: "Entrega actualizada correctamente",
      total_entregado: totalEntregado,
      estado_asignacion: estado,
    });
  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      mensaje: "Error al actualizar entrega",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

const eliminarEntrega = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    const [entregas] = await connection.query(
      "SELECT id_asignacion FROM entregas WHERE id_entrega = ?",
      [id]
    );

    if (entregas.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        mensaje: "Entrega no encontrada",
      });
    }

    const idAsignacion = entregas[0].id_asignacion;

    await connection.query("DELETE FROM entregas WHERE id_entrega = ?", [id]);

    const [[asignacion]] = await connection.query(
      "SELECT cantidad_asignada FROM asignaciones WHERE id_asignacion = ?",
      [idAsignacion]
    );

    const [[totales]] = await connection.query(
      `
      SELECT IFNULL(SUM(cantidad_entregada), 0) AS total_entregado
      FROM entregas
      WHERE id_asignacion = ?
      `,
      [idAsignacion]
    );

    const totalEntregado = Number(totales.total_entregado);
    const cantidadAsignada = Number(asignacion.cantidad_asignada);

    let estado = "Pendiente";

    if (totalEntregado > 0 && totalEntregado < cantidadAsignada) {
      estado = "En proceso";
    }

    if (totalEntregado === cantidadAsignada) {
      estado = "Terminado";
    }

    await connection.query(
      `
      UPDATE asignaciones
      SET cantidad_entregada = ?, estado = ?
      WHERE id_asignacion = ?
      `,
      [totalEntregado, estado, idAsignacion]
    );

    await connection.commit();

    res.json({
      mensaje: "Entrega eliminada correctamente",
      total_entregado: totalEntregado,
      estado_asignacion: estado,
    });
  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      mensaje: "Error al eliminar entrega",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  obtenerEntregas,
  obtenerEntregasPorAsignacion,
  crearEntrega,
  actualizarEntrega,
  eliminarEntrega,
};