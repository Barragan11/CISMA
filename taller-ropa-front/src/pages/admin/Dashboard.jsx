import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Users,
  Scissors,
  Package,
  Wallet,
  Shirt,
  ShoppingBag,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { obtenerDashboard } from "../../services/dashboardService";
import "./Dashboard.css";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setCargando(true);
      const datos = await obtenerDashboard();
      setDashboard(datos);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return <p>Cargando dashboard...</p>;
  }

  if (!dashboard) {
    return <p>No se pudo cargar el dashboard.</p>;
  }

  const resumen = [
    {
      titulo: "Empleados activos",
      valor: dashboard.resumen.empleados,
      texto: "Registrados en el taller",
      icono: <Users size={26} />,
    },
    {
      titulo: "Cortes activos",
      valor: dashboard.resumen.cortes_activos,
      texto: "Pendientes o en proceso",
      icono: <Scissors size={26} />,
    },
    {
      titulo: "Producción del mes",
      valor: dashboard.resumen.produccion_mes,
      texto: "Piezas entregadas",
      icono: <Shirt size={26} />,
    },
    {
      titulo: "Ventas del mes",
      valor: `$${dashboard.resumen.ventas_mes}`,
      texto: "Ventas registradas",
      icono: <ShoppingBag size={26} />,
    },
    {
      titulo: "Anticipos pendientes",
      valor: `$${dashboard.resumen.anticipos_pendientes}`,
      texto: "Por descontar",
      icono: <Wallet size={26} />,
    },
    {
      titulo: "Stock bajo",
      valor: dashboard.resumen.stock_bajo,
      texto: "Materiales por revisar",
      icono: <Package size={26} />,
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-title">
        <div>
          <h1>Dashboard</h1>
          <p>Resumen real del taller de ropa infantil.</p>
        </div>

        <button className="primary-action" onClick={cargarDashboard}>
          Actualizar
        </button>
      </div>

      <section className="summary-grid">
        {resumen.map((item, index) => (
          <article className="summary-card" key={index}>
            <div className="summary-icon">{item.icono}</div>

            <div>
              <p>{item.titulo}</p>
              <h2>{item.valor}</h2>
              <span>{item.texto}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="charts-grid">
        <article className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Producción por empleada</h2>
              <p>Piezas entregadas durante el mes actual.</p>
            </div>
          </div>

          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.produccion_por_empleado}>
                <XAxis dataKey="empleado" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="piezas" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Alertas de inventario</h2>
              <p>Materiales con stock bajo.</p>
            </div>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Cantidad</th>
                <th>Mínimo</th>
              </tr>
            </thead>

            <tbody>
              {dashboard.inventario_bajo.map((item) => (
                <tr key={item.id_material}>
                  <td>{item.nombre}</td>
                  <td>
                    {item.cantidad} {item.unidad}
                  </td>
                  <td>{item.stock_minimo}</td>
                </tr>
              ))}

              {dashboard.inventario_bajo.length === 0 && (
                <tr>
                  <td colSpan="3">No hay materiales con stock bajo.</td>
                </tr>
              )}
            </tbody>
          </table>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-panel big-panel">
          <div className="panel-header">
            <div>
              <h2>Cortes en proceso</h2>
              <p>Avance de producción por corte.</p>
            </div>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Corte</th>
                <th>Entregado</th>
                <th>Total</th>
                <th>Avance</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {dashboard.cortes_proceso.map((corte) => {
                const porcentaje =
                  Number(corte.cantidad_total) > 0
                    ? Math.round(
                        (Number(corte.cantidad_entregada) /
                          Number(corte.cantidad_total)) *
                          100
                      )
                    : 0;

                return (
                  <tr key={corte.id_corte}>
                    <td>{corte.nombre_prenda}</td>
                    <td>{corte.cantidad_entregada}</td>
                    <td>{corte.cantidad_total}</td>
                    <td>{porcentaje}%</td>
                    <td>
                      <span
                        className={
                          corte.estado === "Pendiente"
                            ? "estado-badge estado-pendiente"
                            : "estado-badge estado-proceso"
                        }
                      >
                        {corte.estado}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {dashboard.cortes_proceso.length === 0 && (
                <tr>
                  <td colSpan="5">No hay cortes activos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </article>

        <aside className="dashboard-side">
          <article className="dashboard-panel">
            <div className="side-card-title">
              <Shirt size={22} />
              <h2>Últimas entregas</h2>
            </div>

            <table className="admin-table">
              <tbody>
                {dashboard.ultimas_entregas.map((entrega) => (
                  <tr key={entrega.id_entrega}>
                    <td>
                      <b>{entrega.empleado}</b>
                      <br />
                      {entrega.nombre_prenda}
                    </td>
                    <td>
                      {entrega.cantidad_entregada} pzas
                      <br />${entrega.pago}
                    </td>
                  </tr>
                ))}

                {dashboard.ultimas_entregas.length === 0 && (
                  <tr>
                    <td>No hay entregas registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </article>

          <article className="dashboard-panel">
            <div className="side-card-title">
              <Wallet size={22} />
              <h2>Últimos anticipos</h2>
            </div>

            <table className="admin-table">
              <tbody>
                {dashboard.ultimos_anticipos.map((anticipo) => (
                  <tr key={anticipo.id_anticipo}>
                    <td>
                      <b>{anticipo.empleado}</b>
                      <br />
                      {anticipo.fecha_anticipo?.slice(0, 10)}
                    </td>
                    <td>
                      ${anticipo.monto}
                      <br />
                      {anticipo.estado}
                    </td>
                  </tr>
                ))}

                {dashboard.ultimos_anticipos.length === 0 && (
                  <tr>
                    <td>No hay anticipos registrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </article>
        </aside>
      </section>
    </div>
  );
}

export default Dashboard;