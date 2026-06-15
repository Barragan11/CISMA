const pool = require("../config/db");

const reportePorEmpleado = async (req, res) => {
  try {
    const { id_empleado, fecha_inicio, fecha_fin } = req.query;

    if (!id_empleado || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        mensaje: "Empleado, fecha inicio y fecha fin son obligatorios",
      });
    }

    const [reporte] = await pool.query(
      `
      SELECT 
        e.id_empleado,
        e.nombre AS empleado,
        c.nombre_prenda,
        a.cantidad_asignada,
        a.cantidad_entregada,
        a.pago_por_pieza,
        (a.cantidad_entregada * a.pago_por_pieza) AS pago_total,
        a.estado,
        a.fecha_asignacion
      FROM asignaciones a
      INNER JOIN empleados e ON a.id_empleado = e.id_empleado
      INNER JOIN cortes c ON a.id_corte = c.id_corte
      WHERE a.id_empleado = ?
        AND DATE(a.fecha_asignacion) BETWEEN ? AND ?
      ORDER BY a.fecha_asignacion DESC
      `,
      [id_empleado, fecha_inicio, fecha_fin]
    );

    const [[totales]] = await pool.query(
      `
      SELECT 
        IFNULL(SUM(cantidad_asignada), 0) AS total_asignado,
        IFNULL(SUM(cantidad_entregada), 0) AS total_entregado,
        IFNULL(SUM(cantidad_entregada * pago_por_pieza), 0) AS total_pago
      FROM asignaciones
      WHERE id_empleado = ?
        AND DATE(fecha_asignacion) BETWEEN ? AND ?
      `,
      [id_empleado, fecha_inicio, fecha_fin]
    );

    res.json({
      empleado: id_empleado,
      fecha_inicio,
      fecha_fin,
      totales,
      detalle: reporte,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al generar reporte por empleado",
      error: error.message,
    });
  }
};

const reporteProduccion = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        mensaje: "Fecha inicio y fecha fin son obligatorias",
      });
    }

    const [reporte] = await pool.query(
      `
      SELECT
        c.id_corte,
        c.nombre_prenda,
        c.cantidad_total,
        IFNULL(SUM(a.cantidad_asignada), 0) AS total_asignado,
        IFNULL(SUM(a.cantidad_entregada), 0) AS total_entregado,
        c.estado,
        c.fecha_inicio,
        c.fecha_entrega
      FROM cortes c
      LEFT JOIN asignaciones a ON c.id_corte = a.id_corte
      WHERE c.fecha_inicio BETWEEN ? AND ?
      GROUP BY c.id_corte
      ORDER BY c.id_corte DESC
      `,
      [fecha_inicio, fecha_fin]
    );

    res.json(reporte);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al generar reporte de producción",
      error: error.message,
    });
  }
};

const reporteInventarioBajo = async (req, res) => {
  try {
    const [materiales] = await pool.query(
      `
      SELECT 
        id_material,
        nombre,
        cantidad,
        unidad,
        stock_minimo
      FROM inventario
      WHERE estado = 1
        AND cantidad <= stock_minimo
      ORDER BY cantidad ASC
      `
    );

    res.json(materiales);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al generar reporte de inventario bajo",
      error: error.message,
    });
  }
};

const reporteVentas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        mensaje: "Fecha inicio y fecha fin son obligatorias",
      });
    }

    const [ventas] = await pool.query(
      `
      SELECT 
        v.id_venta,
        u.nombre AS cliente,
        u.correo,
        v.fecha_venta,
        v.total,
        v.estado
      FROM ventas v
      INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
      ORDER BY v.id_venta DESC
      `,
      [fecha_inicio, fecha_fin]
    );

    const [[totales]] = await pool.query(
      `
      SELECT 
        COUNT(*) AS total_ventas,
        IFNULL(SUM(total), 0) AS importe_total
      FROM ventas
      WHERE DATE(fecha_venta) BETWEEN ? AND ?
      `,
      [fecha_inicio, fecha_fin]
    );

    res.json({
      fecha_inicio,
      fecha_fin,
      totales,
      ventas,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al generar reporte de ventas",
      error: error.message,
    });
  }
};

const reportePorCorte = async (req, res) => {
  try {
    const { id_corte } = req.query;

    if (!id_corte) {
      return res.status(400).json({
        mensaje: "El corte es obligatorio",
      });
    }

    const [[corte]] = await pool.query(
      `
      SELECT
        id_corte,
        folio,
        nombre_prenda,
        descripcion,
        cantidad_total,
        precio_cliente,
        costo_material,
        fecha_inicio,
        fecha_entrega,
        estado
      FROM cortes
      WHERE id_corte = ?
      `,
      [id_corte]
    );

    if (!corte) {
      return res.status(404).json({
        mensaje: "Corte no encontrado",
      });
    }

    const [entregas] = await pool.query(
      `
      SELECT
        en.id_entrega,
        e.nombre AS empleado,
        a.id_asignacion,
        a.cantidad_asignada,
        en.cantidad_entregada,
        en.fecha_entrega,
        a.pago_por_pieza,
        (en.cantidad_entregada * a.pago_por_pieza) AS pago_entrega,
        en.observaciones
      FROM entregas en
      INNER JOIN asignaciones a ON en.id_asignacion = a.id_asignacion
      INNER JOIN empleados e ON a.id_empleado = e.id_empleado
      WHERE a.id_corte = ?
      ORDER BY en.fecha_entrega ASC, en.id_entrega ASC
      `,
      [id_corte]
    );

    const [asignaciones] = await pool.query(
      `
      SELECT
        a.id_asignacion,
        e.nombre AS empleado,
        a.cantidad_asignada,
        a.cantidad_entregada,
        (a.cantidad_asignada - a.cantidad_entregada) AS pendiente,
        a.pago_por_pieza,
        (a.cantidad_entregada * a.pago_por_pieza) AS pago_total,
        a.estado
      FROM asignaciones a
      INNER JOIN empleados e ON a.id_empleado = e.id_empleado
      WHERE a.id_corte = ?
      ORDER BY e.nombre ASC
      `,
      [id_corte]
    );

    const [[totales]] = await pool.query(
      `
      SELECT
        IFNULL(SUM(a.cantidad_asignada), 0) AS total_asignado,
        IFNULL(SUM(a.cantidad_entregada), 0) AS total_entregado,
        IFNULL(SUM(a.cantidad_asignada - a.cantidad_entregada), 0) AS total_pendiente,
        IFNULL(SUM(a.cantidad_entregada * a.pago_por_pieza), 0) AS total_mano_obra
      FROM asignaciones a
      WHERE a.id_corte = ?
      `,
      [id_corte]
    );

    res.json({
      corte,
      asignaciones,
      entregas,
      totales,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al generar reporte por corte",
      error: error.message,
    });
  }
};

module.exports = {
  reportePorEmpleado,
  reporteProduccion,
  reporteInventarioBajo,
  reporteVentas,
  reportePorCorte,
};