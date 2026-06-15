const express = require("express");
const router = express.Router();

const {
  obtenerVentas,
  obtenerMisCompras,
  obtenerDetalleVenta,
  crearVenta,
} = require("../controllers/ventaController");

const { verificarToken, soloAdmin } = require("../middlewares/authMiddleware");

router.get("/", verificarToken, soloAdmin, obtenerVentas);
router.get("/mis-compras", verificarToken, obtenerMisCompras);
router.get("/:id/detalle", verificarToken, obtenerDetalleVenta);
router.post("/", verificarToken, crearVenta);

module.exports = router;