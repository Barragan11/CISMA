const express = require("express");
const router = express.Router();

const {
  obtenerAsignaciones,
  obtenerAsignacionPorId,
  crearAsignacion,
  actualizarAsignacion,
  eliminarAsignacion,
} = require("../controllers/asignacionController");

const { verificarToken, soloAdmin } = require("../middlewares/authMiddleware");

router.get("/", verificarToken, soloAdmin, obtenerAsignaciones);
router.get("/:id", verificarToken, soloAdmin, obtenerAsignacionPorId);
router.post("/", verificarToken, soloAdmin, crearAsignacion);
router.put("/:id", verificarToken, soloAdmin, actualizarAsignacion);
router.delete("/:id", verificarToken, soloAdmin, eliminarAsignacion);

module.exports = router;