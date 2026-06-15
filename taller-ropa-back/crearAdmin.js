const bcrypt = require("bcryptjs");
const pool = require("./src/config/db");

async function crearAdmins() {
  try {
    const passwordEncriptada = await bcrypt.hash("123456", 10);

    const administradores = [
      {
        nombre: "Administrador Principal",
        correo: "admin@taller.com",
        telefono: "4491234567",
      },
      {
        nombre: "Administrador Producción",
        correo: "produccion@taller.com",
        telefono: "4491112233",
      },
      {
        nombre: "Administrador Nómina",
        correo: "nomina@taller.com",
        telefono: "4492223344",
      },
      {
        nombre: "Administrador Inventario",
        correo: "inventario@taller.com",
        telefono: "4493334455",
      },
      {
        nombre: "Administrador Reportes",
        correo: "reportes@taller.com",
        telefono: "4494445566",
      },
      {
        nombre: "Administrador Ventas",
        correo: "ventas@taller.com",
        telefono: "4495556677",
      },
    ];

    for (const admin of administradores) {
      await pool.query(`DELETE FROM usuarios WHERE correo = ?`, [
        admin.correo,
      ]);

      await pool.query(
        `INSERT INTO usuarios 
         (nombre, correo, password, rol, telefono, estado)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          admin.nombre,
          admin.correo,
          passwordEncriptada,
          "admin",
          admin.telefono,
          1,
        ]
      );

      console.log(`Admin creado: ${admin.correo}`);
    }

    console.log("\nAdministradores creados correctamente\n");

    console.log("Usuarios y contraseñas:");
    administradores.forEach((admin) => {
      console.log(`${admin.correo} | Contraseña: 123456`);
    });

    process.exit();
  } catch (error) {
    console.log("Error:", error.message);
    process.exit();
  }
}

crearAdmins();