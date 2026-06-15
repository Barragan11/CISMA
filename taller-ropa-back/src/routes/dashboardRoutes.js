const express = require("express");
const router = express.Router();

const { obtenerResumenDashboard } = require("../controllers/dashboardController");
const { verificarToken, soloAdmin } = require("../middlewares/authMiddleware");

router.get("/", verificarToken, soloAdmin, obtenerResumenDashboard);

module.exports = router;