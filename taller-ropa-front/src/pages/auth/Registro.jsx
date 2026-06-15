import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, Shirt } from "lucide-react";
import { registrarUsuario } from "../../services/authService";
import "./Registro.css";
import toast from "react-hot-toast";

function Registro() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    nombre: "",
    telefono: "",
    correo: "",
    password: "",
    confirmarPassword: "",
  });

  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [cargando, setCargando] = useState(false);

  const cambiarDato = (e) => {
    const { name, value } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const enviarRegistro = async (e) => {
    e.preventDefault();

    setError("");
    setExito("");

    if (formulario.password.length < 6) {
      setError("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    if (formulario.password !== formulario.confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setCargando(true);

      await registrarUsuario({
        nombre: formulario.nombre,
        correo: formulario.correo,
        password: formulario.password,
        telefono: formulario.telefono,
      });

      setExito("Cuenta creada correctamente. Redirigiendo al login...");
      toast.success("Cuenta creada correctamente");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="register-page">
      <section className="register-card">
        <div className="register-brand">
          <div className="register-icon">
            <Shirt size={30} />
          </div>

          <h1>Crear cuenta</h1>
          <p>
            Regístrate para ver detalles de productos y agregar al carrito.
          </p>
        </div>

        {error && <div className="register-alert error">{error}</div>}
        {exito && <div className="register-alert success">{exito}</div>}

        <form onSubmit={enviarRegistro}>
          <label>Nombre completo</label>

          <div className="register-input">
            <User size={18} />

            <input
              type="text"
              name="nombre"
              placeholder="Ej. Luis Barragán"
              value={formulario.nombre}
              onChange={cambiarDato}
              required
            />
          </div>

          <label>Teléfono</label>

          <div className="register-input">
            <Phone size={18} />

            <input
              type="tel"
              name="telefono"
              placeholder="Ej. 4491234567"
              value={formulario.telefono}
              onChange={cambiarDato}
              required
            />
          </div>

          <label>Correo electrónico</label>

          <div className="register-input">
            <Mail size={18} />

            <input
              type="email"
              name="correo"
              placeholder="cliente@correo.com"
              value={formulario.correo}
              onChange={cambiarDato}
              required
            />
          </div>

          <label>Contraseña</label>

          <div className="register-input">
            <Lock size={18} />

            <input
              type="password"
              name="password"
              placeholder="Mínimo 6 caracteres"
              value={formulario.password}
              onChange={cambiarDato}
              required
            />
          </div>

          <label>Confirmar contraseña</label>

          <div className="register-input">
            <Lock size={18} />

            <input
              type="password"
              name="confirmarPassword"
              placeholder="Repite tu contraseña"
              value={formulario.confirmarPassword}
              onChange={cambiarDato}
              required
            />
          </div>

          <button type="submit" disabled={cargando}>
            {cargando ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="register-login">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </section>
    </main>
  );
}

export default Registro;