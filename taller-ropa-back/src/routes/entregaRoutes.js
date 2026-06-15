const express = require("express");
const router = express.Router();

const {
  obtenerEntregas,
  obtenerEntregasPorAsignacion,
  crearEntrega,
  actualizarEntrega,
  eliminarEntrega,
} = require("../controllers/entregaController");

const { verificarToken, soloAdmin } = require("../middlewares/authMiddleware");

router.get("/", verificarToken, soloAdmin, obtenerEntregas);
router.get(
  "/asignacion/:id_asignacion",
  verificarToken,
  soloAdmin,
  obtenerEntregasPorAsignacion
);
router.post("/", verificarToken, soloAdmin, crearEntrega);
router.put("/:id", verificarToken, soloAdmin, actualizarEntrega);
router.delete("/:id", verificarToken, soloAdmin, eliminarEntrega);

module.exports = router;