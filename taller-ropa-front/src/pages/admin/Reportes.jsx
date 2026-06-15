import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { obtenerEmpleados } from "../../services/empleadoService";
import { obtenerAsignaciones } from "../../services/asignacionService";
import { obtenerCortes } from "../../services/corteService";
import {
  obtenerReporteCorte,
  obtenerReporteProduccion,
  obtenerReporteInventarioBajo,
  obtenerReporteVentas,
} from "../../services/reporteService";
import "./AdminPages.css";

function Reportes() {
  const reporteRef = useRef(null);

  const [tipoReporte, setTipoReporte] = useState("formato_empleada");
  const [empleados, setEmpleados] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [cortes, setCortes] = useState([]);
  const [resultado, setResultado] = useState(null);

  const [filtros, setFiltros] = useState({
    id_empleado: "",
    id_asignacion: "",
    id_corte: "",
    fecha_inicio: "",
    fecha_fin: "",
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [datosEmpleados, datosAsignaciones, datosCortes] =
        await Promise.all([
          obtenerEmpleados(),
          obtenerAsignaciones(),
          obtenerCortes(),
        ]);

      setEmpleados(datosEmpleados);
      setAsignaciones(datosAsignaciones);
      setCortes(datosCortes);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cambiarFiltro = (e) => {
    const { name, value } = e.target;

    setFiltros({
      ...filtros,
      [name]: value,
    });
  };

  const cambiarTipoReporte = (e) => {
    setTipoReporte(e.target.value);
    setResultado(null);

    setFiltros({
      id_empleado: "",
      id_asignacion: "",
      id_corte: "",
      fecha_inicio: "",
      fecha_fin: "",
    });
  };

  const empleadoSeleccionado = empleados.find(
    (empleado) => empleado.id_empleado === Number(filtros.id_empleado)
  );

  const asignacionesEmpleado = asignaciones.filter(
    (asignacion) =>
      asignacion.id_empleado === Number(filtros.id_empleado) &&
      asignacion.estado !== "Terminado"
  );

  const asignacionSeleccionada = asignaciones.find(
    (asignacion) =>
      asignacion.id_asignacion === Number(filtros.id_asignacion)
  );

  const generarReporte = async (e) => {
    e.preventDefault();

    try {
      if (tipoReporte === "formato_empleada") {
        if (!filtros.id_empleado || !filtros.id_asignacion) {
          toast.error("Selecciona empleada y asignación");
          return;
        }

        setResultado({
          tipo: "formato_empleada",
        });

        return;
      }

      if (tipoReporte === "corte") {
        if (!filtros.id_corte) {
          toast.error("Selecciona un corte");
          return;
        }

        const datos = await obtenerReporteCorte({
          id_corte: filtros.id_corte,
        });

        setResultado({
          tipo: "corte",
          datos,
        });

        toast.success("Reporte por corte generado");
        return;
      }

      if (tipoReporte === "produccion") {
        const datos = await obtenerReporteProduccion({
          fecha_inicio: filtros.fecha_inicio,
          fecha_fin: filtros.fecha_fin,
        });

        setResultado({
          tipo: "produccion",
          datos,
        });

        toast.success("Reporte de producción generado");
        return;
      }

      if (tipoReporte === "inventario") {
        const datos = await obtenerReporteInventarioBajo();

        setResultado({
          tipo: "inventario",
          datos,
        });

        toast.success("Reporte de inventario generado");
        return;
      }

      if (tipoReporte === "ventas") {
        const datos = await obtenerReporteVentas({
          fecha_inicio: filtros.fecha_inicio,
          fecha_fin: filtros.fecha_fin,
        });

        setResultado({
          tipo: "ventas",
          datos,
        });

        toast.success("Reporte de ventas generado");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const imprimirReporte = () => {
    if (!resultado) {
      toast.error("Primero genera un reporte");
      return;
    }

    const contenido = reporteRef.current.innerHTML;
    const ventana = window.open("", "", "width=1000,height=800");

    ventana.document.write(`
      <html>
        <head>
          <title>Reporte Taller de Ropa</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #102235;
            }

            .reporte-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px solid #1677e8;
              padding-bottom: 15px;
              margin-bottom: 25px;
            }

            .logo-box {
              font-size: 24px;
              font-weight: bold;
              color: #1677e8;
            }

            .reporte-title {
              text-align: right;
            }

            .reporte-title h1 {
              margin: 0;
              font-size: 24px;
            }

            .reporte-title p {
              margin: 4px 0;
              color: #555;
            }

            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
              margin-bottom: 25px;
            }

            .info-card {
              border: 1px solid #d7e0ea;
              border-radius: 10px;
              padding: 12px;
              background: #f8fbff;
            }

            .info-card strong {
              display: block;
              font-size: 13px;
              color: #6b7280;
              margin-bottom: 5px;
            }

            .section-title {
              margin-top: 26px;
              font-size: 18px;
              color: #102235;
              border-left: 5px solid #1677e8;
              padding-left: 10px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              font-size: 13px;
            }

            th {
              background: #102235;
              color: white;
              padding: 9px;
              border: 1px solid #102235;
            }

            td {
              padding: 10px;
              border: 1px solid #cfd8e3;
              height: 24px;
            }

            .firmas {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 60px;
              margin-top: 60px;
            }

            .firma-box {
              text-align: center;
              padding-top: 45px;
              border-top: 1px solid #102235;
              font-weight: bold;
            }

            .nota {
              margin-top: 25px;
              font-size: 12px;
              color: #555;
              line-height: 1.5;
            }
          </style>
        </head>

        <body>
          ${contenido}
        </body>
      </html>
    `);

    ventana.document.close();
    ventana.focus();
    ventana.print();
    ventana.close();
  };

  const fechaActual = new Date().toLocaleDateString("es-MX");
  const requiereFechas =
    tipoReporte === "produccion" || tipoReporte === "ventas";

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Reportes</h1>
          <p>Genera formatos y reportes administrativos del taller.</p>
        </div>

        <button onClick={imprimirReporte}>Generar PDF / Imprimir</button>
      </div>

      <section className="page-card">
        <form className="admin-form-grid" onSubmit={generarReporte}>
          <select value={tipoReporte} onChange={cambiarTipoReporte}>
            <option value="formato_empleada">
              Formato de entregas por empleada
            </option>
            <option value="corte">Reporte por corte</option>
            <option value="produccion">Reporte de producción</option>
            <option value="inventario">Inventario bajo</option>
            <option value="ventas">Reporte de ventas</option>
          </select>

          {tipoReporte === "formato_empleada" && (
            <>
              <select
                name="id_empleado"
                value={filtros.id_empleado}
                onChange={cambiarFiltro}
              >
                <option value="">Selecciona empleada</option>

                {empleados.map((empleado) => (
                  <option
                    key={empleado.id_empleado}
                    value={empleado.id_empleado}
                  >
                    {empleado.nombre}
                  </option>
                ))}
              </select>

              <select
                name="id_asignacion"
                value={filtros.id_asignacion}
                onChange={cambiarFiltro}
                disabled={!filtros.id_empleado}
              >
                <option value="">Selecciona asignación activa</option>

                {asignacionesEmpleado.map((asignacion) => (
                  <option
                    key={asignacion.id_asignacion}
                    value={asignacion.id_asignacion}
                  >
                    {asignacion.nombre_prenda} -{" "}
                    {asignacion.cantidad_entregada}/
                    {asignacion.cantidad_asignada}
                  </option>
                ))}
              </select>
            </>
          )}

          {tipoReporte === "corte" && (
            <select
              name="id_corte"
              value={filtros.id_corte}
              onChange={cambiarFiltro}
            >
              <option value="">Selecciona corte</option>

              {cortes.map((corte) => (
                <option key={corte.id_corte} value={corte.id_corte}>
                  {corte.folio} - {corte.nombre_prenda}
                </option>
              ))}
            </select>
          )}

          {requiereFechas && (
            <>
              <input
                type="date"
                name="fecha_inicio"
                value={filtros.fecha_inicio}
                onChange={cambiarFiltro}
                required
              />

              <input
                type="date"
                name="fecha_fin"
                value={filtros.fecha_fin}
                onChange={cambiarFiltro}
                required
              />
            </>
          )}

          <button type="submit">Generar reporte</button>
        </form>
      </section>

      {resultado && (
        <section className="page-card" ref={reporteRef}>
          <div className="reporte-header">
            <div className="logo-box">Taller Infantil</div>

            <div className="reporte-title">
              <h1>
                {resultado.tipo === "formato_empleada" &&
                  "Formato de Entregas"}
                {resultado.tipo === "corte" && "Reporte por Corte"}
                {resultado.tipo === "produccion" &&
                  "Reporte de Producción"}
                {resultado.tipo === "inventario" && "Inventario Bajo"}
                {resultado.tipo === "ventas" && "Reporte de Ventas"}
              </h1>
              <p>Fecha de impresión: {fechaActual}</p>
            </div>
          </div>

          {resultado.tipo === "formato_empleada" &&
            asignacionSeleccionada &&
            empleadoSeleccionado && (
              <>
                <div className="info-grid">
                  <div className="info-card">
                    <strong>Empleada</strong>
                    {empleadoSeleccionado.nombre}
                  </div>

                  <div className="info-card">
                    <strong>Teléfono</strong>
                    {empleadoSeleccionado.telefono || "No registrado"}
                  </div>

                  <div className="info-card">
                    <strong>Folio / Corte</strong>
                    {asignacionSeleccionada.folio || "Sin folio"} -{" "}
                    {asignacionSeleccionada.nombre_prenda}
                  </div>

                  <div className="info-card">
                    <strong>Fecha de asignación</strong>
                    {asignacionSeleccionada.fecha_asignacion?.slice(0, 10)}
                  </div>

                  <div className="info-card">
                    <strong>Cantidad asignada</strong>
                    {asignacionSeleccionada.cantidad_asignada} piezas
                  </div>

                  <div className="info-card">
                    <strong>Cantidad entregada actual</strong>
                    {asignacionSeleccionada.cantidad_entregada} piezas
                  </div>

                  <div className="info-card">
                    <strong>Cantidad pendiente</strong>
                    {Number(asignacionSeleccionada.cantidad_asignada) -
                      Number(asignacionSeleccionada.cantidad_entregada)}{" "}
                    piezas
                  </div>

                  <div className="info-card">
                    <strong>Pago por pieza</strong>$
                    {asignacionSeleccionada.pago_por_pieza}
                  </div>
                </div>

                <h2 className="section-title">
                  Registro manual de entregas
                </h2>

                <table>
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Fecha</th>
                      <th>Cantidad entregada</th>
                      <th>Cantidad pendiente</th>
                      <th>Observaciones</th>
                      <th>Firma empleada</th>
                      <th>Firma recibe</th>
                    </tr>
                  </thead>

                  <tbody>
                    {Array.from({ length: 12 }).map((_, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="firmas">
                  <div className="firma-box">Firma de la empleada</div>
                  <div className="firma-box">Firma de quien recibe</div>
                </div>
              </>
            )}

          {resultado.tipo === "corte" && (
            <>
              <div className="info-grid">
                <div className="info-card">
                  <strong>Folio</strong>
                  {resultado.datos.corte.folio}
                </div>

                <div className="info-card">
                  <strong>Corte</strong>
                  {resultado.datos.corte.nombre_prenda}
                </div>

                <div className="info-card">
                  <strong>Cantidad total</strong>
                  {resultado.datos.corte.cantidad_total}
                </div>

                <div className="info-card">
                  <strong>Estado</strong>
                  {resultado.datos.corte.estado}
                </div>
              </div>

              <h2 className="section-title">Asignaciones del corte</h2>

              <table>
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Asignado</th>
                    <th>Entregado</th>
                    <th>Pendiente</th>
                    <th>Pago pieza</th>
                    <th>Total pagado</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {resultado.datos.asignaciones.map((item) => (
                    <tr key={item.id_asignacion}>
                      <td>{item.empleado}</td>
                      <td>{item.cantidad_asignada}</td>
                      <td>{item.cantidad_entregada}</td>
                      <td>{item.pendiente}</td>
                      <td>${item.pago_por_pieza}</td>
                      <td>${item.pago_total}</td>
                      <td>{item.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h2 className="section-title">Entregas registradas</h2>

              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Empleado</th>
                    <th>Cantidad</th>
                    <th>Pago pieza</th>
                    <th>Pago entrega</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>

                <tbody>
                  {resultado.datos.entregas.map((item) => (
                    <tr key={item.id_entrega}>
                      <td>{item.fecha_entrega?.slice(0, 10)}</td>
                      <td>{item.empleado}</td>
                      <td>{item.cantidad_entregada}</td>
                      <td>${item.pago_por_pieza}</td>
                      <td>${item.pago_entrega}</td>
                      <td>{item.observaciones || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {resultado.tipo === "produccion" && (
            <table>
              <thead>
                <tr>
                  <th>Corte</th>
                  <th>Total corte</th>
                  <th>Asignado</th>
                  <th>Entregado</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {resultado.datos.map((item) => (
                  <tr key={item.id_corte}>
                    <td>{item.nombre_prenda}</td>
                    <td>{item.cantidad_total}</td>
                    <td>{item.total_asignado}</td>
                    <td>{item.total_entregado}</td>
                    <td>{item.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {resultado.tipo === "inventario" && (
            <table>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Cantidad</th>
                  <th>Unidad</th>
                  <th>Stock mínimo</th>
                </tr>
              </thead>

              <tbody>
                {resultado.datos.map((item) => (
                  <tr key={item.id_material}>
                    <td>{item.nombre}</td>
                    <td>{item.cantidad}</td>
                    <td>{item.unidad}</td>
                    <td>{item.stock_minimo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {resultado.tipo === "ventas" && (
            <>
              <div className="info-grid">
                <div className="info-card">
                  <strong>Total ventas</strong>
                  {resultado.datos.totales.total_ventas}
                </div>

                <div className="info-card">
                  <strong>Importe total</strong>$
                  {resultado.datos.totales.importe_total}
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Correo</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {resultado.datos.ventas.map((venta) => (
                    <tr key={venta.id_venta}>
                      <td>{venta.cliente}</td>
                      <td>{venta.correo}</td>
                      <td>{venta.fecha_venta?.slice(0, 10)}</td>
                      <td>${venta.total}</td>
                      <td>{venta.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <p className="nota">
            Documento generado por el sistema de control del taller. La
            información mostrada corresponde a los registros almacenados en la
            base de datos.
          </p>
        </section>
      )}
    </div>
  );
}

export default Reportes;