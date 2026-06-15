const pool = require("../config/db");

const obtenerCostosGanancia = async (req, res) => {
  try {
    const [costos] = await pool.query(`
      SELECT
        c.id_corte,
        c.nombre_prenda,
        c.cantidad_total,
        c.precio_cliente,
        c.costo_material,
        IFNULL(SUM(a.cantidad_entregada * a.pago_por_pieza), 0) AS mano_obra,
        (c.cantidad_total * c.precio_cliente) AS ingreso_estimado,
        ((c.cantidad_total * c.precio_cliente) - c.costo_material - IFNULL(SUM(a.cantidad_entregada * a.pago_por_pieza), 0)) AS ganancia_estimada,
        c.estado
      FROM cortes c
      LEFT JOIN asignaciones a ON c.id_corte = a.id_corte
      WHERE c.estado <> 'Cancelado'
      GROUP BY c.id_corte
      ORDER BY c.id_corte DESC
    `);

    res.json(costos);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener costos y ganancia",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerCostosGanancia,
};