const express = require("express");
const router = express.Router();

const {
  obtenerNominas,
  generarNomina,
  pagarNomina,
} = require("../controllers/nominaController");

const { verificarToken, soloAdmin } = require("../middlewares/authMiddleware");

router.get("/", verificarToken, soloAdmin, obtenerNominas);
router.post("/generar", verificarToken, soloAdmin, generarNomina);
router.put("/:id/pagar", verificarToken, soloAdmin, pagarNomina);

module.exports = router;