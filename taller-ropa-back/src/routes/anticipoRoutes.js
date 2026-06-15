const express = require("express");
const router = express.Router();

const {
  obtenerAnticipos,
  obtenerAnticipoPorId,
  crearAnticipo,
  actualizarAnticipo,
  eliminarAnticipo,
} = require("../controllers/anticipoController");

const { verificarToken, soloAdmin } = require("../middlewares/authMiddleware");

router.get("/", verificarToken, soloAdmin, obtenerAnticipos);
router.get("/:id", verificarToken, soloAdmin, obtenerAnticipoPorId);
router.post("/", verificarToken, soloAdmin, crearAnticipo);
router.put("/:id", verificarToken, soloAdmin, actualizarAnticipo);
router.delete("/:id", verificarToken, soloAdmin, eliminarAnticipo);

module.exports = router;