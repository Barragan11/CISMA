import { lazy, Suspense } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

const Login = lazy(() => import("./pages/auth/Login"));
const Registro = lazy(() => import("./pages/auth/Registro"));
const Home = lazy(() => import("./pages/public/Home"));
const Tienda = lazy(() => import("./pages/user/Tienda"));
const Carrito = lazy(() => import("./pages/user/Carrito"));
const ProductoDetalle = lazy(() => import("./pages/user/ProductoDetalle"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Empleados = lazy(() => import("./pages/admin/Empleados"));
const Cortes = lazy(() => import("./pages/admin/Cortes"));
const Asignaciones = lazy(() => import("./pages/admin/Asignaciones"));
const Nomina = lazy(() => import("./pages/admin/Nomina"));
const Inventario = lazy(() => import("./pages/admin/Inventario"));
const CostosGanancia = lazy(() => import("./pages/admin/CostosGanancia"));
const Reportes = lazy(() => import("./pages/admin/Reportes"));
const Configuracion = lazy(() => import("./pages/admin/Configuracion"));
const Anticipos = lazy(() => import("./pages/admin/Anticipos"));
const Productos = lazy(() => import("./pages/admin/Productos"));
const Entregas = lazy(() => import("./pages/admin/Entregas"));


function App() {
  return (
    <Suspense fallback={<p className="loading-text">Cargando página...</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        <Route
          path="/tienda"
          element={
            <ProtectedRoute rolPermitido="usuario">
              <Tienda />
            </ProtectedRoute>
          }
        />

        <Route
          path="/carrito"
          element={
            <ProtectedRoute rolPermitido="usuario">
              <Carrito />
            </ProtectedRoute>
          }
        />

        <Route
          path="/producto/:id"
          element={
            <ProtectedRoute rolPermitido="usuario">
              <ProductoDetalle />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute rolPermitido="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="empleados" element={<Empleados />} />
          <Route path="cortes" element={<Cortes />} />
          <Route path="asignaciones" element={<Asignaciones />} />
          <Route path="nomina" element={<Nomina />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="costos-ganancia" element={<CostosGanancia />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="anticipos" element={<Anticipos />} />
          <Route path="productos" element={<Productos />} />
          <Route path="entregas" element={<Entregas />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;