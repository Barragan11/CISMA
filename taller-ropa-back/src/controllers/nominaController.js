const pool = require("../config/db");

const obtenerNominas = async (req, res) => {
  try {
    const [nominas] = await pool.query(`
      SELECT 
        n.id_nomina,
        n.id_empleado,
        e.nombre AS empleado,
        n.fecha_inicio,
        n.fecha_fin,
        n.total_producido,
        n.total_anticipos,
        n.total_pagar,
        n.estado
      FROM nominas n
      INNER JOIN empleados e ON n.id_empleado = e.id_empleado
      ORDER BY n.id_nomina DESC
    `);

    res.json(nominas);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener nóminas",
      error: error.message,
    });
  }
};

const generarNomina = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id_empleado, fecha_inicio, fecha_fin } = req.body;

    if (!id_empleado || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        mensaje: "Empleado, fecha inicio y fecha fin son obligatorios",
      });
    }

    await connection.beginTransaction();

    const [detalleEntregas] = await connection.query(
      `
      SELECT
        en.id_entrega,
        c.folio,
        c.nombre_prenda,
        en.cantidad_entregada,
        en.fecha_entrega,
        a.pago_por_pieza,
        (en.cantidad_entregada * a.pago_por_pieza) AS subtotal
      FROM entregas en
      INNER JOIN asignaciones a ON en.id_asignacion = a.id_asignacion
      INNER JOIN cortes c ON a.id_corte = c.id_corte
      WHERE a.id_empleado = ?
        AND en.fecha_entrega BETWEEN ? AND ?
        AND en.id_nomina IS NULL
      ORDER BY en.fecha_entrega ASC
      `,
      [id_empleado, fecha_inicio, fecha_fin]
    );

    if (detalleEntregas.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        mensaje:
          "No hay entregas pendientes de pago para esta empleada en ese periodo. Puede que ya hayan sido incluidas en otra nómina.",
      });
    }

    const totalProducido = detalleEntregas.reduce(
      (suma, entrega) => suma + Number(entrega.subtotal),
      0
    );

    const [anticipos] = await connection.query(
      `
      SELECT IFNULL(SUM(monto), 0) AS total_anticipos
      FROM anticipos
      WHERE id_empleado = ?
        AND estado = 'Pendiente'
        AND fecha_anticipo BETWEEN ? AND ?
      `,
      [id_empleado, fecha_inicio, fecha_fin]
    );

    const totalAnticipos = Number(anticipos[0].total_anticipos);
    const totalPagar = totalProducido - totalAnticipos;

    const [resultado] = await connection.query(
      `
      INSERT INTO nominas
      (id_empleado, fecha_inicio, fecha_fin, total_producido, total_anticipos, total_pagar, estado)
      VALUES (?, ?, ?, ?, ?, ?, 'Pendiente')
      `,
      [
        id_empleado,
        fecha_inicio,
        fecha_fin,
        totalProducido,
        totalAnticipos,
        totalPagar,
      ]
    );

    const idNomina = resultado.insertId;

    const idsEntregas = detalleEntregas.map((entrega) => entrega.id_entrega);

    await connection.query(
      `
      UPDATE entregas
      SET id_nomina = ?
      WHERE id_entrega IN (?)
      `,
      [idNomina, idsEntregas]
    );

    await connection.query(
      `
      UPDATE anticipos
      SET estado = 'Descontado'
      WHERE id_empleado = ?
        AND estado = 'Pendiente'
        AND fecha_anticipo BETWEEN ? AND ?
      `,
      [id_empleado, fecha_inicio, fecha_fin]
    );

    await connection.commit();

    res.status(201).json({
      mensaje: "Nómina generada correctamente",
      id_nomina: idNomina,
      total_producido: totalProducido,
      total_anticipos: totalAnticipos,
      total_pagar: totalPagar,
      detalle_entregas: detalleEntregas,
    });
  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      mensaje: "Error al generar nómina",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

const pagarNomina = async (req, res) => {
  try {
    const { id } = req.params;

    const [[nomina]] = await pool.query(
      `
      SELECT id_nomina, estado
      FROM nominas
      WHERE id_nomina = ?
      `,
      [id]
    );

    if (!nomina) {
      return res.status(404).json({
        mensaje: "Nómina no encontrada",
      });
    }

    if (nomina.estado === "Pagada") {
      return res.status(400).json({
        mensaje: "Esta nómina ya fue pagada.",
      });
    }

    await pool.query(
      `
      UPDATE nominas
      SET estado = 'Pagada'
      WHERE id_nomina = ?
      `,
      [id]
    );

    res.json({
      mensaje: "Nómina pagada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al pagar nómina",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerNominas,
  generarNomina,
  pagarNomina,
};