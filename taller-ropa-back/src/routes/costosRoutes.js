const express = require("express");
const router = express.Router();

const { obtenerCostosGanancia } = require("../controllers/costosController");
const { verificarToken, soloAdmin } = require("../middlewares/authMiddleware");

router.get("/", verificarToken, soloAdmin, obtenerCostosGanancia);

module.exports = router;