const express = require("express");
const router = express.Router();

const {
  obtenerCortes,
  obtenerCortePorId,
  crearCorte,
  actualizarCorte,
  eliminarCorte,
} = require("../controllers/corteController");

const { verificarToken, soloAdmin } = require("../middlewares/authMiddleware");

router.get("/", verificarToken, soloAdmin, obtenerCortes);
router.get("/:id", verificarToken, soloAdmin, obtenerCortePorId);
router.post("/", verificarToken, soloAdmin, crearCorte);
router.put("/:id", verificarToken, soloAdmin, actualizarCorte);
router.delete("/:id", verificarToken, soloAdmin, eliminarCorte);

module.exports = router;