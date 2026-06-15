const express = require("express");
const router = express.Router();

const {
  reportePorEmpleado,
  reporteProduccion,
  reporteInventarioBajo,
  reporteVentas,
  reportePorCorte,
} = require("../controllers/reporteController");

const { verificarToken, soloAdmin } = require("../middlewares/authMiddleware");

router.get("/empleado", verificarToken, soloAdmin, reportePorEmpleado);
router.get("/produccion", verificarToken, soloAdmin, reporteProduccion);
router.get("/inventario-bajo", verificarToken, soloAdmin, reporteInventarioBajo);
router.get("/ventas", verificarToken, soloAdmin, reporteVentas);
router.get("/corte", verificarToken, soloAdmin, reportePorCorte);

module.exports = router;