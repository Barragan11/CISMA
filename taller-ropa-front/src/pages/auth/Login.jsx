import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { loginUsuario } from "../../services/authService";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formulario, setFormulario] = useState({
    correo: "",
    password: "",
  });

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  const cambiarDato = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  const iniciarSesion = async (e) => {
    e.preventDefault();

    try {
      setCargando(true);

      const datos = await loginUsuario(formulario.correo, formulario.password);

      login(datos.usuario, datos.token);

      toast.success("Inicio de sesión correcto");

      if (datos.usuario.rol === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/tienda");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-hero">
        <Link to="/" className="login-brand">
          <img src="/logo-cisma.png" alt="Logo CISMA" />

          <div>
            <h2>CISMA</h2>
            <span>Cooperativa Integral San Miguel El Alto</span>
          </div>
        </Link>

        <div className="login-hero-content">
          <span>Sistema de administración</span>

          <h1>Control de producción, nómina e inventario</h1>

          <p>
            Accede al sistema para administrar empleados, cortes, entregas,
            anticipos, nómina, inventario y productos del catálogo.
          </p>
        </div>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={iniciarSesion}>
          <div className="login-card-header">
            <img src="/logo-cisma.png" alt="Logo CISMA" />
            <h1>Iniciar sesión</h1>
            <p>Accede con tu cuenta registrada</p>
          </div>

          <label>Correo electrónico</label>

          <div className="input-group">
            <Mail size={20} />
            <input
              type="email"
              name="correo"
              placeholder="admin@taller.com"
              value={formulario.correo}
              onChange={cambiarDato}
              required
            />
          </div>

          <label>Contraseña</label>

          <div className="input-group">
            <Lock size={20} />

            <input
              type={mostrarPassword ? "text" : "password"}
              name="password"
              placeholder="Ingresa tu contraseña"
              value={formulario.password}
              onChange={cambiarDato}
              required
            />

            <button
              type="button"
              className="eye-button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
            >
              {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button className="login-button" type="submit" disabled={cargando}>
            {cargando ? "Entrando..." : "Entrar al sistema"}
          </button>

          <p className="register-text">
            ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
          </p>

          <Link className="back-home" to="/">
            Volver al inicio
          </Link>
        </form>
      </section>
    </main>
  );
}

export default Login;