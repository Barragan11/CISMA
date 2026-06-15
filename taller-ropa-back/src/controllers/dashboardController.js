const pool = require("../config/db");

const obtenerResumenDashboard = async (req, res) => {
  try {
    const [[empleados]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM empleados
      WHERE estado = 1
    `);

    const [[cortesActivos]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM cortes
      WHERE estado IN ('Pendiente', 'En proceso')
    `);

    const [[produccionMes]] = await pool.query(`
      SELECT IFNULL(SUM(cantidad_entregada), 0) AS total
      FROM entregas
      WHERE MONTH(fecha_entrega) = MONTH(CURDATE())
        AND YEAR(fecha_entrega) = YEAR(CURDATE())
    `);

    const [[ventasMes]] = await pool.query(`
      SELECT IFNULL(SUM(total), 0) AS total
      FROM ventas
      WHERE MONTH(fecha_venta) = MONTH(CURDATE())
        AND YEAR(fecha_venta) = YEAR(CURDATE())
    `);

    const [[anticiposPendientes]] = await pool.query(`
      SELECT IFNULL(SUM(monto), 0) AS total
      FROM anticipos
      WHERE estado = 'Pendiente'
    `);

    const [[stockBajo]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM inventario
      WHERE estado = 1
        AND cantidad <= stock_minimo
    `);

    const [ultimasEntregas] = await pool.query(`
      SELECT
        en.id_entrega,
        e.nombre AS empleado,
        c.nombre_prenda,
        en.cantidad_entregada,
        en.fecha_entrega,
        a.pago_por_pieza,
        (en.cantidad_entregada * a.pago_por_pieza) AS pago
      FROM entregas en
      INNER JOIN asignaciones a ON en.id_asignacion = a.id_asignacion
      INNER JOIN empleados e ON a.id_empleado = e.id_empleado
      INNER JOIN cortes c ON a.id_corte = c.id_corte
      ORDER BY en.fecha_entrega DESC, en.id_entrega DESC
      LIMIT 5
    `);

    const [ultimosAnticipos] = await pool.query(`
      SELECT
        a.id_anticipo,
        e.nombre AS empleado,
        a.monto,
        a.fecha_anticipo,
        a.estado
      FROM anticipos a
      INNER JOIN empleados e ON a.id_empleado = e.id_empleado
      ORDER BY a.fecha_anticipo DESC, a.id_anticipo DESC
      LIMIT 5
    `);

    const [cortesProceso] = await pool.query(`
      SELECT
        c.id_corte,
        c.nombre_prenda,
        c.cantidad_total,
        c.estado,
        IFNULL(SUM(a.cantidad_entregada), 0) AS cantidad_entregada
      FROM cortes c
      LEFT JOIN asignaciones a ON c.id_corte = a.id_corte
      WHERE c.estado IN ('Pendiente', 'En proceso')
      GROUP BY c.id_corte
      ORDER BY c.id_corte DESC
      LIMIT 5
    `);

    const [inventarioBajo] = await pool.query(`
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
      LIMIT 5
    `);

    const [produccionPorEmpleado] = await pool.query(`
      SELECT
        e.nombre AS empleado,
        IFNULL(SUM(en.cantidad_entregada), 0) AS piezas
      FROM empleados e
      LEFT JOIN asignaciones a ON e.id_empleado = a.id_empleado
      LEFT JOIN entregas en ON a.id_asignacion = en.id_asignacion
        AND MONTH(en.fecha_entrega) = MONTH(CURDATE())
        AND YEAR(en.fecha_entrega) = YEAR(CURDATE())
      WHERE e.estado = 1
      GROUP BY e.id_empleado
      ORDER BY piezas DESC
      LIMIT 5
    `);

    res.json({
      resumen: {
        empleados: empleados.total,
        cortes_activos: cortesActivos.total,
        produccion_mes: Number(produccionMes.total),
        ventas_mes: Number(ventasMes.total),
        anticipos_pendientes: Number(anticiposPendientes.total),
        stock_bajo: stockBajo.total,
      },
      ultimas_entregas: ultimasEntregas,
      ultimos_anticipos: ultimosAnticipos,
      cortes_proceso: cortesProceso,
      inventario_bajo: inventarioBajo,
      produccion_por_empleado: produccionPorEmpleado,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener dashboard",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerResumenDashboard,
};