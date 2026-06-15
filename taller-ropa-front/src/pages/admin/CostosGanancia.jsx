import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { obtenerCostosGanancia } from "../../services/costosService";
import "./AdminPages.css";

function CostosGanancia() {
  const [costos, setCostos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarCostos();
  }, []);

  const cargarCostos = async () => {
    try {
      setCargando(true);
      const datos = await obtenerCostosGanancia();
      setCostos(datos);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCargando(false);
    }
  };

  const totalIngresos = costos.reduce(
    (suma, item) => suma + Number(item.ingreso_estimado),
    0
  );

  const totalMaterial = costos.reduce(
    (suma, item) => suma + Number(item.costo_material),
    0
  );

  const totalManoObra = costos.reduce(
    (suma, item) => suma + Number(item.mano_obra),
    0
  );

  const totalGanancia = costos.reduce(
    (suma, item) => suma + Number(item.ganancia_estimada),
    0
  );

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Costos y Ganancia</h1>
          <p>Resumen de ingresos, materiales, mano de obra y ganancia por corte.</p>
        </div>

        <button onClick={cargarCostos}>Actualizar</button>
      </div>

      <section className="summary-grid">
        <article className="summary-card">
          <div>
            <p>Ingresos estimados</p>
            <h2>${totalIngresos.toFixed(2)}</h2>
            <span>Total por cortes</span>
          </div>
        </article>

        <article className="summary-card">
          <div>
            <p>Costo material</p>
            <h2>${totalMaterial.toFixed(2)}</h2>
            <span>Material registrado</span>
          </div>
        </article>

        <article className="summary-card">
          <div>
            <p>Mano de obra</p>
            <h2>${totalManoObra.toFixed(2)}</h2>
            <span>Pagos por entregas</span>
          </div>
        </article>

        <article className="summary-card">
          <div>
            <p>Ganancia estimada</p>
            <h2>${totalGanancia.toFixed(2)}</h2>
            <span>Ingreso - costos</span>
          </div>
        </article>
      </section>

      <section className="page-card">
        {cargando ? (
          <p>Cargando costos...</p>
        ) : (
          <table className="page-table">
            <thead>
              <tr>
                <th>Corte</th>
                <th>Cantidad</th>
                <th>Precio cliente</th>
                <th>Ingreso</th>
                <th>Material</th>
                <th>Mano de obra</th>
                <th>Ganancia</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {costos.map((item) => (
                <tr key={item.id_corte}>
                  <td>{item.nombre_prenda}</td>
                  <td>{item.cantidad_total}</td>
                  <td>${item.precio_cliente}</td>
                  <td>${Number(item.ingreso_estimado).toFixed(2)}</td>
                  <td>${Number(item.costo_material).toFixed(2)}</td>
                  <td>${Number(item.mano_obra).toFixed(2)}</td>
                  <td>
                    <strong>${Number(item.ganancia_estimada).toFixed(2)}</strong>
                  </td>
                  <td>{item.estado}</td>
                </tr>
              ))}

              {costos.length === 0 && (
                <tr>
                  <td colSpan="8">No hay datos de costos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default CostosGanancia;