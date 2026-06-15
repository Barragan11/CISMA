import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Scissors,
  ClipboardList,
  Wallet,
  Package,
  TrendingUp,
  FileText,
  Settings,
  LogOut,
  Menu,
  Shirt,
  Store,
  Truck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./AdminLayout.css";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = () => {
    logout();
    navigate("/");
  };

  return (
    <div className={`admin-layout ${sidebarOpen ? "" : "collapsed"}`}>
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <Shirt size={24} />
          {sidebarOpen && <span>CISMA</span>}
        </div>

        <nav className="admin-menu">
          <NavLink to="/admin/dashboard">
            <LayoutDashboard size={18} />
            {sidebarOpen && <span>Dashboard</span>}
          </NavLink>

          <NavLink to="/admin/empleados">
            <Users size={18} />
            {sidebarOpen && <span>Empleados</span>}
          </NavLink>

          <NavLink to="/admin/cortes">
            <Scissors size={18} />
            {sidebarOpen && <span>Cortes</span>}
          </NavLink>

          <NavLink to="/admin/asignaciones">
            <ClipboardList size={18} />
            {sidebarOpen && <span>Asignaciones</span>}
          </NavLink>
          <NavLink to="/admin/entregas">
            <Truck size={18} />
            {sidebarOpen && <span>Entregas</span>}
          </NavLink>

          <NavLink to="/admin/nomina">
            <Wallet size={18} />
            {sidebarOpen && <span>Nómina</span>}
          </NavLink>

          <NavLink to="/admin/anticipos">
            <Wallet size={18} />
            {sidebarOpen && <span>Anticipos</span>}
          </NavLink>

          <NavLink to="/admin/inventario">
            <Package size={18} />
            {sidebarOpen && <span>Inventario</span>}
          </NavLink>

          <NavLink to="/admin/costos-ganancia">
            <TrendingUp size={18} />
            {sidebarOpen && <span>Costos y Ganancia</span>}
          </NavLink>

          <NavLink to="/admin/reportes">
            <FileText size={18} />
            {sidebarOpen && <span>Reportes</span>}
          </NavLink>
          <NavLink to="/admin/productos">
            <Store size={18} />
            {sidebarOpen && <span>Productos</span>}
          </NavLink>
          <NavLink to="/admin/configuracion">
            <Settings size={18} />
            {sidebarOpen && <span>Configuración</span>}
          </NavLink>

          
        </nav>

        <button className="logout-button" onClick={cerrarSesion}>
          <LogOut size={18} />
          {sidebarOpen && <span>Cerrar sesión</span>}
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={22} />
            </button>

            <h2>Panel Administrativo</h2>
          </div>

          <div className="admin-user">
            <div className="admin-avatar">
              {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : "A"}
            </div>
            <span>{usuario?.nombre || "Admin"}</span>
          </div>
        </header>

        <section className="admin-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default AdminLayout;