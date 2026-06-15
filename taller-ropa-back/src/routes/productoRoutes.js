const express = require("express");
const router = express.Router();

const {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} = require("../controllers/productoController");

const { verificarToken, soloAdmin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.get("/", obtenerProductos);
router.get("/:id", obtenerProductoPorId);

router.post("/", verificarToken, soloAdmin, upload.single("imagen"), crearProducto);
router.put("/:id", verificarToken, soloAdmin, upload.single("imagen"), actualizarProducto);
router.delete("/:id", verificarToken, soloAdmin, eliminarProducto);

module.exports = router;