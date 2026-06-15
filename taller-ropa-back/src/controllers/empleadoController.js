const pool = require("../config/db");

const obtenerEmpleados = async (req, res) => {
  try {
    const [empleados] = await pool.query(
      "SELECT * FROM empleados WHERE estado = 1 ORDER BY id_empleado DESC"
    );

    res.json(empleados);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener empleados",
      error: error.message,
    });
  }
};

const obtenerEmpleadoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [empleados] = await pool.query(
      "SELECT * FROM empleados WHERE id_empleado = ? AND estado = 1",
      [id]
    );

    if (empleados.length === 0) {
      return res.status(404).json({
        mensaje: "Empleado no encontrado",
      });
    }

    res.json(empleados[0]);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener empleado",
      error: error.message,
    });
  }
};

const crearEmpleado = async (req, res) => {
  try {
    const { nombre, telefono, puesto } = req.body;

    if (!nombre || !puesto) {
      return res.status(400).json({
        mensaje: "Nombre y puesto son obligatorios",
      });
    }

    const [resultado] = await pool.query(
      "INSERT INTO empleados (nombre, telefono, puesto) VALUES (?, ?, ?)",
      [nombre, telefono || null, puesto]
    );

    res.status(201).json({
      mensaje: "Empleado creado correctamente",
      id_empleado: resultado.insertId,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear empleado",
      error: error.message,
    });
  }
};

const actualizarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, puesto } = req.body;

    if (!nombre || !puesto) {
      return res.status(400).json({
        mensaje: "Nombre y puesto son obligatorios",
      });
    }

    const [resultado] = await pool.query(
      `UPDATE empleados 
       SET nombre = ?, telefono = ?, puesto = ?
       WHERE id_empleado = ? AND estado = 1`,
      [nombre, telefono || null, puesto, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Empleado no encontrado",
      });
    }

    res.json({
      mensaje: "Empleado actualizado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar empleado",
      error: error.message,
    });
  }
};

const eliminarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      "UPDATE empleados SET estado = 0 WHERE id_empleado = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Empleado no encontrado",
      });
    }

    res.json({
      mensaje: "Empleado eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar empleado",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerEmpleados,
  obtenerEmpleadoPorId,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
};