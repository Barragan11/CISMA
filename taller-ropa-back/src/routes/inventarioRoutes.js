const express = require("express");
const router = express.Router();

const {
  obtenerMateriales,
  crearMaterial,
  actualizarMaterial,
  eliminarMaterial,
  registrarMovimiento,
  obtenerMovimientos,
} = require("../controllers/inventarioController");

const { verificarToken, soloAdmin } = require("../middlewares/authMiddleware");

router.get("/", verificarToken, soloAdmin, obtenerMateriales);
router.post("/", verificarToken, soloAdmin, crearMaterial);
router.put("/:id", verificarToken, soloAdmin, actualizarMaterial);
router.delete("/:id", verificarToken, soloAdmin, eliminarMaterial);

router.get("/movimientos/lista", verificarToken, soloAdmin, obtenerMovimientos);
router.post("/movimientos", verificarToken, soloAdmin, registrarMovimiento);

module.exports = router;