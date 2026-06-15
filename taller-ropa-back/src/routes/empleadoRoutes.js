const express = require("express");
const router = express.Router();

const {
  obtenerEmpleados,
  obtenerEmpleadoPorId,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
} = require("../controllers/empleadoController");

const { verificarToken, soloAdmin } = require("../middlewares/authMiddleware");

router.get("/", verificarToken, soloAdmin, obtenerEmpleados);
router.get("/:id", verificarToken, soloAdmin, obtenerEmpleadoPorId);
router.post("/", verificarToken, soloAdmin, crearEmpleado);
router.put("/:id", verificarToken, soloAdmin, actualizarEmpleado);
router.delete("/:id", verificarToken, soloAdmin, eliminarEmpleado);

module.exports = router;