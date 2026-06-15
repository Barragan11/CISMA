const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const productoRoutes = require("./routes/productoRoutes");
const empleadoRoutes = require("./routes/empleadoRoutes");
const corteRoutes = require("./routes/corteRoutes");
const asignacionRoutes = require("./routes/asignacionRoutes");
const inventarioRoutes = require("./routes/inventarioRoutes");
const anticipoRoutes = require("./routes/anticipoRoutes");
const nominaRoutes = require("./routes/nominaRoutes");
const ventaRoutes = require("./routes/ventaRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reporteRoutes = require("./routes/reporteRoutes");
const entregaRoutes = require("./routes/entregaRoutes");
const costosRoutes = require("./routes/costosRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.json({
    mensaje: "API del sistema taller de ropa funcionando",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/empleados", empleadoRoutes);
app.use("/api/cortes", corteRoutes);
app.use("/api/asignaciones", asignacionRoutes);
app.use("/api/inventario", inventarioRoutes);
app.use("/api/anticipos", anticipoRoutes);
app.use("/api/nominas", nominaRoutes);
app.use("/api/ventas", ventaRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reportes", reporteRoutes);
app.use("/api/entregas", entregaRoutes);
app.use("/api/costos-ganancia", costosRoutes);

module.exports = app;